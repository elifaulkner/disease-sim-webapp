import React, {Component} from 'react';

class DiseaseParameters extends Component {
  constructor(props) {
    super(props);
    this.state = props.parameters
    
    this.onInputChange = (state) => {
      this.setState(state)
      this.props.onChange(this.state)
    }
  }

  render() {
    return (
      <div>
        <table>
          <tr>
            <td>R0</td> <td><input type="text" value={this.state.R0} onChange={(event) => this.onInputChange({R0: event.target.value})}/></td>
          </tr>
          <tr>
            <td>avgerage days infectious</td> <td><input type="text" value={this.state.avg_days_infected} onChange={(event) => this.onInputChange({avg_days_infected: event.target.value})}/></td>
          </tr>
          <tr>
            <td>avgerage dayshospitalized</td> <td><input type="text" value={this.state.avg_days_hospitalized} onChange={(event) => this.onInputChange({avg_days_hospitalized: event.target.value})}/></td>
          </tr>
          <tr>
            <td>average daysimmune</td> <td><input type="text" value={this.state.avg_days_immune} onChange={(event) => this.onInputChange({avg_days_immune: event.target.value})}/></td>
          </tr>
          <tr>
            <td>P(hospitalization|infection)</td> <td><input type="text" value={this.state.p_hospitalization_given_infection} onChange={(event) => this.onInputChange({p_hospitalization_given_infection: event.target.value})}/></td>
          </tr>
          <tr>
            <td>P(death|hospitalization)</td> <td><input type="text" value={this.state.p_death_given_hospitalization} onChange={(event) => this.onInputChange({p_death_given_hospitalization: event.target.value})}/></td>
          </tr>
        </table>
      </div>
    );  
  }
} 

export default DiseaseParameters;