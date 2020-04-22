import React, {  } from 'react';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { IButtonProps } from 'office-ui-fabric-react/lib/Button';


const FooterMenu = (props) => {
    const items: ICommandBarItemProps[] = [ 
        {
            key:'blog',
            text:'Blog',
            target:"_blank",
            href:"https://medium.com/@elifaulkner"
        }, {
            key:'email',
            text:'Email Support',
            href:"mailto:support@infectiousdiseasemodel.com"
        }];
 
    return(<div>
      <CommandBar className='Footer-Menu'
        align="right"
        items={items}
        ariaLabel="Use left and right arrow keys to navigate between commands"
      />
    </div>);
}

export default FooterMenu