"use client";
import { useState } from "react";
import { compile } from "@softpy/compiler";
import SoftPyEditor from "../components/SoftPyEditor";

const EXAMPLES: Record<string, string> = {
  "Hello World": `print("Hello World")`,
  Variables: `x = 10
y = 20
print(x + y)`,
  "If/Else": `x = 10
if x > 5:
    print("x is greater than 5")
else:
    print("x is small")`,
  "While Loop": `i = 0
while i < 5:
    print(i)
    i = i + 1`,
  "For Loop": `for i in range(5):
    print(i)`,
  Functions: `func add(a, b):
    return a + b

print(add(5, 10))`,
  Fibonacci: `func fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(10))`,
};

export default function Home() {
  const [input, setInput] = useState(EXAMPLES["Hello World"]);
  const [output, setOutput] = useState("");
  const [ast, setAst] = useState<any>(null);
  const [tokens, setTokens] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"js" | "ast" | "tokens">("js");
  const [runOutput, setRunOutput] = useState("");
  const [error, setError] = useState("");

  const handleExampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value;
    if (EXAMPLES[key]) {
      setInput(EXAMPLES[key]);
      // Clear outputs when switching examples
      setOutput("");
      setAst(null);
      setTokens(null);
      setRunOutput("");
      setError("");
    }
  };

  const handleCompile = () => {
    try {
      const result = compile(input, { debug: true });
      setOutput(result.code);
      setAst(result.ast);
      setTokens(result.tokens);
      setError("");
      return result.code;
    } catch (e: any) {
      setError(e.message);
      setOutput("");
      setAst(null);
      setTokens(null);
      return null;
    }
  };

  const handleRun = () => {
    const code = handleCompile();
    if (!code) return;

    const logs: string[] = [];
    const originalLog = console.log;

    // Capture console.log
    console.log = (...args) => {
      logs.push(args.map((arg) => String(arg)).join(" "));
    };

    try {
      // Execute the code
      // We wrap it in a function to avoid variable collisions with the global scope if we were to run it multiple times in the same context,
      // though new Function creates a fresh scope mostly.
      new Function(code)();
    } catch (e: any) {
      logs.push(`Runtime Error: ${e.message}`);
    } finally {
      // Restore console.log
      console.log = originalLog;
    }

    setRunOutput(logs.join("\n"));
  };

  return (
    <div className="p-10 min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">SoftPy Compiler Playground</h1>
        <select
          className="border p-2 rounded bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
          onChange={handleExampleChange}
          defaultValue="Hello World"
        >
          {Object.keys(EXAMPLES).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <label className="block mb-2 font-semibold">Input (SoftPy)</label>
          <div className="h-96 border border-gray-300 dark:border-gray-700 rounded overflow-hidden">
            <SoftPyEditor value={input} onChange={setInput} />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div>
            <div className="flex gap-4 mb-2 border-b border-gray-300 dark:border-gray-700">
              <button
                onClick={() => setActiveTab("js")}
                className={`pb-1 font-semibold ${
                  activeTab === "js"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                JavaScript
              </button>
              <button
                onClick={() => setActiveTab("ast")}
                className={`pb-1 font-semibold ${
                  activeTab === "ast"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                AST
              </button>
              <button
                onClick={() => setActiveTab("tokens")}
                className={`pb-1 font-semibold ${
                  activeTab === "tokens"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                Tokens
              </button>
            </div>
            <div className="w-full h-44 border p-2 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded overflow-auto font-mono whitespace-pre-wrap text-sm">
              {error ? (
                <span className="text-red-500">{error}</span>
              ) : activeTab === "js" ? (
                output
              ) : activeTab === "ast" ? (
                JSON.stringify(ast, null, 2)
              ) : (
                JSON.stringify(tokens, null, 2)
              )}
            </div>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Terminal Output</label>
            <div className="w-full h-44 border p-2 bg-black text-green-400 border-gray-700 rounded overflow-auto font-mono whitespace-pre-wrap text-sm">
              {runOutput || (
                <span className="text-gray-600 italic">
                  Run code to see output...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition-colors"
          onClick={() => handleCompile()}
        >
          Compile
        </button>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold transition-colors"
          onClick={handleRun}
        >
          Run
        </button>
      </div>
    </div>
  );
}
