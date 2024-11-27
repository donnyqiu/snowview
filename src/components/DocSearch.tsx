import * as React from 'react';
import { connect } from 'react-redux';
import { Button, withStyles, WithStyles } from 'material-ui';
import { RootState } from '../redux/reducer';
import { Dispatch } from 'redux';
import { Theme } from 'material-ui/styles';
import { ChangeEvent, MouseEvent } from 'react';
import RegularCard from '../components/Cards/RegularCard';
import { marked } from 'marked';

const styles = (theme: Theme) => ({
    container: {
        paddingLeft: theme.spacing.unit * 2,
        paddingTop: theme.spacing.unit * 4,
        paddingBottom: theme.spacing.unit * 2,
    },
    form: {
        display: 'flex',
        flexWrap: 'wrap' as 'wrap',
        width: '100%',
        justifyContent: 'center' as 'center',
    },
    button: {
        width: '40%',
        marginRight: '5px',
        marginTop: theme.spacing.unit * 1,
        textTransform: 'none',
        backgroundColor: '#26c6da',
        color: '#fff',
        fontSize: '16px',
        borderRadius: '8px',
        '&:hover': {
            backgroundColor: '#0056b3',
        },
    },
    textArea: {
        marginTop: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2,
        padding: theme.spacing.unit * 2,
        height: '600px',
        width: '90%',
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
        fontSize: '12px',
        lineHeight: '2.0',
        resize: 'none',
        '& img': {
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
        },
    }
});

interface DocSearchProps {
    callback: Function;
    dispatch: Dispatch<RootState>;
}

type DocSearchStyles = WithStyles<'container' | 'form' | 'button' | 'textArea'>;

interface DocSearchState {
    input: string;
    anchorEl: HTMLElement | undefined;
    rawText: string;
    renderedText: string;
    selectedText: string;
    isEditMode: boolean;
}

class DocSearch extends React.Component<DocSearchProps & DocSearchStyles, DocSearchState> {
    fileInputRef: HTMLInputElement | undefined = undefined;

    constructor(props: DocSearchProps & DocSearchStyles) {
        super(props);
        this.state = {
            input: '',
            anchorEl: undefined,
            rawText: '',
            renderedText: '',
            selectedText: '',
            isEditMode: true,
        };
    }

    setFileInputRef = (ref: HTMLInputElement) => {
        this.fileInputRef = ref;
    }

    handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target && typeof e.target.result === 'string') {
                    this.setState({ rawText: e.target.result });
                }
            };
            reader.readAsText(event.target.files[0]);
        }
    }

    handleSave = () => {
        const content = this.state.rawText;
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'MarkdownFile.md';
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    parseMarkdown = (markdown: string): string => {
        const renderer = new marked.Renderer();

        const options = {
            renderer: renderer,
            gfm: true,
            breaks: false,
            pedantic: false,
            smartLists: true,
            smartypants: false
        };

        return marked(markdown, options);
    };

    handleUploadClick = () => {
        if (this.fileInputRef) {
            this.fileInputRef.click();
        }
    }

    handleTextAreaSelect = (event: MouseEvent<HTMLTextAreaElement>) => {
        const textArea = event.currentTarget;
        if (textArea.selectionStart !== undefined && textArea.selectionEnd !== undefined) {
            const start = textArea.selectionStart;
            const end = textArea.selectionEnd;
            const selectedText = textArea.value.substring(start, end);
            this.setState({selectedText : selectedText});
        }
    }

    handleTextAreaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({ rawText: event.target.value });
    }

    handleMenuClose = () => {
        this.setState({ anchorEl: undefined });
    }

    handleSearch = () => {
        const { dispatch, callback } = this.props;
        dispatch(callback({ query: this.state.selectedText }));
        this.handleMenuClose();
    }

    handleRenderClick = () => {
        const renderedText = this.parseMarkdown(this.state.rawText);
        this.setState({ renderedText : renderedText, isEditMode: false });
    }

    handleEditModeClick = () => {
        this.setState({ isEditMode: true });
    }

    render() {
        const { classes } = this.props;
        const { rawText, renderedText, selectedText, isEditMode } = this.state;

        return (
            <div className={classes.container}>
                <RegularCard headerColor="blue" cardTitle="File Viewer">
                    {isEditMode ? (
                        <textarea
                            className={`${classes.textArea}`}
                            value={rawText}
                            onChange={this.handleTextAreaChange}
                            onMouseUp={this.handleTextAreaSelect}
                        ></textarea>
                    ) : (
                        <div className={`${classes.textArea}`} dangerouslySetInnerHTML={{ __html: renderedText }}/>
                    )}

                    <form className={classes.form} onSubmit={(e) => e.preventDefault()}>
                        <Button
                            color="primary"
                            className={classes.button}
                            onClick={this.handleUploadClick}
                        >
                            Upload
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
                            onClick={isEditMode? this.handleRenderClick : this.handleEditModeClick}
                        >
                            {isEditMode ? 'Render' : 'Edit'}
                        </Button>

                        <Button
                            color="primary"
                            className={classes.button}
                            onClick={this.handleSave}
                        >
                            Save
                        </Button>

                        <input
                            ref={this.setFileInputRef}
                            type="file"
                            accept=".md"
                            style={{ display: 'none' }}
                            onChange={this.handleFileUpload}
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