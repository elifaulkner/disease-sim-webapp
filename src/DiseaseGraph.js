import React, {Component} from 'react';
import CanvasJSReact from './canvasjs.react';
//var CanvasJSReact = require('./canvasjs.react');
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

class DiseaseGraph extends Component {
  constructor(props) {
    super(props);
    if(props.parameters.time != null) {
      this.state.sdata = this.build_data_series(props.parameters.time, props.parameters.suseptible)
    }
  }

  build_data_series(x, y) {
    var list = []

    x.forEach(function (o, i) {
      list.push({"x":x[i], "y":100*y[i]})
    });

    return list
  }

  render() {
    var sdata = [{x: 0, y:1}]
    var idata = [{x: 0, y:0}]
    var rdata = [{x: 0, y:0}]
    if(this.props.parameters.time != null) {
      sdata = this.build_data_series(this.props.parameters.time, this.props.parameters.suseptible)
      idata = this.build_data_series(this.props.parameters.time, this.props.parameters.infectious)
      rdata = this.build_data_series(this.props.parameters.time, this.props.parameters.recovered)
    }
    
    const options = {
      title: {
        text: "Disease Profile"
      },
			axisY: {
        title: "% pf population",
        minimum: 0,
        maximum: 100
			},
			axisX: {
				title: "Days Since Infection Began",
        includeZero: true
			},
      data: [{				
                type: "line",
                toolTipContent: "{y}% Susceptible on day {x}",
                dataPoints: sdata
              }, {				
                type: "line",
                toolTipContent: "{y}% Infectious on day {x}",
                dataPoints: idata
              },{				
                type: "line",
                toolTipContent: "{y}% Recovered on day {x}",
                dataPoints: rdata
              },]
   }
    return(<div>
      <CanvasJSChart options = {options}/>
      </div>)
  }
}

export default DiseaseGraph;