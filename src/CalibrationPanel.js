import React, { useState, useEffect } from 'react';
import './App.css';
import { DetailsList, DetailsListLayoutMode, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { SpinButton } from 'office-ui-fabric-react/lib/SpinButton';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { Selection } from 'office-ui-fabric-react/lib/Selection';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { CSVReader } from 'react-papaparse'
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Pivot, PivotItem } from 'office-ui-fabric-react';

const CalibrationPanel = (props) => {
    const [currentData, setCurrentData] = useState({ state: 'confirmed', day: 1, count: 0 })
    const [hideDialog, setHideDialog] = useState(true)
    const [hideCalibrationConfirm, setHideCalibrationConfirm] = useState(true)
    const [autoCalibrateEnabled, setAutoCalibrateEnabled] = useState(false)

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

    useEffect(() => {
        if (props.calibrationData.length > 0) {
            setAutoCalibrateEnabled(true)
        }
        else {
            setAutoCalibrateEnabled(false)
        }
    }, [props.calibrationData])

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
        const upload = data.map(d => d.data).filter(d => d.day != null);
        props.setCalibrationData(props.calibrationData.concat(upload))
    }

    const handleOnError = () => {
    }

    const autoCalibrationHandler = () => {
        setHideDialog(false)
    }

    const isEmpty = (x) => {
        for(var key in x) {
            if(x.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    useEffect(() => {
        if(!isEmpty(props.calibrationResults)) {
            setHideCalibrationConfirm(false)
        }
    }, [props.calibrationResults])


    return (<div>
        <Pivot>
            <PivotItem headerText="Upload Data">
                <CSVReader
                    className="csv-reader"
                    onDrop={handleOnDrop}
                    onError={handleOnError}
                    noClick
                    id="csv-reader"
                    config={{
                        delimiter: ",",
                        newline: "",
                        quoteChar: '"',
                        escapeChar: '"',
                        header: true
                    }}
                >
                    <span>Drop CSV file here to upload</span> <br/>
                    <span>state,day,count</span>
                    <span>confirmed,10,120</span>
                    <span>hospitalized,10,24</span>
                    <span>deaths,10,3</span>
                </CSVReader>
            </PivotItem>
            <PivotItem headerText="Add Manual Data">
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
                    <Stack horizontal horizontalAlign="center" style={{ paddingTop: 20 }}>
                        <DefaultButton text="Add Data" onClick={confirm} className="panel-button" />
                    </Stack>
                </Stack>
            </PivotItem>
        </Pivot>
        <Separator />
        <DefaultButton text="Auto Calibrate" onClick={autoCalibrationHandler} id="calibrate-button" disabled={!autoCalibrateEnabled} className="panel-button" />
        <CalibrationCallout hideDialog={hideDialog} setHideDialog={setHideDialog} calibrate={props.calibrate} setHideConfirm={setHideCalibrationConfirm} interventions={props.interventions}/>
        <CalibrationVerification setHideDialog={setHideCalibrationConfirm} hideDialog={hideCalibrationConfirm} data={props.data} setParameterValues={props.setParameterValues} calibrationResults={props.calibrationResults}/>
        <Separator />
        <Stack horizontal horizontalAlign="center">
            <DefaultButton text="Delete Selected" onClick={deleteSelected} className="panel-button" />
            <DefaultButton text="Delete All" onClick={deleteAll} className="panel-button" />
        </Stack>
        <Separator />
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


const CalibrationVerification = (props) => {
    const [items, setItems] = useState([{'key':0, 'value':0}])
    const rejectCallback = () => {
        props.setHideDialog(true)
    }

    const acceptCallback = () => {
        props.setParameterValues()
        props.setHideDialog(true)
    }

    const isEmpty = (x) => {
        for(var key in x) {
            if(x.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    useEffect(() =>
    {
        if(!isEmpty(props.calibrationResults)) {
            var items = Object.entries(props.calibrationResults).map((k)=>{
                return {'key':k[0], 
                        'value':k[1]}});
            setItems(items)
            }
     }, [props.calibrationResults])

    const columns = [
        { key: 'column1', name: 'Parameter', fieldName: 'key', minWidth: 150, maxWidth: 400, isResizable: true },
        { key: 'column2', name: 'Value', fieldName: 'value', minWidth: 150, maxWidth: 400, isResizable: true }
    ];

    return(<div>
                <Dialog
                maxWidth={600}
            hidden={props.hideDialog}
            dialogContentProps={{
                type: DialogType.normal,
                title: 'Calibration Configuration',
                closeButtonAriaLabel: 'Close',
            }}
            modalProps={{
                isBlocking: false,
                styles: { main: { maxWidth: 450 } }
            }}
        >
            <DetailsList
            items={items}
            columns={columns}
            selectionMode={SelectionMode.none}
            label="Calibration Results"
            layoutMode={DetailsListLayoutMode.justified}
            selectionPreservedOnEmptyClick={true}
            ariaLabelForSelectionColumn="Toggle selection"
            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
            checkButtonAriaLabel="Row checkbox"
            setKey="name"
        />

            <DialogFooter>
                <DefaultButton onClick={rejectCallback} text="Reject" />
                <PrimaryButton onClick={acceptCallback} text="Accept" />
            </DialogFooter>
        </Dialog>
    </div>)
}

const CalibrationCallout = (props) => {
    const [calibrationVariables, setCalibrationVariables] = useState([])

    const calibrateCallback = () => {
        props.setHideDialog(true)

        props.calibrate(calibrationVariables)

        setCalibrationVariables([])
    }

    const exitCallback = () => {
        props.setHideDialog(true)
    }

    const options = [{ key: 'least_squares', text: 'Least Squares' }]

    const calibrationMethodChanged = () => {

    }

    const checkboxCallback = (checked, variable) => {
        setCalibrationVariables(calibrationVariables.concat([variable]))
        if (checked) {

        } else {
            setCalibrationVariables(calibrationVariables.filter(x => x !== variable))
        }
    }

    return (
        <Dialog
            hidden={props.hideDialog}
            dialogContentProps={{
                type: DialogType.normal,
                title: 'Calibration Configuration',
                closeButtonAriaLabel: 'Close',
            }}
            modalProps={{
                isBlocking: false,
                styles: { main: { maxWidth: 450 } }
            }}
        >
            <Dropdown
                label="Calibration Method"
                options={options}
                defaultSelectedKey="least_squares"
                onChanged={calibrationMethodChanged}
            />
            <Checkbox label="Basic Reproductive Number" onChange={(ev, v) => checkboxCallback(v, 'R0')} />
            <Checkbox label="Average Days Infectious" onChange={(ev, v) => checkboxCallback(v, 'avg_days_infected')} />
            <Checkbox label="Average Days Hospitalized" onChange={(ev, v) => checkboxCallback(v, 'avg_days_hospitalized')} />
            <Checkbox label="Average Days Immune" onChange={(ev, v) => checkboxCallback(v, 'avg_days_immune')} />
            <Checkbox label="P(hospitalization|infection)" onChange={(ev, v) => checkboxCallback(v, 'p_hospitalization_given_infection')} />
            <Checkbox label="P(death|hospitalization)" onChange={(ev, v) => checkboxCallback(v, 'p_death_given_hospitalization')} />
            <Checkbox label="Confirmed Case Percentage" onChange={(ev, v) => checkboxCallback(v, 'confirmed_case_percentage')} />
            {props.interventions.map((i) => {
                return <Checkbox label={"Intervention:"+i.name} onChange={(ev, v) => checkboxCallback(v, "Intervention:"+i.name)} />
            })}
            <DialogFooter>
                <DefaultButton onClick={exitCallback} text="Exit" />
                <PrimaryButton onClick={calibrateCallback} text="Calibrate" />
            </DialogFooter>
        </Dialog>
    )
}

export default CalibrationPanel;