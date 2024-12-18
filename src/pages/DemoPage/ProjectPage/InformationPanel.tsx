import * as React from 'react';
import { connect } from 'react-redux';
import {
  LinearProgress, Table, TableBody, TableCell, TableRow, Typography, WithStyles, Button
} from 'material-ui';
import { Dispatch } from 'redux';
import withStyles from 'material-ui/styles/withStyles';
import { Option } from 'ts-option';
import * as _ from 'lodash';
import CodeModal from '../../../components/CodeModal';
import { RootState } from '../../../redux/reducer';
import { NodesState } from '../../../redux/graphReducer';
import RegularCard from '../../../components/Cards/RegularCard';
import * as Prism from 'prismjs';

const mapStateToProps = (state: RootState) => {
  return {
    selectedNode: state.graph.selectedNode,
    nodes: state.graph.nodes,
    generatedCode: state.graph.generatedCode,
    nodesShown: state.graph.nodesShown
  };
};

const styles = () => ({
  normalCell: {
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  code: {
    height: '700px', 
    overflowY: 'auto' as 'auto',
    overflowX: 'hidden' as 'hidden',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    wordWrap: 'break-word',
    fontSize: '12px',
  },
  nodeDetail: {
    height: '700px', 
    overflowY: 'auto' as 'auto',
    overflowX: 'hidden' as 'hidden',
  },
  button: {
    width: '100%',
    marginRight: '5px',
    marginTop: '10px',
    textTransform: 'none',
    backgroundColor: '#26c6da',
    color: '#fff',
    fontSize: '16px',
    borderRadius: '8px',
    '&:hover': {
        backgroundColor: '#0056b3',
    },
  },
  notice: {
    height: '700px', 
    overflowY: 'auto' as 'auto',
    overflowX: 'hidden' as 'hidden',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    wordWrap: 'break-word',
    fontSize: '20px',
    textAlign: 'center'
  },
});

interface InformationPanelProps {
  selectedNode: Option<number>;
  nodes: NodesState;
  generatedCode: string;
  nodesShown: boolean;
}


class InformationPanel extends React.Component<InformationPanelProps & WithStyles<'normalCell' | 'code' | 'nodeDetail' | 'button' | 'notice'>> {
  render() {
    let body = null;

    const {classes, selectedNode, nodes, generatedCode, nodesShown} = this.props;
    const showCode = Prism.highlight(generatedCode, Prism.languages.javascript);

    if (!nodesShown) {
      if(showCode === '') {
        body = (
          <Typography component="p" className={classes.notice}>无生成代码</Typography>
        )
      } else {
        body = (
          <div className={classes.code} dangerouslySetInnerHTML={{ __html: showCode }}/> 
        );
      }
    } else {
      if(selectedNode.isEmpty) {
        body = (
          <Typography component="p" className={classes.notice}>无选中节点</Typography>
        )
      } else {
        const selected = nodes.get(selectedNode.get);
        if (selected.nonEmpty) {
          const node = selected.get.node;
          let properties = Object.keys(node.properties)
            .map(k => {
              let content = node.properties[k];
              if (content.length > 80) {
                content = (
                  <CodeModal
                    code={k === 'content' || k === 'comment'}
                    label="SHOW"
                    content={content}
                  />
                );
              } else {
                content = <div className={classes.normalCell}>{content.toString()}</div>;
              }
              return {key: k, label: k, content};
            });
          properties = _.sortBy(properties, (entry) => {
            if (entry.key === 'label') {
              return 1;
            }
            if (entry.key.indexOf('name') !== -1) {
              return 2;
            }
            if (entry.key.indexOf('signature') !== -1) {
              return 3;
            }
            if (entry.key.indexOf('title') !== -1) {
              return 4;
            }
            return 10;
          });
          body = (
            <div className={classes.nodeDetail}>
              <Table>
                <TableBody>
                  {properties.map(p => <TableRow key={p.key}>
                    <TableCell>{p.label}</TableCell>
                    <TableCell>{p.content}</TableCell>
                  </TableRow>)}
                </TableBody>
              </Table>
            </div>
          );
        } else {
          body = <LinearProgress/>;
        }
      }
    }

    return (
      <RegularCard headerColor="blue" cardTitle={nodesShown ? "节点详情" : "生成的代码"}>
        {body}
      </RegularCard>
    );
  }
}

export default withStyles(styles)(connect(mapStateToProps)(InformationPanel));