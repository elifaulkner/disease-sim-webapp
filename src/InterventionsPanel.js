import React, { useState } from 'react';
import './App.css';
import { DetailsList, DetailsListLayoutMode } from 'office-ui-fabric-react/lib/DetailsList';
import { DefaultButton, Label } from 'office-ui-fabric-react';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { SpinButton } from 'office-ui-fabric-react/lib/SpinButton';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { Selection } from 'office-ui-fabric-react/lib/Selection';

function InterventionsPanel(props) {
    const [currentIntervention, setCurrentIntervention] = useState({ name: '', start: 0, end: 3650, effectiveness: 0, type: '' })
    const [currentType, setCurrentType] = useState('infection_rate')

    const columns = [
        { key: 'column1', name: 'Name', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'column2', name: 'Type', fieldName: 'type', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'column3', name: 'Start', fieldName: 'start', minWidth: 50, maxWidth: 200, isResizable: true },
        { key: 'column4', name: 'End', fieldName: 'end', minWidth: 50, maxWidth: 200, isResizable: true },
        { key: 'column5', name: 'Effectiveness', fieldName: 'effectiveness', minWidth: 100, maxWidth: 200, isResizable: true, onRender:(v)=>{return Math.round(v.effectiveness*1000000)/10000+' %'}}
    ];

    const confirm = () => {
        if (props.interventions.some(i => i.name === currentIntervention.name)) {
            alert('duplicate name, choose another')
            return
        }

        props.setInterventions([...props.interventions, {
            ...currentIntervention,
            type: currentType
        }])

        setCurrentIntervention({ name: '', start: 0, end: 3650, effectiveness: 0, type: '' })
    }

    const options = [
        { key: 'infection_rate', text: 'Infection Rate' },
        { key: 'infection_time', text: 'Infection Time' },
        { key: 'hospitilization_time', text: 'Hospitilization Time' },
        { key: 'immunity_time', text: 'Immunity Time' },
        { key: 'hospitilization_rate', text: 'Hospitilization Rate' },
        { key: 'death_rate', text: 'Death Rate' },
        { key: 'confirmed_case_percentage', text: 'Confirmed Case Percentage' }
    ];

    const selection = React.useMemo(() => new Selection({ getKey: i => i.name}), []);

    const deleteSelected = () => {
        if (selection.getSelectedCount() > 0) {
            const selectedItems = selection.getSelection();

            const remaining = props.interventions.filter(x => !selectedItems.includes(x));
            props.setInterventions(remaining);
        } else {
            alert('nothing selected to delete')
        }
    }

    return (
            <div>
                <div>
                    <Stack vertical>
                        <TextField
                            label="Name"
                            labelPosition="Left"
                            value={currentIntervention.name}
                            onChange={(v) => setCurrentIntervention(prevState => { return { ...prevState, name: v.target.value } })} />
                        <Dropdown
                            label="Intervention Type"
                            options={options}
                            value={currentIntervention.type}
                            onChanged={(v) => setCurrentType(v.key)}
                        />
                        <SpinButton
                            label="Start Day"
                            labelPosition="Top"
                            min={0}
                            max={3650}
                            step={1}
                            showValue={true}
                            snapToStep
                            value={currentIntervention.start}
                            onValidate={(v) => setCurrentIntervention(prevState => { return { ...prevState, start: v } })} />
                        <SpinButton
                            label="End Day"
                            labelPosition="Top"
                            min={0}
                            max={3650}
                            step={1}
                            showValue={true}
                            snapToStep
                            value={currentIntervention.end}
                            onValidate={(v) => setCurrentIntervention(prevState => { return { ...prevState, end: v } })} />
                        <SpinButton
                            label="Intervention Effectiveness"
                            labelPosition="Top"
                            min={0}
                            max={1}
                            ariaLabel="Percentage of the effectiveness of the intervention. 0% has no effect and 100% is a maximum effect"
                            step={0.0001}
                            showValue={true}
                            snapToStep
                            value={currentIntervention.effectiveness*100+' %'}
                            onValidate={(v) => setCurrentIntervention(prevState => { return { ...prevState, effectiveness: parseFloat(v)/100 } })} />
                        <Label />
                        <Stack horizontal horizontalAlign="center">
                            <DefaultButton text="Add Intervention" onClick={confirm} />
                            <DefaultButton text="Delete Selected" onClick={deleteSelected} />
                        </Stack>
                    </Stack>
                </div>
                <DetailsList
                    className="panel-list"
                    items={props.interventions}
                    columns={columns}
                    label="Infection Rate Intenventions"
                    layoutMode={DetailsListLayoutMode.justified}
                    selectionPreservedOnEmptyClick={true}
                    ariaLabelForSelectionColumn="Toggle selection"
                    ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                    checkButtonAriaLabel="Row checkbox"
                    selection={selection}
                    setKey="name"
                />
            </div>
    );
}

export default InterventionsPanel;