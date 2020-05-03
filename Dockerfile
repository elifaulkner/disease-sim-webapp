FROM python as unittest

RUN pip install --upgrade pip

RUN pip install numpy scipy pandas matplotlib gunicorn

WORKDIR /app/

COPY api/ /app/
COPY api/test/ /app/test
COPY api/.flaskenv.prod /app/.flaskenv

RUN pip install coverage
RUN pip install -r /app/requirements.txt

RUN python -m unittest discover -s /app/test/ -p Test_*.py
RUN coverage run -m unittest discover -s /app/test/ -p Test_*.py
RUN coverage report -m

FROM node:latest as ui-build

WORKDIR /usr/src/app/

COPY . /usr/src/app/
RUN ls /usr/src/app/

RUN npm install
RUN yarn build

FROM python

RUN apt-get update
RUN apt-cache search nginx
RUN apt-get --yes install nginx-full

COPY --from=ui-build /usr/src/app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80

RUN pip install --upgrade pip

RUN pip install numpy scipy pandas matplotlib gunicorn

WORKDIR /app/

COPY api/ /app/
COPY api/.flaskenv.prod /app/.flaskenv

RUN pip install flask
RUN pip install -r /app/requirements.txt

COPY docker_startup.sh /app/
RUN chmod +x docker_startup.sh

ENTRYPOINT /app/docker_startup.sh