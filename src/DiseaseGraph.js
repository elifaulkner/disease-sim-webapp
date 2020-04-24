import React, {} from 'react';
import IDMCurve from './IDMCurve';
import IDMGraphHighcharts from './IDMGraphHighcharts';

const DiseaseGraph = (props) =>  {

    return (
        <div>
          <IDMGraphHighcharts title="Disease Profile"> 
            <IDMCurve times={props.simulation.time} values={props.simulation.suseptible} name="Suseptible" color="Green"/>
            <IDMCurve times={props.simulation.time} values={props.simulation.infectious} name="Infectious" color="Red"/>
            <IDMCurve times={props.simulation.time} values={props.simulation.recovered} name="Recovered" color="Blue"/>
          </IDMGraphHighcharts>
        </div>
    )
}

export default DiseaseGraph;