import React from 'react';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';

function CumulativeStatisticsPanel(props) {

    const getMax = (sim, field) => {
        if(sim && sim[field]) {
            var max = Math.max(...sim[field]);
            var maxTime = sim['time'][props.sim[field].findIndex(x=>x===max)]
            return [max, maxTime]
        }
        return [0, 0];
    }

    const formatNumber = (num) => {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
      }

    const [maxInfectious, maxInfectiousTime] = getMax(props.sim, 'infectious')
    const [maxHospitalized, maxHospitalizedTime] = getMax(props.sim, 'hospitalized')
    const [cumInfectious] = getMax(props.sim, 'cumulative_infectious')
    const [cumHospitalized] = getMax(props.sim, 'cumulative_hospitalized')
    const [dead] = getMax(props.sim, 'dead')

    return(<div>
            <table width="100%">
                <tr>
                    
                    <td><Label>Max Infectious</Label></td> <td>{formatNumber(Math.ceil(maxInfectious*props.population))}</td>
                </tr>
                <tr>
                    <td><Label>Max Infectious Time</Label></td> <td>Day {maxInfectiousTime}</td>
                </tr>
                <tr>
                    <td><Label>Max Hospitalized</Label></td> <td>{formatNumber(Math.ceil(maxHospitalized*props.population))}</td>
                </tr>
                <tr>
                    <td><Label>Max Hospitalized Time</Label></td> <td>Day {maxHospitalizedTime}</td>
                </tr>
                <tr>
                    <td><Label>Cumulative Infected</Label></td> <td>{formatNumber(Math.ceil(cumInfectious*props.population))}</td>
                </tr>
                <tr>
                    <td><Label>Cumulative Hospitalized</Label></td> <td>{formatNumber(Math.ceil(cumHospitalized*props.population))}</td>
                </tr>
                <tr>
                    <td><Label>Cumulative Dead</Label></td> <td>{formatNumber(Math.ceil(dead*props.population))}</td>
                </tr>
            </table>
            <DefaultButton text="Calculate Sensitivities" onClick={props.calculateSensitivities}/>
    </div>)
}

export default CumulativeStatisticsPanel