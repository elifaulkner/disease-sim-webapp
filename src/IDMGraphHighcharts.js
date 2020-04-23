import React, {useState, useEffect, useCallback} from 'react';
import Highcharts from 'highcharts';
import HighchartsExporting from 'highcharts/modules/exporting';

const IDMGraphHighcharts = (props) => {

    HighchartsExporting(Highcharts)

    const makeGuid = () => {
        var s4 = () => (((1+Math.random())*0x10000)|0).toString(32)
        return s4()+'-'+s4()+'-'+s4()+'-'+s4()
    }
    const guid = useState(makeGuid())

    const [curves, setCurves] = useState([]);

    const build_child_data_sets = useCallback(() => {
        setCurves(props.children
            .map((child)=> {
                var data = [{'x':0, 'y':child.props.init_y}]
                if(child.props.times != null) {
                    child.props.times.forEach((x, i) => {
                        data.push({'x':child.props.times[i], 'y':Math.round(child.props.values[i]*1.0E6)/1.0E4})
                    });    
                }
                return {
                    name: child.props.name,
                    data: data,
                    type: 'line',
                    color: child.props.color,
                    showInLegend: false
                }
            }))
    }, [props.children]);

    useEffect(() => {
        Highcharts.chart('container'+guid, {
            chart: {
                type: 'scatter'
            },
            title: {
                text: props.title,
                style: {
                    fontSize: 32
                }
            },
            xAxis: {
                title: {
                    text: 'Day'
                }
            },
            yAxis: {
                title: {
                    text: '% of Population'
                }
            },
            series: curves,
            plotOptions: {
                series: [{
                    // specific options for this series instance
                    type: 'line'
                }],
                scatter: {
                    marker: false,
                    lineWidth: 1
                }
            },
            legend: {
                enable: false
            },
            tooltip: {
                useHTML: true,
                shared: true,
                pointFormat: '<span style="color:{point.color}">●</span> {point.y}% {series.name} on day {point.x}<br/>'
            }
        });
    }, [curves, props.title, guid])
    useEffect(() => {
        build_child_data_sets();
    }, [props.children, build_child_data_sets])

    return(<div id={'container'+guid}></div>)
}

export default IDMGraphHighcharts