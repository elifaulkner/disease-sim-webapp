import React, {Component} from 'react';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { SpinButton } from 'office-ui-fabric-react/lib/SpinButton';

class SimulationParameters extends Component {
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
              <Stack verticle>
              <SpinButton
                label="# Days to Simulation"
                min={1}
                max={1825}
                step={1}
                defaultValue={this.state.max_time}
                showValue={true}
                snapToStep
                value={this.state.max_time} onChanged={(event) => this.onInputChange({max_time: event.target.value})}/>
              <SpinButton
                label="# Days to Simulation"
                min={1}
                max={1825}
                step={1}
                defaultValue={this.state.max_time}
                showValue={true}
                snapToStep
                value={this.state.max_time} onChanged={(event) => this.onInputChange({max_time: event.target.value})}/>
              <SpinButton
                label="Initial Infection Rate"
                min={0}
                max={1}
                step={0.0000001}
                defaultValue={this.state.init_infection}
                showValue={true}
                snapToStep
                value={this.state.init_infection} onChanged={(event) => this.onInputChange({init_infection: event.target.value})}/>
              </Stack>
            </div>
          );
    }
}
export default SimulationParameters;