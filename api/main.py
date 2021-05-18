import os
from flask import Flask
from flask import request, render_template, jsonify, redirect, session, make_response, url_for
from scir import DiseaseModel, Interventions, Intervention, build_dict
import calibration as cal
#import bayesian_calibration as bayesian_cal
import covid_tracking
import cdc_data
import requests
from fusionauth.fusionauth_client import FusionAuthClient
import data
from sensitivities import Sensitivities

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY') if os.environ.get('FLASK_SECRET_KEY') else 'lsdhfalwehflawehfla'

def build_json(t, sim):
    return jsonify({
        'time' : list(t),
        'suseptible':list(sim[:,0]),
        'infectious':list(sim[:,1]),
        'hospitalized':list(sim[:,2]),
        'recovered':list(sim[:,3]),
        'dead':list(sim[:,4]),
        'cumulative_infectious':list(sim[:,5]),
        'cumulative_confirmed':list(sim[:,6]),
        'cumulative_hospitalized':list(sim[:,7])
        })

@app.route('/api/hello/', methods=['GET'])
def hello():
    return 'Hello'

@app.route('/api/auth/login', methods=['GET'])
def auth_login():
    api_key = os.environ.get('FUSION_API_KEY')
    client_id = os.environ.get('FUSION_CLIENT_ID')
    client_secret = os.environ.get('FUSION_CLIENT_SECRET')
    fusion_url = os.environ.get('FUSION_URL_PUBLIC')
    app_url = os.environ.get('APP_URL')
    callback = app_url+'/api/auth/callback'

    print(fusion_url)
    return redirect(fusion_url+'/oauth2/authorize?client_id='+client_id+'&response_type=code&redirect_uri='+callback, code=302)

@app.route('/api/auth/callback', methods=['GET'])
def auth_callback():
    api_key = os.environ.get('FUSION_API_KEY')
    client_id = os.environ.get('FUSION_CLIENT_ID')
    client_secret = os.environ.get('FUSION_CLIENT_SECRET')
    fusion_url = os.environ.get('FUSION_URL')
    app_url = os.environ.get('APP_URL')

    fusion_client = FusionAuthClient(api_key, fusion_url)
 
    response = fusion_client.exchange_o_auth_code_for_access_token(code=request.args.get('code'), client_id=client_id,  redirect_uri=app_url+'/api/auth/callback', client_secret=client_secret)

    print(response.status)
    if(response.was_successful()):
        session['userId'] = response.success_response['userId']
        session['token_type'] = response.success_response['token_type']
        session['access_token'] = response.success_response['access_token']
        session['expires_in'] = response.success_response['expires_in']
        return redirect(app_url)
    else:
        return jsonify(response.error_response)

@app.route('/api/auth/user', methods=['GET'])
def auth_user():
    if 'userId' in session:
        return session['userId']
    return make_response(404)

@app.route('/api/auth/logout', methods=['GET'])
def auth_logout():
    client_id = os.environ.get('FUSION_CLIENT_ID')
    fusion_url = os.environ.get('FUSION_URL_PUBLIC')
    app_url = os.environ.get('APP_URL')

    url = fusion_url+'/oauth2/logout?client_id='+client_id+'&post_logout_redirect_uri='+app_url

    session.pop('userId')
    session.pop('token_type')
    session.pop('access_token')
    session.pop('expires_in')

    return redirect(url)
    
@app.route('/api/calibrate', methods=['POST'])
def calibrate():
    R0 = float(request.json['disease_parameters']['R0'])
    avg_days_infected = float(request.json['disease_parameters']['avg_days_infected'])
    avg_days_hospitalized = float(request.json['disease_parameters']['avg_days_hospitalized'])
    avg_days_immune = float(request.json['disease_parameters']['avg_days_immune'])
    p_hospitalization_given_infection = float(request.json['disease_parameters']['p_hospitalization_given_infection'])
    p_death_given_hospitalization = float(request.json['disease_parameters']['p_death_given_hospitalization'])
    confirmed_case_percentage = float(request.json['disease_parameters']['confirmed_case_percentage'])
    max_time = int(request.json['sim_parameters']['max_time'])
    init_infection = float(request.json['sim_parameters']['init_infection'])
    init_recovered = float(request.json['sim_parameters']['init_recovered'])
    population = float(request.json['sim_parameters']['population'])

    interventions = interventions_from_list(request.json['interventions'])

    calibration_data = request.json['calibration_data']
    calibration_variables = request.json['calibration_variables']

    method = request.json['calibration_method']

    #if(request.json['calibration_method'] == 'least_squares'):
    [sln, factory, sol] = cal.calibrate(calibration_variables, calibration_data, interventions, R0, avg_days_infected, avg_days_hospitalized, avg_days_immune, p_hospitalization_given_infection, p_death_given_hospitalization, confirmed_case_percentage, init_infection, init_recovered, population, method)
    return jsonify(sln)

    # if(request.json['calibration_method'] == 'vi'):
    #     sln = bayesian_cal.calibrate(calibration_variables, calibration_data, interventions, R0, avg_days_infected, avg_days_hospitalized, avg_days_immune, p_hospitalization_given_infection, p_death_given_hospitalization, confirmed_case_percentage, init_infection, init_recovered, population)
    #     print(sln)
    #     return jsonify(sln)
    
    #return jsonify({})

@app.route('/api/simulate/<float:R0>/<float:avg_days_infected>/<float:avg_days_hospitalized>/<float:avg_days_immune>/<float:p_hospitalization_given_infection>/<float:p_death_given_hospitalization>/<int:max_time>/<int:num_time_points>/<float:init_infection>', methods=['GET'])
def simulate(R0, avg_days_infected, avg_days_hospitalized, avg_days_immune, p_hospitalization_given_infection, p_death_given_hospitalization,max_time, num_time_points, init_infection):
    model = DiseaseModel(float(R0), float(avg_days_infected), float(avg_days_hospitalized), avg_days_immune, p_hospitalization_given_infection, p_death_given_hospitalization, Interventions())
    t, sim = model.simulate(max_time, num_time_points, init_infection)
    return build_json(t, sim)

def intervention_from_dict(dict, sign=-1):
    return Intervention(dict['name'], float(dict['start']), float(dict['end']), 1+sign*float(dict['effectiveness']), sign)

def interventions_from_list(list):
    interventions = Interventions()
    interventions.infection_rate = [intervention_from_dict(x) for x in list if x['type'] == 'infection_rate']
    interventions.infection_time = [intervention_from_dict(x) for x in list if x['type'] == 'infection_time']
    interventions.hospitilization_time = [intervention_from_dict(x) for x in list if x['type'] == 'hospitilization_time']
    interventions.immunity_time = [intervention_from_dict(x) for x in list if x['type'] == 'immunity_time']
    interventions.hospitilization_rate = [intervention_from_dict(x) for x in list if x['type'] == 'hospitilization_rate']
    interventions.death_rate = [intervention_from_dict(x) for x in list if x['type'] == 'death_rate']
    interventions.confirmed_case_percentage = [intervention_from_dict(x, 1) for x in list if x['type'] == 'confirmed_case_percentage']
    interventions.immunization_rate = [Intervention(x['name'], float(x['start']), float(x['end']), float(x['effectiveness'])) for x in list if x['type'] == 'immunization_rate']
    return interventions

@app.route('/api/simulate', methods=['POST'])
def simulate_post():
    try:
        print(session.get('userId'))
        R0 = float(request.json['disease_parameters']['R0'])
        avg_days_infected = float(request.json['disease_parameters']['avg_days_infected'])
        avg_days_hospitalized = float(request.json['disease_parameters']['avg_days_hospitalized'])
        avg_days_immune = float(request.json['disease_parameters']['avg_days_immune'])
        p_hospitalization_given_infection = float(request.json['disease_parameters']['p_hospitalization_given_infection'])
        p_death_given_hospitalization = float(request.json['disease_parameters']['p_death_given_hospitalization'])
        confirmed_case_percentage = float(request.json['disease_parameters']['confirmed_case_percentage'])
        max_time = int(request.json['sim_parameters']['max_time'])
        init_infection = float(request.json['sim_parameters']['init_infection'])
        init_recovered = float(request.json['sim_parameters']['init_recovered'])
        population = float(request.json['sim_parameters']['population'])
        
        interventions = interventions_from_list(request.json['interventions'])
        model = DiseaseModel(R0, avg_days_infected, avg_days_hospitalized, avg_days_immune, p_hospitalization_given_infection, p_death_given_hospitalization, confirmed_case_percentage, interventions)
        t, sim = model.simulate(max_time, max_time+1, init_infection/population, init_recovered/population)
        return build_json(t, sim)
    except Exception as e:
        return make_response(str(e), 500)

@app.route('/api/simulate/sensitivities', methods=['POST'])
def sensitivities_post():
    try:
        print(session.get('userId'))
        R0 = float(request.json['disease_parameters']['R0'])
        avg_days_infected = float(request.json['disease_parameters']['avg_days_infected'])
        avg_days_hospitalized = float(request.json['disease_parameters']['avg_days_hospitalized'])
        avg_days_immune = float(request.json['disease_parameters']['avg_days_immune'])
        p_hospitalization_given_infection = float(request.json['disease_parameters']['p_hospitalization_given_infection'])
        p_death_given_hospitalization = float(request.json['disease_parameters']['p_death_given_hospitalization'])
        confirmed_case_percentage = float(request.json['disease_parameters']['confirmed_case_percentage'])
        max_time = int(request.json['sim_parameters']['max_time'])
        init_infection = float(request.json['sim_parameters']['init_infection'])
        init_recovered = float(request.json['sim_parameters']['init_recovered'])
        population = float(request.json['sim_parameters']['population'])
        
        interventions = interventions_from_list(request.json['interventions'])
        model = DiseaseModel(R0, avg_days_infected, avg_days_hospitalized, avg_days_immune, p_hospitalization_given_infection, p_death_given_hospitalization, confirmed_case_percentage, interventions)
        
        sensitivities = Sensitivities(model, max_time, max_time, init_infection, init_recovered, population)
        return jsonify(sensitivities.build_sensitivities())
    except Exception as e:
        return make_response(str(e), 500)


@app.route('/api/data/covid/state/<code>', methods=['GET'])
def get_state_data(code):
    return jsonify(covid_tracking.get_state_data(code))

@app.route('/api/data/covid/cdc/state/<code>', methods=['GET'])
def get_cdc_state_data(code):
    return jsonify(cdc_data.get_state_data(code))

def get_user():
    if 'userId' in session:
        return session['userId']
    return None

@app.route('/api/models/<name>', methods=['PUT'])
def save_model(name):
    user = get_user()
    if(user is None):
        return make_response("Please Login Before Saving", 401)
    model = request.json
    try:
        data.save_model(name, user, model)
        return jsonify({})
    except Exception as e:
        return make_response(str(e), 500)

@app.route('/api/models/list', methods=['GET'])
def list_models():
    user = get_user()
    if(user is None):
        return make_response("Please login to see Models", 401)
    l = data.list_models(user)
    return jsonify(l)

@app.route('/api/models/<name>', methods=['GET'])
def get_model(name):
    user = get_user()
    if(user is None):
        return make_response("Please Login", 401)
    model = data.load_model(name, user)
    return jsonify(model)

@app.route('/api/models/<name>', methods=['DELETE'])
def delete_model(name):
    user = get_user()
    if(user is None):
        return make_response("Please Login", 401)
    data.delete_model(name, user)
    return ''

@app.route('/api/models/<name>/rename/<newname>', methods=['PUT'])
def rename_model(name, newname):
    user = get_user()
    if(user is None):
        return make_response("Please Login", 401)
    return data.rename_model(name, newname, user)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)