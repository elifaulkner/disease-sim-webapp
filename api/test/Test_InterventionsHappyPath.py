import unittest
import scir

class TestInterventionsHappyPath(unittest.TestCase):
    def setUp(self):
        self.interventions = scir.Interventions()

    def test_get_confirmed_case_percentage_scale(self):
        self.assertEqual(1, self.interventions.get_confirmed_case_percentage_scale(10))
        
    def test_get_death_rate_scale(self):
        self.assertEqual(1, self.interventions.get_death_rate_scale(10))

    def test_get_hospitilization_rate_scale(self):
        self.assertEqual(1, self.interventions.get_hospitilization_rate_scale(10))

    def test_get_hospitilization_time_scale(self):
        self.assertEqual(1, self.interventions.get_hospitilization_time_scale(10))

    def test_get_immunity_time_scale(self):
        self.assertEqual(1, self.interventions.get_immunity_time_scale(10))

    def test_get_infection_rate_scale(self):
        self.assertEqual(1, self.interventions.get_infection_rate_scale(10))

    def test_get_infection_time_scale(self):
        self.assertEqual(1, self.interventions.get_infection_time_scale(10))
