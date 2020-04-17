import React, {Component} from 'react';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { SpinButton } from 'office-ui-fabric-react/lib/SpinButton';
import { Stack } from 'office-ui-fabric-react/lib/Stack';

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
        <Stack vertival>
        <SpinButton
          label="Basic Reproductive Number"
          min={0}
          max={5}
          step={0.1}
          defaultValue={this.state.R0}
          showValue={true}
          snapToStep
          value={this.state.R0}
          onValidate={(v) => this.onInputChange({R0: v})}/>
        <SpinButton
          label="Average Days Infectious"
          min={1}
          max={30}
          step={1}
          defaultValue={this.state.avg_days_infected}
          showValue={true}
          snapToStep
          value={this.state.avg_days_infected} onChanged={(event) => this.onInputChange({avg_days_infected: event.target.value})}/>
        <SpinButton
          label="Average Days Hospitalized"
          min={1}
          max={30}
          step={1}
          defaultValue={this.state.avg_days_hospitalized}
          showValue={true}
          snapToStep
          value={this.state.avg_days_hospitalized} onChanged={(event) => this.onInputChange({avg_days_hospitalized: event.target.value})}/>
        <SpinButton
          label="Average Days Immune"
          min={1}
          max={1000}
          step={1}
          defaultValue={this.state.avg_days_immune}
          showValue={true}
          snapToStep
          value={this.state.avg_days_immune} onChanged={(event) => this.onInputChange({avg_days_immune: event.target.value})}/>
        <SpinButton
          label="P(hospitalization|infection)"
          min={0}
          max={1}
          step={0.01}
          defaultValue={this.state.p_hospitalization_given_infection}
          showValue={true}
          snapToStep
          value={this.state.p_hospitalization_given_infection} onChanged={(event) => this.onInputChange({p_hospitalization_given_infection: event.target.value})}/>
         <SpinButton
          label="P(death|hospitalization)"
          min={0}
          max={1}
          step={0.01}
          defaultValue={this.state.p_death_given_hospitalization}
          showValue={true}
          snapToStep
          value={this.state.p_death_given_hospitalization} onChanged={(event) => this.onInputChange({p_death_given_hospitalization: event.target.value})}/>
        </Stack>
      </div>
    );  
  }
} 

export default DiseaseParameters;