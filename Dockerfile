FROM python:3.8-slim-buster AS unittest

WORKDIR /app/

RUN pip install scipy matplotlib flask requests python-dotenv==0.13.0 fusionauth-client pony

COPY api/ /app/
COPY api/test/ /app/test
COPY api/.flaskenv.prod /app/.flaskenv

RUN pip install coverage
RUN coverage run -m unittest discover -v -s /app/test/ -p Test_*.py
RUN coverage report -m

FROM node:lts AS ui-build

WORKDIR /usr/src/app/

COPY . /usr/src/app/

RUN npm install
RUN yarn build

FROM python:3.8-slim-buster

RUN apt-get update \
    && apt-get install -y nginx-full libpq-dev gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ui-build /usr/src/app/build /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/nginx.conf

#RUN echo "127.0.0.1 auth.localhost" >> /etc/hosts
COPY nginx/auth.localhost /etc/nginx/sites-available/
RUN ln -s /etc/nginx/sites-available/auth.localhost /etc/nginx/sites-enabled/auth.localhost

#RUN echo "127.0.0.1 auth.infectiousdiseasemodel.com" >> /etc/hosts
COPY nginx/auth.infectiousdiseasemodel.com /etc/nginx/sites-available/
RUN ln -s /etc/nginx/sites-available/auth.infectiousdiseasemodel.com /etc/nginx/sites-enabled/auth.infectiousdiseasemodel.com

COPY /nginx/default /etc/nginx/sites-available/

EXPOSE 80

WORKDIR /app/

RUN pip install --no-cache-dir scipy matplotlib flask requests 
RUN pip install --no-cache-dir gunicorn==20.0.4 python-dotenv==0.13.0 fusionauth-client pony
RUN pip install --no-cache-dir psycopg2-binary
RUN pip install --no-cache-dir psycopg2cffi

COPY api/ /app/
COPY api/.flaskenv.prod /app/.flaskenv

COPY docker_startup.sh /app/
RUN chmod +x docker_startup.sh

ENTRYPOINT ["/app/docker_startup.sh"]
