import React, { useEffect, useState } from 'react';
import './App.css';
import DiseaseGraph from './DiseaseGraph'
import MorbidityAndMortalityGraph from './MorbidityAndMortalityGraph'
import ModelConfigurationPanel from './ModelConfigurationPanel'
import InterventionsPanel from './InterventionsPanel'
import CumulativeStatisticsPanel from './CumulativeStatisticsPanel';
import FooterMenu from './FooterMenu';
import DataMenu from './DataMenu';
import InterventionsChart from './InterventionsChart'
import { Pivot, PivotItem, PivotLinkSize, PivotLinkFormat } from 'office-ui-fabric-react/lib/Pivot';
import CalibrationPanel from './CalibrationPanel';
import CalibrationGraph from './CalibrationGraph';
import { initializeIcons } from '@uifabric/icons';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/';
import { Stack } from 'office-ui-fabric-react/lib/Stack';


function App() {
  initializeIcons();

  const [diseaseParameters, setDiseaseParameters] = useState({
    R0: 3.25,
    avg_days_infected: 10.0,
    avg_days_hospitalized: 14.0,
    avg_days_immune: 183.0,
    p_hospitalization_given_infection: 0.005,
    p_death_given_hospitalization: 0.1,
    confirmed_case_percentage: .01
  });

  const handleError = (error) => {}

  const handleResponse = (response) => {
    if(response.ok) {
      return response.json()
    } else {
      setErrorMessage(response.url +" Returned Status Code " + response.status +" with message: " + response.statusText) 
      return {}
    }
  }

  const [simParameters, setSimParameters] = useState({
    max_time: 730,
    population: 1000000,
    init_infection: 10,
    init_recovered: 0
  });

  const setPopulation = (p) => {
    setSimParameters({...simParameters, population: p})
  }
  
  const [interventions, setInterventions] = useState([]);
  const [simulation, setSimulation] = useState({});

  const [calibrationData, setCalibrationData] = useState([]);
  //const [user, setUser] = useState([])

  const [modelName, setModelName] = useState('')

  const saveModel = (name) => {
    setModelName(name)
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disease_parameters: diseaseParameters,
        sim_parameters: simParameters,
        interventions: interventions,
        calibration_data: calibrationData
      })
    }

    return fetch('/api/models/'+name, requestOptions)
      .then(handleResponse)
      .catch(handleError)
  }

  const loadModel = (name) => {
    fetch('/api/models/'+name)
    .then(handleResponse)
    .then(model=> {
      setDiseaseParameters(model['disease_parameters'])
      setSimParameters(model['sim_parameters'])
      setInterventions(model['interventions'])
      setCalibrationData(model['calibration_data'])  
    })
    .catch(handleError)

    setModelName(name)
  }

  const deleteModel = (name) => {
    const requestOptions = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    }

    fetch('/api/models/'+name, requestOptions)
    .then(handleResponse)
    .catch(handleError)
  }

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
      .then(handleResponse)
      .then(data => setSimulation(data))
      .catch((error) => {
        setSimulation({})
      })
  }

  const [calibrationResults, setCalibrationResults] = useState({})

  const setParameterValues = () => {
    setDiseaseParameters({
      R0: calibrationResults['R0'] || diseaseParameters.R0,
      avg_days_infected:  calibrationResults['avg_days_infected'] || diseaseParameters.avg_days_infected,
      p_hospitalization_given_infection:  calibrationResults['p_hospitalization_given_infection'] || diseaseParameters.p_hospitalization_given_infection,
      p_death_given_hospitalization:  calibrationResults['p_death_given_hospitalization'] || diseaseParameters.p_death_given_hospitalization,
      confirmed_case_percentage:  calibrationResults['confirmed_case_percentage'] || diseaseParameters.confirmed_case_percentage,
      avg_days_hospitalized:  calibrationResults['avg_days_hospitalized'] || diseaseParameters.avg_days_hospitalized,
      avg_days_immune:  calibrationResults['avg_days_immune'] || diseaseParameters.avg_days_immune
    });

    setInterventions(interventions.map((i) => {return {...i, 'effectiveness' : calibrationResults['Intervention:'+i.name] || i.effectiveness}}))
  }
  
  useEffect(() => {
    setCalibrationResults({});
  }, [diseaseParameters])

  const calibrate = (variables, method) => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disease_parameters: diseaseParameters,
        sim_parameters: simParameters,
        interventions: interventions,
        calibration_data: calibrationData,
        calibration_variables: variables,
        calibration_method: method
      })
    }

    fetch('/api/calibrate', requestOptions)
      .then(response => response.json())
      .then(data => setCalibrationResults(data))
      .catch(handleError)
  }

  useEffect(simulate, [diseaseParameters, simParameters, interventions]);

  const [errorMessage, setErrorMessage] = useState("")
  const clearErrorMessage = () => {
    setErrorMessage("")
  } 

  return (
    <div className="App">
        <div class="header">
          <div class="leftheader">
            <DataMenu saveModel={saveModel} modelName={modelName} loadModel={loadModel} deleteModel={deleteModel}/>
          </div>
          <div class="rightheader">
            <FooterMenu class="footer" setErrorMessage={setErrorMessage} saveModel={saveModel}/>
          </div>
          </div> 
        <Stack horizontal>
        </Stack>
        {errorMessage !== "" && (<MessageBar
          messageBarType={MessageBarType.error}
          isMultiline={false}
          onDismiss={clearErrorMessage}
          dismissButtonAriaLabel="Close"
        >
          {errorMessage}
        </MessageBar>)}
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
                <InterventionsPanel setErrorMessage={setErrorMessage} interventions={interventions} setInterventions={setInterventions} simulate={simulate} setParameterValues={setParameterValues}/>
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
                <CalibrationPanel setErrorMessage={setErrorMessage} calibrationData={calibrationData} setCalibrationData={setCalibrationData} calibrate={calibrate} calibrationResults={calibrationResults} setParameterValues={setParameterValues} interventions={interventions} setPopulation={setPopulation}/>
              </div>
            </div>
          </PivotItem>
        </Pivot>

    </div>

  );
}

export default App;
