import React, {} from 'react';
import IDMCurve from './IDMCurve';
import IDMGraphChartjs from './IDMGraphChartjs';

const DiseaseGraph = (props) =>  {

    return (
        <div>
          <IDMGraphChartjs title="Disease Profile"> 
            <IDMCurve times={props.simulation.time} values={props.simulation.suseptible} name="Suseptible" init_y={1} color="Green"/>
            <IDMCurve times={props.simulation.time} values={props.simulation.infectious} name="Infectious" init_y={0} color="Red"/>
            <IDMCurve times={props.simulation.time} values={props.simulation.recovered} name="Recovered" init_y={0} color="Blue"/>
          </IDMGraphChartjs>
        </div>
    )
}

export default DiseaseGraph;