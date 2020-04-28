from flask import Flask
from flask import request, render_template, jsonify
from scir import DiseaseModel, Interventions, Intervention
import calibration as cal

app = Flask(__name__)

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
    print('Hello')
    return 'Hello'

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

    sln = cal.calibrate(calibration_data, interventions, R0, avg_days_infected, avg_days_hospitalized, avg_days_immune, p_hospitalization_given_infection, p_death_given_hospitalization, confirmed_case_percentage, init_infection, init_recovered, population)

    return jsonify(sln)

@app.route('/api/simulate/<float:R0>/<float:avg_days_infected>/<float:avg_days_hospitalized>/<float:avg_days_immune>/<float:p_hospitalization_given_infection>/<float:p_death_given_hospitalization>/<int:max_time>/<int:num_time_points>/<float:init_infection>', methods=['GET'])
def simulate(R0, avg_days_infected, avg_days_hospitalized, avg_days_immune, p_hospitalization_given_infection, p_death_given_hospitalization,max_time, num_time_points, init_infection):
    model = DiseaseModel(float(R0), float(avg_days_infected), float(avg_days_hospitalized), avg_days_immune, p_hospitalization_given_infection, p_death_given_hospitalization)
    t, sim = model.simulate(max_time, num_time_points, init_infection)
    return build_json(t, sim)

def intervention_from_dict(dict, sign):
    return Intervention(dict['name'], float(dict['start']), float(dict['end']), 1+sign*float(dict['effectiveness']))

def interventions_from_list(list):
    interventions = Interventions()
    interventions.infection_rate = [intervention_from_dict(x, -1) for x in list if x['type'] == 'infection_rate']
    interventions.infection_time = [intervention_from_dict(x, 1) for x in list if x['type'] == 'infection_time']
    interventions.hospitilization_time = [intervention_from_dict(x, 1) for x in list if x['type'] == 'hospitilization_time']
    interventions.immunity_time = [intervention_from_dict(x, -1) for x in list if x['type'] == 'immunity_time']
    interventions.hospitilization_rate = [intervention_from_dict(x, -1) for x in list if x['type'] == 'hospitilization_rate']
    interventions.death_rate = [intervention_from_dict(x, -1) for x in list if x['type'] == 'death_rate']
    interventions.confirmed_case_percentage = [intervention_from_dict(x, 1) for x in list if x['type'] == 'confirmed_case_percentage']
    return interventions

@app.route('/api/simulate', methods=['POST'])
def simulate_post():
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
    model = DiseaseModel(R0, avg_days_infected, avg_days_hospitalized, avg_days_immune, p_hospitalization_given_infection, p_death_given_hospitalization, confirmed_case_percentage)
    t, sim = model.simulate(max_time, max_time+1, init_infection/population, init_recovered/population, interventions)
    return build_json(t, sim)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)