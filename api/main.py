from flask import Flask
from flask import request, render_template, jsonify
from scir import DiseaseModel

app = Flask(__name__)

def build_json(t, sim):
    return jsonify({
        'time' : list(t),
        'suseptible':list(sim[:,0]),
        'infectious':list(sim[:,1]),
        'hospitalized':list(sim[:,2]),
        'recovered':list(sim[:,3]),
        'dead':list(sim[:,4])
        })

@app.route('/api/hello/', methods=['GET'])
def hello():
    print('Hello')
    return 'Hello'

@app.route('/api/simulate/<float:R0>/<float:avg_days_infected>/<float:avg_days_hospitalized>/<float:avg_days_immune>/<float:p_hospitalization_given_infection>/<float:p_death_given_hospitalization>/<int:max_time>/<int:num_time_points>/<float:init_infection>', methods=['GET'])
def simulate(R0, avg_days_infected, avg_days_hospitalized, avg_days_immune, p_hospitalization_given_infection, p_death_given_hospitalization,max_time, num_time_points, init_infection):
    model = DiseaseModel(float(R0), float(avg_days_infected), float(avg_days_hospitalized), avg_days_immune, p_hospitalization_given_infection, p_death_given_hospitalization)
    t, sim = model.simulate(max_time, num_time_points, init_infection)
    return build_json(t, sim)

@app.route('/api/simulate', methods=['POST'])
def simulate_post():
    R0 = float(request.json['disease_parameters']['R0'])
    avg_days_infected = float(request.json['disease_parameters']['avg_days_infected'])
    avg_days_hospitalized = float(request.json['disease_parameters']['avg_days_hospitalized'])
    avg_days_immune = float(request.json['disease_parameters']['avg_days_immune'])
    p_hospitalization_given_infection = float(request.json['disease_parameters']['p_hospitalization_given_infection'])
    p_death_given_hospitalization = float(request.json['disease_parameters']['p_death_given_hospitalization'])
    max_time = int(request.json['sim_parameters']['max_time'])
    num_time_points = int(request.json['sim_parameters']['num_time_points'])
    init_infection = float(request.json['sim_parameters']['init_infection'])

    model = DiseaseModel(R0, avg_days_infected, avg_days_hospitalized, avg_days_immune, p_hospitalization_given_infection, p_death_given_hospitalization)
    t, sim = model.simulate(max_time, num_time_points, init_infection)
    return build_json(t, sim)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)