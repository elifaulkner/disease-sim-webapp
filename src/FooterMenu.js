import React, {  } from 'react';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';


const FooterMenu = (props) => {

    const logout = () => {
      fetch('http://localhost:9011/oauth2/logout?client_id=cc9d4fbe-897b-474b-9a9a-b10b059aa079', 
       {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    }
    const items: ICommandBarItemProps[] = [ 
        {
            key:'blog',
            text:'Blog',
            target:"_blank",
            href:"https://medium.com/infectious-disease-model"
        }, {
            key:'email',
            text:'Feedback',
            href:"mailto:support@infectiousdiseasemodel.com"
        }, {
          key:'login',
          text:'Login',
          href:'http://localhost:9011/oauth2/authorize?client_id=cc9d4fbe-897b-474b-9a9a-b10b059aa079&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fapi%2Fcallback'
        }, {
          key:'logout',
          text:'Logout',
          onClick: logout
        }];
 
    return(<div class="Footer-Menu">
      <CommandBar
        className="Footer-Menu"
        align="right"
        items={items}
        ariaLabel="Use left and right arrow keys to navigate between commands"
      />
    </div>);
}

export default FooterMenu