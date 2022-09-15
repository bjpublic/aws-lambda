import faker
import lorem
import json
import os


fa = faker.Faker()
dirname = os.path.dirname(os.path.abspath(__file__))

all = {}
for image_file in os.listdir(os.path.join(dirname, "..", "website", "public", "images")):
    name = os.path.splitext(image_file)[0]

    title = " ".join(lorem.sentence().split()[:3])
    author = fa.name()
    description = "\n".join(fa.texts()) + "\n\n" + "\n".join(fa.texts())
    all[name] = {
        "title": title,
        "author": author,
        "description": description,
        "year": fa.date_time().year,
    }

with open(os.path.join(dirname, "..", "website", "src", "data.json"), "w") as f:
    f.write(json.dumps(all, indent=2))
