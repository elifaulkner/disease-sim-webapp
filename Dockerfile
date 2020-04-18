FROM python

RUN apt-get update
RUN apt-cache search nginx
RUN apt-get --yes install nginx-full

COPY build/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80

RUN which nginx 

RUN pip install --upgrade pip

RUN pip install numpy scipy pandas matplotlib

WORKDIR /app/

COPY api/ /app/

RUN pip install flask
RUN pip install -r /app/requirements.txt

COPY docker_startup.sh /app/
RUN chmod +x docker_startup.sh

#CMD ["nginx", "-g", "daemon on;"]
ENTRYPOINT /app/docker_startup.sh