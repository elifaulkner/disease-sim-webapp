from scipy.integrate import odeint
import numpy as np

class Interventions:
    def __init__(self):
        self.infection_rate = []
        self.infection_time = []
        self.hospitilization_time = []
        self.immunity_time = []
        self.hospitilization_rate = []
        self.death_rate = []
        self.confirmed_case_percentage = []
        self.immunization_rate = []
        self.isActive = self._isActive

    def _isActive(self, i, t):
        return i.start <= t and i.end > t

    def _get_active_intervention_scale(self, interventions, t):
        scale = 1
        for i in interventions:
            if(self.isActive(i, t)):
                scale*= i.scale
        return scale

    def get_infection_rate_scale(self, t):
        return self._get_active_intervention_scale(self.infection_rate, t)

    def get_infection_time_scale(self, t):
        return self._get_active_intervention_scale(self.infection_time, t)

    def get_hospitilization_rate_scale(self, t):
        return self._get_active_intervention_scale(self.hospitilization_rate, t)

    def get_hospitilization_time_scale(self, t):
        return self._get_active_intervention_scale(self.hospitilization_time, t)

    def get_confirmed_case_percentage_scale(self, t):
        return self._get_active_intervention_scale(self.confirmed_case_percentage, t)

    def get_death_rate_scale(self, t):
        return self._get_active_intervention_scale(self.death_rate, t)

    def get_immunity_time_scale(self, t):
        return self._get_active_intervention_scale(self.immunity_time, t)

    def get_immunization_rate(self, t):
        for a in [i for i in self.immunization_rate if self.isActive(i, t)]:
            return a.scale
        return 0

    def __iter__(self):
        return iter([*self.infection_rate, *self.infection_time, *self.hospitilization_time, *self.hospitilization_rate, *self.confirmed_case_percentage, *self.death_rate, *self.immunity_time])

class Intervention:
    def __init__(self, name, start, end, scale, sign=-1):
        self.name = name
        self.start = start
        self.end = end
        self.scale = scale
        self.sign=sign

    def to_effectiveness(self):
        return (1-self.scale)*self.sign*-1

class DiseaseModel:
    def __init__(self, R0, avg_days_infected, avg_days_hospitalized, avg_days_immune, p_hospitalization_given_infection, p_death_given_hospitalization, confirmed_case_percentage, interventions):
        self.R0 = R0
        self.avg_days_infected = avg_days_infected
        self.avg_days_hospitalized = avg_days_hospitalized
        self.avg_days_immune = avg_days_immune
        self.p_hospitalization_given_infection = p_hospitalization_given_infection
        self.p_death_given_hospitalization = p_death_given_hospitalization
        self.confirmed_case_percentage = confirmed_case_percentage
        self.interventions = interventions

    def get_active_intervention_scale(self, interventions, t):
        scale = 1
        for i in interventions:
            if(i.start <= t and i.end > t):
                scale*= i.scale
        return scale

    def scir(self, X, t, R0, avg_days_infected, avg_days_hospitalized, p_hospitalization_given_infection, p_death_given_hospitalization, avg_days_immune, confirmed_case_percentage, interventions):
        R = R0*interventions.get_infection_rate_scale(t)
        avg_days_infected = avg_days_infected*interventions.get_infection_time_scale(t)
        avg_days_hospitalized = avg_days_hospitalized*interventions.get_hospitilization_time_scale(t)
        p_hospitalization_given_infection = p_hospitalization_given_infection*interventions.get_hospitilization_rate_scale(t)
        p_death_given_hospitalization = p_death_given_hospitalization*interventions.get_death_rate_scale(t)
        avg_days_immune = avg_days_immune*interventions.get_immunity_time_scale(t)
        confirmed_case_percentage = confirmed_case_percentage*interventions.get_confirmed_case_percentage_scale(t)

        a = R/avg_days_infected
        b = p_hospitalization_given_infection/avg_days_infected
        c = (1-p_hospitalization_given_infection)/avg_days_infected
        d = (1-p_death_given_hospitalization)/avg_days_hospitalized
        e = p_death_given_hospitalization/avg_days_hospitalized
        f = avg_days_immune**(-1.0)
        g = confirmed_case_percentage
        h = interventions.get_immunization_rate(t)

        S = X[0]
        I = X[1]
        H = X[2]
        R = X[3]
        D = X[4]
        CI = X[5]
        CC = X[6]
        CH = X[7]

        #S, I, H, R, D, CI, CC, CH = X

        return [-a*S*I+f*R-h*S, a*S*I-b*I-c*I, b*I-d*H-e*H, c*I+d*H-f*R+h*S, e*H, a*S*I, a*S*I*g, b*I]    
    
    def equation(self):
        def _scir(X, t, p):
            R0 = p[0]
            avg_days_infected = p[1] 
            avg_days_hospitalized = p[2] 
            p_hospitalization_given_infection = p[3] 
            p_death_given_hospitalization = p[4] 
            avg_days_immune = p[5] 
            confirmed_case_percentage = p[6]
            return self.scir(X, t, R0, avg_days_infected, avg_days_hospitalized, p_hospitalization_given_infection, p_death_given_hospitalization, avg_days_immune, confirmed_case_percentage, self.interventions)
        return _scir

    def get_times(self, max_time, num_time_points):
        return np.linspace(0, max_time, num_time_points)

    def get_initial_conditions(self, init_infection, init_recovered):
        return [1-init_infection-init_recovered, init_infection, 0, init_recovered, 0, 0, 0, 0]

    def simulate(self, max_time, num_time_points, init_infection, init_recovered):
        t = self.get_times(max_time, num_time_points)
        sol = odeint(self.equation(), self.get_initial_conditions(init_infection, init_recovered), t, args=((self.R0, self.avg_days_infected, self.avg_days_hospitalized, self.p_hospitalization_given_infection, self.p_death_given_hospitalization, self.avg_days_immune, self.confirmed_case_percentage),)) 
        return [t, sol]       

def build_dict(t, sim):
    return {
        'time' : list(t),
        'suseptible':list(sim[:,0]),
        'infectious':list(sim[:,1]),
        'hospitalized':list(sim[:,2]),
        'recovered':list(sim[:,3]),
        'dead':list(sim[:,4]),
        'cumulative_infectious':list(sim[:,5]),
        'cumulative_confirmed':list(sim[:,6]),
        'cumulative_hospitalized':list(sim[:,7])
        }

if __name__ == '__main__':
    pop = 325000000

    interventions = Interventions()
    interventions.infection_rate.append(Intervention("Social Distancing", 45, 150, .8))
    interventions.infection_rate.append(Intervention("Handwashing Media", 20, 200, .95))
    interventions.infection_rate.append(Intervention("Public Facemasks", 60, 150, .9))
    interventions.death_rate.append(Intervention("Ventilators", 60, 150, .8))

    model = DiseaseModel(2.5, 10.0, 14.0, 183.0, .01,.05, .01, interventions)

    t, sol = model.simulate( 365*2, 2*365*24, 100.0/pop, 0)

    print("# Hospitalized ")
    print(int(sol[365*24*2-1][2]*pop))

    print("Death per hospitalization")
    print(sol[2400][4]/sol[2400][2])

    print("Hospitalization at day 100")
    print(int(sol[2400][2]*pop))

    print("Hospitalization at two years")
    print(int(sol[365*24*2-1][2]*pop))

    print("Infected at two years")
    print(int(sol[365*24*2-1][1]*pop))

    print("Deaths at year one")
    print(int(sol[365*24][4]*pop))

    print("Deaths at year two")
    print(int(sol[365*24*2-1][4]*pop))

    import matplotlib.pyplot as plt
    plt.plot(t, sol[:, 0], 'b', label='Suseptible')
    plt.plot(t, sol[:, 1], 'r', label='Infected')
    plt.plot(t, sol[:, 2], 'y', label='Hospitalized')
    plt.plot(t, sol[:, 3], 'k', label='Recovered')
    plt.plot(t, sol[:, 4], 'g', label='Dead')
    plt.legend(loc='best')
    plt.xlabel('t')
    plt.grid()
    plt.show()
