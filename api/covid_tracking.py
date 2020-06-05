import requests 
import datetime
import dateutil.parser as parser

def get_state_data(state_code):
    r = requests.get('https://covidtracking.com/api/v1/states/'+state_code.lower()+'/daily.json')
    minDate = datetime.date(9999, 12, 31)
    for x in r.json():
        date = split_date(x['date'])
        if(date < minDate):
            minDate = date

    data = []
    for x in r.json():
        date = split_date(x['date'])
        days = (date-minDate).days

        if 'positive' in x and x['positive'] is not None:
            data.append({'day':days, 'state': 'confirmed', 'count': x['positive']})
        if 'hospitalizedCumulative' in x and x['hospitalizedCumulative'] is not None:
            data.append({'day':days, 'state': 'hospitalized', 'count': x['hospitalizedCumulative']})
        elif 'hospitalizedCurrently' in x and x['hospitalizedCurrently'] is not None:
            data.append({'day':days, 'state': 'hospitalized_current', 'count': x['hospitalizedCurrently']})
        if 'death' in x and x['death'] is not None:
            data.append({'day':days, 'state': 'deaths', 'count': x['death']})

    return data

def split_date(string):
    string = str(string)
    return parser.isoparse(string).date()
