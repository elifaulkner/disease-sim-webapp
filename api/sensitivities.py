from cumulative_stats import CumulativeStats
from scir import DiseaseModel, Interventions, Intervention, build_dict

class Sensitivities:
    def __init__(self, model:DiseaseModel,  max_time, num_time_points, init_infection, init_recovered, population):
        self.model = model
        self.population = population
        self.max_time = max_time
        self.num_time_points = num_time_points
        self.init_infection = init_infection
        self.init_recovered = init_recovered

    def build_sensitivities(self):
        return {
            'R0': self._basic_repoductive_number_sensitivities(),
            'avg_days_infected': self._avg_days_infected_sensitivities(),
            'avg_days_hospitalized': self._avg_days_hospitalized_sensitivities(),
            'avg_days_immune': self._avg_days_immune_sensitivities(),
            'p_hospitalization_given_infection': self._p_hospitalization_given_infection_sensitivities(),
            'p_death_given_hospitalization': self._p_death_given_hospitalization_sensitivities(),
            'confirmed_case_percentage': self._confirmed_case_percentage_sensitivities()
        }

    def _basic_repoductive_number_sensitivities(self):
        def getter():
            return self.model.R0

        def setter(x):
            self.model.R0 = x

        return self._compute_sensitivities(setter, getter, 0.1)

    def _avg_days_infected_sensitivities(self):
        def getter():
            return self.model.avg_days_infected

        def setter(x):
            self.model.avg_days_infected = x

        return self._compute_sensitivities(setter, getter, 1)

    def _avg_days_hospitalized_sensitivities(self):
        def getter():
            return self.model.avg_days_hospitalized

        def setter(x):
            self.model.avg_days_hospitalized = x

        return self._compute_sensitivities(setter, getter, 1)

    def _avg_days_immune_sensitivities(self):
        def getter():
            return self.model.avg_days_immune

        def setter(x):
            self.model.avg_days_immune = x

        return self._compute_sensitivities(setter, getter, 1)

    def _p_hospitalization_given_infection_sensitivities(self):
        def getter():
            return self.model.p_hospitalization_given_infection

        def setter(x):
            self.model.p_hospitalization_given_infection = x

        return self._compute_sensitivities(setter, getter, 1)

    def _p_death_given_hospitalization_sensitivities(self):
        def getter():
            return self.model.p_death_given_hospitalization

        def setter(x):
            self.model.p_death_given_hospitalization = x

        return self._compute_sensitivities(setter, getter, 1)

    def _confirmed_case_percentage_sensitivities(self):
        def getter():
            return self.model.confirmed_case_percentage

        def setter(x):
            self.model.confirmed_case_percentage = x

        return self._compute_sensitivities(setter, getter, 1)

    def _compute_sensitivities(self, setter, getter, delta):
        init = getter()
        plus = init+delta
        minus = init-delta

        setter(init+.1)
        [t, sim] = self.model.simulate(self.max_time, self.num_time_points, self.init_infection, self.init_recovered)
        S_plus = CumulativeStats(build_dict(t, sim), self.population)
        setter(init-.1)
        [t, sim] = self.model.simulate(self.max_time, self.num_time_points, self.init_infection, self.init_recovered)
        S_minus = CumulativeStats(build_dict(t, sim), self.population)

        setter(init)
        return self._deltas(S_plus, S_minus, plus, minus)

    def _deltas(self, S_plus, S_minus, plus, minus):
        return {
            'max_infectious': (S_plus.max_infectious()-S_minus.max_infectious())/(plus-minus),
            'max_infectious_time': (S_plus.max_infectious_time()-S_minus.max_infectious_time())/(plus-minus),
            'max_hospitalized': (S_plus.max_hospitalized()-S_minus.max_hospitalized())/(plus-minus),
            'max_hospitalized_time': (S_plus.max_hospitalized_time()-S_minus.max_hospitalized_time())/(plus-minus),
            'cumulative_infected' : (S_plus.cumulative_infected()-S_minus.cumulative_infected())/(plus-minus),
            'cumulative_hospitalized': (S_plus.cumulative_hospitalized()-S_minus.cumulative_hospitalized())/(plus-minus),
            'deaths': (S_plus.deaths()-S_minus.deaths())/(plus-minus)
            }
