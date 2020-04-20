import React, {useState} from 'react';
import { Panel } from 'office-ui-fabric-react/lib/Panel';
import { useConstCallback } from '@uifabric/react-hooks';
import { SpinButton } from 'office-ui-fabric-react/lib/SpinButton';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { getMaxHeight } from 'office-ui-fabric-react/lib/utilities/positioning';

function CumulativeStatisticsPanel(props) {
    const [population, setPopulation] = useState(1000000)

    const dismissPanel = useConstCallback(() => {
        props.setIsOpen(false);
    });

    const getMax = (sim, field) => {
        if(sim && sim[field]) {
            var max = Math.max(...sim[field]);
            var maxTime = sim['time'][props.sim[field].findIndex(x=>x==max)]
            return [max, maxTime]
        }
        return [0, 0];
    }

    const formatNumber = (num) => {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
      }

    const [maxInfectious, maxInfectiousTime] = getMax(props.sim, 'infectious')
    const [maxHospitalized, maxHospitalizedTime] = getMax(props.sim, 'hospitalized')
    const [cumInfectious, cumInfectiousTime] = getMax(props.sim, 'cumulative_infectious')
    const [cumHospitalized, cumHospitalizedTime] = getMax(props.sim, 'cumulative_hospitalized')
    const [dead, deadTime] = getMax(props.sim, 'dead')

    return(<div>
        <Panel
            isLightDismiss
            headerText="Cumulative Statistics"
            isOpen={props.isOpen}
            type={3}
            onDismiss={dismissPanel}
            onLightDismissClick={dismissPanel}
            // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
            closeButtonAriaLabel="Close"
            hasCloseButton="true"
            >
            <SpinButton
                label="Population"
                labelPosition="Top"
                min={0}
                max={10000000000000}
                step={1}
                showValue={true}
                snapToStep
                value={population}
                onValidate={(v) => setPopulation(v)}/>
        
            <table>
                <tr>
                    <td>Max Infectious</td> <td>{formatNumber(Math.ceil(maxInfectious*population))}</td>
                </tr>
                <tr>
                    <td>Max Infectious Time</td> <td>Day {maxInfectiousTime}</td>
                </tr>
                <tr>
                    <td>Max Hospitalized</td> <td>{formatNumber(Math.ceil(maxHospitalized*population))}</td>
                </tr>
                <tr>
                    <td>Max Hospitalized Time</td> <td>Day {maxHospitalizedTime}</td>
                </tr>
                <tr>
                    <td>Cumulative Infected</td> <td>{formatNumber(Math.ceil(cumInfectious*population))}</td>
                </tr>
                <tr>
                    <td>Cumulative Hospitalized</td> <td>{formatNumber(Math.ceil(cumHospitalized*population))}</td>
                </tr>
                <tr>
                    <td>Cumulative Dead</td> <td>{formatNumber(Math.ceil(dead*population))}</td>
                </tr>
            </table>
            <Label> </Label>
        </Panel>
    </div>)
}

export default CumulativeStatisticsPanel