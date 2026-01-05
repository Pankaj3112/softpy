import React from "react";
import { TokenType } from "@softpy/compiler";

// ============================================================================
// Token Viewer
// ============================================================================

const TOKEN_COLORS: Record<string, string> = {
  // Keywords - Blue
  [TokenType.IF]: "text-blue-400",
  [TokenType.ELSE]: "text-blue-400",
  [TokenType.ELIF]: "text-blue-400",
  [TokenType.WHILE]: "text-blue-400",
  [TokenType.FOR]: "text-blue-400",
  [TokenType.IN]: "text-blue-400",
  [TokenType.FUNC]: "text-blue-400",
  [TokenType.RETURN]: "text-blue-400",
  [TokenType.AND]: "text-blue-400",
  [TokenType.OR]: "text-blue-400",
  [TokenType.NOT]: "text-blue-400",

  // Identifiers - Green
  [TokenType.IDENTIFIER]: "text-green-400",

  // Literals
  [TokenType.NUMBER]: "text-yellow-400",
  [TokenType.STRING]: "text-orange-300",
  [TokenType.BOOLEAN]: "text-yellow-400",

  // Operators - Red/Pink
  [TokenType.PLUS]: "text-red-400",
  [TokenType.MINUS]: "text-red-400",
  [TokenType.STAR]: "text-red-400",
  [TokenType.SLASH]: "text-red-400",
  [TokenType.MOD]: "text-red-400",
  [TokenType.ASSIGN]: "text-red-400",
  [TokenType.EQUAL]: "text-red-400",
  [TokenType.NOT_EQUAL]: "text-red-400",
  [TokenType.LT]: "text-red-400",
  [TokenType.GT]: "text-red-400",
  [TokenType.LTE]: "text-red-400",
  [TokenType.GTE]: "text-red-400",

  // Punctuation - Cyan/Gray
  [TokenType.LPAREN]: "text-cyan-400",
  [TokenType.RPAREN]: "text-cyan-400",
  [TokenType.COLON]: "text-cyan-400",
  [TokenType.COMMA]: "text-cyan-400",
  [TokenType.INDENT]: "text-gray-500",
  [TokenType.DEDENT]: "text-gray-500",
  [TokenType.NEWLINE]: "text-gray-600",
  [TokenType.EOF]: "text-gray-600",
};

export const TokenViewer = ({ tokens }: { tokens: any[] }) => {
  if (!tokens) return null;

  return (
    <div className="font-mono text-sm p-4">
      {tokens.map((token, index) => {
        const colorClass = TOKEN_COLORS[token.type] || "text-gray-300";
        // Pad the type for alignment
        const typeStr = token.type.padEnd(15);

        // Special handling for whitespace tokens to make them visible
        let valueDisplay = token.value;
        if (token.type === TokenType.NEWLINE) valueDisplay = "\\n";
        if (token.type === TokenType.INDENT) valueDisplay = "INDENT";
        if (token.type === TokenType.DEDENT) valueDisplay = "DEDENT";
        if (token.type === TokenType.EOF) valueDisplay = "EOF";

        return (
          <div key={index} className="whitespace-pre">
            <span className={`${colorClass} font-bold`}>{typeStr}</span>
            <span className="text-gray-500">: </span>
            <span className="text-gray-300">{valueDisplay}</span>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// AST Viewer
// ============================================================================

const ASTNode = ({
  node,
  indent = 0,
  label,
}: {
  node: any;
  indent?: number;
  label?: string;
}) => {
  if (!node) return null;

  // Handle arrays of nodes (e.g. body: Statement[])
  if (Array.isArray(node)) {
    return (
      <>
        {node.map((child, i) => (
          <ASTNode key={i} node={child} indent={indent} />
        ))}
      </>
    );
  }

  // Handle primitive values (shouldn't happen often with proper recursion, but for safety)
  if (typeof node !== "object") {
    return (
      <div
        style={{ paddingLeft: `${indent * 20}px` }}
        className="text-gray-400"
      >
        {label ? `${label}: ` : ""}
        {String(node)}
      </div>
    );
  }

  const type = node.type;
  let value = "";
  const children: { key: string; value: any }[] = [];

  // Extract interesting properties based on node type
  switch (type) {
    case "Program":
      children.push({ key: "body", value: node.body });
      break;
    case "FunctionDeclaration":
      value = node.name.name;
      children.push({ key: "params", value: node.params });
      children.push({ key: "body", value: node.body });
      break;
    case "Identifier":
      value = node.name;
      break;
    case "NumberLiteral":
    case "StringLiteral":
    case "BooleanLiteral":
      value = node.value;
      break;
    case "BinaryExpression":
      value = node.operator;
      children.push({ key: "left", value: node.left });
      children.push({ key: "right", value: node.right });
      break;
    case "Assignment":
      children.push({ key: "left", value: node.left });
      children.push({ key: "right", value: node.right });
      break;
    case "CallExpression":
      children.push({ key: "callee", value: node.callee });
      children.push({ key: "args", value: node.args });
      break;
    case "IfStatement":
      children.push({ key: "condition", value: node.condition });
      children.push({ key: "consequent", value: node.consequent });
      if (node.alternate)
        children.push({ key: "alternate", value: node.alternate });
      break;
    case "WhileStatement":
      children.push({ key: "condition", value: node.condition });
      children.push({ key: "body", value: node.body });
      break;
    case "ReturnStatement":
      if (node.argument)
        children.push({ key: "argument", value: node.argument });
      break;
    case "ExpressionStatement":
      children.push({ key: "expression", value: node.expression });
      break;
    default:
      // Fallback for unknown nodes
      Object.keys(node).forEach((key) => {
        if (key !== "type" && typeof node[key] === "object") {
          children.push({ key, value: node[key] });
        }
      });
  }

  return (
    <div>
      <div
        style={{ paddingLeft: `${indent * 20}px` }}
        className="whitespace-pre"
      >
        {label && <span className="text-gray-500 text-xs mr-2">{label}:</span>}
        <span className="text-purple-400 font-bold">{type}</span>
        {value && <span className="text-green-300 ml-2">({value})</span>}
      </div>
      {children.map((child, i) => (
        <ASTNode
          key={i}
          node={child.value}
          indent={indent + 1}
          label={child.key}
        />
      ))}
    </div>
  );
};

export const ASTViewer = ({ ast }: { ast: any }) => {
  if (!ast) return null;
  return (
    <div className="font-mono text-sm p-4 overflow-auto">
      <ASTNode node={ast} />
    </div>
  );
};
