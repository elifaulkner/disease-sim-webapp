#FROM continuumio/miniconda3 as unittest
FROM python:3.7-slim-stretch as unittest

WORKDIR /app/

#COPY api/environment.yml /app/
#RUN conda env create -f environment.yml && conda clean -afy
RUN pip install scipy matplotlib flask pymc3==3.8 requests python-dotenv==0.13.0 fusionauth-client pony 

COPY api/ /app/
COPY api/test/ /app/test
COPY api/.flaskenv.prod /app/.flaskenv

#RUN conda install -n idm coverage
#RUN conda run -n idm coverage run -m unittest discover -v -s /app/test/ -p Test_*.py
#RUN conda run -n idm coverage report -m

RUN pip install coverage
RUN coverage run -m unittest discover -v -s /app/test/ -p Test_*.py
RUN coverage report -m

FROM node:latest as ui-build

WORKDIR /usr/src/app/

COPY . /usr/src/app/

RUN npm install
RUN yarn build

#FROM continuumio/miniconda3
FROM python:3.7-slim-stretch

RUN apt-get update 
RUN apt-get --yes install nginx-full && apt-get --yes install libpq-dev && apt-get --yes install gcc 
RUN apt-get clean && apt-get autoremove -y 
RUN rm -rf /var/lib/apt/lists/*

COPY --from=ui-build /usr/src/app/build /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/nginx.conf

RUN echo "127.0.0.1 auth.localhost" >> /etc/hosts
COPY nginx/auth.localhost /etc/nginx/sites-available/
RUN ln -s /etc/nginx/sites-available/auth.localhost /etc/nginx/sites-enabled/auth.localhost

RUN echo "127.0.0.1 auth.infectiousdiseasemodel.com" >> /etc/hosts
COPY nginx/auth.infectiousdiseasemodel.com /etc/nginx/sites-available/
RUN ln -s /etc/nginx/sites-available/auth.infectiousdiseasemodel.com /etc/nginx/sites-enabled/auth.infectiousdiseasemodel.com

COPY /nginx/default /etc/nginx/sites-available/

EXPOSE 80

WORKDIR /app/

#COPY api/environment.yml /app/
#RUN conda env create -f environment.yml && conda clean -afy

RUN pip install --no-cache-dir scipy matplotlib flask pymc3==3.8 requests psycopg2-binary gunicorn==20.0.4 python-dotenv==0.13.0 fusionauth-client pony psycopg2cffi

COPY api/ /app/
COPY api/.flaskenv.prod /app/.flaskenv

#SHELL ["conda", "run", "-n", "idm", "/bin/bash", "-c"]

COPY docker_startup.sh /app/
RUN chmod +x docker_startup.sh

ENTRYPOINT /app/docker_startup.sh