import React from 'react';
import IDMCurve from './IDMCurve';
import IDMGraphHighcharts from './IDMGraphHighcharts';

const DiseaseGraph = (props) =>  {

    return (
        <div class="graph">
          <IDMGraphHighcharts title="Disease Profile" max={100} yTickInterval={10}> 
            <IDMCurve times={props.simulation.time} values={props.simulation.suseptible} name="Suseptible" color="Green" type="line"/>
            <IDMCurve times={props.simulation.time} values={props.simulation.infectious} name="Infectious" color="Red" type="line"/>
            <IDMCurve times={props.simulation.time} values={props.simulation.recovered} name="Recovered" color="Blue" type="line"/>
          </IDMGraphHighcharts>
        </div>
    )
}

export default DiseaseGraph;