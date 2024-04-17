# pull official base image
FROM python

# set work directory
WORKDIR /usr/src/app

# install psycopg2 dependencies
RUN apt update \
    && apt install postgresql gcc python3-dev musl-dev libffi-dev g++ -y

# install dependencies
RUN pip install -U pip setuptools wheel

COPY ./requirements.txt .
RUN pip install -r requirements.txt

# copy project
COPY . .