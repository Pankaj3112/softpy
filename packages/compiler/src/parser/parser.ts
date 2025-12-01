import { Token, TokenType } from "../lexer/token";
import {
  Program,
  Statement,
  Assignment,
  ExpressionStatement,
  Expression,
  NumberLiteral,
  StringLiteral,
  Identifier,
  BinaryExpression,
  CallExpression,
} from "./ast";

export class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  // ------------------ Helper Methods ------------------
  private current(): Token {
    const token = this.tokens[this.pos];
    if (!token)
      throw new Error(`Unexpected end of input at position ${this.pos}`);
    return token;
  }

  private peek(offset = 1): Token | null {
    return this.tokens[this.pos + offset] || null;
  }

  private eat(type: TokenType, value?: string): Token {
    const token = this.current();
    if (token.type !== type || (value !== undefined && token.value !== value)) {
      throw new Error(
        `Unexpected token: expected ${type}${value ? `(${value})` : ""}, got ${token.type}(${token.value}) at line ${token.line}`,
      );
    }
    this.pos++;
    return token;
  }

  private match(type: TokenType, value?: string): boolean {
    const token = this.current();
    if (value !== undefined)
      return token.type === type && token.value === value;
    return token.type === type;
  }

  private skipNewlines() {
    while (this.match(TokenType.NEWLINE)) this.pos++;
  }

  // ------------------ Entry Point ------------------
  public parse(): Program {
    const body: Statement[] = [];
    while (!this.match(TokenType.EOF)) {
      const stmt = this.parseStatement();
      if (stmt) body.push(stmt);
    }
    return { type: "Program", body };
  }

  // ------------------ Statement Parsing ------------------
  private parseStatement(): Statement | null {
    this.skipNewlines();
    const token = this.current();

    if (token.type === TokenType.IDENTIFIER) {
      if (token.value === "print") return this.parsePrintStatement();

      const next = this.peek();
      if (next && next.type === TokenType.OPERATOR && next.value === "=") {
        return this.parseAssignment();
      }

      return this.parseExpressionStatement();
    }

    if ([TokenType.NUMBER, TokenType.STRING].includes(token.type)) {
      return this.parseExpressionStatement();
    }

    if (token.type === TokenType.NEWLINE) {
      this.pos++;
      return null;
    }

    throw new Error(`Unexpected token: ${token.type} at line ${token.line}`);
  }

  private parsePrintStatement(): ExpressionStatement {
    this.eat(TokenType.IDENTIFIER, "print");
    const args: Expression[] = [];

    while (!this.match(TokenType.NEWLINE) && !this.match(TokenType.EOF)) {
      args.push(this.parseExpression());
      if (this.match(TokenType.OPERATOR, ","))
        this.eat(TokenType.OPERATOR, ",");
      else break;
    }

    this.skipNewlines();

    return {
      type: "ExpressionStatement",
      expression: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "print" },
        args,
      },
    };
  }

  private parseAssignment(): Assignment {
    const leftToken = this.eat(TokenType.IDENTIFIER);
    const left: Identifier = { type: "Identifier", name: leftToken.value };
    this.eat(TokenType.OPERATOR, "=");
    const right = this.parseExpression();
    this.skipNewlines();
    return { type: "Assignment", left, right };
  }

  private parseExpressionStatement(): ExpressionStatement {
    const expr = this.parseExpression();
    this.skipNewlines();
    return { type: "ExpressionStatement", expression: expr };
  }

  // ------------------ Expression Parsing ------------------
  private parseExpression(): Expression {
    let left = this.parsePrimary();

    // handle simple binary expressions (without precedence)
    if (
      this.match(TokenType.OPERATOR) &&
      ["+", "-", "*", "/", "%"].includes(this.current().value)
    ) {
      const operator = this.current().value;
      this.pos++;
      const right = this.parseExpression();
      left = { type: "BinaryExpression", left, operator, right };
    }

    return left;
  }

  private parsePrimary(): Expression {
    const token = this.current();

    if (token.type === TokenType.NUMBER) {
      this.pos++;
      return { type: "NumberLiteral", value: token.value };
    }

    if (token.type === TokenType.STRING) {
      this.pos++;
      return { type: "StringLiteral", value: token.value };
    }

    if (token.type === TokenType.IDENTIFIER) {
      this.pos++;
      let expr: Expression = { type: "Identifier", name: token.value };

      // function call
      if (this.match(TokenType.OPERATOR, "(")) {
        this.eat(TokenType.OPERATOR, "(");
        const args: Expression[] = [];
        while (!this.match(TokenType.OPERATOR, ")")) {
          args.push(this.parseExpression());
          if (this.match(TokenType.OPERATOR, ","))
            this.eat(TokenType.OPERATOR, ",");
          else break;
        }
        this.eat(TokenType.OPERATOR, ")");
        expr = { type: "CallExpression", callee: expr as Identifier, args };
      }

      return expr;
    }

    throw new Error(
      `Unexpected token in expression: ${token.type} at line ${token.line}`,
    );
  }
}
