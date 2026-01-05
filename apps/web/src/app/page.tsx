"use client";
import { useState } from "react";
import { compile } from "@softpy/compiler";
import SoftPyEditor from "../components/SoftPyEditor";

export default function Home() {
  const [input, setInput] = useState("x = 10\nprint(x)");
  const [output, setOutput] = useState("");
  const [runOutput, setRunOutput] = useState("");
  const [error, setError] = useState("");

  const handleCompile = () => {
    try {
      const result = compile(input);
      setOutput(result.code);
      setError("");
      return result.code;
    } catch (e: any) {
      setError(e.message);
      setOutput("");
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
      <h1 className="text-2xl font-bold mb-4">SoftPy Compiler Playground</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <label className="block mb-2 font-semibold">Input (SoftPy)</label>
          <div className="h-96 border border-gray-300 dark:border-gray-700 rounded overflow-hidden">
            <SoftPyEditor value={input} onChange={setInput} />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div>
            <label className="block mb-2 font-semibold">
              Output (JavaScript)
            </label>
            <div className="w-full h-44 border p-2 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded overflow-auto font-mono whitespace-pre-wrap text-sm">
              {error ? <span className="text-red-500">{error}</span> : output}
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
