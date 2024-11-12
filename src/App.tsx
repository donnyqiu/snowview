import * as React from 'react';
import { Route, Switch } from 'react-router';
import { withStyles } from 'material-ui';
import appStyle, { AppStyle } from './variables/styles/AppStyle';
import Footer from './components/Footer/Footer';
import ProjectPage from './pages/DemoPage/ProjectPage/ProjectPage';

const image = require('./assets/img/sidebar.jpg');
const logo = require('./assets/img/logo.png');

class App extends React.Component<AppStyle, {}> {
  render() {
    const {classes} = this.props;

    return (
      <div className={classes.mainPanel}>
        <div className={classes.content}>
          <Switch>
            <Route exact path="/" component={ProjectPage} />
          </Switch>
        </div>
        <Footer />
      </div>
    );
  }
}

export default withStyles(appStyle)<{}>(App);
