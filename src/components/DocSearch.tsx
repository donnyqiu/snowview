import * as React from 'react';
import { connect } from 'react-redux';
import { Button, Input, Menu, MenuItem, withStyles, WithStyles } from 'material-ui';
import { RootState } from '../redux/reducer';
import { Dispatch } from 'redux';
import { Theme } from 'material-ui/styles';
import { ChangeEvent, MouseEvent, FormEvent } from 'react';
import { Marked } from '@ts-stack/markdown';

const styles = (theme: Theme) => ({
    container: {
        margin: theme.spacing.unit * 2
    },
    form: {
        display: 'flex',
        width: '100%',
    },
    search: {
        marginLeft: theme.spacing.unit * 2,
        marginRight: theme.spacing.unit * 2,
        width: `calc(100% - ${theme.spacing.unit * 4}px)`,
        flex: 1,
    },
    uploadButton: {
        marginRight: theme.spacing.unit * 2,
    },
    textArea: {
        marginTop: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2,
        width: '100%',
        maxHeight: '600px',
        border: `1px solid ${theme.palette.grey[300]}`,
        padding: theme.spacing.unit,
        boxSizing: 'border-box',
        overflowY: 'auto' as 'auto'
    },
});

interface DocSearchProps {
    callback: Function;
    dispatch: Dispatch<RootState>;
}

type DocSearchStyles = WithStyles<'container' | 'form' | 'search' | 'uploadButton' | 'textArea'>;

interface DocSearchState {
    input: string;
    anchorEl: HTMLElement | undefined;
    documentText: string;
    selectedText: string;
}

class DocSearch extends React.Component<DocSearchProps & DocSearchStyles, DocSearchState> {
    fileInputRef: HTMLInputElement | undefined = undefined;

    constructor(props: DocSearchProps & DocSearchStyles) {
        super(props);
        this.state = {
            input: '',
            anchorEl: undefined,
            documentText: '',
            selectedText: '',
        };
    }

    setFileInputRef = (ref: HTMLInputElement) => {
        this.fileInputRef = ref;
    }

    handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target && typeof e.target.result === 'string') {
                    const parsedMarkdown = Marked.parse(e.target.result);
                    this.setState({ documentText: parsedMarkdown });
                }
            };
            reader.readAsText(event.target.files[0]);
        }
    }

    handleUploadClick = () => {
        if (this.fileInputRef) {
            this.fileInputRef.click();
        }
    }

    handleTextAreaSelect = (event: MouseEvent<HTMLDivElement>) => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
            this.setState({
                selectedText: selection.toString(),
                anchorEl: event.currentTarget,
            });
        }
    }

    handleMenuClose = () => {
        this.setState({ anchorEl: undefined });
    }

    handleSearch = () => {
        const { dispatch, callback } = this.props;
        dispatch(callback({ query: this.state.selectedText }));
        this.handleMenuClose();
    }

    render() {
        const { classes } = this.props;
        const { anchorEl, documentText } = this.state;

        return (
            <div className={classes.container}>
                <form className={classes.form} onSubmit={(e) => e.preventDefault()}>
                    <Button
                        color="primary"
                        className={classes.uploadButton}
                        onClick={this.handleUploadClick}
                    >
                        Upload markdown File
                    </Button>
                    <input
                        ref={this.setFileInputRef}
                        type="file"
                        accept=".md"
                        style={{ display: 'none' }}
                        onChange={this.handleFileChange}
                    />
                </form>
                <div
                    className={classes.textArea}
                    onContextMenu={this.handleTextAreaSelect}
                    dangerouslySetInnerHTML={{ __html: documentText }}
                />
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onRequestClose={this.handleMenuClose}
                >
                    <MenuItem onClick={this.handleSearch}>Search</MenuItem>
                </Menu>
            </div>
        );
    }
}

export default withStyles(styles)<{
    callback: Function
}>(connect()(DocSearch));