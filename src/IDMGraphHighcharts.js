import React, {useState, useEffect, useCallback} from 'react';
import Highcharts from 'highcharts';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsExportData from 'highcharts/modules/export-data';

const IDMGraphHighcharts = (props) => {

    HighchartsExporting(Highcharts)
    HighchartsExportData(Highcharts)
    
    const makeGuid = () => {
        var s4 = () => (((1+Math.random())*0x10000)|0).toString(32)
        return s4()+'-'+s4()+'-'+s4()+'-'+s4()
    }
    const guid = useState(makeGuid())

    const [curves, setCurves] = useState([]);

    const build_child_data_sets = useCallback(() => {
        setCurves(props.children
            .map((child)=> {
                var data = []
                if(child.props.times != null) {
                    child.props.times.forEach((x, i) => {
                        data.push({'x':child.props.times[i], 'y':Math.round(child.props.values[i]*1.0E6)/1.0E4})
                    });    
                }
                return {
                    name: child.props.name,
                    data: data,
                    type: child.props.type,
                    color: child.props.color,
                    showInLegend: false,
                    animation: false,
                    marker: {
                        radius: 3,
                        //enabled: (child.props.type === 'scatter')
                    }
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
                    fontSize: 32,
                    fontFamily: 'Impact'
                }
            },
            xAxis: {
                title: {
                    text: 'Days Since Infection Began',
                    style: {
                        fontSize: 18,
                        fontFamily: 'Verdana'
                    }
                },
                lineWidth: 2
            },
            yAxis: {
                title: {
                    text: '% of Population',
                    style: {
                        fontSize: 18,
                        fontFamily: 'Verdana'
                    }
                } ,
                lineWidth: 2,
                max: props.max,
                tickInterval: props.yTickInterval,
                tickWidth: 2,
                gridLineWidth: 2
            },
            series: curves,
            plotOptions: {
                series: [{
                    // specific options for this series instance
                    type: 'line'
                }, {
                    type: 'scatter',
                }],
                line: {
                    marker: false,
                    lineWidth: 1,
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
                },
                scatter: {
                    marker: {
                        radius: 5
                    },
                    lineWidth: 0,
                    tooltip: {
                        enables:false
                    },
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
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
    }, [curves, props.title, guid, props.max, props.yTickInterval])
    useEffect(() => {
        build_child_data_sets();
    }, [props.children, build_child_data_sets])

    return(<div id={'container'+guid}></div>)
}

export default IDMGraphHighcharts