import React, { useEffect, useState } from 'react';
import './App.css';
import DiseaseGraph from './DiseaseGraph'
import MorbidityAndMortalityGraph from './MorbidityAndMortalityGraph'
import ModelConfigurationPanel from './ModelConfigurationPanel'
import InterventionsPanel from './InterventionsPanel'
import CumulativeStatisticsPanel from './CumulativeStatisticsPanel';
import FooterMenu from './FooterMenu';
import InterventionsChart from './InterventionsChart'
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import CalibrationPanel from './CalibrationPanel';
import CalibrationGraph from './CalibrationGraph';

function App() {
  const [diseaseParameters, setDiseaseParameters] = useState({
    R0: 2.5,
    avg_days_infected: 10.0,
    avg_days_hospitalized: 14.0,
    avg_days_immune: 183.0,
    p_hospitalization_given_infection: 0.01,
    p_death_given_hospitalization: 0.05
  });

  const [simParameters, setSimParameters] = useState({
    max_time: 730,
    init_infection: 0.00001,
    init_recovered: 0
  });

  const [interventions, setInterventions] = useState([]);
  const [simulation, setSimulation] = useState({});

  const [population, setPopulation] = useState(1000000);
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

  useEffect(simulate, [diseaseParameters, simParameters, interventions]);

  return (

    <div className="App">
        <Pivot>
          <PivotItem headerText="Model Configuration">
            <div class="container">
              <div class="content">
                <DiseaseGraph simulation={simulation} calibrationData={calibrationData} population={population} />
                <MorbidityAndMortalityGraph simulation={simulation} calibrationData={calibrationData} population={population} />
              </div>
              <div class="sidebar">
                <ModelConfigurationPanel diseaseParameters={diseaseParameters} setDiseaseParameters={setDiseaseParameters} simParameters={simParameters} setSimParameters={setSimParameters} simulate={simulate} />
              </div>
            </div>
          </PivotItem>
          <PivotItem headerText="Interventions">
            <div class="container">
              <div class="content">
                <InterventionsChart title="Active Interventions" interventions={interventions} max={simParameters.max_time} />
                <div class="container">
                  <DiseaseGraph simulation={simulation} calibrationData={calibrationData} population={population} />
                  <MorbidityAndMortalityGraph simulation={simulation} calibrationData={calibrationData} population={population} />
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
                <DiseaseGraph simulation={simulation} calibrationData={calibrationData} population={population} />
                <MorbidityAndMortalityGraph simulation={simulation} calibrationData={calibrationData} population={population} />
              </div>
              <div class="sidebar">
                <CumulativeStatisticsPanel sim={simulation} population={population} setPopulation={setPopulation} />
              </div>
            </div>
          </PivotItem>
          <PivotItem headerText="Calibration">
            <div class="container">
              <div class="content">
                <CalibrationGraph simulation={simulation} calibrationData={calibrationData} population={population} />
              </div>
              <div class="sidebar">
                <CalibrationPanel calibrationData={calibrationData} setCalibrationData={setCalibrationData} />
              </div>
            </div>
          </PivotItem>
        </Pivot>
        <FooterMenu class="footer" />
    </div>

  );
}

export default App;
