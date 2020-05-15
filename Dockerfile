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

COPY nginx.conf /etc/nginx/nginx.conf
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