import React, { useEffect, useState }  from 'react';
import './App.css';
import { Panel } from 'office-ui-fabric-react/lib/Panel';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { SpinButton } from 'office-ui-fabric-react/lib/SpinButton';
import { DefaultButton } from 'office-ui-fabric-react';
import { useConstCallback } from '@uifabric/react-hooks';

function ModelConfigurationPanel(props) {
    const [diseaseParameters, setDiseaseParameters] = useState(props.diseaseParameters);
    const [simParameters, setSimParameters] = useState(props.simParameters);
    //const parentSetDiseaseParams = props.setDiseaseParameters
    //const parentSetSimParams = props.setSimParameters

    const dismissPanel = useConstCallback(() => {
        props.setDiseaseParameters(diseaseParameters)
        props.setSimParameters(simParameters)
        props.simulate()
        props.setIsOpen(false);
    });

    useEffect(() => props.setDiseaseParameters(diseaseParameters), [diseaseParameters, props])
    useEffect(() => props.setSimParameters(simParameters), [simParameters, props])

    return (
    <div>
        <Panel
        isLightDismiss
        headerText="Model Configuration"
        isOpen={props.isOpen}
        onDismiss={dismissPanel}
        onLightDismissClick={dismissPanel}
        // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
        closeButtonAriaLabel="Close"
        hasCloseButton="true"
        >
    <Stack vertival>
    <SpinButton
        label="Basic Reproductive Number"
        min={0}
        max={5}
        step={0.1}
        showValue={true}
        snapToStep
        value={diseaseParameters.R0}
        onValidate={(v) => setDiseaseParameters(prevState => {return {...prevState, R0: v}})}/>
    <SpinButton
        label="Average Days Infectious"
        min={1}
        max={30}
        step={1}
        showValue={true}
        snapToStep
        value={diseaseParameters.avg_days_infected} 
        onValidate={(v) => setDiseaseParameters(prevState => {return {...prevState, avg_days_infected: v}})}/>
    <SpinButton
        label="Average Days Hospitalized"
        min={1}
        max={30}
        step={1}
        value={diseaseParameters.avg_days_hospitalized}
        showValue={true}
        snapToStep
        onValidate={(v) => setDiseaseParameters(prevState => {return {...prevState, avg_days_hospitalized: v}})}/>
    <SpinButton
        label="Average Days Immune"
        min={1}
        max={1000}
        step={1}
        value={diseaseParameters.avg_days_immune}
        showValue={true}
        snapToStep
        onValidate={(v) => setDiseaseParameters(prevState => {return {...prevState, avg_days_immune: v}})}/>
    <SpinButton
        label="P(hospitalization|infection)"
        min={0}
        max={1}
        step={0.0001}
        value={diseaseParameters.p_hospitalization_given_infection}
        showValue={true}
        snapToStep
        onValidate={(v) => setDiseaseParameters(prevState => {return {...prevState, p_hospitalization_given_infection: v}})}/>
    <SpinButton
        label="P(death|hospitalization)"
        min={0}
        max={1}
        step={0.0001}
        value={diseaseParameters.p_death_given_hospitalization}
        showValue={true}
        snapToStep
        onValidate={(v) => setDiseaseParameters(prevState => {return {...prevState, p_death_given_hospitalization: v}})}/>
    <SpinButton
        label="# Days to Simulation"
        min={1}
        max={1825}
        step={1}
        showValue={true}
        snapToStep
        value={simParameters.max_time} 
        onValidate={(v) => setSimParameters(prevState => {return {...prevState, max_time: v}})}/>
    <SpinButton
        label="Initial Infection Rate"
        min={0}
        max={1}
        step={0.0000001}
        value={simParameters.init_infection}
        showValue={true}
        snapToStep
        onValidate={(v) => setSimParameters(prevState => {return {...prevState, init_infection: v}})}/>
    <DefaultButton text="Done" onClick={dismissPanel}/>
    </Stack>
    </Panel>
    </div>
    );
}

export default ModelConfigurationPanel;