import React, {Component} from 'react';
import CanvasJSReact from './canvasjs.react';
//var CanvasJSReact = require('./canvasjs.react');
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

class MorbidityAndMortalityGraph extends Component {

  build_data_series(x, y) {
    var list = []

    x.forEach(function (o, i) {
      list.push({"x":x[i], "y":y[i]*100})
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
        title: "% pf population",
        minimum: 0
			},
			axisX: {
				title: "Days Since Infection Began",
        includeZero: true
			},
      data: [{				
                type: "line",
                toolTipContent: "{y}% Hospitalized on day {x}",
                dataPoints: hdata
              }, {				
                type: "line",
                toolTipContent: "{y}% Dead on day {x}",
                dataPoints: ddata
              }]
   }
    return(<div>
      <CanvasJSChart options = {options}/>
      </div>)
  }
}

export default MorbidityAndMortalityGraph;