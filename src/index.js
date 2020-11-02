import './index.css';
import GIFView from './gifView'

import React from 'react';
import ReactDOM from 'react-dom';

import { Header, Icon, Divider} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

import { Jumbotron, Container } from 'react-bootstrap';

function MainView() {
  return (
    <Container className="main">

      <Jumbotron className="py-2">

        <Header as="h1">
          <Icon name="image" />
          GIPHY Viewer
        </Header>
        
        <Divider/>
      </Jumbotron>
      
      <GIFView/>
      
    </Container>
  );
}

ReactDOM.render(<MainView />, document.getElementById('root'), function() {
});

export { MainView }
// Share to fb

// $.getScript('https://connect.facebook.net/en_US/sdk.js', function(){
//     window.FB.init({
//       appId: '397263621474279',
//       version: 'v2.7' // or v2.1, v2.2, v2.3, ...
//     });
//     console.log(window.FB);
//     window.FB.ui({
//       method: 'share',
//       href: 'https://developers.facebook.com/docs/'
//     }, (response) => {

//     })
// });



