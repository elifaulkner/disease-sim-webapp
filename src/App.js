import React, { Component, useEffect, useState } from 'react';
import './App.css';
import DiseaseParameters from './DiseaseParameters'
import SimulationParameters from './SimulationParameters'
import DiseaseGraph from './DiseaseGraph'
import MorbidityAndMortalityGraph from './MorbidityAndMortalityGraph'
import ModelDescription from './ModelDescription'

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
    max_time: 365,
    num_time_points: 1000,
    init_infection: 0.0001
  });

  const [simulation, setSimulation] = useState({});

  const simulate = () => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disease_parameters: diseaseParameters,
        sim_parameters: simParameters
      })
    }

    fetch('/simulate', requestOptions)
      .then(response => response.json())
      .then(data => setSimulation(data));
  }

  useEffect(simulate);

  return (
    <div className="App">
      <table>
        <tr>
          <td><DiseaseParameters parameters={diseaseParameters} /></td>
          <td><SimulationParameters parameters={simParameters} /></td>
        </tr>
      </table>

      <DiseaseGraph parameters={simulation} />
      <MorbidityAndMortalityGraph parameters={simulation} />

      <ModelDescription />
    </div>
  );
}

export default App;
