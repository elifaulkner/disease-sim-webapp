echo "Starting nginx"
/usr/sbin/nginx
echo "Starting API"
conda run -n idm gunicorn --bind=0.0.0.0:5000 main:app