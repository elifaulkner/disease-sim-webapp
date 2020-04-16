import React, {Component} from 'react';
import './App.css';
import DiseaseParameters from './DiseaseParameters'
import SimulationParameters from './SimulationParameters'
import DiseaseGraph from './DiseaseGraph'
import MorbidityAndMortalityGraph from './MorbidityAndMortalityGraph'

class App extends Component {
  state = {
    disease_parameters: {
      R0: 2.5, 
      avg_days_infected: 10.0, 
      avg_days_hospitalized: 14.0, 
      avg_days_immune : 183.0, 
      p_hospitalization_given_infection : 0.01, 
      p_death_given_hospitalization: 0.05
    },
    sim_parameters: {
      max_time: 365, 
      num_time_points: 1000, 
      init_infection: 0.0001
    },
    simulation: {}
  }

  simulate = () => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state)
    }

    fetch('/simulate', requestOptions)
        .then(response => response.json())
        .then(data => this.setState({ simulation: data }));
  }

  componentDidMount() {
    this.simulate()
  }

  render () {
    return (
      <div className="App">
        <table>
          <tr>
            <td><DiseaseParameters parameters={this.state.disease_parameters}/></td>
            <td><SimulationParameters parameters={this.state.sim_parameters}/></td>
          </tr>
        </table>

        <DiseaseGraph parameters={this.state.simulation}/>
        <MorbidityAndMortalityGraph parameters={this.state.simulation}/>
      </div>
    );
  }
}

export default App;
