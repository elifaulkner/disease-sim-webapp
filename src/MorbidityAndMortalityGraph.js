import React from 'react';
import IDMCurve from './IDMCurve';
import IDMGraphHighcharts from './IDMGraphHighcharts';

const MorbidityAndMortalityGraph = (props) => {

    return(<div class="graph">
        <IDMGraphHighcharts title="Morbidity And Mortality"> 
          <IDMCurve times={props.simulation.time} values={props.simulation.hospitalized} name="Hospitalized" color="Blue" type='line'/>
          <IDMCurve times={props.simulation.time} values={props.simulation.dead} name="Dead" color="Red" type='line'/>
        </IDMGraphHighcharts>
      </div>)
}

export default MorbidityAndMortalityGraph;