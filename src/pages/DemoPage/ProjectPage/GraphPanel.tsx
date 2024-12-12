import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { RootState } from '../../../redux/reducer';
import D3Force from '../../../components/d3/D3Force';
import { Option } from 'ts-option';
import { SnowNode, SnowRelation } from '../../../model';
import { NodesState, RelationsState } from '../../../redux/graphReducer';
import { fetchRelationListWorker, selectNode } from '../../../redux/action';
import { name2color } from '../../../utils/utils';
import RegularCard from '../../../components/Cards/RegularCard';
import { Button, withStyles, WithStyles } from 'material-ui';

const mapStateToProps = (state: RootState) => ({
  nodes: state.graph.nodes,
  relations: state.graph.relations,
  selectedNode: state.graph.selectedNode
});

interface GraphPanelProps {
  nodes: NodesState;
  relations: RelationsState;
  selectedNode: Option<number>;
  dispatch: Dispatch<RootState>;
  project: string;
  callback: Function;
}

class Graph extends D3Force<SnowNode, SnowRelation> {
}

class GraphPanel extends React.Component<GraphPanelProps, {}> {

  handleGenerate = () => {
      const { dispatch, callback, nodes } = this.props;
      const idArray: number[] = [];
      nodes.forEach((node, key) => {
        if(node?.exists && node.get.shown === true && key !== undefined) {
          idArray.push(key);
        }
      });
      const ids: string = JSON.stringify(idArray);
      dispatch(callback({ ids: ids }));
  }

  render() {
    const buttonStyle = {
        width: '40%',
        marginRight: '5px',
        marginTop: '5px',
        textTransform: 'none',
        backgroundColor: '#26c6da',
        color: '#fff',
        fontSize: '16px',
        borderRadius: '8px',
        '&:hover': {
            backgroundColor: '#0056b3',
        },
    };
    const containerStyle = {
      display: 'flex',
      justifyContent: 'center' as 'center',
    };

    const {dispatch, selectedNode, project} = this.props;

    const nodes = this.props.nodes
      .valueSeq()
      .flatMap<number, SnowNode>((x?: Option<SnowNode>) => x!.toArray)
      .filter(x => x!.shown)
      .toArray();

    const links = this.props.relations
      .valueSeq()
      .filter(x => x!.shown)
      .filter(x => nodes.some(n => n.node.id === x!.source) &&
        nodes.some(n => n.node.id === x!.target))
      .toArray();

    return (
      <RegularCard headerColor="blue" cardTitle="Knowledge Graph Inference Result">
          <Graph
            id="neo4jd3"
            highlight={selectedNode}
            nodes={nodes}
            links={links}
            getNodeColor={n => name2color(n.node.label)}
            getNodeLabel={n => n.node.label}
            getNodeText={n => {
              let name = '';
              name = n.node.properties['_names'] ? n.node.properties['_names'] : name;
              name = n.node.properties['_title'] ? n.node.properties['_title'] : name;
              name = n.node.properties['title'] ? n.node.properties['title'] : name;
              name = n.node.properties['name'] ? n.node.properties['name'] : name;
              name = name.replace(/<(?:.|\s)*?>/g, ' ').trim();
              name = name.length > 10 ? name.substr(0, 8) + '...' : name;
              return name;
            }}
            getLinkID={d => d.id}
            getLinkText={d => d.types.toString()}
            getSourceNodeID={d => d.source.toString()}
            getTargetNodeID={d => d.target.toString()}
            onNodeClick={id => {
              dispatch(fetchRelationListWorker({project, id: parseInt(id, 10)}));
              dispatch(selectNode(parseInt(id, 10)));
            }}
          />

          <div style={containerStyle}>
            <Button
              color="primary"
              onClick={this.handleGenerate}
              style={buttonStyle}
            >
              Generate Code
            </Button>
          </div>
      </RegularCard>
    );
  }
}

export default connect(mapStateToProps)(GraphPanel);
