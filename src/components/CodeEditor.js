'use client';

import { useState, useEffect, useRef } from 'react';

const CodeEditor = ({ code, language, onChange, readOnly = false }) => {
    const [currentCode, setCurrentCode] = useState(code || '');
    const textareaRef = useRef(null);

    useEffect(() => {
        setCurrentCode(code || '');
    }, [code]);

    const handleChange = (e) => {
        if (readOnly) return; // Don't allow changes in read-only mode

        const newCode = e.target.value;
        setCurrentCode(newCode);
        onChange(newCode);
    };

    const handleKeyDown = (e) => {
        if (readOnly) return; // Don't handle key events in read-only mode

        if (e.key === 'Tab') {
            e.preventDefault();
            const { selectionStart, selectionEnd, value } = e.target;
            const newValue = value.substring(0, selectionStart) + '  ' + value.substring(selectionEnd);
            e.target.value = newValue;
            e.target.selectionStart = e.target.selectionEnd = selectionStart + 2;

            setCurrentCode(newValue);
            onChange(newValue);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-800 dark:bg-gray-900">
                <span className="text-sm font-medium text-gray-100 dark:text-gray-200 capitalize">
                    {language} Editor
                </span>
                {readOnly && (
                    <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
                        Viewer Mode
                    </span>
                )}
            </div>
            <textarea
                ref={textareaRef}
                value={currentCode}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                readOnly={readOnly}
                className={`flex-1 font-mono text-sm p-4 border-0 resize-none focus:outline-none ${readOnly
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'
                    }`}
                placeholder={readOnly ? "You are in viewer mode. Ask the host for edit permissions." : "Start coding..."}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
            />
        </div>
    );
};

export default CodeEditor;
