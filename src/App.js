import React, { useEffect, useState } from 'react';
import './App.css';
import DiseaseGraph from './DiseaseGraph'
import MorbidityAndMortalityGraph from './MorbidityAndMortalityGraph'
import ModelConfigurationPanel from './ModelConfigurationPanel'
import InterventionsPanel from './InterventionsPanel'
import CumulativeStatisticsPanel from './CumulativeStatisticsPanel';
import FooterMenu from './FooterMenu';
import InterventionsChart from './InterventionsChart'
import { Pivot, PivotItem, PivotLinkSize, PivotLinkFormat } from 'office-ui-fabric-react/lib/Pivot';
import CalibrationPanel from './CalibrationPanel';
import CalibrationGraph from './CalibrationGraph';

function App() {
  const [diseaseParameters, setDiseaseParameters] = useState({
    R0: 2.5,
    avg_days_infected: 10.0,
    avg_days_hospitalized: 14.0,
    avg_days_immune: 183.0,
    p_hospitalization_given_infection: 0.01,
    p_death_given_hospitalization: 0.05,
    confirmed_case_percentage: .1
  });

  const [simParameters, setSimParameters] = useState({
    max_time: 730,
    population: 1000000,
    init_infection: 10,
    init_recovered: 0
  });

  const [interventions, setInterventions] = useState([]);
  const [simulation, setSimulation] = useState({});

  const [calibrationData, setCalibrationData] = useState([]);


  const simulate = () => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disease_parameters: diseaseParameters,
        sim_parameters: simParameters,
        interventions: interventions
      })
    }

    fetch('/api/simulate', requestOptions)
      .then(response => response.json())
      .then(data => setSimulation(data), (error) => {
        alert(error);
        setSimulation({})
      });
  }

  const calibrate = () => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disease_parameters: diseaseParameters,
        sim_parameters: simParameters,
        interventions: interventions,
        calibration_data: calibrationData
      })
    }

    fetch('/api/calibrate', requestOptions)
      .then(response => response.json())
      .then(data => setDiseaseParameters({
        R0: data['R0'],
        avg_days_infected: diseaseParameters.avg_days_infected,
        p_hospitalization_given_infection: data['p_hospitalization_given_infection'],
        p_death_given_hospitalization: data['p_death_given_hospitalization'],
        confirmed_case_percentage: diseaseParameters.confirmed_case_percentage,
        avg_days_hospitalized: diseaseParameters.avg_days_hospitalized,
        avg_days_immune: diseaseParameters.avg_days_immune
      }), (error) => {
        alert(error);
      });
  }

  useEffect(simulate, [diseaseParameters, simParameters, interventions]);

  return (

    <div className="App">
        <Pivot linkSize={PivotLinkSize.large}>
          <PivotItem headerText="Model Configuration" linkFormat={PivotLinkFormat.tabs}>
            <div class="container">
              <div class="content">
                <DiseaseGraph simulation={simulation} calibrationData={calibrationData} population={simParameters.population} />
                <MorbidityAndMortalityGraph simulation={simulation} calibrationData={calibrationData} population={simParameters.population} />
              </div>
              <div class="sidebar">
                <ModelConfigurationPanel diseaseParameters={diseaseParameters} setDiseaseParameters={setDiseaseParameters} simParameters={simParameters} setSimParameters={setSimParameters} simulate={simulate}/>
              </div>
            </div>
          </PivotItem>
          <PivotItem headerText="Interventions">
            <div class="container">
              <div class="content">
                <InterventionsChart title="Active Interventions" interventions={interventions} max={simParameters.max_time} />
                <div class="container">
                  <DiseaseGraph simulation={simulation} calibrationData={calibrationData} population={simParameters.population} />
                  <MorbidityAndMortalityGraph simulation={simulation} calibrationData={calibrationData} population={simParameters.population} />
                </div>
              </div>
              <div class="sidebar">
                <InterventionsPanel interventions={interventions} setInterventions={setInterventions} simulate={simulate} />
              </div>
            </div>
          </PivotItem>
          <PivotItem headerText="Cumulative Statistics">
            <div class="container">
              <div class="content">
                <DiseaseGraph simulation={simulation} calibrationData={calibrationData} population={simParameters.population} />
                <MorbidityAndMortalityGraph simulation={simulation} calibrationData={calibrationData} population={simParameters.population} />
              </div>
              <div class="sidebar">
                <CumulativeStatisticsPanel sim={simulation} population={simParameters.population} />
              </div>
            </div>
          </PivotItem>
          <PivotItem headerText="Calibration">
            <div class="container">
              <div class="content">
                <CalibrationGraph simulation={simulation} calibrationData={calibrationData} population={simParameters.population} confirmed_case_percentage={diseaseParameters.confirmed_case_percentage}/>
              </div>
              <div class="sidebar">
                <CalibrationPanel calibrationData={calibrationData} setCalibrationData={setCalibrationData} calibrate={calibrate}/>
              </div>
            </div>
          </PivotItem>
        </Pivot>
        <FooterMenu class="footer" />
    </div>

  );
}

export default App;
