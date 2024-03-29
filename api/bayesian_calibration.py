import os
os.environ["OMP_NUM_THREADS"] = "6" # export OMP_NUM_THREADS=4
os.environ["OPENBLAS_NUM_THREADS"] = "6" # export OPENBLAS_NUM_THREADS=4 
os.environ["MKL_NUM_THREADS"] = "6" # export MKL_NUM_THREADS=6
os.environ["VECLIB_MAXIMUM_THREADS"] = "6" # export VECLIB_MAXIMUM_THREADS=4
os.environ["NUMEXPR_NUM_THREADS"] = "6" # export NUMEXPR_NUM_THREADS=6
os.environ["MKL_THREADING_LAYER"] = "GNU"
import numpy as np
from scipy.integrate import odeint
import theano
from scir import DiseaseModel, Interventions, Intervention
import matplotlib.pyplot as plt
from flask import  jsonify
import pymc3 as pm
from pymc3.ode import DifferentialEquation
from pymc3.variational.callbacks import CheckParametersConvergence

class MyCallback(pm.callbacks.Callback):
    def __init__(self, **kwargs):
        self.kwargs = kwargs

    def __call__(self, approx, loss, i):
        print("Iter: " + str(i))
        print('Mean: '+str(approx.mean.eval()))
        print('Std: '+str(approx.std.eval()))

def calibrate(calibration_variables, calibration_data, interventions, R0, avg_days_infected, avg_days_hospitalized, avg_days_immune, p_hospitalization_given_infection, p_death_given_hospitalization, confirmed_case_percentage, init_infection, init_recovered, population):
    def _isActive(i, t):
        return False

    interventions.isActive = _isActive
    print("Starting model set up")

    model = DiseaseModel(R0, avg_days_infected, avg_days_hospitalized, avg_days_immune, p_hospitalization_given_infection, p_death_given_hospitalization, confirmed_case_percentage, interventions)
    ic = model.get_initial_conditions(init_infection, init_recovered)
    max_date = max([int(x['day']) for x in calibration_data])

    calibration_data.sort(key=lambda d : d['day'])

    confirmed = [x for x in calibration_data if x['state'] == 'confirmed']
    c_days = [x['day'] for x in confirmed]
    c_counts = [x['count']/population for x in confirmed]
    c_sir_model = DifferentialEquation(func=model.equation(), times=c_days, n_states=8, n_theta=7)

    hospitalized = [x for x in calibration_data if x['state'] == 'hospitalized']
    h_days = [x['day'] for x in hospitalized]
    h_counts = [x['count']/population for x in hospitalized]
    h_sir_model = DifferentialEquation(func=model.equation(), times=h_days, n_states=8, n_theta=7)

    hospitalized_c = [x for x in calibration_data if x['state'] == 'hospitalized_current']
    hc_days = [x['day'] for x in hospitalized_c]
    hc_counts = [x['count']/population for x in hospitalized_c]
    hc_sir_model = DifferentialEquation(func=model.equation(), times=hc_days, n_states=8, n_theta=7)

    deaths = [x for x in calibration_data if x['state'] == 'deaths']
    d_days = [x['day'] for x in deaths]
    d_counts = [x['count']/population for x in deaths]
    d_sir_model = DifferentialEquation(func=model.equation(), times=d_days, n_states=8, n_theta=7)

    print("Starting pm model")

    with pm.Model() as model:
        if('R0' in calibration_variables):
            R0 = pm.Lognormal('R0', pm.floatX(R0), 0.2)
        
        if('avg_days_infected' in calibration_variables):
            avg_days_infected = pm.Bound(pm.Gamma, lower=1, upper=30)('avg_days_infected', mu=avg_days_infected, sigma=0.2)

        if('avg_days_hospitalized' in calibration_variables):
            avg_days_hospitalized = pm.Bound(pm.Gamma, lower=1, upper=30)('avg_days_hospitalized', mu=avg_days_hospitalized, sigma=0.2)

        if('avg_days_immune' in calibration_variables):
            avg_days_immune = pm.Bound(pm.Gamma, lower=1)('avg_days_immune', mu=pm.floatX(avg_days_immune), sigma=pm.floatX(0.2))

        if('p_hospitalization_given_infection' in calibration_variables):
            p_hospitalization_given_infection = pm.Beta('p_hospitalization_given_infection', mu=p_hospitalization_given_infection, sigma=.2)
        
        if('p_death_given_hospitalization' in calibration_variables):
            p_death_given_hospitalization = pm.Beta('p_death_given_hospitalization', mu=p_death_given_hospitalization, sigma=.2)

        if('confirmed_case_percentage' in calibration_variables):            
            confirmed_case_percentage = pm.Beta('confirmed_case_percentage', mu=confirmed_case_percentage, sigma = .2)

        print("Running ODE")
        if(len(c_counts) > 0):
            c_ode_sln = c_sir_model(y0=ic, theta=[R0, avg_days_infected, avg_days_hospitalized, p_hospitalization_given_infection, p_death_given_hospitalization, avg_days_immune, confirmed_case_percentage])
            confirmed = pm.Normal('confirmed', mu=c_ode_sln[:,6], sigma=.2, observed=c_counts)

        if(len(h_counts) > 0):
            h_ode_sln = h_sir_model(y0=ic, theta=[R0, avg_days_infected, avg_days_hospitalized, p_hospitalization_given_infection, p_death_given_hospitalization, avg_days_immune, confirmed_case_percentage])
            hospitalized = pm.Normal('hospitalized', mu=h_ode_sln[:,7], sigma=.2, observed=h_counts)

        if(len(hc_counts) > 0):
            hc_ode_sln = hc_sir_model(y0=ic, theta=[R0, avg_days_infected, avg_days_hospitalized, p_hospitalization_given_infection, p_death_given_hospitalization, avg_days_immune, confirmed_case_percentage])
            hospitalized_current = pm.Normal('hospitalized_current', mu=hc_ode_sln[:,2], sigma=.2, observed=hc_counts)

        if(len(c_counts) > 0):
            d_ode_sln = d_sir_model(y0=ic, theta=[R0, avg_days_infected, avg_days_hospitalized, p_hospitalization_given_infection, p_death_given_hospitalization, avg_days_immune, confirmed_case_percentage])
            deaths = pm.Normal('deaths', mu=d_ode_sln[:,4], sigma=.2, observed=d_counts)
        
        print("Fitting model")
        with model:
            callback = MyCallback()
            mean_field = pm.fit(method='advi', n=100, callbacks=[callback, CheckParametersConvergence()])

            means_dict = mean_field.bij.rmap(mean_field.params[0].eval())
            as_list = [convert_means_dict_entry(kv[0], kv[1]) for kv in means_dict.items()]
            sln = {x[0]: x[1] for x in as_list}
            return sln

def convert_means_dict_entry(key, value):
    if key.endswith('_interval__'):
        return (key.replace('_interval__', ''),  np.asscalar(np.exp(value)))
    if key.endswith('_log__'):
        return (key.replace('_log__', ''),  np.asscalar(value))
    if key.endswith('_logodds__'):
        return (key.replace('_logodds__', ''), np.asscalar((np.exp(value))))

if __name__ == '__main__':
    print("Starting Calibration")

    pop = 19450000

    interventions = Interventions()
    interventions.infection_rate.append(Intervention("Social Distancing", 45, 150, .8))
    #interventions.infection_rate.append(Intervention("Handwashing Media", 20, 200, .95))
    #interventions.infection_rate.append(Intervention("Public Facemasks", 60, 150, .9))
    #interventions.death_rate.append(Intervention("Ventilators", 60, 150, .8))

    calibration_data = [{"count":318953,"day":61,"state":"confirmed"},{"count":69331,"day":61,"state":"hospitalized_current"},{"count":19415,"day":61,"state":"deaths"},{"count":316415,"day":60,"state":"confirmed"},{"count":68736,"day":60,"state":"hospitalized_current"},{"count":19189,"day":60,"state":"deaths"},{"count":312977,"day":59,"state":"confirmed"},{"count":67890,"day":59,"state":"hospitalized_current"},{"count":18909,"day":59,"state":"deaths"},{"count":308314,"day":58,"state":"confirmed"},{"count":67180,"day":58,"state":"hospitalized_current"},{"count":18610,"day":58,"state":"deaths"},{"count":304372,"day":57,"state":"confirmed"},{"count":66369,"day":57,"state":"hospitalized_current"},{"count":18321,"day":57,"state":"deaths"},{"count":299691,"day":56,"state":"confirmed"},{"count":65397,"day":56,"state":"hospitalized_current"},{"count":18015,"day":56,"state":"deaths"},{"count":295106,"day":55,"state":"confirmed"},{"count":64318,"day":55,"state":"hospitalized_current"},{"count":17638,"day":55,"state":"deaths"},{"count":291996,"day":54,"state":"confirmed"},{"count":63570,"day":54,"state":"hospitalized_current"},{"count":17303,"day":54,"state":"deaths"},{"count":288045,"day":53,"state":"confirmed"},{"count":62526,"day":53,"state":"hospitalized_current"},{"count":16966,"day":53,"state":"deaths"},{"count":282143,"day":52,"state":"confirmed"},{"count":61459,"day":52,"state":"hospitalized_current"},{"count":16599,"day":52,"state":"deaths"},{"count":271590,"day":51,"state":"confirmed"},{"count":60414,"day":51,"state":"hospitalized_current"},{"count":16162,"day":51,"state":"deaths"},{"count":263460,"day":50,"state":"confirmed"},{"count":59265,"day":50,"state":"hospitalized_current"},{"count":15740,"day":50,"state":"deaths"},{"count":257216,"day":49,"state":"confirmed"},{"count":57907,"day":49,"state":"hospitalized_current"},{"count":15302,"day":49,"state":"deaths"},{"count":251690,"day":48,"state":"confirmed"},{"count":56526,"day":48,"state":"hospitalized_current"},{"count":14828,"day":48,"state":"deaths"},{"count":247512,"day":47,"state":"confirmed"},{"count":55188,"day":47,"state":"hospitalized_current"},{"count":14347,"day":47,"state":"deaths"},{"count":242786,"day":46,"state":"confirmed"},{"count":53809,"day":46,"state":"hospitalized_current"},{"count":13869,"day":46,"state":"deaths"},{"count":236732,"day":45,"state":"confirmed"},{"count":52425,"day":45,"state":"hospitalized_current"},{"count":13362,"day":45,"state":"deaths"},{"count":229642,"day":44,"state":"confirmed"},{"count":50508,"day":44,"state":"hospitalized_current"},{"count":12822,"day":44,"state":"deaths"},{"count":222284,"day":43,"state":"confirmed"},{"count":48535,"day":43,"state":"hospitalized_current"},{"count":12192,"day":43,"state":"deaths"},{"count":213779,"day":42,"state":"confirmed"},{"count":46539,"day":42,"state":"hospitalized_current"},{"count":11586,"day":42,"state":"deaths"},{"count":202208,"day":41,"state":"confirmed"},{"count":44286,"day":41,"state":"hospitalized_current"},{"count":10834,"day":41,"state":"deaths"},{"count":195031,"day":40,"state":"confirmed"},{"count":42637,"day":40,"state":"hospitalized_current"},{"count":10056,"day":40,"state":"deaths"},{"count":188694,"day":39,"state":"confirmed"},{"count":42594,"day":39,"state":"hospitalized_current"},{"count":9385,"day":39,"state":"deaths"},{"count":180458,"day":38,"state":"confirmed"},{"count":40679,"day":38,"state":"hospitalized_current"},{"count":8627,"day":38,"state":"deaths"},{"count":170512,"day":37,"state":"confirmed"},{"count":38818,"day":37,"state":"hospitalized_current"},{"count":7844,"day":37,"state":"deaths"},{"count":159937,"day":36,"state":"confirmed"},{"count":36576,"day":36,"state":"hospitalized_current"},{"count":7067,"day":36,"state":"deaths"},{"count":149316,"day":35,"state":"confirmed"},{"count":34432,"day":35,"state":"hospitalized_current"},{"count":6268,"day":35,"state":"deaths"},{"count":138863,"day":34,"state":"confirmed"},{"count":32083,"day":34,"state":"hospitalized_current"},{"count":5489,"day":34,"state":"deaths"},{"count":130689,"day":33,"state":"confirmed"},{"count":30203,"day":33,"state":"hospitalized_current"},{"count":4758,"day":33,"state":"deaths"},{"count":122031,"day":32,"state":"confirmed"},{"count":28092,"day":32,"state":"hospitalized_current"},{"count":4159,"day":32,"state":"deaths"},{"count":113704,"day":31,"state":"confirmed"},{"count":26383,"day":31,"state":"hospitalized_current"},{"count":3565,"day":31,"state":"deaths"},{"count":102863,"day":30,"state":"confirmed"},{"count":23696,"day":30,"state":"hospitalized_current"},{"count":2935,"day":30,"state":"deaths"},{"count":92381,"day":29,"state":"confirmed"},{"count":20817,"day":29,"state":"hospitalized_current"},{"count":2373,"day":29,"state":"deaths"},{"count":83712,"day":28,"state":"confirmed"},{"count":18368,"day":28,"state":"hospitalized_current"},{"count":1941,"day":28,"state":"deaths"},{"count":75795,"day":27,"state":"confirmed"},{"count":15904,"day":27,"state":"hospitalized_current"},{"count":1550,"day":27,"state":"deaths"},{"count":66497,"day":26,"state":"confirmed"},{"count":13721,"day":26,"state":"hospitalized_current"},{"count":1218,"day":26,"state":"deaths"},{"count":59513,"day":25,"state":"confirmed"},{"count":12075,"day":25,"state":"hospitalized_current"},{"count":965,"day":25,"state":"deaths"},{"count":52318,"day":24,"state":"confirmed"},{"count":10054,"day":24,"state":"hospitalized_current"},{"count":728,"day":24,"state":"deaths"},{"count":44635,"day":23,"state":"confirmed"},{"count":8526,"day":23,"state":"hospitalized_current"},{"count":519,"day":23,"state":"deaths"},{"count":37258,"day":22,"state":"confirmed"},{"count":6844,"day":22,"state":"hospitalized_current"},{"count":385,"day":22,"state":"deaths"},{"count":30811,"day":21,"state":"confirmed"},{"count":3805,"day":21,"state":"hospitalized_current"},{"count":285,"day":21,"state":"deaths"},{"count":25665,"day":20,"state":"confirmed"},{"count":3234,"day":20,"state":"hospitalized_current"},{"count":210,"day":20,"state":"deaths"},{"count":20875,"day":19,"state":"confirmed"},{"count":2635,"day":19,"state":"hospitalized_current"},{"count":114,"day":19,"state":"deaths"},{"count":15168,"day":18,"state":"confirmed"},{"count":1974,"day":18,"state":"hospitalized_current"},{"count":114,"day":18,"state":"deaths"},{"count":10356,"day":17,"state":"confirmed"},{"count":1603,"day":17,"state":"hospitalized_current"},{"count":44,"day":17,"state":"deaths"},{"count":7102,"day":16,"state":"confirmed"},{"count":1042,"day":16,"state":"hospitalized_current_current"},{"count":35,"day":16,"state":"deaths"},{"count":4152,"day":15,"state":"confirmed"},{"count":617,"day":15,"state":"hospitalized_current_current"},{"count":12,"day":15,"state":"deaths"},{"count":2382,"day":14,"state":"confirmed"},{"count":416,"day":14,"state":"hospitalized_current_current"},{"count":12,"day":14,"state":"deaths"},{"count":1700,"day":13,"state":"confirmed"},{"count":325,"day":13,"state":"hospitalized_current_current"},{"count":7,"day":13,"state":"deaths"},{"count":950,"day":12,"state":"confirmed"},{"count":7,"day":12,"state":"deaths"},{"count":729,"day":11,"state":"confirmed"},{"count":3,"day":11,"state":"deaths"},{"count":524,"day":10,"state":"confirmed"},{"count":421,"day":9,"state":"confirmed"},{"count":216,"day":8,"state":"confirmed"},{"count":216,"day":7,"state":"confirmed"},{"count":173,"day":6,"state":"confirmed"},{"count":142,"day":5,"state":"confirmed"},{"count":105,"day":4,"state":"confirmed"},{"count":76,"day":3,"state":"confirmed"},{"count":33,"day":2,"state":"confirmed"},{"count":22,"day":1,"state":"confirmed"},{"count":6,"day":0,"state":"confirmed"}]

    var = ['R0', 'p_hospitalization_given_infection', 'p_death_given_hospitalization', 'confirmed_case_percentage', 'Intervention:Social Distancing']
    mean_field = calibrate(var, calibration_data, interventions, 2.5, 6, 14, 183, .02, .3, .3, 6, 0, 19450000)

    print(mean_field)
    #plt.plot(mean_field)
    
    #plot = pm.plot_posterior(mean_field.sample(50), color='LightSeaGreen')
    #plt.show()