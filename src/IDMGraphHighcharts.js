import React, {useState, useEffect, useCallback} from 'react';
import Highcharts from 'highcharts';

const IDMGraphHighcharts = (props) => {
    const chartRef = React.createRef();

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
                        data.push({'x':child.props.times[i], 'y':child.props.values[i]})
                    });    
                }
                return {
                    name: child.props.name,
                    data: data                
                }
            }))
    }, [props.children]);

    useEffect(() => {
        Highcharts.chart('container'+guid, {
            chart: {
                type: 'scatter'
            },
            title: {
                text: props.title
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
                    type: 'areaspline'
                }],
                scatter: {
                    marker: false,
                    lineWidth: 1
                }
            },
            legend: {
                enable: false
            }
        });
    }, [curves, props.title, chartRef, guid])
    useEffect(() => {
        build_child_data_sets();
    }, [props.children, build_child_data_sets])

    return(<div id={'container'+guid}></div>)
}

export default IDMGraphHighcharts