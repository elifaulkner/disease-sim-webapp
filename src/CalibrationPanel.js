import React, { useState } from 'react';
import './App.css';
import { DetailsList, DetailsListLayoutMode } from 'office-ui-fabric-react/lib/DetailsList';
import { DefaultButton } from 'office-ui-fabric-react';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { SpinButton } from 'office-ui-fabric-react/lib/SpinButton';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { Selection } from 'office-ui-fabric-react/lib/Selection';
import { CSVReader } from 'react-papaparse'

const CalibrationPanel = (props) => {
    const [currentData, setCurrentData] = useState({ state: 'confirmed', day: 1, count: 0 })

    const columns = [
        { key: 'column1', name: 'State', fieldName: 'state', minWidth: 75, maxWidth: 75, isResizable: true },
        { key: 'column2', name: 'Day', fieldName: 'day', minWidth: 50, maxWidth: 75, isResizable: true },
        { key: 'column3', name: 'Count', fieldName: 'count', minWidth: 50, maxWidth: 50, isResizable: true },
    ];

    const options = [
        { key: 'confirmed', text: 'Confirmed' },
        { key: 'hospitalized', text: 'Hospitalized' },
        { key: 'deaths', text: 'Deaths' }
    ];

    const selection = React.useMemo(() => new Selection({ getKey: i => i.name }), []);

    const deleteSelected = () => {
        if (selection.getSelectedCount() > 0) {
            const selectedItems = selection.getSelection();

            const remaining = props.calibrationData.filter(x => !selectedItems.includes(x));
            props.setCalibrationData(remaining);
        } else {
            alert('nothing selected to delete')
        }
    }

    const deleteAll = () => {
        props.setCalibrationData([])
    }

    const confirm = () => {
        props.setCalibrationData(props.calibrationData.concat([currentData]))

        setCurrentData({ state: 'confirmed', day: 1, count: 0 })
    }

    const handleOnDrop = (data) => {
        const upload = data.map(d=>d.data).filter(d=>d.day!= null);
        props.setCalibrationData(props.calibrationData.concat(upload))
    }

    const handleOnError = () => {
    
    }


    return (<div>
        <Stack vertical>
            <Dropdown
                label="State"
                options={options}
                value={currentData.state}
                onChanged={(v) => setCurrentData(prevState => { return { ...prevState, state: v.key } })}
            />
            <SpinButton
                label="Day"
                labelPosition="Top"
                min={0}
                max={3650}
                step={1}
                showValue={true}
                snapToStep
                iconProps={{ iconName: 'IncreaseIndentLegacy' }}
                value={currentData.day}
                onValidate={(v) => setCurrentData(prevState => { return { ...prevState, day: parseInt(v) } })} />
            <SpinButton
                label="Count"
                labelPosition="Top"
                min={0}
                max={10000000000000}
                step={1}
                showValue={true}
                snapToStep
                value={currentData.count}
                onValidate={(v) => setCurrentData(prevState => { return { ...prevState, count: parseInt(v) } })} />
            <Separator/>
            <Stack horizontal>
                <DefaultButton text="Add Data" onClick={confirm} />
                <DefaultButton text="Delete Selected" onClick={deleteSelected} />
                <DefaultButton text="Delete All" onClick={deleteAll} />
            </Stack>
        <DefaultButton text="Auto Calibrate" onClick={props.calibrate} />
        </Stack>
        <Separator/>
        <CSVReader
        onDrop={handleOnDrop}
        onError={handleOnError}
        noClick
        config={{
            delimiter: ",",	// auto-detect
            newline: "",	// auto-detect
            quoteChar: '"',
            escapeChar: '"',
            header: true}}
        >
        <span>Drop CSV file here to upload</span>
        </CSVReader> 
        <Separator/>
        <DetailsList
            items={props.calibrationData}
            columns={columns}
            label="Calibration Data"
            layoutMode={DetailsListLayoutMode.justified}
            selectionPreservedOnEmptyClick={true}
            ariaLabelForSelectionColumn="Toggle selection"
            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
            checkButtonAriaLabel="Row checkbox"
            selection={selection}
            setKey="name"
        /> 
    </div>)
}

export default CalibrationPanel;