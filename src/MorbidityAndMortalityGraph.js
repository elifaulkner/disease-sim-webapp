import React, {} from 'react';
import IDMCurve from './IDMCurve';
import IDMGraphPlottable from './IDMGraphPlottable';

const MorbidityAndMortalityGraph = (props) => {

    return(<div>
        <IDMGraphPlottable title="Morbidity And Mortality"> 
          <IDMCurve times={props.simulation.time} values={props.simulation.hospitalized} name="Hospitalized" init_y={0} color="Blue"/>
          <IDMCurve times={props.simulation.time} values={props.simulation.dead} name="Dead" init_y={0} color="Red"/>          
        </IDMGraphPlottable>
      </div>)
}

export default MorbidityAndMortalityGraph;