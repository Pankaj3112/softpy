"use client";
import { useState } from "react";
import { compile } from "@softpy/compiler";
import SoftPyEditor from "../components/SoftPyEditor";

export default function Home() {
  const [input, setInput] = useState("x = 10\nprint(x)");
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
          <div className="h-96 border border-gray-300 dark:border-gray-700 rounded overflow-hidden">
            <SoftPyEditor value={input} onChange={setInput} />
          </div>
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
