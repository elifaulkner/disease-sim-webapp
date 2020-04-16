import React, {Component} from 'react';
import CanvasJSReact from './canvasjs.react';
//var CanvasJSReact = require('./canvasjs.react');
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

class MorbidityAndMortalityGraph extends Component {
  constructor(props) {
    super(props);
  }

  build_data_series(x, y) {
    var list = []

    x.forEach(function (o, i) {
      list.push({"x":x[i], "y":y[i]})
    });

    return list
  }

  render() {
    var hdata = [{x: 0, y:1}]
    var ddata = [{x: 0, y:0}]
    if(this.props.parameters.time != null) {
      hdata = this.build_data_series(this.props.parameters.time, this.props.parameters.hospitalized)
      ddata = this.build_data_series(this.props.parameters.time, this.props.parameters.dead)
    }
    
    const options = {
      title: {
        text: "Morbidity and Mortality"
      },
			axisY: {
        title: "% pf population"
			},
			axisX: {
				title: "Days Since Simulation Began",
        includeZero: true
			},
      data: [{				
                type: "line",
                toolTipContent: "Hospitalized {x}: {y}",
                dataPoints: hdata
              }, {				
                type: "line",
                toolTipContent: "Dead {x}: {y}",
                dataPoints: ddata
              }]
   }
    return(<div>
      <CanvasJSChart options = {options}/>
      </div>)
  }
}

export default MorbidityAndMortalityGraph;