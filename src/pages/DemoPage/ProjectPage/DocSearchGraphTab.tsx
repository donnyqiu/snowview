import * as React from 'react';
import { connect } from 'react-redux';
import GraphPanels from './GraphPanels';
import { fetchGraphWorker } from '../../../redux/action';
import { RootState } from '../../../redux/reducer';
import { RouteComponentProps } from 'react-router';
import { Grid, LinearProgress, WithStyles } from 'material-ui';
import { container } from '../../../variables/styles';
import withStyles from 'material-ui/styles/withStyles';
import DocSearch from '../../../components/DocSearch';

const styles = () => ({
  container: {
    paddingTop: '60px',
    ...container
  }
});

const mapStateToProps = (state: RootState) => ({
  query: state.graph.query,
  fetching: state.graph.fetching
});

interface GraphTabRouteProps {
  project: string;
}

type GraphTabStyles = WithStyles<'container'>;

interface GraphTabProps extends RouteComponentProps<GraphTabRouteProps> {
  query: string;
  fetching: boolean;
}

class GraphTab extends React.Component<GraphTabProps & GraphTabStyles, {}> {

  render() {
    const {project} = this.props.match.params;
    const {query, fetching} = this.props;

    return (
      <Grid container spacing={0}>
        <Grid item xs={3}>
          <DocSearch 
            callback={(param: { query: string }) => fetchGraphWorker({project, query: param.query})} 
          />
        </Grid>
        <Grid item xs={9}>
          {fetching ?
            <LinearProgress/> :
            <GraphPanels project={project}/>
          }
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)<{}>(connect(mapStateToProps)(GraphTab));
