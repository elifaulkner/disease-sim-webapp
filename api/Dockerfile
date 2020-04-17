from python

WORKDIR /app/

COPY *.py /app/
COPY .flaskenv /app/
COPY requirements.txt /app/

RUN pip install -r requirements.txt

EXPOSE 5000

ENTRYPOINT [ "flask", "run" ]