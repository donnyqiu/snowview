import * as React from 'react';
import ClickMenu from './ClickMenu';
// import FindEntityPanel from './FindEntityPanel';
import InformationPanel from './InformationPanel';
import { Grid, LinearProgress, withStyles, WithStyles } from 'material-ui';
import { connect } from 'react-redux';
import { Theme } from 'material-ui/styles';
import { RootState } from '../../../redux/reducer';
import { Dispatch } from 'redux';

const styles = (theme: Theme) => ({
  leftPanel: {
    padding: theme.spacing.unit * 2,
  },
  rightPanel: {
    paddingTop: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
  },
  informationPanel: {
    marginTop: theme.spacing.unit * 2,
  }
});

const mapStateToProps = (state: RootState) => {
  return {
    fetchingGraph: state.graph.fetching,
    cypher: state.graph.cypher,
  };
};

interface GraphPanelsProps {
  fetchingGraph: boolean;
  cypher: string;
  project: string;
  dispatch: Dispatch<RootState>;
}

type GraphPanelsStyles = WithStyles<'leftPanel' | 'rightPanel' | 'informationPanel'>;

class GraphPanels extends React.Component<GraphPanelsProps & GraphPanelsStyles, {}> {
  render() {
    const {classes, fetchingGraph, project, cypher} = this.props;
    const show = (
      <Grid container={true} spacing={0}>
        <Grid item={true} xs={8} className={classes.leftPanel}>
          <div className={classes.informationPanel}>
            <ClickMenu project={project}/>
          </div>
        </Grid>
        <Grid item={true} xs={4} className={classes.rightPanel}>
          {/* <FindEntityPanel project={project}/> */}
          <div className={classes.informationPanel}>
            <InformationPanel/>
          </div>
        </Grid>
      </Grid>
    );
    const notShow = (
      <Grid container={true} spacing={0}>
        <LinearProgress/>
      </Grid>
    );
    return fetchingGraph ? notShow : show;
  }
}

export default withStyles(styles)<{ project: string }>(connect(mapStateToProps)(GraphPanels));
