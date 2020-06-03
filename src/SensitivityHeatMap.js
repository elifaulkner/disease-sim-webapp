import React, {useState, useEffect} from 'react';
import Highcharts from 'highcharts';
import Heatmap from 'highcharts/modules/heatmap';


const SensitivityHeatMap = (props) => {
    Heatmap(Highcharts)

    const variable_categories = Object.keys(props.sensitivities)
    const stat_categories = ['max_infectious', 'max_infectious_time', 'max_hospitalized', 'max_hospitalized_time', 'cumulative_infected', 'cumulative_hospitalized', 'deaths']
    
    const points = []
    for (var x = 0; x < stat_categories.length; x++) {
        for(var y = 0; y < variable_categories.length; y++) {
            points.push([x, y, Highcharts.numberFormat(props.sensitivities[variable_categories[y]][stat_categories[x]], 2, '.', ',')])
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
                type: 'heatmap',
                marginTop: 40,
                marginBottom: 80,
                plotBorderWidth: 1
              },
              title: {
                enabled: false,
                text: null
              },
            xAxis: {
                categories: stat_categories
              },
            yAxis: {
                categories: variable_categories,
                title: {
                    enabled: false
                }
            },          
            series: [{
                name: 'Sensitivities',
                borderWidth: 1,
                data: points,
                dataLabels: {
                  enabled: true,
                  //color: '#000000',
                  format: "{point.value}"
                }
              }],
            colorAxis: {
                min: -1.0E7,
                max: 1.0E7,
                minColor: '#eeeeee',
                maxColor: '#ffffff',
                endOnTick: false
            },
            legend: {
                enabled: false
            }
        })
    }, [guid, points, stat_categories, variable_categories])

    return(<div id={'container'+guid} class="tall-graph"></div>)
}

export default SensitivityHeatMap;