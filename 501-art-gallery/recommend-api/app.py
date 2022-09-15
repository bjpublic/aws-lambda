import boto3
import json
import os
import tempfile

from gensim.models import KeyedVectors
from time import time
from typing import List, Tuple

bucket_name = os.getenv("BUCKET_NAME")
print(f"bucket_name={bucket_name}")

default_topn = 10
w2v_dat_file = os.path.join(tempfile.gettempdir(), "w2v.dat")

s3_client = boto3.client("s3")

start = time()
s3_client.download_file(Bucket=bucket_name, Key="w2v.dat", Filename=w2v_dat_file)
elapsed = time() - start
print(f"Elapsed [{elapsed}s]: Download w2v.dat from S3")

start = time()
kv: KeyedVectors = KeyedVectors.load(w2v_dat_file)
elapsed = time() - start
print(f"Elapsed [{elapsed}s]: Load KeyedVectors")


def lambda_handler(event, context):
    start = time()
    id = _read_id(event)
    likes, dislikes, topn = _read_query_params(event)
    print(f"id={id}")
    print(f"likes={likes}")
    print(f"dislikes={dislikes}")
    print(f"topn={topn}")

    r = kv.most_similar_cosmul(positive=[id] + likes, negative=dislikes, topn=int(topn))
    resp = json.dumps({"result":[each[0] for each in r]})
    elapsed = time() - start
    print(f"Elapsed [{elapsed}s]: Handler")
    return resp

def _read_id(event) -> str:
        return event["pathParameters"]["id"]

def _read_query_params(event) -> Tuple[List[str], List[str]]:
    if "queryStringParameters" not in event:
        return [], [], default_topn
    query = event["queryStringParameters"]
    return _split_csv(query.get("like")) \
         , _split_csv(query.get("dislike")) \
         , query.get("topn") or default_topn

def _split_csv(input: str) -> List[str]:
    if input is None:
        return []
    return [id.strip() for id in input.split(",") if len(id.strip()) > 0]