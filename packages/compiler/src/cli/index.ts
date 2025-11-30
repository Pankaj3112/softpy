#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { Lexer } from "../lexer/lexer";
import { Parser } from "../parser/parser";
import { Token, TokenType } from "../lexer/token";
import { CodeGenerator } from "../codegen/codegen";
const isDev = process.env.SOFTPY_DEV === "true";

const args = process.argv.slice(2);
const fileName = args[0];

if (!fileName) {
  console.error("Error: Please provide a SoftPy file path.");
  process.exit(1);
}

const filePath = path.resolve(process.cwd(), fileName);

if (!fs.existsSync(filePath)) {
  console.error(`Error: File does not exist at path: ${filePath}`);
  process.exit(1);
}

// ---- Helper Functions ----
function logToFile(filename: string, content: string) {
  if (!isDev) return;
  const logDir = path.resolve(process.cwd(), "logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  const fullPath = path.join(logDir, filename);
  fs.writeFileSync(fullPath, content, { encoding: "utf-8" });
  console.log(`Output written to ${fullPath}`);
}

// --- Read file ---
const fileContent: string = fs.readFileSync(filePath, "utf-8");

// --- Lexing ---
const lexer = new Lexer(fileContent);

const tokens: Token[] = [];
let token: Token;

do {
  token = lexer.getNextToken();
  tokens.push(token);
} while (token.type !== TokenType.EOF);

logToFile("tokens.json", JSON.stringify(tokens, null, 2));

// --- Parsing ---
const parser = new Parser(tokens);
const ast = parser.parse();

logToFile("ast.json", JSON.stringify(ast, null, 2));

// --- Code Generation ---
const generator = new CodeGenerator();
const outputJS = generator.generate(ast);

logToFile("output.js", outputJS);

// Run it immediately
eval(outputJS);
