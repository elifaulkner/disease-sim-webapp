import unittest
from cumulative_stats import CumulativeStats
import numpy as np

class TestCumulativeStats(unittest.TestCase):
    def setUp(self):
        self.population = 1000000
        self.time = [0, .25, .5, .75, 1]
        S =  [.999, .9,   .8,   .65,  .5]
        I =  [.001, .08,  .12,  .1,   .05]
        H =  [0,    .01,  .02,  .03,  .01]
        R =  [0,    .01,  .05,  .2,  .4]
        D =  [0,    .0,  .01,  .02,  .04]
        CI = [0.001, 0.09, 0.18, 0.25, 0.29]
        CC = [0.0001, 0.009, 0.018, 0.025, 0.029]
        CH = [0, .01, .03, .045, .053]
        
        self.sim = {
            'time': self.time,
            'suseptible': S,
            'infectious': I,
            'hospitalized': H,
            'recovered': R,
            'dead': D,
            'cumulative_infectious': CI,
            'cumulative_confirmed': CC,
            'cumulative_hospitalized': CH
        }
        self.stats = CumulativeStats(self.sim, self.population)

    def test_max_infectious(self):
        max_I = self.stats.max_infectious()
        self.assertEqual(120000, max_I)

    def test_max_infectious_time(self):
        max_I_time = self.stats.max_infectious_time()
        self.assertEqual(.5, max_I_time)
        
    def test_max_hospitalized(self):
        max_H = self.stats.max_hospitalized()
        self.assertEqual(30000, max_H)

    def test_max_hospitalized_time(self):
        max_H_time = self.stats.max_hospitalized_time()
        self.assertEqual(.75, max_H_time)

    def test_cumulative_infected(self):
        ci = self.stats.cumulative_infected()
        self.assertEqual(290000, ci)

    def test_cumulative_hospitalized(self):
        ch = self.stats.cumulative_hospitalized()
        self.assertEqual(53000, ch)

    def test_deaths(self):
        d = self.stats.deaths()
        self.assertEqual(40000, d)