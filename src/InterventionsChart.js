import React, {useState, useEffect, useCallback} from 'react';
import Highcharts from 'highcharts';
import HighchartsXRange from 'highcharts/modules/xrange';


const InterventionsChart = (props) => {
    HighchartsXRange(Highcharts)
    
    const makeGuid = () => {
        var s4 = () => (((1+Math.random())*0x10000)|0).toString(32)
        return s4()+'-'+s4()+'-'+s4()+'-'+s4()
    }

    const guid = useState(makeGuid())

    const get_y = useCallback((t) => {
        switch(t) {
            case 'infection_rate': return 0
            case 'infection_time': return 1
            case 'hospitilization_time': return 3
            case 'immunity_time': return 5
            case 'hospitilization_rate': return 2
            case 'death_rate': return 4
            default: return 0;
        }
    }, []);

    const [curves, setCurves] = useState([]);
    const build_child_data_sets = useCallback(() => {
        setCurves(props.interventions
            .map((i)=> {
                return {
                    name: i.name,
                    x: parseInt(i.start),
                    x2: parseInt(i.end),
                    opacity: i.effectiveness,
                    y: get_y(i.type),
                    description: i.name+': '+i.effectiveness+'% effectiveness to '+i.type
                }
            }))
    }, [props.interventions, get_y]);

    useEffect(() => {
        Highcharts.chart('container'+guid, {
            chart: {
                type: 'xrange'
            },
            title: {
                text: props.title,
                style: {
                    fontSize: 32,
                    fontFamily: 'Impact'
                }
            },
            accessibility: {
                point: {
                    descriptionFormatter: function (point) {
                        var ix = point.index + 1,
                            category = point.yCategory,
                            from = point.x,
                            to = point.x2;
                        return ix + '. ' + category + ', ' + from +
                            ' to ' + to + '.';
                    }
                }
            },
            xAxis: {
                type: 'linear',
                min: 0,
                max: props.max
            },
            yAxis: {
                categories: ['Infection Rate', 'Infection Time', 'Hospitilization Rate', 'Hospitilization Time', 'Death Rate', 'Immunity Time'],
                min: 0,
                max: 5,
                reversed: true,
                title: {
                    text: ''
                }
            },
            legend: {
                enable: false
            },
            series: [
                {
                    name: 'Interventions',
                    borderColor: 'gray',
                    pointWidth: 20,
                    data: curves,
                    stack: 0
                }
            ], 
            dataLabels: {
                enabled: true,
                allowOverlap: false
            }
    })
    }, [curves, props.title, guid, props.max]);

    useEffect(() => {
        build_child_data_sets();
    }, [props.children, build_child_data_sets])

    return(<div id={'container'+guid} class="graph"></div>)
}

export default InterventionsChart;