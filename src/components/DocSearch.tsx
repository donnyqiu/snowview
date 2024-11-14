import * as React from 'react';
import { connect } from 'react-redux';
import { Button, Input, Menu, MenuItem, withStyles, WithStyles } from 'material-ui';
import { RootState } from '../redux/reducer';
import { Dispatch } from 'redux';
import { Theme } from 'material-ui/styles';
import { ChangeEvent, MouseEvent, FormEvent } from 'react';
import RegularCard from '../components/Cards/RegularCard';
import P from './Typography/P';

const styles = (theme: Theme) => ({
    container: {
        margin: theme.spacing.unit * 2,
        padding: theme.spacing.unit * 2,
    },
    form: {
        display: 'flex',
        width: '100%',
        justifyContent: 'center' as 'center',
    },
    button: {
        marginRight: theme.spacing.unit * 2,
        textTransform: 'none',
        backgroundColor: '#007BFF',
        color: '#fff',
        fontSize: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        transition: 'background-color 0.3s ease',
        padding: '12px 24px',
        '&:hover': {
            backgroundColor: '#0056b3',
        },
        '& .MuiButton-startIcon': {
            marginRight: theme.spacing.unit * 1,
        }
    },
    textArea: {
        marginTop: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2,
        marginRight: theme.spacing.unit * 2,
        height: '400px',
        width: '725px',
        padding: theme.spacing.unit * 2,
        overflowY: 'auto' as 'auto',
        overflowX: 'hidden' as 'hidden',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        wordWrap: 'break-word',
        backgroundColor: '#f9f9f9',
        color: '#333',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        fontSize: '16px',
        lineHeight: '1.5',
    },
    textAreaTitle: {
        padding: theme.spacing.unit * 2,
        backgroundColor: '#e6f7ff',
        color: '#333',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        fontSize: '24px',
        lineHeight: '1.5',
        textAlign: 'center',
        width: '725px',
    }
});

interface DocSearchProps {
    callback: Function;
    dispatch: Dispatch<RootState>;
}

type DocSearchStyles = WithStyles<'container' | 'form' | 'button' | 'textArea' | 'textAreaTitle'>;

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
                    this.setState({ documentText: e.target.result });
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

    handleSelectWholeFile = () => {
        this.setState({selectedText: this.state.documentText});
    }

    handleDeleteSelectedText = () => {
        this.setState({selectedText: ''});
    }

    render() {
        const { classes } = this.props;
        const { documentText, selectedText } = this.state;

        return (
            <div className={classes.container}>
                <RegularCard headerColor="blue" cardTitle="Markdown Viewer">
                    <div className={classes.form}>
                        <div>
                            <h2 className={classes.textAreaTitle}>File Viewer ( Use the left mouse button to select text )</h2>
                            <div
                                className={classes.textArea}
                                onMouseUp={this.handleTextAreaSelect}
                                dangerouslySetInnerHTML={{ __html: documentText }}
                            >
                            </div>
                        </div>
                        <div>
                            <h2 className={classes.textAreaTitle}>Selected Text</h2>
                            <div
                                className={classes.textArea}
                                dangerouslySetInnerHTML={{ __html: selectedText }}
                            >
                            </div>
                        </div>
                    </div>

                    <form className={classes.form} onSubmit={(e) => e.preventDefault()}>
                        <Button
                            color="primary"
                            className={classes.button}
                            onClick={this.handleUploadClick}
                        >
                            Upload File
                        </Button>
                        <Button
                            color="primary"
                            className={classes.button}
                            onClick={this.handleSearch}
                        >
                            Search
                        </Button>
                        <Button
                            color="primary"
                            className={classes.button}
                            onClick={this.handleSelectWholeFile}
                        >
                            Select Whole File
                        </Button>
                        <Button
                            color="primary"
                            className={classes.button}
                            onClick={this.handleDeleteSelectedText}
                        >
                            Delete Selected Text
                        </Button>
                        <input
                            ref={this.setFileInputRef}
                            type="file"
                            accept=".md, .txt"
                            style={{ display: 'none' }}
                            onChange={this.handleFileChange}
                        />
                    </form>
                </RegularCard>
            </div>
        );
    }
}

export default withStyles(styles)<{
    callback: Function
}>(connect()(DocSearch));