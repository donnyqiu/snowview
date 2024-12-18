import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../../../redux/reducer';
import { Dispatch } from 'redux';
import { Option } from 'ts-option';
import _ from 'lodash';
import { removeNode } from '../../../redux/action';
import { RelationListsState, RelationsState, NodesState } from '../../../redux/graphReducer';
import GraphPanel from './GraphPanel';
import { generateCodeWorker, changeShownStatusWorker } from '../../../redux/action';

const mapStateToProps = (state: RootState) => ({
    selectedNode: state.graph.selectedNode,
    relations: state.graph.relations,
    relationLists: state.graph.relationLists,
});
  
interface MenuProps {
    selectedNode: Option<number>;
    relations: RelationsState;
    relationLists: RelationListsState;
    dispatch: Dispatch<RootState>;
    project: string;
}

class ClickMenu extends React.Component<MenuProps, {}> {
    input: HTMLInputElement;
    state = {
        visible: false,
        menuX: 0,
        menuY: 0
    };
    inputdata: HTMLInputElement;

    handleHide = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        const { dispatch, selectedNode } = this.props;
        if (selectedNode.nonEmpty) {
            const selected = selectedNode.get;
            dispatch(removeNode(selected));
        }
        this.setState({ visible: false });
    }

    handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();

        this.setState({
            visible: true,
            menuX: event.clientX + window.scrollX, 
            menuY: event.clientY + window.scrollY 
        });
    }

    handleClickOutside = (event: MouseEvent) => {
        const menuElement = document.querySelector('.context-menu') as HTMLElement | null;
        if (this.state.visible && menuElement && !menuElement.contains(event.target as Node)) {
            this.setState({ visible: false });
        }
    }

    componentDidMount() {
        document.addEventListener('click', this.handleClickOutside, true);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside, true);
    }
    
	render() {
        return (
            <div className="bg">
                <div className="hight"
                    onContextMenu={this.handleContextMenu}
                >
                    <GraphPanel project={this.props.project} 
                    generateCallback={(param: { ids: string }) => generateCodeWorker({ids: param.ids})}
                    changeStatusCallback={(param: { status: boolean }) => changeShownStatusWorker({status: param.status})}
                    />
                </div>

                {this.state.visible && (
                    <div
                        className="context-menu"
                        style={{
                            position: 'absolute',
                            top: this.state.menuY,
                            left: this.state.menuX,
                            width: '100px',
                        }}
                    >
                        <button onClick={this.handleHide} style={{ width: '100%' , background: '#fff'}}>
                            Hide
                        </button>
                    </div>
                )}
            </div>
        );
    }
}

export default (connect(mapStateToProps)(ClickMenu));