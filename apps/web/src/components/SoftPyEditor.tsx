"use client";

import React, { useRef, useEffect } from "react";
import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import { compile } from "@softpy/compiler";

interface SoftPyEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SoftPyEditor({ value, onChange }: SoftPyEditorProps) {
  const monacoRef = useRef<Monaco | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    monacoRef.current = monaco;

    // 1. Register the Language
    if (!monaco.languages.getLanguages().some((l: any) => l.id === "softpy")) {
      monaco.languages.register({ id: "softpy" });
    }

    // 2. Syntax Highlighting (Monarch Tokenizer)
    monaco.languages.setMonarchTokensProvider("softpy", {
      tokenizer: {
        root: [
          [/\b(if|elif|else|while|for|in|func|return|and|or|not)\b/, "keyword"],
          [/\b(print)\b/, "type.identifier"],
          [/[a-zA-Z_]\w*/, "identifier"],
          [/\d+/, "number"],
          [/"[^"]*"/, "string"],
          [/#.*$/, "comment"],
        ],
      },
    });

    // 3. Intellisense (Completion Provider)
    monaco.languages.registerCompletionItemProvider("softpy", {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          {
            label: "print",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "print(${1:value})",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: "func",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "func ${1:name}(${2:args}):\n\t${3:pass}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: "if",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "if ${1:condition}:\n\t${2:pass}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: "for",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "for ${1:item} in ${2:iterable}:\n\t${3:pass}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
        ];

        return { suggestions };
      },
    });

    // Initial validation
    validate(value);
  };

  const validate = (code: string) => {
    const monaco = monacoRef.current;
    if (!monaco) return;

    const model = monaco.editor.getModels()[0];
    if (!model) return;

    try {
      compile(code);
      // Clear markers if successful
      monaco.editor.setModelMarkers(model, "softpy", []);
    } catch (e: any) {
      const message = e.message;
      // Extract line number from error message "Error at line X..."
      const match = message.match(/line (\d+)/);
      const line = match ? parseInt(match[1], 10) : 1;

      monaco.editor.setModelMarkers(model, "softpy", [
        {
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: 1000,
          message: message,
          severity: monaco.MarkerSeverity.Error,
        },
      ]);
    }
  };

  const handleChange = (val: string | undefined) => {
    const code = val || "";
    onChange(code);
    validate(code);
  };

  return (
    <Editor
      height="100%"
      defaultLanguage="softpy"
      value={value}
      onChange={handleChange}
      onMount={handleEditorDidMount}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
}
