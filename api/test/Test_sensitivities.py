import unittest
from scir import DiseaseModel, Interventions, Intervention
from sensitivities import Sensitivities

# class TestSensitivities(unittest.TestCase):
#     def setUp(self):
#         interventions = Interventions()
#         interventions.infection_rate.append(Intervention("i1", 30, 90, .2))
#         interventions.infection_rate.append(Intervention("i2", 15, 150, .3))
#         interventions.infection_time.append(Intervention("i3", 30, 90, .2))
#         interventions.hospitilization_time.append(Intervention("i4", 30, 90, .2))
#         interventions.immunity_time.append(Intervention("i5", 30, 90, .2))
#         interventions.hospitilization_rate.append(Intervention("i6", 30, 90, .2))
#         interventions.death_rate.append(Intervention("i7", 30, 90, .2))
#         interventions.confirmed_case_percentage.append(Intervention("i8", 30, 90, .2))
#         self.sensitivities = Sensitivities( DiseaseModel(2.5, 5, 10, 180, 0.001, 0.1, 0.01, interventions), 365, 365, 0.001, 0, 1000000).build_sensitivities()

#     def test_R0_max_infectious_sensitivity(self):
#         self.assertAlmostEqual(119334.496, self.sensitivities['per 0.1 R0']['max_infectious'], 2)

#     def test_R0_max_infectious_time_sensitivity(self):
#         self.assertAlmostEqual(-20.054, self.sensitivities['per 0.1 R0']['max_infectious_time'], 2)

#     def test_R0_max_hospitalized_sensitivity(self):
#         self.assertAlmostEqual(104.787, self.sensitivities['per 0.1 R0']['max_hospitalized'], 2)

#     def test_R0_max_hospitalized_time_sensitivity(self):
#         self.assertAlmostEqual(-25.068, self.sensitivities['per 0.1 R0']['max_hospitalized_time'], 2)

#     def test_R0_cumulative_infected_sensitivity(self):
#         self.assertAlmostEqual(587426.43, self.sensitivities['per 0.1 R0']['cumulative_infected'], 2)

#     def test_R0_cumulative_hospitalized_sensitivity(self):
#         self.assertAlmostEqual(536.635, self.sensitivities['per 0.1 R0']['cumulative_hospitalized'], 2)

#     def test_R0_deaths_sensitivity(self):
#         self.assertAlmostEqual(39.359, self.sensitivities['per 0.1 R0']['deaths'], 2)

#     def test_avg_days_infected_max_infectious_sensitivity(self):
#         self.assertAlmostEqual(5029.437, self.sensitivities['per day avg_days_infected']['max_infectious'], 2)

#     def test_avg_days_infected_max_infectious_time_sensitivity(self):
#         self.assertAlmostEqual(-18.0494, self.sensitivities['per day avg_days_infected']['max_infectious_time'], 2)

#     def test_avg_days_infected_max_hospitalized_sensitivity(self):
#         self.assertAlmostEqual(2.358, self.sensitivities['per day avg_days_infected']['max_hospitalized'], 2)

#     def test_avg_days_infected_max_hospitalized_time_sensitivity(self):
#         self.assertAlmostEqual(-18.5508, self.sensitivities['per day avg_days_infected']['max_hospitalized_time'], 2)

#     def test_avg_days_infected_cumulative_infected_sensitivity(self):
#         self.assertAlmostEqual(25729.668, self.sensitivities['per day avg_days_infected']['cumulative_infected'], 2)

#     def test_avg_days_infected_cumulative_hospitalized_sensitivity(self):
#         self.assertAlmostEqual(23.08, self.sensitivities['per day avg_days_infected']['cumulative_hospitalized'], 2)

#     def test_avg_days_infected_deaths_sensitivity(self):
#         self.assertAlmostEqual(1.792, self.sensitivities['per day avg_days_infected']['deaths'], 2)