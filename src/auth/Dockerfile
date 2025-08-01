FROM python:bullseye

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        default-libmysqlclient-dev \
    && pip install --no-cache-dir --upgrade pip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt /app
RUN pip install --no-cache-dir --requirement /app/requirements.txt
COPY . /app/

EXPOSE 6000
CMD ["python","server.py"]
