import React, { useState }  from 'react';
import './App.css';
import { Panel } from 'office-ui-fabric-react/lib/Panel';
import { DetailsList, DetailsListLayoutMode} from 'office-ui-fabric-react/lib/DetailsList';
import { DefaultButton, Label } from 'office-ui-fabric-react';
import { useConstCallback } from '@uifabric/react-hooks';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { SpinButton } from 'office-ui-fabric-react/lib/SpinButton';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { SelectionZone, SelectionMode } from 'office-ui-fabric-react/lib/Selection';

function InterventionsPanel(props) {
    var selection

    const dismissPanel = useConstCallback(() => {
        props.simulate()
        props.setIsOpen(false);
    });

    const [interventions, setInterventions] = useState(props.interventions)    
    const [currentIntervention, setCurrentIntervention] = useState({name:'', start:0, end:3650, scale:1, type:''})
    const [currentType, setCurrentType] = useState('infection_rate')

    const columns = [
        { key: 'column1', name: 'Name', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'column2', name: 'Start', fieldName: 'start', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'column2', name: 'End', fieldName: 'end', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'column2', name: 'Scale', fieldName: 'scale', minWidth: 100, maxWidth: 200, isResizable: true },
    ];

    const confirm = () => {
        currentIntervention.type = currentType
        interventions.push(currentIntervention)
        props.setInterventions(interventions)
        setCurrentIntervention({name:'', start:0, end:3650, scale:1, type:''})
    }

    const options: IDropdownOption[] = [
        { key: 'infection_rate', text: 'Infection Rate' },
        { key: 'infection_time', text: 'Infection Time' },
        { key: 'hospitilization_time', text: 'Hospitilization Time' },
        { key: 'immunity_time', text: 'Immunity Time' },
        { key: 'hospitilization_rate', text: 'Hospitilization Rate' },
        { key: 'death_rate', text: 'Death Rate' },
      ];

    return (
        <div>
            <Panel
            isLightDismiss
            headerText="Intervention Strategies"
            isOpen={props.isOpen}
            type={3}
            onDismiss={dismissPanel}
            onLightDismissClick={dismissPanel}
            // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
            closeButtonAriaLabel="Close"
            hasCloseButton="true"
            >
            <div> 
                <Stack vertical>
                    <TextField  
                        label="Name" 
                        onChange={(v) => setCurrentIntervention(prevState => {return {...prevState, name: v.target.value}})}/>
                    <Dropdown
                        label="Intervention Type"
                        options={options}
                        value={currentIntervention.type}
                        onChanged={(v) => setCurrentType(v.key)}
                    />
                    <SpinButton
                        label="Start"
                        labelPosition="Top"
                        min={0}
                        max={3650}
                        step={1}
                        showValue={true}
                        snapToStep
                        value={currentIntervention.start}
                        onValidate={(v) => setCurrentIntervention(prevState => {return {...prevState, start: v}})}/>
                    <SpinButton
                        label="End"
                        labelPosition="Top"
                        min={0}
                        max={3650}
                        step={1}
                        showValue={true}
                        snapToStep
                        value={currentIntervention.end}
                        onValidate={(v) => setCurrentIntervention(prevState => {return {...prevState, end: v}})}/>
                    <SpinButton
                        label="Scale"
                        labelPosition="Top"
                        min={0}
                        max={100}
                        step={0.0001}
                        showValue={true}
                        snapToStep
                        value={currentIntervention.scale}
                        onValidate={(v) => setCurrentIntervention(prevState => {return {...prevState, scale: v}})}/>
                    <Label/>
                    <DefaultButton text="Add" onClick={confirm}/>
                </Stack>
            </div>
                <DetailsList
                    items={interventions}
                    columns={columns}
                    label="Infection Rate Intenventions"
                    setKey="set"
                    layoutMode={DetailsListLayoutMode.justified}
                    selectionPreservedOnEmptyClick={true}
                    ariaLabelForSelectionColumn="Toggle selection"
                    ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                    checkButtonAriaLabel="Row checkbox"
                />
            <DefaultButton text="Done" onClick={dismissPanel}/>
            </Panel>
        </div>
    );
}

export default InterventionsPanel;