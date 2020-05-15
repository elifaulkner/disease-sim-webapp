
import json
import os
import datetime as dt
from datetime import datetime
from pony.orm import Database, Required, PrimaryKey, Json, commit, select, db_session, delete


db = Database()
host = os.environ.get('IDM_DB_HOST')
port = os.environ.get('IDM_DB_PORT')
password = os.environ.get('IDM_DB_PASSWORD')

db.bind(provider='postgres', user='idm', password=password, host=host, database='idm_models', port=port)
class Model(db.Entity):
    user = Required(str)
    name = Required(str)
    PrimaryKey(user, name)
    model = Required(Json)
    modified = Required(datetime)
    created = Required(datetime)

db.generate_mapping(create_tables=True)

@db_session
def rename_model(oldname, newname, user):
    model = Model.get(user=user, name=oldname)
    model.name = newname
    model.modified = dt.datetime.utcnow()
    commit()

@db_session
def save_model(name, user, new_model):
    model = Model.get(user=user, name=name)
    if model:
        model.model = new_model
        model.modified = dt.datetime.utcnow()
    else:
        time = dt.datetime.utcnow()
        model = Model(user = user, name = name, model = new_model, modified=time, created = time)
    commit()
    return

@db_session
def load_model(name, user):
    model = Model.get(user=user, name=name)
    return model.model

@db_session
def delete_model(name, user):
    model = Model.get(user=user, name=name)
    model.delete()
    commit()
    return model.model

@db_session
def list_models(user):
    models = select((m.name, m.modified) for m in Model if m.user == user)
    return [{'name': x[0], 'modified': x[1]} for x in models]

if __name__ == '__main__':
    list_models('124979431')