import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { RootState } from '../../../redux/reducer';
import { Option } from 'ts-option';
import { SnowNode } from '../../../model';
import { NodesState, RelationsState } from '../../../redux/graphReducer';
import { selectNode } from '../../../redux/action';
import { name2color } from '../../../utils/utils';
import RegularCard from '../../../components/Cards/RegularCard';
import { Button } from 'material-ui';
import DirectedGraph from '../../../components/sigma/SigmaGraph';

const mapStateToProps = (state: RootState) => ({
  nodes: state.graph.nodes,
  relations: state.graph.relations,
  selectedNode: state.graph.selectedNode,
  nodesShown: state.graph.nodesShown
});

interface GraphPanelProps {
  nodes: NodesState;
  relations: RelationsState;
  selectedNode: Option<number>;
  dispatch: Dispatch<RootState>;
  project: string;
  generateCallback: Function;
  changeStatusCallback: Function;
  nodesShown: boolean;
}


class GraphPanel extends React.Component<GraphPanelProps, {}> {

  handleGenerate = () => {
      const { dispatch, generateCallback, nodes } = this.props;
      const idArray: number[] = [];
      nodes.forEach((node, key) => {
        if(node?.exists && node.get.shown === true && key !== undefined) {
          idArray.push(key);
        }
      });
      const ids: string = JSON.stringify(idArray);
      dispatch(generateCallback({ ids: ids }));
  }

  handleChangeStatus = () => {
    const { dispatch, changeStatusCallback } = this.props;
    dispatch(changeStatusCallback(true));
  }

  render() {
    const buttonStyle = {
        width: '20%',
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

    const {dispatch, selectedNode, project, nodesShown} = this.props;

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

    console.log('nodes', nodes);

    return (
      <RegularCard headerColor="blue" cardTitle="知识图谱">
          <DirectedGraph
            id="directedgraph"
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
              name = name.length > 6 ? name.substr(0, 6) + '...' : name;
              return name;
            }}
            getLinkID={d => d.id}
            getLinkText={d => d.types.toString()}
            getSourceNodeID={d => d.source.toString()}
            getTargetNodeID={d => d.target.toString()}
            onNodeClick={id => {
              dispatch(selectNode(parseInt(id, 10)));
            }}
          />

          <div style={containerStyle}>
            <Button
              color="primary"
              onClick={this.handleGenerate}
              style={buttonStyle}
            >
              生成代码
            </Button>

            <Button
              color="primary"
              onClick={this.handleChangeStatus}
              style={buttonStyle}
            >
              {nodesShown ? "显示生成的代码" : "显示选中的节点"}
            </Button>
          </div>
      </RegularCard>
    );
  }
}

export default connect(mapStateToProps)(GraphPanel);
