import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ language, value, onChange, theme = 'vs-dark' }) => {
  
  const mapEditorLanguage = (lang) => {
    switch (lang?.toLowerCase()) {
      case 'javascript': return 'javascript';
      case 'python': return 'python';
      case 'cpp': return 'cpp';
      case 'java': return 'java';
      default: return 'javascript';
    }
  };

  return (
    <div class="w-full h-full rounded-2xl overflow-hidden border border-gray-200 dark:border-darkbg-700 shadow-sm bg-darkbg-900">
      <div class="bg-gray-100 dark:bg-darkbg-800 px-4 py-2 border-b border-gray-200 dark:border-darkbg-700 flex justify-between items-center">
        <span class="text-xs font-mono font-semibold text-gray-500 dark:text-gray-400 capitalize">
          {language || 'javascript'} Console
        </span>
        <div class="flex gap-1.5">
          <span class="w-3 h-3 rounded-full bg-red-400"></span>
          <span class="w-3 h-3 rounded-full bg-yellow-400"></span>
          <span class="w-3 h-3 rounded-full bg-green-400"></span>
        </div>
      </div>
      <div class="h-[calc(100%-38px)]">
        <Editor
          height="100%"
          language={mapEditorLanguage(language)}
          value={value}
          onChange={onChange}
          theme={theme}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            fontFamily: 'Fira Code, Courier New, monospace',
            padding: { top: 12, bottom: 12 }
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
