import React from 'react';
import './App.css';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { SpinButton } from 'office-ui-fabric-react/lib/SpinButton';

function ModelConfigurationPanel(props) {
    return (
        <div>
            <Stack vertival>
                <SpinButton
                    label="Basic Reproductive Number"
                    labelPosition="Top"
                    min={0}
                    max={5}
                    step={0.1}
                    showValue={true}
                    snapToStep
                    value={props.diseaseParameters.R0}
                    onValidate={(v) => props.setDiseaseParameters(prevState => { return { ...prevState, R0: v } })} />
                <SpinButton
                    label="Average Days Infectious"
                    labelPosition="Top"
                    min={1}
                    max={30}
                    step={1}
                    showValue={true}
                    snapToStep
                    value={props.diseaseParameters.avg_days_infected}
                    onValidate={(v) => props.setDiseaseParameters(prevState => { return { ...prevState, avg_days_infected: v } })} />
                <SpinButton
                    label="Average Days Hospitalized"
                    labelPosition="Top"
                    min={1}
                    max={30}
                    step={1}
                    value={props.diseaseParameters.avg_days_hospitalized}
                    showValue={true}
                    snapToStep
                    onValidate={(v) => props.setDiseaseParameters(prevState => { return { ...prevState, avg_days_hospitalized: v } })} />
                <SpinButton
                    label="Average Days Immune"
                    labelPosition="Top"
                    min={1}
                    max={1000}
                    step={1}
                    value={props.diseaseParameters.avg_days_immune}
                    showValue={true}
                    snapToStep
                    onValidate={(v) => props.setDiseaseParameters(prevState => { return { ...prevState, avg_days_immune: v } })} />
                <SpinButton
                    label="P(hospitalization|infection)"
                    labelPosition="Top"
                    min={0}
                    max={1}
                    step={0.0001}
                    value={props.diseaseParameters.p_hospitalization_given_infection}
                    showValue={true}
                    snapToStep
                    onValidate={(v) => props.setDiseaseParameters(prevState => { return { ...prevState, p_hospitalization_given_infection: v } })} />
                <SpinButton
                    label="P(death|hospitalization)"
                    labelPosition="Top"
                    min={0}
                    max={1}
                    step={0.0001}
                    value={props.diseaseParameters.p_death_given_hospitalization}
                    showValue={true}
                    snapToStep
                    onValidate={(v) => props.setDiseaseParameters(prevState => { return { ...prevState, p_death_given_hospitalization: v } })} />
                <SpinButton
                    label="Confirmed Case Percentage"
                    labelPosition="Top"
                    min={0}
                    max={1}
                    step={0.0001}
                    value={props.diseaseParameters.confirmed_case_percentage}
                    showValue={true}
                    snapToStep
                    onValidate={(v) => props.setDiseaseParameters(prevState => { return { ...prevState, confirmed_case_percentage: v } })} />
                <SpinButton
                    label="# Days to Simulation"
                    labelPosition="Top"
                    min={1}
                    max={1825}
                    step={1}
                    showValue={true}
                    snapToStep
                    value={props.simParameters.max_time}
                    onValidate={(v) => props.setSimParameters(prevState => { return { ...prevState, max_time: v } })} />
                <SpinButton
                    label="Population"
                    labelPosition="Top"
                    min={0}
                    max={10000000000000}
                    step={1}
                    showValue={true}
                    snapToStep
                    value={props.simParameters.population}
                    onValidate={(v) => props.setSimParameters(prevState => { return { ...prevState, population: v } })} />
                <SpinButton
                    label="Initial Infectious"
                    labelPosition="Top"
                    min={0}
                    max={10000000000000}
                    step={1}
                    value={props.simParameters.init_infection}
                    showValue={true}
                    snapToStep
                    onValidate={(v) => props.setSimParameters(prevState => { return { ...prevState, init_infection: v } })} />
                <SpinButton
                    label="Initial Recovered"
                    labelPosition="Top"
                    min={0}
                    max={10000000000000}
                    step={1}
                    value={props.simParameters.init_recovered}
                    showValue={true}
                    snapToStep
                    onValidate={(v) => props.setSimParameters(prevState => { return { ...prevState, init_recovered: v } })} />
            </Stack>
        </div>
    );
}

export default ModelConfigurationPanel;