import requests
import datetime
import dateutil.parser as parser

def get_state_data(state_code):
    r = requests.get('https://data.cdc.gov/resource/9mfq-cb36.json?state='+state_code)
    minDate = datetime.date(9999, 12, 31)
    for x in r.json():
        date = split_date(x['submission_date'])
        if(date < minDate):
            minDate = date

    data = []
    for x in r.json():
        date = split_date(x['submission_date'])
        days = (date-minDate).days

        if 'tot_cases' in x and x['tot_cases'] is not None:
            data.append({'day':days, 'state': 'confirmed', 'count': x['tot_cases']})
        if 'tot_death' in x and x['tot_death'] is not None:
            data.append({'day':days, 'state': 'deaths', 'count': x['tot_death']})

    return data

def split_date(string):
    string = str(string)
    return parser.isoparse(string).date()