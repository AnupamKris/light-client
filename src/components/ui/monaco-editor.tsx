import * as React from "react";
import Editor from "@monaco-editor/react";
import { cn } from "../../lib/utils";

interface MonacoEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  className?: string;
  readOnly?: boolean;
}

export function MonacoEditor({
  value,
  onChange,
  className,
  readOnly = false,
}: MonacoEditorProps) {
  return (
    <div
      className={cn(
        "border rounded-md overflow-hidden flex-1 h-full",
        className
      )}
    >
      <Editor
        height="100%"
        defaultLanguage="json"
        theme="custom-dark"
        value={value}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          tabSize: 2,
          formatOnPaste: true,
          formatOnType: true,
          readOnly,
          domReadOnly: readOnly,
        }}
        beforeMount={(monaco) => {
          monaco.editor.defineTheme("custom-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
              "editor.background": "#121212", // bg-muted color
            },
          });
          monaco.editor.setTheme("custom-dark");
        }}
      />
    </div>
  );
}
