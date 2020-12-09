from scir import DiseaseModel, Interventions, Intervention
from scipy import optimize
import numpy as np

class CalibrationFactory:
    def __init__(self, calibration_variables, calibration_data, interventions, R0, avg_days_infected, avg_days_hospitalized, avg_days_immune, p_hospitalization_given_infection, 
        p_death_given_hospitalization, confirmed_case_percentage, init_infection, init_recovered, population):

        def get_index(name):
            return calibration_variables.index(name) if (name in calibration_variables) else None

        self.calibration_variables = calibration_variables
        self.calibration_data = calibration_data
        self.interventions = interventions
        self.R0 = CalibrationVariable('R0', R0, get_index('R0'), [0.001, 20])
        self.avg_days_infected = CalibrationVariable('avg_days_infected', avg_days_infected, get_index('avg_days_infected'), [1, 3650])
        self.avg_days_hospitalized =  CalibrationVariable('avg_days_hospitalized', avg_days_hospitalized, get_index('avg_days_hospitalized'), [1, 3650])
        self.avg_days_immune =  CalibrationVariable('avg_days_immune', avg_days_immune, get_index('avg_days_immune'), [0, 3650])
        self.p_hospitalization_given_infection =  CalibrationVariable('p_hospitalization_given_infection', p_hospitalization_given_infection, get_index('p_hospitalization_given_infection'), [0, 1])
        self.p_death_given_hospitalization =  CalibrationVariable('p_death_given_hospitalization', p_death_given_hospitalization, get_index('p_death_given_hospitalization'), [0, 1])
        self.confirmed_case_percentage =  CalibrationVariable('confirmed_case_percentage', confirmed_case_percentage, get_index('confirmed_case_percentage'), [0, 1])

        self.variables = [self.R0, self.avg_days_infected, self.avg_days_hospitalized, self.avg_days_immune, self.p_hospitalization_given_infection, self.p_death_given_hospitalization, self.confirmed_case_percentage]

        for intervention in interventions:
            if ('Intervention:'+intervention.name in calibration_variables):
                index = len(self.get_variable_indices())
                self.variables.append(InterventionVariable(intervention, index))

        self.init_infection =  init_infection
        self.init_recovered =  init_recovered
        self.population =  population

    def build_disease_model(self, x):
        for iv in self.variables:
            iv.value(x)
        return DiseaseModel(self.R0.value(x), self.avg_days_infected.value(x), self.avg_days_hospitalized.value(x), self.avg_days_immune.value(x), self.p_hospitalization_given_infection.value(x), self.p_death_given_hospitalization.value(x), self.confirmed_case_percentage.value(x), self.interventions)

    def build_interventions(self, x):
        return self.interventions

    def get_variable_names(self):
        return [v.name for v in self.variables if v.is_variable()]

    def get_variable_indices(self):
        return [v.index for v in self.variables if v.is_variable()]

    def build_initial_conditions(self):
        return [v.init_value for v in self.variables if v.is_variable()]

    def build_bounds(self):
        bounds = tuple([tuple([v.lower_bound() for v in self.variables if v.is_variable()]), tuple([v.upper_bound() for v in self.variables if v.is_variable()])])
        return bounds

    def build_return_value(self, x):
        return {v.name: v.return_value(x) for v in self.variables if v.is_variable()}

class ICalibrationVariable:
    def is_variable(self):
        return None
    def value(self, x):
        return None
    def lower_bound(self):
        return None
    def upper_bound(self):
        return None
    def return_value(self, x):
        return None
        
class CalibrationVariable(ICalibrationVariable):
    def __init__(self, name, init_value, index, bounds):
        self.name = name
        self.init_value = init_value
        self.index = index
        self.bounds = bounds

    def is_variable(self):
        return self.index is not None

    def value(self, x):
        if self.is_variable():
            return x[self.index]
        else:
            return self.init_value
    
    def lower_bound(self):
        if self.is_variable():
            return self.bounds[0]
        else: 
            return None

    def upper_bound(self):
        if self.is_variable():
            return self.bounds[1]
        else: 
            return None

    def return_value(self, x):
        return x[self.index]

class InterventionVariable(ICalibrationVariable):
    def __init__(self, intervention, index):
        self.name = 'Intervention:'+intervention.name
        self.intervention = intervention
        self.index = index
        self.init_value = intervention.scale

    def is_variable(self):
        return True

    def value(self, x):
        self.intervention.scale = x[self.index]
        return False

    def lower_bound(self):
        return 0.0000001

    def upper_bound(self):
        return 1.99999

    def return_value(self, x):
        self.intervention.scale = x[self.index]
        return self.intervention.to_effectiveness()

def calibrate(calibration_variables, calibration_data, interventions, R0, avg_days_infected, avg_days_hospitalized, avg_days_immune, p_hospitalization_given_infection, p_death_given_hospitalization, confirmed_case_percentage, init_infection, init_recovered, population, method):
    max_date = max([int(x['day']) for x in calibration_data])
    factory = CalibrationFactory(calibration_variables, calibration_data, interventions, R0, avg_days_infected, avg_days_hospitalized, avg_days_immune, p_hospitalization_given_infection, p_death_given_hospitalization, confirmed_case_percentage, init_infection, init_recovered, population)

    def get_error(d, sim):
        simdata = []
        if d['state'] == 'confirmed':
            simdata = sim[:,6]
        if d['state'] == 'hospitalized':
            simdata = sim[:,7]
        if d['state'] == 'hospitalized_current':
            simdata = sim[:,2]
        if d['state'] == 'deaths':
            simdata = sim[:,4]
        
        if(len(simdata) == 0):
            return [0]
        return simdata[int(d['day'])]*population - int(d['count'])

    def optim_function(x):
        model = factory.build_disease_model(x)
        t, sol = model.simulate(max_date+1, max_date+2, init_infection/population, init_recovered/population)

        err = [get_error(x, sol) for x in calibration_data]
        return err
    
    bounds = factory.build_bounds()
    ic = factory.build_initial_conditions()

    print(bounds)
    print(ic)

    sln = None

    if method == 'LS':
        sln = optimize.least_squares(optim_function, ic,  bounds=bounds)
    elif method == 'dual_annealing':
        sln = optimize.dual_annealing(optim_function, ic,  bounds=bounds)
    elif method == 'differential_evolution':
        sln = optimize.differential_evolution(optim_function, ic,  bounds=bounds)
    else:
        sln = optimize.least_squares(optim_function, ic,  bounds=bounds)

    return [factory.build_return_value(sln.x), factory, sln]

if __name__ == '__main__':
    pop = 19450000

    interventions = Interventions()
    interventions.infection_rate.append(Intervention("Social Distancing", 45, 150, .8))
    #interventions.infection_rate.append(Intervention("Handwashing Media", 20, 200, .95))
    #interventions.infection_rate.append(Intervention("Public Facemasks", 60, 150, .9))
    #interventions.death_rate.append(Intervention("Ventilators", 60, 150, .8))

    calibration_data = [
        { 'state': 'confirmed', 'day': 5, 'count': 142 },
        { 'state': 'confirmed', 'day': 10, 'count': 524 },
        { 'state': 'confirmed', 'day': 15, 'count': 4152 },
        { 'state': 'confirmed', 'day': 20, 'count': 25665 },
        { 'state': 'confirmed', 'day': 25, 'count': 59513 },
        { 'state': 'hospitalized', 'day': 20, 'count': 3234 },
        { 'state': 'hospitalized', 'day': 25, 'count': 112075 },
        { 'state': 'deaths', 'day': 11, 'count': 3 },
        { 'state': 'deaths', 'day': 15, 'count': 12 },
        { 'state': 'deaths', 'day': 20, 'count': 210 },
        { 'state': 'deaths', 'day': 25, 'count': 965 }
    ]

    var = ['R0', 'avg_days_infected', 'p_hospitalization_given_infection', 'p_death_given_hospitalization', 'confirmed_case_percentage', 'Intervention:Social Distancing']
    [x, factory, sln] = calibrate(var, calibration_data, interventions, 2.5, 6, 14, 183, .02, .3, .3, 6, 0, 19450000)
    
    print(x)
    print(sln)

    
    model = factory.build_disease_model(sln.x)
    t, sol = model.simulate( 30, 31, 6/pop, 0)
    import matplotlib.pyplot as plt
    plt.plot(t, sol[:, 6]*pop, 'r', label='Infected')
    plt.plot(t, sol[:, 7]*pop, 'y', label='Hospitalized')
    plt.plot(t, sol[:, 4]*pop, 'g', label='Dead')
    plt.legend(loc='best')
    plt.xlabel('t')
    plt.grid()
    plt.show()

