FROM continuumio/miniconda3 as unittest

WORKDIR /app/

COPY api/environment.yml /app/
RUN conda env create -f environment.yml 

COPY api/ /app/
COPY api/test/ /app/test
COPY api/.flaskenv.prod /app/.flaskenv

RUN conda install -n idm coverage

RUN conda run -n idm coverage run -m unittest discover -v -s /app/test/ -p Test_*.py
RUN conda run -n idm coverage report -m

FROM node:latest as ui-build

WORKDIR /usr/src/app/

COPY . /usr/src/app/
RUN ls /usr/src/app/

RUN npm install
RUN yarn build

FROM continuumio/miniconda3

RUN apt-get update
RUN apt-cache search nginx
RUN apt-get --yes install nginx-full
RUN apt-get --yes install libpq-dev

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

COPY api/environment.yml /app/
RUN conda env create -f environment.yml 

COPY api/ /app/
COPY api/.flaskenv.prod /app/.flaskenv

SHELL ["conda", "run", "-n", "idm", "/bin/bash", "-c"]

COPY docker_startup.sh /app/
RUN chmod +x docker_startup.sh

ENTRYPOINT /app/docker_startup.sh