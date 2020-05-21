echo "Starting nginx"
/usr/sbin/nginx
echo "Starting API"
mkdir /var/log/gunicorn/
gunicorn --bind=0.0.0.0:5000 --access-logfile /var/log/gunicorn/gunicorn-access --log-file /var/log/gunicorn/gunicorn-error main:app