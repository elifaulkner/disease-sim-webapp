import React, { } from 'react';
import SensitivityHeatMap from './SensitivityHeatMap'
import SensitivitySpiderChart from './SensitivitySpiderChart'
import { Pivot, PivotItem, PivotLinkFormat } from 'office-ui-fabric-react/lib/Pivot';

const SensitivityChart = (props) => {
    return(<div>
        <Pivot style={{'text-align':'left'}} aria-label="Links of Tab Style Pivot Example" linkFormat={PivotLinkFormat.tabs}>
            <PivotItem headerText="Chart">
                <SensitivitySpiderChart sensitivities={props.sensitivities}/> 
            </PivotItem >
            <PivotItem headerText="Table">
                <SensitivityHeatMap sensitivities={props.sensitivities}/>
            </PivotItem>

        </Pivot>

    </div>)
}

export default SensitivityChart;