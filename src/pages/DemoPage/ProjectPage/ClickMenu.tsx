import * as React from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { connect } from 'react-redux';
import { RootState } from '../../../redux/reducer';
import { Dispatch } from 'redux';
import { Option } from 'ts-option';
import _ from 'lodash';
import { fetchNodeWorker, removeNode, showRelations } from '../../../redux/action';
import { RelationListsState, RelationsState } from '../../../redux/graphReducer';
import GraphPanel from './GraphPanel';
import { Chance } from 'chance';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, withStyles, WithStyles } from 'material-ui';
import Select from 'material-ui/Select';
import Input from 'material-ui/Input';

const chance  = new Chance();

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
        visible: false
    };
    inputdata: HTMLInputElement;

    showDialog = () => {
        this.setState({
            visible: true
        });
    }

    handleOk = () => {
        const { dispatch, selectedNode, relationLists, relations, project } = this.props;
        if (selectedNode.isEmpty)  {
            return;
        }
        
        this.setState({
            visible: false
        });
        const catalog = this.input.value;

        const relationList = relationLists.get(selectedNode.get);

        const rels = relationList.get
        .map(x => relations.get(x))
        .filter(x => !x.shown)
        .filter(x => x.types.some(t => t === catalog));
    
        const readyToShow = rels.length > 0 ? chance.pickset(rels, parseInt(this.inputdata.value)) : [];

        readyToShow.forEach(r => {
        const source = r.source, target = r.target;
        const otherID = source === selectedNode.get ? target : source;
        dispatch(fetchNodeWorker({ project, id: otherID }));
        });

        dispatch(showRelations(readyToShow.map(x => x.id)));
    }

    handleCancel = () => {
        this.setState({
          visible: false
        });
    }

    handleClick = () => {
        const { dispatch, selectedNode } = this.props;
        if (selectedNode.nonEmpty) {
            const selected = selectedNode.get;
            dispatch(removeNode(selected));
        }
    }
    
	render() {
        const { selectedNode, relationLists, relations } = this.props;

        return (
            <div className="bg">
                <Dialog aria-labelledby="customized-dialog-title" open={this.state.visible}>
                    <DialogTitle id="customized-dialog-title">
                    EXPAND
                    </DialogTitle>
                    <DialogContent>
                        Relation Type:&emsp;
                        <Select
                            native={true}
                            input={<Input id="relation-type" inputRef={(input: HTMLInputElement) => this.input = input} />}
                        >
                            {selectedNode.isEmpty
                                ? null
                                : (relationLists.get(selectedNode.get).isEmpty ?
                                    null : _.chain(relationLists.get(selectedNode.get).get)
                                    .flatMap(x => relations.get(x).types)
                                    .uniq()
                                    .value()
                                    .map(t => <option key={t} value={t}>{t}</option>))
                            }
                        </Select>
                        <br/>
                        <br/>Max Number:&emsp;
                        <Input
                            type="text"
                            defaultValue={'5'}
                            inputRef={(val: HTMLInputElement) => (this.inputdata = val)}
                            placeholder="Max Number"
                            style={{ width: 100 }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button autoFocus onClick={this.handleCancel} color="primary">
                            Cancel
                        </Button>
                        <Button autoFocus onClick={this.handleOk} color="primary">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
                <ContextMenuTrigger id="add_same_id">
                    <div className="hight">
                        <GraphPanel project={this.props.project}/>
                    </div>
                </ContextMenuTrigger>
                <ContextMenu 
                    id="add_same_id"
                    style={{padding: '15px', backgroundColor: 'white', border: '1px solid lightgray'}}
                >
                    <MenuItem
                        onClick={this.showDialog}
                    >
                        <strong>expand</strong>
                    </MenuItem>
                    <div style={{border: '1px solid #CCC'}}/>
                    <MenuItem
                        onClick={this.handleClick}
                    >
                        <strong>hide</strong>
                    </MenuItem>
                </ContextMenu>
            </div>
        );
    }
}

export default (connect(mapStateToProps)(ClickMenu));