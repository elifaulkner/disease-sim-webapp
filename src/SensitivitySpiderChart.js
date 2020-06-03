import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import Sankey from 'highcharts/modules/sankey';

const SensitivitySpiderChart = (props) => {
    Sankey(Highcharts)

    const variable_categories = Object.keys(props.sensitivities)
    const stat_categories = [ 'cumulative_infected', 'cumulative_hospitalized', 'deaths', 'max_infectious', 'max_infectious_time', 'max_hospitalized', 'max_hospitalized_time']

    const makeSeries = () => {
        const series = []
        variable_categories.forEach(v=> {
            stat_categories.forEach(s=>series.push([v, s, Math.abs(props.sensitivities[v][s])]))
        });
        return series
    }

    const makeGuid = () => {
        var s4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(32)
        return s4() + '-' + s4() + '-' + s4() + '-' + s4()
    }

    const guid = useState(makeGuid())

    useEffect(() => {
        Highcharts.chart('container' + guid, {
            chart: {
                //polar: true,
                type: 'sankey'
              },
            title: {
                text: null
            },
            series: [{
                keys: ['from', 'to', 'weight'],
                data: makeSeries()
            }]
        })
    })

    return (<div id={'container' + guid} class="tall-graph"></div>)
}

export default SensitivitySpiderChart;
