import React from 'react';
import Graph from 'graphology';
import { Sigma } from 'sigma';
import { INode } from '../../model';
import { Option } from 'ts-option';
import forceAtlas2 from 'graphology-layout-forceatlas2';

interface GraphProps<N extends INode, R> {
  id: string;
  highlight: Option<number>;
  nodes: N[];
  links: R[];
  getNodeColor: (node: N) => string;
  getNodeLabel: (node: N) => string;
  getNodeText: (node: N) => string;
  getLinkID: (link: R) => string;
  getLinkText: (link: R) => string;
  getSourceNodeID: (link: R) => string;
  getTargetNodeID: (link: R) => string;
  onNodeClick?: (id: string) => void;
}

interface GraphState<N, R> {
  nodes: GraphNode<N>[];
  links: GraphRelation<N, R>[];
}

export interface GraphNode<N> {
  raw: N;
  x: number;
  y: number;
}

interface GraphRelation<N, R> {
  raw: R;
  type: 'single' | 'repeated';
  source: GraphNode<N>;
  target: GraphNode<N>;
}

export const RelationType = {
  SINGLE: 'single' as 'single',
  REPEATED: 'repeated' as 'repeated'
};

class GraphComponent<N extends INode, R> extends React.Component<GraphProps<N, R>, GraphState<N, R>> {
  private container: HTMLDivElement | null = null;
  private sigmaInstance: Sigma | null = null; // 用于存储sigma实例

  state = {
    nodes: [] as GraphNode<N>[],
    links: [] as GraphRelation<N, R>[]
  };
  nodes: GraphNode<N>[] = [];
  links: GraphRelation<N, R>[] = [];

  updateNodes = (nextProps: GraphProps<N, R>) => {
    const { nodes } = nextProps;

    const newNodes = nodes.filter(n => !this.nodes.some(nd => nd.raw.getID() === n.getID()));

    this.nodes = [
      ...this.nodes.filter((nd: GraphNode<N>) => nodes.some(n => nd.raw.getID() === n.getID())),
      ...newNodes.map(n => ({ raw: n, x: Math.random(), y: Math.random() }))
    ];
  };

  updateLinks = (nextProps: GraphProps<N, R>) => {
    const { links, getLinkID, getSourceNodeID, getTargetNodeID } = nextProps;

    const newLinks = links.filter(l => !this.links.some(lk => getLinkID(lk.raw) === getLinkID(l)));

    this.links = [
      ...this.links.filter(lk => links.some(l => getLinkID(lk.raw) === getLinkID(l))),
      ...newLinks.map(l => ({
        raw: l,
        source: this.nodes.find(n => n.raw.getID() === getSourceNodeID(l))!,
        target: this.nodes.find(n => n.raw.getID() === getTargetNodeID(l))!,
        type: RelationType.SINGLE
      }))
    ];

    this.links
      .filter(l => this.links.some(o => l.source === o.target && l.target === o.source))
      .forEach(l => (l.type = RelationType.REPEATED));
  };

  componentDidMount() {
    this.updateNodes(this.props);
    this.updateLinks(this.props);
    this.initializeGraph();
  }

  componentDidUpdate(prevProps: GraphProps<N, R>) {
    // 如果 nodes 或 links 发生变化，更新图形
    if (this.props.nodes !== prevProps.nodes || this.props.links !== prevProps.links) {
      this.updateNodes(this.props);
      this.updateLinks(this.props);
      this.updateGraph();
    }
  }

  initializeGraph() {
    const { getNodeColor, getNodeText, getSourceNodeID, getTargetNodeID, getLinkText, onNodeClick } = this.props;

    if (this.container) {
      const graph = new Graph();

      this.nodes.forEach(node => {
        graph.addNode(node.raw.getID(), { label: getNodeText(node.raw), x: node.x, y: node.y, size: 20, color: getNodeColor(node.raw) });
      });

      this.links.forEach(link => {
        graph.addDirectedEdge(getSourceNodeID(link.raw), getTargetNodeID(link.raw), { size: 3, label: getLinkText(link.raw) });
      });

      // 使用 ForceAtlas2 布局
      forceAtlas2.assign(graph, 50);

      // 初始化 Sigma 实例
      this.sigmaInstance = new Sigma(graph, this.container, {
        defaultEdgeType: 'arrow',
        edgeLabelSize: 10,
        renderEdgeLabels: true,
        renderLabels: true,
        labelSize: 12
      });

      this.sigmaInstance.on('clickNode', (event) => {
        const nodeId = event.node;
        if (onNodeClick) {
          onNodeClick(nodeId);
        }
      });
    }
  }

  updateGraph() {
    if (this.sigmaInstance) {
      const { getNodeColor, getNodeText, getSourceNodeID, getTargetNodeID, getLinkText } = this.props;
      const graph = this.sigmaInstance.getGraph();

      // 清空旧的节点和边
      graph.clear();

      // 重新添加节点
      this.nodes.forEach(node => {
        graph.addNode(node.raw.getID(), { label: getNodeText(node.raw), x: node.x, y: node.y, size: 20, color: getNodeColor(node.raw) });
      });

      // 重新添加边
      this.links.forEach(link => {
        graph.addDirectedEdge(getSourceNodeID(link.raw), getTargetNodeID(link.raw), { size: 3, label: getLinkText(link.raw) });
      });

      // 使用 ForceAtlas2 布局
      forceAtlas2.assign(graph, 50);

      this.sigmaInstance.refresh(); // 刷新图形
    }
  }

  render() {
    return (
      <div>
        {/* 图例部分 */}
        <div style={legendStyle}>
          <div style={legendItemStyle}>
            <span
              style={{
                display: 'inline-block',
                width: '20px',
                height: '20px',
                backgroundColor: '#00BFFF',
                marginRight: '10px',
              }}
            />
            <span>Java Class</span>
          </div>

          <div style={legendItemStyle}>
            <span
              style={{
                display: 'inline-block',
                width: '20px',
                height: '20px',
                backgroundColor: '#FFA500',
                marginRight: '10px',
              }}
            />
            <span>Java Method</span>
          </div>

          <div style={legendItemStyle}>
            <span
              style={{
                display: 'inline-block',
                width: '20px',
                height: '20px',
                backgroundColor: '#DDA0DD',
                marginRight: '10px',
              }}
            />
            <span>Java Field</span>
          </div>
        </div>

        {/* 图形容器 */}
        <div
          ref={(el) => (this.container = el)}
          style={{ width: '100%', height: '650px', marginBottom: '10px' }}
        />
      </div>
    );
  }
}


// 图例样式
const legendStyle: React.CSSProperties = {
  display: "flex",
  gap: "20px",
  alignItems: "center",
  flexWrap: "wrap",
  marginBottom: '20px',
  padding: '10px',
  border: '1px solid #ccc',
  backgroundColor: '#f9f9f9',
  borderRadius: '5px',
};

const legendItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

export default GraphComponent;
