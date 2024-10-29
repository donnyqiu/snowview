import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import CatalogPage from './CatalogPage';
import ProjectPage from './ProjectPage/ProjectPage';

class DemoPage extends React.Component<{}, {}> {
  render() {
    return (
      <div>
        <Route exact={true} path="/demo" component={ProjectPage}/>
        <Route path="/demo/:tab" component={ProjectPage}/>
      </div>
    );
  }
}

export default DemoPage;