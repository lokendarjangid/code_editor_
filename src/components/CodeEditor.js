'use client';

import { useEffect, useRef } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { sql } from '@codemirror/lang-sql';
import { json } from '@codemirror/lang-json';
import { basicSetup } from '@codemirror/basic-setup';

const CodeEditor = ({ code, language, onChange, readOnly = false }) => {
    const editorRef = useRef(null);
    const viewRef = useRef(null);

    const getLanguageExtension = (lang) => {
        switch (lang) {
            case 'javascript':
            case 'js':
                return javascript();
            case 'python':
            case 'py':
                return python();
            case 'cpp':
            case 'c++':
            case 'cxx':
                return cpp();
            case 'c':
                return cpp(); // C and C++ share similar syntax highlighting
            case 'java':
                return java();
            case 'html':
            case 'htm':
                return html();
            case 'css':
                return css();
            case 'sql':
                return sql();
            case 'json':
                return json();
            default:
                return javascript(); // Default fallback
        }
    };

    useEffect(() => {
        if (editorRef.current && !viewRef.current) {
            try {
                // Create a minimal set of extensions to avoid conflicts
                const extensions = [
                    basicSetup,
                    getLanguageExtension(language),
                    EditorView.theme({
                        '&': {
                            height: '100%',
                            fontSize: '14px'
                        },
                        '.cm-editor': {
                            height: '100%'
                        },
                        '.cm-scroller': {
                            height: '100%'
                        },
                        '.cm-content': {
                            padding: '12px'
                        }
                    }),
                    EditorView.updateListener.of((update) => {
                        if (update.docChanged && onChange) {
                            onChange(update.state.doc.toString());
                        }
                    })
                ];

                if (readOnly) {
                    extensions.push(EditorState.readOnly.of(true));
                }

                const state = EditorState.create({
                    doc: code || '',
                    extensions
                });

                viewRef.current = new EditorView({
                    state,
                    parent: editorRef.current
                });
            } catch (error) {
                console.error('Error creating CodeMirror editor:', error);
                // Fallback to a simple textarea if CodeMirror fails
                if (editorRef.current) {
                    editorRef.current.innerHTML = `
                        <textarea 
                            class="w-full h-full p-4 font-mono text-sm border-none outline-none resize-none"
                            value="${code || ''}"
                            ${readOnly ? 'readonly' : ''}
                        ></textarea>
                    `;
                    if (!readOnly) {
                        const textarea = editorRef.current.querySelector('textarea');
                        textarea.addEventListener('input', (e) => {
                            if (onChange) onChange(e.target.value);
                        });
                    }
                }
            }
        }

        return () => {
            if (viewRef.current) {
                try {
                    viewRef.current.destroy();
                } catch (error) {
                    console.warn('Error destroying editor:', error);
                }
                viewRef.current = null;
            }
        };
    }, [language]);

    useEffect(() => {
        if (viewRef.current && code !== undefined) {
            try {
                const currentContent = viewRef.current.state.doc.toString();
                if (code !== currentContent) {
                    const transaction = viewRef.current.state.update({
                        changes: {
                            from: 0,
                            to: currentContent.length,
                            insert: code
                        }
                    });
                    viewRef.current.dispatch(transaction);
                }
            } catch (error) {
                console.error('Error updating editor content:', error);
            }
        }
    }, [code]);

    return (
        <div className="h-full w-full">
            <div ref={editorRef} className="h-full w-full" />
        </div>
    );
};

export default CodeEditor;
