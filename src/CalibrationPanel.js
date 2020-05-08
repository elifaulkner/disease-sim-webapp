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
import { Pivot, PivotItem, PivotLinkFormat } from 'office-ui-fabric-react';

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
        <Pivot linkFormat={PivotLinkFormat.tabs} styles={{ root: { display: 'flex', flexWrap: 'wrap' } }}>
            <PivotItem headerText="Upload Data" itemKey="csv-reader">
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
            <PivotItem headerText="Manual Data" itemKey="manual"> 
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
            <PivotItem itemKey="covid-state" headerText="COVID Tracking Project">
                <StatePanel setCalibrationData={props.setCalibrationData} setPopulation={props.setPopulation}/>
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

        props.calibrate(calibrationVariables, calibrationMethod.key)

        setCalibrationVariables([])
    }

    const exitCallback = () => {
        props.setHideDialog(true)
    }

    const options = [{ key: 'least_squares', text: 'Least Squares' }]
    //const options = [{ key: 'least_squares', text: 'Least Squares' }, { key: 'vi', text: 'Bayesian Variational Inference' }]
    const [calibrationMethod, setCalibrationMethod] = useState(options[0])
    const calibrationMethodChanged = (m) => {
        setCalibrationMethod(m)
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

const StatePanel = (props) => {
    const states = [{'population': 4903185, 'text':'Alabama', 'key':'AL'},
    {'population': 731545, 'text':'Alaska', 'key':'AK'},
    {'population': 7278717, 'text':'Arizona', 'key':'AZ'},
    {'population': 3017804, 'text':'Arkansas', 'key':'AR'},
    {'population': 39512223, 'text':'California', 'key':'CA'},
    {'population': 5758736, 'text':'Colorado', 'key':'CO'},
    {'population': 3565287, 'text':'Connecticut', 'key':'CT'},
    {'population': 973764, 'text':'Delaware', 'key':'DE'},
    {'population': 705749, 'text':'District of Columbia', 'key':'DC'},
    {'population': 21477737, 'text':'Florida', 'key':'FL'},
    {'population': 10617423, 'text':'Georgia', 'key':'GA'},
    {'population': 1415872, 'text':'Hawaii', 'key':'HI'},
    {'population': 1787065, 'text':'Idaho', 'key':'ID'},
    {'population': 12671821, 'text':'Illinois', 'key':'IL'},
    {'population': 6732219, 'text':'Indiana', 'key':'IN'},
    {'population': 3155070, 'text':'Iowa', 'key':'IA'},
    {'population': 2913314, 'text':'Kansas', 'key':'KS'},
    {'population': 4467673, 'text':'Kentucky', 'key':'KY'},
    {'population': 4648794, 'text':'Louisiana', 'key':'LA'},
    {'population': 1344212, 'text':'Maine', 'key':'ME'},
    {'population': 6045680, 'text':'Maryland', 'key':'MD'},
    {'population': 6892503, 'text':'Massachusetts', 'key':'MA'},
    {'population': 9986857, 'text':'Michigan', 'key':'MI'},
    {'population': 5639632, 'text':'Minnesota', 'key':'MN'},
    {'population': 2976149, 'text':'Mississippi', 'key':'MS'},
    {'population': 6137428, 'text':'Missouri', 'key':'MO'},
    {'population': 1068778, 'text':'Montana', 'key':'MT'},
    {'population': 1934408, 'text':'Nebraska', 'key':'NE'},
    {'population': 3080156, 'text':'Nevada', 'key':'NV'},
    {'population': 1359711, 'text':'New Hampshire', 'key':'NH'},
    {'population': 8882190, 'text':'New Jersey', 'key':'NJ'},
    {'population': 2096829, 'text':'New Mexico', 'key':'NM'},
    {'population': 19453561, 'text':'New York', 'key':'NY'},
    {'population': 10488084, 'text':'North Carolina', 'key':'NC'},
    {'population': 762062, 'text':'North Dakota', 'key':'ND'},
    {'population': 11689100, 'text':'Ohio', 'key':'OH'},
    {'population': 3956971, 'text':'Oklahoma', 'key':'OK'},
    {'population': 4217737, 'text':'Oregon', 'key':'OR'},
    {'population': 12801989, 'text':'Pennsylvania', 'key':'PA'},
    {'population': 3193694, 'text':'Puerto Rico', 'key':'PR'},
    {'population': 1059361, 'text':'Rhode Island', 'key':'RI'},
    {'population': 5148714, 'text':'South Carolina', 'key':'SC'},
    {'population': 884659, 'text':'South Dakota', 'key':'SD'},
    {'population': 6829174, 'text':'Tennessee', 'key':'TN'},
    {'population': 28995881, 'text':'Texas', 'key':'TX'},
    {'population': 3205958, 'text':'Utah', 'key':'UT'},
    {'population': 623989, 'text':'Vermont', 'key':'VT'},
    {'population': 8535519, 'text':'Virginia', 'key':'VA'},
    {'population': 7614893, 'text':'Washington', 'key':'WA'},
    {'population': 1792147, 'text':'West Virginia', 'key':'WV'},
    {'population': 5822434, 'text':'Wisconsin', 'key':'WI'},
    {'population': 578759, 'text':'Wyoming', 'key':'WY'}]


    const stateStateSelected = (state) => {
        if(state !== '') {
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }
        
            fetch('/api/data/covid/state/'+state.key, requestOptions)
                .then(response => response.json())
                .then(data => props.setCalibrationData(data), (error) => {
                    alert(error);
                });    

            props.setPopulation(state['population'])
        }
    }
    
    return(
        <div>
            <Dropdown options={states} onChanged={stateStateSelected}/>
        </div>
    );
}

export default CalibrationPanel;