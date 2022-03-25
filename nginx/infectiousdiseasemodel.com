server { # simple reverse-proxy
    listen 80;
    server_name infectiousdiseasemodel.com;
    
    # serve static files
    location /  {
        root    /usr/share/nginx/html;
        expires 30d;
    }

    # pass requests for dynamic content to rails/turbogears/zope, et al
    location /api {
        proxy_pass      http://localhost:5000;
    }
}


server {
    listen 443 ssl;
    server_name www.infectiousdiseasemodel.com infectiousdiseasemodel.com;
    ssl_certificate /etc/letsencrypt/live/infectiousdiseasemodel.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/infectiousdiseasemodel.com/privkey.pem;

    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # serve static files
    location /  {
        root    /usr/share/nginx/html;
        expires 30d;
    }

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # pass requests for dynamic content to rails/turbogears/zope, et al
    location /api {
        proxy_pass      http://localhost:5000;
    }
}