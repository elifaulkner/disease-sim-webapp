import React, {useState, useEffect, useCallback} from 'react';
import Chart from 'chart.js';

const IDMGraphChartjs = (props) => {
    const chartRef = React.createRef();

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
                    label: child.props.name,
                    data: data,
                    backgroundColor: child.props.color,
                    borderColor: child.props.color,
                    borderWidth: 1,
                    pointRadius: 0,
                    showLine: true,
                    fill:false
                }
            }))
    }, [props.children]);

    useEffect(() => {
        const myChartRef = chartRef.current
        new Chart(myChartRef, {
            type: 'scatter',
            data: {
                datasets: curves
            },
            options: {
                responsive: true,
                showLines: true,
                title: {
                    display: true,
                    text: props.title,
                    fontSize:36
                },
                legend: {
                    display:false
                },
                scales: {
                    xAxes: [{
                        type: 'linear',
                        position: 'bottom'
                    }]
                },
                tooltips: {
                    mode: 'index',
                    axis: 'x',
                    intersect: false,
                    callbacks: {
                        label: function(tooltipItem, data) {
                            var dataset = data.datasets[tooltipItem.datasetIndex];
                            var point = dataset.data[tooltipItem.index]
                            return Math.round(point.y*1.0E6, 4)/1.0E4+" % "+ dataset.label +' on day ' + point.x
                        }
                    }
                }
            }
        });
    }, [curves, props.title, chartRef])
    useEffect(() => {
        build_child_data_sets();
    }, [props.children, build_child_data_sets])

    return(
        <div>
            <canvas id="myChart" ref={chartRef} height={50}/>
        </div>)
}

export default IDMGraphChartjs