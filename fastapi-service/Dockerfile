FROM python:3.9-slim-buster

WORKDIR /code

ENV PYTHONPATH=/code:/usr/local/lib/python3.9/site-packages

COPY requirements.txt ./requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY ./app /code/app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3010"]
