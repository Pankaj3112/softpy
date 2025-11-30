import { Token, TokenType } from "../lexer/token";
import {
  Program,
  Statement,
  Assignment,
  ExpressionStatement,
  Expression,
  NumberLiteral,
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

  private current(): Token {
    const token = this.tokens[this.pos];
    if (!token) {
      throw new Error(`Unexpected end of input at position ${this.pos}`);
    }
    return token;
  }

  private eat(type: TokenType): Token {
    const token = this.current();
    if (token.type !== type) {
      throw new Error(`Unexpected token: expected ${type}, got ${token.type}`);
    }
    this.pos++;
    return token;
  }

  private match(type: TokenType): boolean {
    return this.current().type === type;
  }

  public parse(): Program {
    const body: Statement[] = [];
    while (
      this.pos < this.tokens.length &&
      this.current().type !== TokenType.EOF
    ) {
      const stmt = this.parseStatement();
      if (stmt) body.push(stmt);
    }
    return { type: "Program", body };
  }

  private parseStatement(): Statement | null {
    const token = this.current();

    if (token.type === TokenType.IDENTIFIER) {
      // Peek next token to see if it's an assignment
      const next = this.tokens[this.pos + 1];
      if (next && next.type === TokenType.OPERATOR && next.value === "=") {
        return this.parseAssignment();
      } else {
        return this.parseExpressionStatement();
      }
    }

    // Skip newlines
    if (token.type === TokenType.NEWLINE) {
      this.pos++;
      return null;
    }

    throw new Error(`Unexpected token: ${token.type} at line ${token.line}`);
  }

  private parseAssignment(): Assignment {
    const leftToken = this.eat(TokenType.IDENTIFIER);
    const left: Identifier = { type: "Identifier", name: leftToken.value };

    this.eat(TokenType.OPERATOR); // eat '='

    const right = this.parseExpression();

    // optional newline
    if (this.match(TokenType.NEWLINE)) this.pos++;

    return { type: "Assignment", left, right };
  }

  private parseExpressionStatement(): ExpressionStatement {
    const expr = this.parseExpression();

    // optional newline
    if (this.match(TokenType.NEWLINE)) this.pos++;

    return { type: "ExpressionStatement", expression: expr };
  }

  private parseExpression(): Expression {
    let left: Expression;

    const token = this.current();
    if (token.type === TokenType.NUMBER) {
      left = { type: "NumberLiteral", value: token.value };
      this.pos++;
    } else if (token.type === TokenType.IDENTIFIER) {
      left = { type: "Identifier", name: token.value };
      this.pos++;

      // function call
      if (this.match(TokenType.OPERATOR) && this.current().value === "(") {
        this.pos++; // eat '('
        const args: Expression[] = [];
        while (
          !this.match(TokenType.OPERATOR) ||
          this.current().value !== ")"
        ) {
          args.push(this.parseExpression());
          if (this.match(TokenType.OPERATOR) && this.current().value === ",")
            this.pos++;
        }
        this.eat(TokenType.OPERATOR); // eat ')'
        left = { type: "CallExpression", callee: left as Identifier, args };
      }
    } else {
      throw new Error(`Unexpected token in expression: ${token.type}`);
    }

    // handle binary expressions with + (very simple, left-associative)
    if (this.match(TokenType.OPERATOR) && this.current().value === "+") {
      const operator = this.current().value;
      this.pos++;
      const right = this.parseExpression();
      left = { type: "BinaryExpression", left, operator, right };
    }

    return left;
  }
}
