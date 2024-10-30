import * as React from 'react';
import QueryTab from './GraphTab';
import Tabs, { Tab } from 'material-ui/Tabs';
import DocumentTab from './DocumentTab';
import DiagramTab from './DiagramTab';
import { Route, RouteComponentProps, Switch } from 'react-router';

interface ProjectPageRouteProps {
  project: string;
  tab: TabType;
}

type TabType = 'diagram' | 'graph' | 'document';

class ProjectPage extends React.Component<RouteComponentProps<ProjectPageRouteProps>> {
  render() {
    const {tab} = this.props.match.params;

    return (
      <div>
        <Tabs
          value={tab}
          onChange={(e, v) => this.props.history.push(`/demo/${v}`)}
          indicatorColor="primary"
          textColor="primary"
          scrollable={true}
          scrollButtons="auto"
        >
          {/* <Tab value="" label="模板检索"/> */}
        </Tabs>
        <Switch>
          <Route path="/" component={QueryTab}/>
        </Switch>
      </div>
    );
  }
}

export default ProjectPage;