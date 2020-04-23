import React, {useState, useEffect, useCallback} from 'react';
import CanvasJSReact from './canvasjs.react';
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const IDMGraph = (props) => {
    const build_child_data_sets = useCallback(() => {
        return props.children
            .map((child)=> {
                var data = [{'x':0, 'y':child.props.init_y}]
                if(child.props.times != null) {
                    child.props.times.forEach((x, i) => {
                        data.push({'x':child.props.times[i], 'y':child.props.values[i]})
                    });    
                }
                return {
                    type: "line",
                    toolTipContent: "{y}% "+ child.props.name +" on day {x}",
                    dataPoints: data
                }
            })
    }, [props.children]);

    const [curves, setCurves] = useState(build_child_data_sets(props.children))

    const buildOptions = useCallback(() => {
        return {
            title: {
                text: props.title
            },
            axisY: {
                title: "% of population",
                minimum: 0
            },
            axisX: {
                title: "Days Since Infection Began",
                includeZero: true
            },
            data: curves
        }
    }, [props.title, curves]);

    const [options, setOptions] = useState(buildOptions())

    useEffect(() => {
        setCurves(build_child_data_sets())
        setOptions(buildOptions())
    }, [props.children, build_child_data_sets, buildOptions])


    return (<div>
        <CanvasJSChart options={options} />
    </div>)
}

export default IDMGraph;