from scipy.integrate import odeint
import numpy as np

class DiseaseModel:
    def __init__(self, R0, avg_days_infected, avg_days_hospitalized, avg_days_immune, p_hospitalization_given_infection, p_death_given_hospitalization):
        self.R0 = R0
        self.avg_days_infected = avg_days_infected
        self.avg_days_hospitalized = avg_days_hospitalized
        self.avg_days_immune = avg_days_immune
        self.p_hospitalization_given_infection = p_hospitalization_given_infection
        self.p_death_given_hospitalization = p_death_given_hospitalization


    def simulate(self, max_time, num_time_points, init_infection):
        def build_scir_parameters():
            a = self.R0/self.avg_days_infected
            b = self.p_hospitalization_given_infection/self.avg_days_infected
            c = (1-self.p_hospitalization_given_infection)/self.avg_days_infected
            d = (1-self.p_death_given_hospitalization)/self.avg_days_hospitalized
            e = self.p_death_given_hospitalization/self.avg_days_hospitalized
            f = 1.0/self.avg_days_immune

            return (a, b, c, d, e, f)

        def scir(X, t, a, b, c, d, e, f):
            S, I, H, R, D = X
            return [-a*S*I+f*R, a*S*I-b*I-c*I, b*I-d*H-e*H, c*I+d*H-f*R, e*H]

        t = np.linspace(0, max_time, num_time_points)
        sol = odeint(scir, [1-init_infection, init_infection, 0, 0, 0], t, args=build_scir_parameters()) 
        return [t, sol]       

if __name__ == '__main__':
    pop = 325000000
    model = DiseaseModel(2.5, 10.0, 14.0, 183.0, .01, .05)
    t, sol = model.simulate( 365*2, 2*365*24, 100.0/pop)

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
