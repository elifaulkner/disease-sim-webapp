import numpy as np

class CumulativeStats:
    def __init__(self, sim, population):
        self.time = sim['time']
        self.suseptible = sim['suseptible']
        self.infectious= sim['infectious']
        self.hospitalized = sim['hospitalized']
        self.recovered = sim['recovered']
        self.dead = sim['dead']
        self.cumulative_i = sim['cumulative_infectious']
        self.cumulative_c = sim['cumulative_confirmed']
        self.cumulative_h = sim['cumulative_hospitalized']
        self.population = population
        self.max_I = None
        self.max_I_time = None
        self.max_H = None
        self.max_H_time = None

    def max_infectious(self):
        if(self.max_I is None):
            self.max_I = max(self.infectious)
        return self.max_I*self.population

    def max_infectious_time(self):
        if(self.max_I_time is None):
            if(self.max_I is None):
                self.max_infectious()
            index = self.infectious.index(self.max_I)
            self.max_I_time = self.time[index]
        return self.max_I_time

    def max_hospitalized(self):
        if(self.max_H is None):
            self.max_H = max(self.hospitalized)
        return self.max_H*self.population

    def max_hospitalized_time(self):
        if(self.max_H_time is None):
            if(self.max_H is None):
                self.max_hospitalized()
            index = self.hospitalized.index(self.max_H)
            self.max_H_time = self.time[index]
        return self.max_H_time

    def cumulative_infected(self):
        return max(self.cumulative_i)*self.population
    
    def cumulative_hospitalized(self):
        return max(self.cumulative_h)*self.population

    def deaths(self):
        return max(self.dead)*self.population