import React, { useEffect, useState } from 'react';
import IDMCurve from './IDMCurve';
import IDMGraphHighcharts from './IDMGraphHighcharts';

const MorbidityAndMortalityGraph = (props) => {

    const [hospitalizedTimes, setHospitalizedtimes] = useState([])
    const [hospitalizedCounts, setHospitalizedCounts] = useState([])
    
    useEffect(() => {
      setHospitalizedtimes(props.calibrationData.filter(d=>d.state==='hospitalized').map(d=>d.day));
      setHospitalizedCounts(props.calibrationData.filter(d=>d.state==='hospitalized').map(d=>d.count/props.population));
    }, [props.calibrationData, props.population]);

    const [deathTimes, setDeathtimes] = useState([])
    const [deathCounts, setDeathCounts] = useState([])

    useEffect(() => {
      setDeathtimes(props.calibrationData.filter(d=>d.state==='deaths').map(d=>d.day));
      setDeathCounts(props.calibrationData.filter(d=>d.state==='deaths').map(d=>d.count/props.population));
    }, [props.calibrationData, props.population]);

    const [infectiousTimes, setInfectiousTimes] = useState([])
    const [infectiousCounts, setInfectiousCounts] = useState([])
    
    useEffect(() => {
      setInfectiousTimes(props.calibrationData.filter(d=>d.state==='infectious').map(d=>d.day));
      setInfectiousCounts(props.calibrationData.filter(d=>d.state==='infectious').map(d=>d.count/props.population));
    }, [props.calibrationData, props.population]);

    return(<div class="graph">
        <IDMGraphHighcharts title="Cumulative Infectious"> 
          <IDMCurve times={props.simulation.time} values={props.simulation.cumulative_infectious} name="Cumulative Infectious" color="Red" type='line'/>
          <IDMCurve times={infectiousTimes} values={infectiousCounts} name="Observed Infectious" color="Red" type="scatter"/>
        </IDMGraphHighcharts>
        <IDMGraphHighcharts title="Cumulative Hospitalized"> 
          <IDMCurve times={props.simulation.time} values={props.simulation.cumulative_hospitalized} name="Hospitalized" color="Blue" type='line'/>
          <IDMCurve times={hospitalizedTimes} values={hospitalizedCounts} name="Observed Hospitalizations" color="Blue" type='scatter'/>
        </IDMGraphHighcharts>
        <IDMGraphHighcharts title="Deaths"> 
          <IDMCurve times={props.simulation.time} values={props.simulation.dead} name="Dead" color="Red" type='line'/>
          <IDMCurve times={deathTimes} values={deathCounts} name="Observed Deaths" color="Red" type='scatter'/>
        </IDMGraphHighcharts>
      </div>)
}

export default MorbidityAndMortalityGraph;