import React, { useEffect, useState } from 'react';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';

const FooterMenu = (props) => {
  const items: ICommandBarItemProps[] = [
    {
      key: 'blog',
      text: 'Blog',
      target: "_blank",
      href: "https://medium.com/infectious-disease-model"
    }, {
      key: 'email',
      text: 'Feedback',
      href: "mailto:support@infectiousdiseasemodel.com"
    }, {
      key: 'login',
      text: 'Login',
      href: '/api/auth/login'
    }, {
      key: 'logout',
      text: 'Logout',
      href: '/api/auth/logout'
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