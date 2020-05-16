import React, {} from 'react';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';

const FooterMenu = (props) => {

  const items: ICommandBarItemProps[] = [
    {
      key: 'blog',
      ariaLabel: 'Blog',
      target: "_blank",
      iconProps: { iconName: 'Blog' },
      href: "https://medium.com/infectious-disease-model"
    }, {
      key: 'email',
      ariaLabel: 'Feedback',
      iconProps: { iconName: 'Feedback' },
      href: "mailto:support@infectiousdiseasemodel.com"
    }, {
      key: 'login',
      ariaLabel: 'SignIn',
      iconProps: { iconName: 'SignIn' },
      href: '/api/auth/login',
      disabled: props.signedIn
    }, {
      key: 'logout',
      ariaLabel: 'SignOut',
      iconProps: { iconName: 'SignOut' },
      href: '/api/auth/logout',
      disabled: !props.signedIn
    }];

  return (<div class="Footer-Menu">
    <CommandBar
      className="Footer-Menu"
      align="right"
      items={items}
      ariaLabel="Use left and right arrow keys to navigate between commands"
    />
  </div>);
}

export default FooterMenu