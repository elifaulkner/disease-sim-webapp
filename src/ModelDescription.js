import React, {Component} from 'react';
import model from './img/SIR_with_reinfection_model.png'
import equation from './img/SIR_with_reinfection_equations.png'
import parameters from './img/SIR_with_reinfection_parameters.png'

class ModelDescription extends Component {
  constructor(props) {
    super(props);
    this.state = props.parameters
  }

  render() {
    return(<div>
        <p>The SIR model (https://en.wikipedia.org/wiki/Compartmental_models_in_epidemiology) is a common model for epidemiological analysis for infectionus diseases, particularly influenza. 
            A well mixed population is broken into three categories: Susceptible, Ifectious, and Revovered. This model is well suited for influenza because after infection there is a long period of immunity to reinfectin.
        </p>
        <p>
            To analyze SARS-Cov-2 I have built an extention of the standard SIR model to include two new states (Hospitalized ad Dead), and several new trantitions including temporary immunity
        </p>
        <img src={model}/>
        <p>
            This model can be captured by a sinple system or ordinary differential equations.
        </p>
        <img src={equation}/>
        <p>
            The parameters of these equations can be reduced to some simple epidemiological properties. Most of these are easily described. 
            The R0 parameter is a common epidemiological measure called the basic reproductive number. 
        </p>
        <img src={parameters}/>
    </div>)
  }
}

export default ModelDescription;