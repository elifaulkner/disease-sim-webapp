import React, {useState, useEffect, useCallback} from 'react';
import Highcharts from 'highcharts';
import Heatmap from 'highcharts/modules/heatmap';


const SensitivityHeatMap = (props) => {
    Heatmap(Highcharts)

    const variable_categories = Object.keys(props.sensitivities)
    const stat_categories = ['max_infectious', 'max_infectious_time', 'max_hospitalized', 'max_hospitalized_time', 'cumulative_infected', 'cumulative_hospitalized', 'deaths']

    const points = []
    for (var x = 0; x < stat_categories.length; x++) {
        for(var y = 0; y < variable_categories.length; y++) {
            points.push([x, y, props.sensitivities[variable_categories[y]][stat_categories[x]]])
        }
    }
    const makeGuid = () => {
        var s4 = () => (((1+Math.random())*0x10000)|0).toString(32)
        return s4()+'-'+s4()+'-'+s4()+'-'+s4()
    }

    const guid = useState(makeGuid())

    useEffect(() => {
        Highcharts.chart('container'+guid, {
            chart: {
                type: 'heatmap'
              },
              title: {
                text: 'Sensitivity HeatMap'
              },
            xAxis: {
                categories: stat_categories
              },
            yAxis: {
                categories: variable_categories
            },
            series: [{
                name: 'Sensitivities',
                borderWidth: 1,
                data: points,
                dataLabels: {
                  enabled: true,
                  color: '#000000'
                }
              }],
            colorAxis: {
                min: 0,
                minColor: '#FFFFFF',
                maxColor: Highcharts.getOptions().colors[0]
            },
        })
    }, [guid])

    return(<div id={'container'+guid} class="graph"></div>)
}

export default SensitivityHeatMap;