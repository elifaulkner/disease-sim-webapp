echo "Starting nginx"
/usr/sbin/nginx
echo "Starting API"
gunicorn --bind=0.0.0.0:5000 --access-logfile "-" --log-file "-" main:app