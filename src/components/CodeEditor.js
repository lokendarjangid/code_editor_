'use client';

import { useState, useEffect, useRef } from 'react';

const CodeEditor = ({ code, language, onChange, readOnly = false, onAddLineComment, lineComments: propLineComments = {} }) => {
    const [currentCode, setCurrentCode] = useState(code || '');
    const [lineComments, setLineComments] = useState(propLineComments);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [showInlineCommentModal, setShowInlineCommentModal] = useState(false);
    const [selectedLine, setSelectedLine] = useState(null);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [inlineCommentText, setInlineCommentText] = useState('');
    const textareaRef = useRef(null);
    const lineNumbersRef = useRef(null);

    useEffect(() => {
        setCurrentCode(code || '');
    }, [code]);

    useEffect(() => {
        setLineComments(propLineComments);
    }, [propLineComments]);

    const getLineCount = () => {
        return currentCode.split('\n').length;
    };

    const handleLineClick = (lineNumber) => {
        if (readOnly) return;
        setSelectedLine(lineNumber);
        setCommentText('');
        setShowCommentModal(true);
    };

    const handleAddComment = () => {
        if (!commentText.trim() || selectedLine === null) return;

        const newComment = {
            id: Date.now(),
            text: commentText.trim(),
            timestamp: new Date().toISOString(),
            author: 'Current User' // This should come from user context
        };

        setLineComments(prev => ({
            ...prev,
            [selectedLine]: [...(prev[selectedLine] || []), newComment]
        }));

        // Call parent callback if provided
        if (onAddLineComment) {
            onAddLineComment(selectedLine, newComment);
        }

        setShowCommentModal(false);
        setCommentText('');
        setSelectedLine(null);
    };

    const getCommentSyntax = (lang) => {
        const commentStyles = {
            javascript: { start: '/* ', end: ' */' },
            typescript: { start: '/* ', end: ' */' },
            java: { start: '/* ', end: ' */' },
            cpp: { start: '/* ', end: ' */' },
            c: { start: '/* ', end: ' */' },
            css: { start: '/* ', end: ' */' },
            python: { start: '# ', end: '' },
            sql: { start: '-- ', end: '' },
            html: { start: '<!-- ', end: ' -->' },
            json: { start: '', end: '' }, // JSON doesn't support comments
        };

        return commentStyles[lang?.toLowerCase()] || { start: '/* ', end: ' */' };
    };

    const handleAddInlineComment = () => {
        if (!inlineCommentText.trim() || selectedPosition === null) return;

        const { selectionStart, value } = textareaRef.current;
        const commentSyntax = getCommentSyntax(language);

        // Don't add comments to JSON files
        if (language?.toLowerCase() === 'json') {
            alert('JSON format does not support comments');
            setShowInlineCommentModal(false);
            setInlineCommentText('');
            setSelectedPosition(null);
            return;
        }

        const commentTag = `${commentSyntax.start}${inlineCommentText.trim()}${commentSyntax.end}`;

        // Insert the inline comment at the current cursor position
        const newValue = value.substring(0, selectionStart) + commentTag + value.substring(selectionStart);

        // Update the code
        setCurrentCode(newValue);
        onChange(newValue);

        // Update textarea and cursor position
        if (textareaRef.current) {
            textareaRef.current.value = newValue;
            const newCursorPos = selectionStart + commentTag.length;
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newCursorPos;
            textareaRef.current.focus();
        }

        setShowInlineCommentModal(false);
        setInlineCommentText('');
        setSelectedPosition(null);
    };

    const toggleLineComment = () => {
        if (readOnly || !textareaRef.current) return;

        const { selectionStart, selectionEnd, value } = textareaRef.current;
        const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
        const lineEnd = value.indexOf('\n', selectionEnd);
        const actualLineEnd = lineEnd === -1 ? value.length : lineEnd;

        const currentLine = value.slice(lineStart, actualLineEnd);
        const commentSyntax = getCommentSyntax(language);

        // For single-line comment languages (Python, SQL)
        if (!commentSyntax.end) {
            const trimmedLine = currentLine.trim();
            let newLine;

            if (trimmedLine.startsWith(commentSyntax.start.trim())) {
                // Uncomment: remove the comment prefix
                newLine = currentLine.replace(new RegExp(`^(\\s*)${commentSyntax.start.trim()}\\s?`), '$1');
            } else {
                // Comment: add the comment prefix
                const leadingSpaces = currentLine.match(/^\s*/)[0];
                newLine = leadingSpaces + commentSyntax.start + currentLine.slice(leadingSpaces.length);
            }

            const newValue = value.substring(0, lineStart) + newLine + value.substring(actualLineEnd);
            setCurrentCode(newValue);
            onChange(newValue);

            if (textareaRef.current) {
                textareaRef.current.value = newValue;
                textareaRef.current.focus();
            }
        } else {
            // For block comment languages, just use inline comment
            handleInlineCommentShortcut();
        }
    };

    const handleInlineCommentShortcut = () => {
        if (readOnly || !textareaRef.current) return;

        const { selectionStart } = textareaRef.current;
        setSelectedPosition(selectionStart);
        setInlineCommentText('');
        setShowInlineCommentModal(true);
    };

    const formatCode = (text) => {
        if (!text) return text;

        const lines = text.split('\n');
        let indentLevel = 0;
        const indentSize = 4; // 4 spaces as per .prettierrc

        const formattedLines = lines.map(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return '';

            // Decrease indent for closing braces/brackets
            if (trimmedLine.startsWith('}') || trimmedLine.startsWith(']') || trimmedLine.startsWith(')')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }

            const indentedLine = ' '.repeat(indentLevel * indentSize) + trimmedLine;

            // Increase indent for opening braces/brackets
            if (trimmedLine.endsWith('{') || trimmedLine.endsWith('[') || trimmedLine.endsWith('(')) {
                indentLevel++;
            }

            return indentedLine;
        });

        return formattedLines.join('\n');
    };

    const handleFormat = () => {
        if (readOnly) return;

        const formatted = formatCode(currentCode);
        setCurrentCode(formatted);
        onChange(formatted);

        // Update textarea value
        if (textareaRef.current) {
            textareaRef.current.value = formatted;
        }
    };

    const handleChange = e => {
        if (readOnly) return; // Don't allow changes in read-only mode

        const newCode = e.target.value;
        setCurrentCode(newCode);
        onChange(newCode);
    };

    const handlePaste = (e) => {
        if (readOnly) return;

        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        const { selectionStart, selectionEnd, value } = e.target;

        // Format the pasted text
        const formattedPaste = formatCode(pastedText);
        const newValue = value.substring(0, selectionStart) + formattedPaste + value.substring(selectionEnd);

        e.target.value = newValue;
        setCurrentCode(newValue);
        onChange(newValue);

        // Set cursor position after pasted content
        const newCursorPos = selectionStart + formattedPaste.length;
        setTimeout(() => {
            e.target.selectionStart = e.target.selectionEnd = newCursorPos;
        }, 0);
    };

    const handleKeyDown = e => {
        if (readOnly) return; // Don't handle key events in read-only mode

        const { selectionStart, selectionEnd, value } = e.target;

        // Ctrl+/ or Cmd+/ for inline comments, Ctrl+Shift+/ for line comments
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            if (e.shiftKey) {
                toggleLineComment();
            } else {
                handleInlineCommentShortcut();
            }
            return;
        }

        if (e.key === 'Tab') {
            e.preventDefault();

            if (e.shiftKey) {
                // Shift+Tab: Remove indentation
                const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
                const lineEnd = value.indexOf('\n', selectionStart);
                const currentLine = lineEnd === -1 ? value.slice(lineStart) : value.slice(lineStart, lineEnd);

                if (currentLine.startsWith('    ')) {
                    const newValue = value.substring(0, lineStart) + currentLine.slice(4) + value.substring(lineEnd === -1 ? value.length : lineEnd);
                    e.target.value = newValue;
                    e.target.selectionStart = e.target.selectionEnd = Math.max(lineStart, selectionStart - 4);
                    setCurrentCode(newValue);
                    onChange(newValue);
                }
            } else {
                // Tab: Add indentation
                const newValue = value.substring(0, selectionStart) + '    ' + value.substring(selectionEnd);
                e.target.value = newValue;
                e.target.selectionStart = e.target.selectionEnd = selectionStart + 4;
                setCurrentCode(newValue);
                onChange(newValue);
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();

            // Auto-indentation on Enter
            const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
            const currentLine = value.slice(lineStart, selectionStart);
            const indentMatch = currentLine.match(/^(\s*)/);
            const currentIndent = indentMatch ? indentMatch[1] : '';

            // Add extra indentation for opening braces/brackets
            let extraIndent = '';
            const trimmedLine = currentLine.trim();
            if (trimmedLine.endsWith('{') || trimmedLine.endsWith('[') || trimmedLine.endsWith('(')) {
                extraIndent = '    ';
            }

            // Check if we need to add closing brace on next line
            let insertText = '\n' + currentIndent + extraIndent;
            const nextChar = value.charAt(selectionStart);
            if (extraIndent && (nextChar === '}' || nextChar === ']' || nextChar === ')')) {
                insertText += '\n' + currentIndent;
            }

            const newValue = value.substring(0, selectionStart) + insertText + value.substring(selectionEnd);
            e.target.value = newValue;

            const newCursorPos = selectionStart + currentIndent.length + extraIndent.length + 1;
            e.target.selectionStart = e.target.selectionEnd = newCursorPos;

            setCurrentCode(newValue);
            onChange(newValue);
        } else if (e.key === 'Backspace') {
            // Smart backspace: remove full indentation if at the beginning of whitespace
            const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
            const beforeCursor = value.slice(lineStart, selectionStart);

            if (beforeCursor.match(/^ +$/)) {
                // We're at the beginning of a line with only spaces
                const spacesToRemove = Math.min(4, beforeCursor.length);
                if (spacesToRemove > 1) {
                    e.preventDefault();
                    const newValue = value.substring(0, selectionStart - spacesToRemove) + value.substring(selectionStart);
                    e.target.value = newValue;
                    e.target.selectionStart = e.target.selectionEnd = selectionStart - spacesToRemove;
                    setCurrentCode(newValue);
                    onChange(newValue);
                }
            }
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-800 dark:bg-gray-900">
                <span className="text-sm font-medium text-gray-100 dark:text-gray-200 capitalize">
                    {language} Editor
                </span>
                <div className="flex items-center space-x-2">
                    {!readOnly && (
                        <>
                            <button
                                onClick={handleFormat}
                                className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                title="Format code (Fix indentation)"
                            >
                                Format
                            </button>
                            <button
                                onClick={handleInlineCommentShortcut}
                                className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                                title="Add inline comment (Ctrl+/) or toggle line comment (Ctrl+Shift+/)"
                            >
                                💬 Comment
                            </button>
                        </>
                    )}
                    {readOnly && (
                        <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full">Viewer Mode</span>
                    )}
                </div>
            </div>

            {/* Code Editor with Line Numbers */}
            <div className="flex-1 flex min-h-0">
                {/* Line Numbers */}
                <div
                    ref={lineNumbersRef}
                    className="bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 px-2 py-4 font-mono text-sm text-gray-500 dark:text-gray-400 select-none min-w-[50px]"
                >
                    {Array.from({ length: getLineCount() }, (_, i) => (
                        <div
                            key={i + 1}
                            className={`h-5 flex items-center justify-end px-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-right ${lineComments[i + 1] && lineComments[i + 1].length > 0
                                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
                                    : ''
                                }`}
                            onClick={() => handleLineClick(i + 1)}
                            title={`Click to add comment to line ${i + 1}`}
                        >
                            <span className="text-xs">{i + 1}</span>
                            {lineComments[i + 1] && lineComments[i + 1].length > 0 && (
                                <span className="ml-1 text-xs">💬</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Code Textarea */}
                <textarea
                    ref={textareaRef}
                    value={currentCode}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    readOnly={readOnly}
                    className={`flex-1 font-mono text-sm p-4 border-0 resize-none focus:outline-none ${readOnly
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'
                        }`}
                    placeholder={
                        readOnly ? 'You are in viewer mode. Ask the host for edit permissions.' : 'Start coding...'
                    }
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    style={{ lineHeight: '20px' }}
                />
            </div>

            {/* Comment Modal */}
            {showCommentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Add Comment to Line {selectedLine}
                            </h3>
                            <button
                                onClick={() => setShowCommentModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Comment
                            </label>
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Enter your comment about this line..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                                rows={3}
                                autoFocus
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowCommentModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddComment}
                                disabled={!commentText.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                            >
                                Add Comment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Inline Comment Modal */}
            {showInlineCommentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Add Inline Comment
                            </h3>
                            <button
                                onClick={() => setShowInlineCommentModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Inline Comment
                            </label>
                            <input
                                type="text"
                                value={inlineCommentText}
                                onChange={(e) => setInlineCommentText(e.target.value)}
                                placeholder="Enter your inline comment..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddInlineComment();
                                    } else if (e.key === 'Escape') {
                                        setShowInlineCommentModal(false);
                                    }
                                }}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                This will insert: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                                    {(() => {
                                        const syntax = getCommentSyntax(language);
                                        if (language?.toLowerCase() === 'json') {
                                            return 'Comments not supported in JSON';
                                        }
                                        return `${syntax.start}your comment${syntax.end}`;
                                    })()}
                                </code>
                            </p>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowInlineCommentModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddInlineComment}
                                disabled={!inlineCommentText.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                            >
                                Add Comment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Line Comments Panel */}
            {Object.keys(lineComments).length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 max-h-48 overflow-y-auto">
                    <div className="p-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Line Comments</h4>
                        <div className="space-y-2">
                            {Object.entries(lineComments).map(([lineNumber, comments]) => (
                                <div key={lineNumber} className="bg-white dark:bg-gray-700 rounded-lg p-2">
                                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                                        Line {lineNumber}
                                    </div>
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="text-xs text-gray-700 dark:text-gray-300 mb-1">
                                            <span className="font-medium">{comment.author}:</span> {comment.text}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeEditor;
