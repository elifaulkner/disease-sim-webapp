import React, {Component} from 'react';

class SimulationParameters extends Component {
    constructor(props) {
        super(props);
        this.state = props.parameters
      }

    render() {
        return (
            <div>
              <table>
                <tr>
                  <td># Days to Simulation</td> <td><input type="text" value={this.state.max_time} onChange={(event) => this.setState({max_time: event.target.value})}/></td>
                </tr>
                <tr>
                  <td>Simulation Data points</td> <td><input type="text" value={this.state.num_time_points}  onChange={(event) => this.setState({num_time_points:event.target.value})}/></td>
                </tr>
                <tr>
                  <td>Initial Infection Rate</td> <td><input type="text" value={this.state.init_infection}  onChange={(event) => this.setState({init_infection:event.target.value})}/></td>
                </tr>
              </table>
            </div>
          );
    }
}
export default SimulationParameters;