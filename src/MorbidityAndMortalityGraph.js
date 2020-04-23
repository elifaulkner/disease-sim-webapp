import React, {} from 'react';
import IDMCurve from './IDMCurve';
import IDMGraph from './IDMGraph'

const MorbidityAndMortalityGraph = (props) => {

    return(<div>
          <IDMGraph title="Morbidity And Mprtality">
            <IDMCurve times={props.simulation.time} values={props.simulation.hospitalized} name="Hospitalized" init_y={0}/>
            <IDMCurve times={props.simulation.time} values={props.simulation.dead} name="Dead" init_y={0}/>
          </IDMGraph>
      </div>)
}

export default MorbidityAndMortalityGraph;