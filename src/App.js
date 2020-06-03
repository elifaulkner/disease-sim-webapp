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
import SensitivityChart from './SensitivityChart'
import { Pivot, PivotItem, PivotLinkSize, PivotLinkFormat } from 'office-ui-fabric-react/lib/Pivot';
import CalibrationPanel from './CalibrationPanel';
import CalibrationGraph from './CalibrationGraph';
import { initializeIcons } from '@uifabric/icons';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/';
import { Stack } from 'office-ui-fabric-react/lib/Stack';


function App() {
  initializeIcons();

  const [model, setModel] = useState({
    diseaseParameters: {
      R0: 3.25,
      avg_days_infected: 10.0,
      avg_days_hospitalized: 14.0,
      avg_days_immune: 183.0,
      p_hospitalization_given_infection: 0.005,
      p_death_given_hospitalization: 0.1,
      confirmed_case_percentage: .01
    },
    simParameters: {
      max_time: 730,
      population: 1000000,
      init_infection: 10,
      init_recovered: 0
    },
    interventions: [],
    calibrationData: []
  })

  function setDiseaseParameters(val) {
    setModel({...model, diseaseParameters:val})
  }

  function setSimParameters(val) {
    setModel({...model, simParameters:val})
  }

  function setInterventions(val) {
    setModel({...model, interventions:val})
  }
  
  function setCalibrationData(val) {
    setModel({...model, calibrationData:val})
  }

  const handleError = (error) => {}

  const handleResponse = (response) => {
    if(response.ok) {
      return response.json()
    } else {
      setErrorMessage(response.url +" Returned Status Code " + response.status +" with message: " + response.statusText) 
      return {}
    }
  }

  const setPopulation = (p) => {
    setModel(model=> {
      model.simParameters.population = p
      return model;
    })
  }
  
  const [simulation, setSimulation] = useState({});
  const [sensitivities, setSensitivities] = useState({});
  const [calibrationResults, setCalibrationResults] = useState({})

  const [signedIn, setSignedIn] = useState([])

  useEffect(() => {
    fetch('api/auth/user')
    .then(response => {
      if(response.ok) {
        setSignedIn(true)
      } else {
        setSignedIn(false)
      }        
    })
  }, [])

  const [modelName, setModelName] = useState('')

  const saveModel = (name) => {
    setModelName(name)
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disease_parameters: model.diseaseParameters,
        sim_parameters: model.simParameters,
        interventions: model.interventions,
        calibration_data: model.calibrationData
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
      setModel({
        diseaseParameters: model['disease_parameters'],
        simParameters: model['sim_parameters'],
        interventions: model['interventions'],
        calibrationData: model['calibration_data'] 
      })
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
        disease_parameters: model.diseaseParameters,
        sim_parameters: model.simParameters,
        interventions: model.interventions
      })
    }

    fetch('/api/simulate', requestOptions)
      .then(handleResponse)
      .then(data => setSimulation(data))
      .catch((error) => {
        setSimulation({})
      })
  }

  const calculateSensitivities = () => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disease_parameters: model.diseaseParameters,
        sim_parameters: model.simParameters,
        interventions: model.interventions
      })
    }

    fetch('/api/simulate/sensitivities', requestOptions)
      .then(handleResponse)
      .then(data => setSensitivities(data))
      .catch((error) => {
        setSensitivities({})
      })
  }

  const setParameterValues = () => {
    setModel(model=> {
      model.diseaseParameters = {
      R0: calibrationResults['R0'] || model.diseaseParameters.R0,
      avg_days_infected:  calibrationResults['avg_days_infected'] || model.diseaseParameters.avg_days_infected,
      p_hospitalization_given_infection:  calibrationResults['p_hospitalization_given_infection'] || model.diseaseParameters.p_hospitalization_given_infection,
      p_death_given_hospitalization:  calibrationResults['p_death_given_hospitalization'] || model.diseaseParameters.p_death_given_hospitalization,
      confirmed_case_percentage:  calibrationResults['confirmed_case_percentage'] || model.diseaseParameters.confirmed_case_percentage,
      avg_days_hospitalized:  calibrationResults['avg_days_hospitalized'] || model.diseaseParameters.avg_days_hospitalized,
      avg_days_immune:  calibrationResults['avg_days_immune'] || model.diseaseParameters.avg_days_immune
      }
      return model
    });

    setModel(model=> {
      model.interventions = model.interventions.map((i) => {return {...i, 'effectiveness' : calibrationResults['Intervention:'+i.name] || i.effectiveness}})
      return model
    })
  }
  
  useEffect(() => {
    setCalibrationResults({});
  }, [model])

  const calibrate = (variables, method) => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disease_parameters: model.diseaseParameters,
        sim_parameters: model.simParameters,
        interventions: model.interventions,
        calibration_data: model.calibrationData,
        calibration_variables: variables,
        calibration_method: method
      })
    }

    fetch('/api/calibrate', requestOptions)
      .then(response => response.json())
      .then(data => setCalibrationResults(data))
      .catch(handleError)
  }

  useEffect(simulate, [model]);
  useEffect(calculateSensitivities, [simulation]);

  const [errorMessage, setErrorMessage] = useState("")
  const clearErrorMessage = () => {
    setErrorMessage("")
  } 

  return (
    <div className="App">
        <div class="header">
          <div class="leftheader">
            <DataMenu saveModel={saveModel} modelName={modelName} loadModel={loadModel} deleteModel={deleteModel} signedIn={signedIn}/>
          </div>
          <div class="rightheader">
            <FooterMenu class="footer" setErrorMessage={setErrorMessage} saveModel={saveModel} signedIn={signedIn}/>
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
                <DiseaseGraph simulation={simulation} calibrationData={model.calibrationData} population={model.simParameters.population} />
                <MorbidityAndMortalityGraph simulation={simulation} calibrationData={model.calibrationData} population={model.simParameters.population} />
              </div>
              <div class="sidebar">
                <ModelConfigurationPanel diseaseParameters={model.diseaseParameters} setDiseaseParameters={setDiseaseParameters} simParameters={model.simParameters} setSimParameters={setSimParameters} simulate={simulate}/>
              </div>
            </div>
          </PivotItem>
          <PivotItem headerText="Interventions">
            <div class="container">
              <div class="content">
                <InterventionsChart title="Active Interventions" interventions={model.interventions} max={model.simParameters.max_time} />
                <div class="container">
                  <DiseaseGraph simulation={simulation} calibrationData={model.calibrationData} population={model.simParameters.population} />
                  <MorbidityAndMortalityGraph simulation={simulation} calibrationData={model.calibrationData} population={model.simParameters.population} />
                </div>
              </div>
              <div class="sidebar">
                <InterventionsPanel setErrorMessage={setErrorMessage} interventions={model.interventions} setInterventions={setInterventions} simulate={simulate} setParameterValues={setParameterValues}/>
              </div>
            </div>
          </PivotItem>
          <PivotItem headerText="Stats & Sensitivities" alwaysRender={false}>
            <div class="container">
              <div class="content">
                <SensitivityChart sensitivities={sensitivities}/>
              </div>
              <div class="sidebar">
                <CumulativeStatisticsPanel sim={simulation} population={model.simParameters.population}/>
              </div>
            </div>
          </PivotItem>
          <PivotItem headerText="Calibration">
            <div class="container">
              <div class="content">
                <CalibrationGraph simulation={simulation} calibrationData={model.calibrationData} population={model.simParameters.population} confirmed_case_percentage={model.diseaseParameters.confirmed_case_percentage}/>
              </div>
              <div class="sidebar">
                <CalibrationPanel setErrorMessage={setErrorMessage} calibrationData={model.calibrationData} setCalibrationData={setCalibrationData} calibrate={calibrate} calibrationResults={calibrationResults} setParameterValues={setParameterValues} interventions={model.interventions} setPopulation={setPopulation}/>
              </div>
            </div>
          </PivotItem>
        </Pivot>

    </div>

  );
}

export default App;
