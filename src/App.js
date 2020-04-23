import React, { useEffect, useState } from 'react';
import './App.css';
import DiseaseGraph from './DiseaseGraph'
import MorbidityAndMortalityGraph from './MorbidityAndMortalityGraph'
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { useConstCallback } from '@uifabric/react-hooks';
import ModelConfigurationPanel from './ModelConfigurationPanel'
import ModelDescriptionPanel from './ModelDescriptionPanel'
import InterventionsPanel from './InterventionsPanel'
import CumulativeStatisticsPanel from './CumulativeStatisticsPanel';
import FooterMenu from './FooterMenu';

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

  const [isConfigOpen, setIsConfigOpen] = React.useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = React.useState(false);
  const [isInterventionOpen, setisInterventionOpen] = React.useState(false);
  const [isStatsOpen, setisStatsOpen] = React.useState(false);

  const openConfigPanel = useConstCallback(() => setIsConfigOpen(true));
  const openInterventionsPanel = useConstCallback(() => setisInterventionOpen(true));
  //const openDescriptionPanel = useConstCallback(() => setIsDescriptionOpen(true));
  const openStatsPanel = useConstCallback(() => setisStatsOpen(true));

  useEffect(simulate, [diseaseParameters, simParameters, interventions]);
  
  return (
    <div className="App">
      <ModelConfigurationPanel isOpen={isConfigOpen} setIsOpen={setIsConfigOpen} diseaseParameters={diseaseParameters} setDiseaseParameters={setDiseaseParameters} simParameters={simParameters} setSimParameters={setSimParameters} simulate={simulate}/>
      <ModelDescriptionPanel isOpen={isDescriptionOpen} setIsOpen={setIsDescriptionOpen} />
      <InterventionsPanel isOpen={isInterventionOpen} setIsOpen={setisInterventionOpen} interventions={interventions} setInterventions={setInterventions} simulate={simulate}/>
      <CumulativeStatisticsPanel isOpen={isStatsOpen} setIsOpen={setisStatsOpen} sim={simulation}/>
      
      <DiseaseGraph simulation={simulation} />
      <MorbidityAndMortalityGraph simulation={simulation}/>
      
      <Separator/>

      <DefaultButton text="Model Configuration" onClick={openConfigPanel} />
      <DefaultButton text="Interventions" onClick={openInterventionsPanel} />
      <DefaultButton text="Cumulative Statistics" onClick={openStatsPanel} />

      <FooterMenu/>
    </div>

  );
}

export default App;
