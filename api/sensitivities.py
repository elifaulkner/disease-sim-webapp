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
        sensitivities = {
            '0.01 R0': self._basic_repoductive_number_sensitivities(),
            '1 hour avg_days_infected': self._avg_days_infected_sensitivities(),
            '1 day avg_days_hospitalized': self._avg_days_hospitalized_sensitivities(),
            '1 day avg_days_immune': self._avg_days_immune_sensitivities(),
            '1% p_hospitalization_given_infection': self._p_hospitalization_given_infection_sensitivities(),
            '1% p_death_given_hospitalization': self._p_death_given_hospitalization_sensitivities(),
        }

        sensitivities.update({'1% ' +i.name: self._intervention_sensitivities(i) for i in self.model.interventions.infection_rate})
        sensitivities.update({'1% ' +i.name: self._intervention_sensitivities(i) for i in self.model.interventions.infection_time})
        sensitivities.update({'1% ' +i.name: self._intervention_sensitivities(i) for i in self.model.interventions.hospitilization_time})
        sensitivities.update({'1% ' +i.name: self._intervention_sensitivities(i) for i in self.model.interventions.immunity_time})
        sensitivities.update({'1% ' +i.name: self._intervention_sensitivities(i) for i in self.model.interventions.hospitilization_rate})
        sensitivities.update({'1% ' +i.name: self._intervention_sensitivities(i) for i in self.model.interventions.death_rate})
        sensitivities.update({'1% ' +i.name: self._intervention_sensitivities(i) for i in self.model.interventions.confirmed_case_percentage})

        return sensitivities

    def _intervention_sensitivities(self, intervention):
        def getter():
            return intervention.scale

        def setter(x):
            intervention.scale = x

        return self._compute_sensitivities(setter, getter, 0.01, 0.01)


    def _basic_repoductive_number_sensitivities(self):
        def getter():
            return self.model.R0

        def setter(x):
            self.model.R0 = x

        return self._compute_sensitivities(setter, getter, 0.01, 0.01)

    def _avg_days_infected_sensitivities(self):
        def getter():
            return self.model.avg_days_infected

        def setter(x):
            self.model.avg_days_infected = x

        return self._compute_sensitivities(setter, getter, 1, 1.0/24.0)

    def _avg_days_hospitalized_sensitivities(self):
        def getter():
            return self.model.avg_days_hospitalized

        def setter(x):
            self.model.avg_days_hospitalized = x

        return self._compute_sensitivities(setter, getter, 1, 1)

    def _avg_days_immune_sensitivities(self):
        def getter():
            return self.model.avg_days_immune

        def setter(x):
            self.model.avg_days_immune = x

        return self._compute_sensitivities(setter, getter, 1, 1)

    def _p_hospitalization_given_infection_sensitivities(self):
        def getter():
            return self.model.p_hospitalization_given_infection

        def setter(x):
            self.model.p_hospitalization_given_infection = x

        return self._compute_sensitivities(setter, getter, 1.0E-8, 0.01)

    def _p_death_given_hospitalization_sensitivities(self):
        def getter():
            return self.model.p_death_given_hospitalization

        def setter(x):
            self.model.p_death_given_hospitalization = x

        return self._compute_sensitivities(setter, getter, 1.0E-8, 0.01)

    def _compute_sensitivities(self, setter, getter, delta, scale):
        init = getter()
        plus = init*1.01
        minus = init*.99

        setter(init+delta)
        [t, sim] = self.model.simulate(self.max_time, self.num_time_points*10, self.init_infection/self.population, self.init_recovered/self.population)
        S_plus = CumulativeStats(build_dict(t, sim), self.population)
        setter(init-delta)
        [t, sim] = self.model.simulate(self.max_time, self.num_time_points*10, self.init_infection/self.population, self.init_recovered/self.population)
        S_minus = CumulativeStats(build_dict(t, sim), self.population)

        setter(init)
        return self._deltas(S_plus, S_minus, plus, minus, scale)

    def _deltas(self, S_plus, S_minus, plus, minus, scale):
        return {
            'max_infectious': (S_plus.max_infectious()-S_minus.max_infectious())/(plus-minus)*scale,
            'max_infectious_time': (S_plus.max_infectious_time()-S_minus.max_infectious_time())/(plus-minus)*scale,
            'max_hospitalized': (S_plus.max_hospitalized()-S_minus.max_hospitalized())/(plus-minus)*scale,
            'max_hospitalized_time': (S_plus.max_hospitalized_time()-S_minus.max_hospitalized_time())/(plus-minus)*scale,
            'cumulative_infected' : (S_plus.cumulative_infected()-S_minus.cumulative_infected())/(plus-minus)*scale,
            'cumulative_hospitalized': (S_plus.cumulative_hospitalized()-S_minus.cumulative_hospitalized())/(plus-minus)*scale,
            'deaths': (S_plus.deaths()-S_minus.deaths())/(plus-minus)*scale
            }
