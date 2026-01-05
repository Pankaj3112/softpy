"use client";
import { useState, useEffect, useRef } from "react";
import { compile } from "@softpy/compiler";
import Editor from "@monaco-editor/react";
import SoftPyEditor from "../components/SoftPyEditor";

const EXAMPLES: Record<string, { code: string; description: string }> = {
  Fibonacci: {
    code: `func fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(10))`,
    description: "Recursive function example",
  },
  "Variables & Arithmetic": {
    code: `x = 10
y = 20
print(x + y)`,
    description: "Basic expressions",
  },
  Conditionals: {
    code: `x = 10
if x > 5:
    print("x is greater than 5")
else:
    print("x is small")`,
    description: "if / else demo",
  },
  "While Loop": {
    code: `i = 0
while i < 5:
    print(i)
    i = i + 1`,
    description: "Basic loop",
  },
  Functions: {
    code: `func add(a, b):
    return a + b

print(add(5, 10))`,
    description: "Parameters & return",
  },
};

type PipelineStepStatus = "pending" | "success" | "error" | "active";

export default function Home() {
  const [input, setInput] = useState(EXAMPLES["Fibonacci"].code);
  const [output, setOutput] = useState("");
  const [ast, setAst] = useState<any>(null);
  const [tokens, setTokens] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"js" | "ast" | "tokens">("js");
  const [runOutput, setRunOutput] = useState("");
  const [error, setError] = useState("");
  const [compileTime, setCompileTime] = useState<number | null>(null);
  const [showExamples, setShowExamples] = useState(false);

  const examplesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        examplesRef.current &&
        !examplesRef.current.contains(event.target as Node)
      ) {
        setShowExamples(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCompile = (codeToCompile: string) => {
    const start = performance.now();
    try {
      // Reset status
      const result = compile(codeToCompile, { debug: true });

      // If we get here, tokens and AST are likely fine, but let's simulate the steps if we had granular control.
      // Since compile() does it all, we assume success if no error.

      setOutput(result.code);
      setAst(result.ast);
      setTokens(result.tokens);
      setError("");

      setCompileTime(performance.now() - start);
      return result.code;
    } catch (e: any) {
      setCompileTime(performance.now() - start);
      setError(e.message);
      setOutput("");
      setAst(null);
      setTokens(null);
      return null;
    }
  };

  const handleRun = () => {
    const code = handleCompile(input);
    if (!code) return;

    const logs: string[] = [];
    const originalLog = console.log;

    console.log = (...args) => {
      logs.push(args.map((arg) => String(arg)).join(" "));
    };

    try {
      // Add a small header to the output to look like a shell
      logs.push("$ softpy run");
      new Function(code)();
    } catch (e: any) {
      logs.push(`Runtime Error: ${e.message}`);
    } finally {
      console.log = originalLog;
    }

    setRunOutput(logs.join("\n"));
  };

  const loadExample = (key: string) => {
    const example = EXAMPLES[key];
    setInput(example.code);
    setShowExamples(false);
    // Auto-run
    setTimeout(() => {
      // We need to pass the new code directly because state update might not be immediate in this closure if we used 'input'
      // But handleRun uses 'input' state.
      // Better to just set input and let user run, OR update state and call compile with new value.
      // For "Auto-runs" requirement:
      const start = performance.now();
      try {
        const result = compile(example.code, { debug: true });
        setOutput(result.code);
        setAst(result.ast);
        setTokens(result.tokens);
        setError("");
        setCompileTime(performance.now() - start);

        // Run
        const logs: string[] = ["$ softpy run"];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.map((arg) => String(arg)).join(" "));
        };
        try {
          new Function(result.code)();
        } catch (e: any) {
          logs.push(`Runtime Error: ${e.message}`);
        } finally {
          console.log = originalLog;
        }
        setRunOutput(logs.join("\n"));
      } catch (e: any) {
        setError(e.message);
      }
    }, 0);
  };

  // Initial compile on load
  useEffect(() => {
    handleCompile(input);
  }, []);

  return (
    <div className="h-screen bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 font-sans flex flex-col overflow-hidden">
      {/* 2. Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex justify-between items-center bg-white dark:bg-[#161b22]">
        <div className="font-semibold text-sm tracking-wide">
          SoftPy ⚡ Transparent Compiler Playground
        </div>
        <a
          href="https://github.com/Pankaj3112/softpy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          [GitHub]
        </a>
      </header>

      {/* 3. Action Bar */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center gap-4 bg-gray-50 dark:bg-[#0d1117]">
        <button
          onClick={handleRun}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
        >
          <span>▶</span> Run SoftPy
        </button>

        <div className="relative" ref={examplesRef}>
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 px-3 py-1.5 rounded transition-colors"
          >
            Examples <span className="text-xs">▼</span>
          </button>

          {showExamples && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-md shadow-xl z-50 py-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 mb-1">
                Examples
              </div>
              {Object.entries(EXAMPLES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => loadExample(key)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {key}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {val.description}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto text-xs text-gray-500 dark:text-gray-400 font-mono">
          {compileTime !== null
            ? `Compiled in ${compileTime.toFixed(2)}ms`
            : "Ready"}
        </div>
      </div>

      {/* 4. Main Playground */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Input Editor */}
        <div className="w-full md:w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-800">
          <div className="px-4 py-2 bg-gray-100 dark:bg-[#161b22] border-b border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Input (SoftPy)
          </div>
          <div className="flex-1 relative">
            <SoftPyEditor
              value={input}
              onChange={(val) => {
                setInput(val);
                handleCompile(val);
              }}
            />
          </div>
        </div>

        {/* Right: Compiler Pipeline Viewer */}
        <div className="w-full md:w-1/2 flex flex-col bg-white dark:bg-[#0d1117]">
          {/* Output Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#161b22]">
            {(["js", "ast", "tokens"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === tab
                    ? "bg-white dark:bg-[#0d1117] border-t-2 border-blue-500 text-gray-900 dark:text-gray-100"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {tab === "js" ? "JavaScript" : tab}
              </button>
            ))}
          </div>

          {/* Output Content */}
          <div className="flex-1 overflow-auto p-0 bg-white dark:bg-[#0d1117] relative">
            {error ? (
              <div className="p-6 text-center">
                <div className="text-red-500 font-semibold mb-2">
                  ❌ Compilation failed
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {error}
                </div>
              </div>
            ) : activeTab === "js" ? (
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={output}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            ) : (
              <pre className="p-4 text-sm font-mono text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
                {activeTab === "ast" && JSON.stringify(ast, null, 2)}
                {activeTab === "tokens" && JSON.stringify(tokens, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>

      {/* 5. Terminal Output */}
      <div className="h-48 border-t border-gray-200 dark:border-gray-800 bg-gray-900 text-gray-300 flex flex-col">
        <div className="px-4 py-1 bg-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider select-none">
          Terminal Output
        </div>
        <div className="flex-1 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap">
          {runOutput || <span className="opacity-50">$ softpy run...</span>}
        </div>
      </div>
    </div>
  );
}
