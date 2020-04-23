import React, {} from 'react';
import IDMCurve from './IDMCurve';
import IDMGraph from './IDMGraph'

const DiseaseGraph = (props) =>  {

    return (
        <div>
          <IDMGraph title="Disease Profile">
            <IDMCurve times={props.simulation.time} values={props.simulation.suseptible} name="Suseptible" init_y={1}/>
            <IDMCurve times={props.simulation.time} values={props.simulation.infectious} name="Infectious" init_y={0}/>
            <IDMCurve times={props.simulation.time} values={props.simulation.recovered} name="Recovered" init_y={0}/>
          </IDMGraph>
        </div>
    )
}

export default DiseaseGraph;