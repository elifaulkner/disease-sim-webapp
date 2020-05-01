import React, { useEffect, useState } from 'react';
import IDMCurve from './IDMCurve';
import IDMGraphHighcharts from './IDMGraphHighcharts';

const MorbidityAndMortalityGraph = (props) => {
    const [hospitalizedTimes, setHospitalizedtimes] = useState([])
    const [hospitalizedCounts, setHospitalizedCounts] = useState([])
    
    useEffect(() => {
      setHospitalizedtimes(props.calibrationData.filter(d=>d.state==='hospitalized').map(d=>d.day));
      setHospitalizedCounts(props.calibrationData.filter(d=>d.state==='hospitalized').map(d=>parseInt(d.count)/props.population));
    }, [props.calibrationData, props.population]);

    const [hospitalizedCurrentTimes, setHospitalizedCurrenttimes] = useState([])
    const [hospitalizedCurrentCounts, setHospitalizedCurrentCounts] = useState([])
    
    useEffect(() => {
      setHospitalizedCurrenttimes(props.calibrationData.filter(d=>d.state==='hospitalized_current').map(d=>d.day));
      setHospitalizedCurrentCounts(props.calibrationData.filter(d=>d.state==='hospitalized_current').map(d=>parseInt(d.count)/props.population));
    }, [props.calibrationData, props.population]);

    const [deathTimes, setDeathtimes] = useState([])
    const [deathCounts, setDeathCounts] = useState([])

    useEffect(() => {
      setDeathtimes(props.calibrationData.filter(d=>d.state==='deaths').map(d=>d.day));
      setDeathCounts(props.calibrationData.filter(d=>d.state==='deaths').map(d=>parseInt(d.count)/props.population));
    }, [props.calibrationData, props.population]);

    const [infectiousTimes, setInfectiousTimes] = useState([])
    const [infectiousCounts, setInfectiousCounts] = useState([])
    
    useEffect(() => {
      setInfectiousTimes(props.calibrationData.filter(d=>d.state==='confirmed').map(d=>d.day));
      setInfectiousCounts(props.calibrationData.filter(d=>d.state==='confirmed').map(d=>parseInt(d.count)/props.population));
    }, [props.calibrationData, props.population]);

    const [showCumulativeHospitalizations, setShowCumulativeHospitalizations] = useState(true)
    useEffect(() => {
      if(hospitalizedCurrentCounts.length > 0) {
        setShowCumulativeHospitalizations(false)
      } else {
        setShowCumulativeHospitalizations(true)
      }
    }, [hospitalizedCurrentCounts])
    return(<div class="graph">
        <IDMGraphHighcharts title="Cumulative Confirmed"> 
          <IDMCurve times={props.simulation.time} values={props.simulation.cumulative_confirmed} name="Cumulative Confirmed" color="Red" type='line'/>
          <IDMCurve times={infectiousTimes} values={infectiousCounts} name="Observed Confirmed" color="Red" type="scatter"/>
        </IDMGraphHighcharts>
        {showCumulativeHospitalizations && (<IDMGraphHighcharts title="Cumulative Hospitalized" hidden={!showCumulativeHospitalizations}> 
          <IDMCurve times={props.simulation.time} values={props.simulation.cumulative_hospitalized} name="Hospitalized" color="Blue" type='line'/>
          <IDMCurve times={hospitalizedTimes} values={hospitalizedCounts} name="Observed Hospitalizations" color="Blue" type='scatter'/>
        </IDMGraphHighcharts>)}
        {!showCumulativeHospitalizations && (<IDMGraphHighcharts title="Hospitalized"  hidden={showCumulativeHospitalizations}> 
          <IDMCurve times={props.simulation.time} values={props.simulation.hospitalized} name="Hospitalized" color="Blue" type='line'/>
          <IDMCurve times={hospitalizedCurrentTimes} values={hospitalizedCurrentCounts} name="Observed Hospitalizations" color="Blue" type='scatter'/>
        </IDMGraphHighcharts>)}
        <IDMGraphHighcharts title="Deaths"> 
          <IDMCurve times={props.simulation.time} values={props.simulation.dead} name="Dead" color="Red" type='line'/>
          <IDMCurve times={deathTimes} values={deathCounts} name="Observed Deaths" color="Red" type='scatter'/>
        </IDMGraphHighcharts>
      </div>)
}

export default MorbidityAndMortalityGraph;