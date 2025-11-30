export type Expression =
  | NumberLiteral
  | Identifier
  | BinaryExpression
  | CallExpression;

export interface NumberLiteral {
  type: "NumberLiteral";
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

export type Statement = Assignment | ExpressionStatement;

export interface Assignment {
  type: "Assignment";
  left: Identifier;
  right: Expression;
}

export interface ExpressionStatement {
  type: "ExpressionStatement";
  expression: Expression;
}

export interface Program {
  type: "Program";
  body: Statement[];
}
