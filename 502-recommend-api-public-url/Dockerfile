FROM public.ecr.aws/lambda/python:3.9

RUN pip install -U pip

COPY requirements.txt ./
RUN python3.9 -m pip install -r requirements.txt -t .

COPY app.py ./

CMD ["app.lambda_handler"]
