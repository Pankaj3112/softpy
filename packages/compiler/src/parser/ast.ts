export type Expression =
  | NumberLiteral
  | StringLiteral
  | BooleanLiteral
  | Identifier
  | BinaryExpression
  | CallExpression
  | UnaryExpression;

export interface NumberLiteral {
  type: "NumberLiteral";
  value: string;
}

export interface StringLiteral {
  type: "StringLiteral";
  value: string;
}

export interface BooleanLiteral {
  type: "BooleanLiteral";
  value: string;
}

export interface Identifier {
  type: "Identifier";
  name: string;
}

export interface BinaryExpression {
  type: "BinaryExpression";
  left: Expression;
  operator: string;
  right: Expression;
}

export interface CallExpression {
  type: "CallExpression";
  callee: Identifier;
  args: Expression[];
}

export interface UnaryExpression {
  type: "UnaryExpression";
  operator: string;
  argument: Expression;
}

export type Statement =
  | Assignment
  | ExpressionStatement
  | IfStatement
  | WhileStatement
  | ForStatement
  | FunctionDeclaration
  | ReturnStatement;

export interface FunctionDeclaration {
  type: "FunctionDeclaration";
  name: Identifier;
  params: Identifier[];
  body: Statement[];
}

export interface ReturnStatement {
  type: "ReturnStatement";
  argument?: Expression;
}

export interface ForStatement {
  type: "ForStatement";
  variable: Identifier;
  iterable: Expression;
  body: Statement[];
}

export interface WhileStatement {
  type: "WhileStatement";
  condition: Expression;
  body: Statement[];
}

export interface Assignment {
  type: "Assignment";
  left: Identifier;
  right: Expression;
}

export interface ExpressionStatement {
  type: "ExpressionStatement";
  expression: Expression;
}

export interface IfStatement {
  type: "IfStatement";
  condition: Expression;
  consequent: Statement[];
  alternate?: (ElifClause | ElseClause)[] | Statement[] | undefined;
}

export interface ElifClause {
  type: "ElifClause";
  condition: Expression;
  consequent: Statement[];
}

export interface ElseClause {
  type: "ElseClause";
  consequent: Statement[];
}

export interface Program {
  type: "Program";
  body: Statement[];
}
