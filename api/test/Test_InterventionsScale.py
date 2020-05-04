import unittest
import scir

class TestInterventionsScale(unittest.TestCase):
    def setUp(self):
        self.interventions = scir.Interventions()
        self.interventions.infection_rate.append(scir.Intervention("test1", 1, 100, .5))
        self.interventions.infection_rate.append(scir.Intervention("test1", 50, 150, .5))

    def test_single_intervention(self):
        self.assertEqual(.5, self.interventions.get_infection_rate_scale(25))

    def test_multiple_interventions(self):
        self.assertEqual(.25, self.interventions.get_infection_rate_scale(75))

    def test_single_intervention2(self):
        self.assertEqual(.5, self.interventions.get_infection_rate_scale(125))