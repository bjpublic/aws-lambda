import os
import tempfile

from gensim.models import KeyedVectors

w2v_dat_file = "w2v.dat"
local_w2v_dat_file = os.path.join(tempfile.gettempdir(), w2v_dat_file)

kv: KeyedVectors = KeyedVectors.load(local_w2v_dat_file)
r = kv.most_similar_cosmul(positive=["d8b423c7c9803b768206f68faff97e25"], negative=["d9e1630de6a64ae46601435b0bc46670"])
print(r)
