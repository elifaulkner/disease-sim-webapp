server {
    listen 80;
    server_name auth.infectiousdiseasemodel.com;

    location / {
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $http_host;
    # proxy_set_header X-NginX-Proxy true;

    proxy_pass http://fusionauth:9011;
    proxy_redirect off;
    }
}


server {
    listen 443 ssl;
    server_name auth.infectiousdiseasemodel.com;
    ssl_certificate /etc/letsencrypt/live/auth.infectiousdiseasemodel.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/auth.infectiousdiseasemodel.com/privkey.pem;

    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $http_host;
    # proxy_set_header X-NginX-Proxy true;

    proxy_pass http://fusionauth:9011;
    proxy_redirect off;
    }

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}