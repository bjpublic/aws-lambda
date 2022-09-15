import json
from time import time
from typing import List, Tuple
import boto3
import os
import tempfile

from gensim.models import KeyedVectors

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
    id, likes, dislikes, topn = _read_query_params(event)
    if not id:
        raise Exception("BadRequest")
    print(f"id={id}")
    print(f"likes={likes}")
    print(f"dislikes={dislikes}")
    print(f"topn={topn}")

    r = kv.most_similar_cosmul(positive=[id] + likes, negative=dislikes, topn=int(topn))
    return json.dumps({"result":[each[0] for each in r]})

def _read_query_params(event) -> Tuple[str, List[str], List[str]]:
    if not "queryStringParameters" in event:
        return None, [], [], default_topn
    query = event["queryStringParameters"]
    return query.get("id") \
         , _split_csv(query.get("like")) \
         , _split_csv(query.get("unlike")) \
         , query.get("topn") or default_topn

def _split_csv(input: str) -> List[str]:
    if input is None:
        return []
    return [id.strip() for id in input.split(",") if len(id.strip()) > 0]