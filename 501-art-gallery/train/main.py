import boto3
import datetime
import glob
import json
import logging
import os
import tempfile

from gensim.models import Word2Vec

w2v_dat_file = "w2v.dat"
local_w2v_dat_file = os.path.join(tempfile.gettempdir(), w2v_dat_file)

queue_name = os.getenv("LIKE_QUEUE_NAME")
sqs = boto3.client("sqs")
get_queue_url = sqs.get_queue_url(QueueName=queue_name)
queue_url = get_queue_url["QueueUrl"]

bucket_name = os.getenv("BUCKET_NAME")
s3 = boto3.client("s3")

logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.INFO)


def drain():
    messages = sqs.receive_message(
        QueueUrl=queue_url, MaxNumberOfMessages=10, WaitTimeSeconds=0
    )
    result = []
    if "Messages" not in messages:
        return result

    for message in messages["Messages"]:
        result.append(json.loads(message["Body"]))

    entries_to_delete = [
        {"Id": m["MessageId"], "ReceiptHandle": m["ReceiptHandle"]}
        for m in messages["Messages"]
    ]
    deleted = sqs.delete_message_batch(QueueUrl=queue_url, Entries=entries_to_delete)
    if "Failed" in deleted:
        details = json.dumps(deleted["Failed"])
        raise Exception(f"메시지를 삭제할 수 없습니다: {details}")

    print(f"Download logs from SQS: {len(result)}")
    return result


def collect():
    user_map = dict()
    while True:
        events = drain()
        if len(events) == 0:
            break
        for event in events:
            if event["traceId"] not in user_map:
                user_map[event["traceId"]] = []
            user_map[event["traceId"]].append(event["id"])

    if len(user_map) == 0:
        return

    filename = "event." + datetime.datetime.now().strftime("%Y-%m-%d") + ".log"
    local_file = os.path.join(tempfile.gettempdir(), filename)
    print(f"Write log file to temp: {local_file}")

    with open(local_file, "w") as f:
        for _, ids in user_map.items():
            f.write(" ".join(ids) + "\n")

    print(f"Upload log file to S3: {local_file}")
    s3.upload_file(Bucket=bucket_name, Filename=local_file, Key=f"events/{filename}")



def download_event_logs():
    objects = s3.list_objects_v2(Bucket=bucket_name, Prefix="events/")
    if "Contents" not in objects:
        return

    for obj in objects["Contents"]:
        filename = os.path.basename(obj["Key"])
        local_file = os.path.join(tempfile.gettempdir(), filename)
        if os.path.exists(local_file):
            print(f"Skip to download event file: {local_file}")
            continue

        print(f"Download event file: {local_file}")
        s3.download_file(Bucket=bucket_name, Key=obj["Key"], Filename=local_file)


# Re-iterable
class Reader:
    def __iter__(self):
        pattern = os.path.join(tempfile.gettempdir(), "event.*.log")
        for file in glob.glob(pattern):
            for line in open(file, "r"):
                yield [id for id in line.strip().split(" ") if len(id) > 0]


def train():
    print("Start to train")
    w = Word2Vec(sentences=Reader())
    w.wv.save(local_w2v_dat_file)

    print("Upload w2v file into Bucket")
    s3.upload_file(Bucket=bucket_name, Filename=local_w2v_dat_file, Key=w2v_dat_file)


if __name__ == "__main__":
    collect()
    download_event_logs()
    train()
