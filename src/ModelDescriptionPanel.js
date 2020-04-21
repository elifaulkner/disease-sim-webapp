import React from 'react';
import model from './img/SIR_with_reinfection_model.png'
import equation from './img/SIR_with_reinfection_equations.png'
import parameters from './img/SIR_with_reinfection_parameters.png'
import { Panel } from 'office-ui-fabric-react/lib/Panel';
import { useConstCallback } from '@uifabric/react-hooks';
import { DefaultButton } from 'office-ui-fabric-react';

function ModelDescriptionPanel(props) {
  const dismissPanel = useConstCallback(() => {
    props.setIsOpen(false);
    });

    return(
      <div>
        <Panel
          isLightDismiss
          headerText="Model Description"
          isOpen={props.isOpen}
          onDismiss={dismissPanel}
          onLightDismissClick={dismissPanel}
          type={3}
          // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
          closeButtonAriaLabel="Close"
        >
          <div>
            <p>The SIR model (https://en.wikipedia.org/wiki/Compartmental_models_in_epidemiology) is a common model for epidemiological analysis for infectious diseases, particularly influenza. 
                A well mixed population is broken into three categories: Susceptible, Infectious, and Recovered. This model is well suited for influenza because after infection there is a long period of immunity to reinfection.
            </p>
            <p>
                To analyze SARS-Cov-2 I have built an extention of the standard SIR model to include two new states (Hospitalized ad Dead), and several new trantitions including temporary immunity
            </p>
            <img src={model} alt=""/>
            <p>
                This model can be captured by a sinple system or ordinary differential equations.
            </p>
            <img src={equation} alt=""/>
            <p>
                The parameters of these equations can be reduced to some simple epidemiological properties. Most of these are easily described. 
                The R0 parameter is a common epidemiological measure called the basic reproductive number. 
            </p>
            <img src={parameters} alt=""/>  
            </div>
            <DefaultButton text="Return To Main Page" onClick={dismissPanel}/>  
          </Panel>
        </div>
        );
  }

export default ModelDescriptionPanel;