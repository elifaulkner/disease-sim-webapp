from scir import DiseaseModel, Interventions, Intervention
from scipy import optimize
import numpy as np

def calibrate(calibration_data, interventions, R0, avg_days_infected, avg_days_hospitalized, avg_days_immune, p_hospitalization_given_infection, p_death_given_hospitalization, confirmed_case_percentage, init_infection, init_recovered, population):
    max_date = max([int(x['day']) for x in calibration_data])

    def get_error(d, sim):
        simdata = []
        if d['state'] == 'confirmed':
            simdata = sim[:,6]
        if d['state'] == 'hospitalized':
            simdata = sim[:,7]
        if d['state'] == 'deaths':
            simdata = sim[:,4]
        return simdata[int(d['day'])]*population - int(d['count'])

    def optim_function(x):
        model = DiseaseModel(x[0], avg_days_infected, avg_days_hospitalized, avg_days_immune, x[1], x[2], confirmed_case_percentage)
        t, sol = model.simulate(max_date+1, max_date+2, 6.0/population, 0, interventions)

        err = [get_error(x, sol) for x in calibration_data]

        return err
    
    bounds = [(0, 0, 0), (20, 1, 1)]
    sln = optimize.least_squares(optim_function, [R0, p_hospitalization_given_infection, p_death_given_hospitalization],  bounds=bounds)

    return {
        'R0': sln.x[0],
        'p_hospitalization_given_infection': sln.x[1],
        'p_death_given_hospitalization': sln.x[2]
    }



if __name__ == '__main__':
    pop = 19450000

    interventions = Interventions()
    #interventions.infection_rate.append(Intervention("Social Distancing", 45, 150, .8))
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

    sln = calibrate(calibration_data, interventions, 2.5, 6, 14, 183, .02, .3, .3, 6, 0, 19450000)
    print(sln)

    model = DiseaseModel(sln['R0'], sln['avg_days_infected'], 14, 183.0, sln['p_hospitalization_given_infection'], sln['p_death_given_hospitalization'], sln['confirmed_case_percentage'])
    t, sol = model.simulate( 30, 31, 6/pop, 0, interventions)
    import matplotlib.pyplot as plt
    plt.plot(t, sol[:, 6]*pop, 'r', label='Infected')
    plt.plot(t, sol[:, 7]*pop, 'y', label='Hospitalized')
    plt.plot(t, sol[:, 4]*pop, 'g', label='Dead')
    plt.legend(loc='best')
    plt.xlabel('t')
    plt.grid()
    plt.show()

