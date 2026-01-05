"use client";
import { useState } from "react";
import { compile } from "@softpy/compiler";

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleCompile = () => {
    try {
      const result = compile(input);
      setOutput(result.code);
      setError("");
    } catch (e: any) {
      setError(e.message);
      setOutput("");
    }
  };

  return (
    <div className="p-10 min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <h1 className="text-2xl font-bold mb-4">SoftPy Compiler Playground</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <label className="block mb-2 font-semibold">Input (SoftPy)</label>
          <textarea
            className="border p-2 w-full h-96 font-mono bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="x = 10"
          />
        </div>
        <div className="w-full md:w-1/2">
          <label className="block mb-2 font-semibold">
            Output (JavaScript)
          </label>
          <div className="w-full h-96 border p-2 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded overflow-auto font-mono whitespace-pre-wrap">
            {error ? <span className="text-red-500">{error}</span> : output}
          </div>
        </div>
      </div>
      <button
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition-colors"
        onClick={handleCompile}
      >
        Compile
      </button>
    </div>
  );
}
