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
import { Token, TokenType } from "../lexer/token";

export class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private current(): Token {
    const t = this.tokens[this.pos];
    if (!t) throw new Error("Unexpected end of input");
    return t;
  }

  private next(): Token {
    const t = this.tokens[this.pos++];
    if (!t) throw new Error("Unexpected end of input");
    return t;
  }

  private peek(offset = 1): Token | null {
    return this.tokens[this.pos + offset] ?? null;
  }

  private eat(type: TokenType, value?: string): Token {
    const t = this.current();
    if (t.type !== type || (value !== undefined && t.value !== value)) {
      throw new Error(
        `Expected ${type}${value ? `(${value})` : ""}, got ${t.type}(${t.value})`,
      );
    }
    this.pos++;
    return t;
  }

  private match(type: TokenType): boolean {
    return this.current().type === type;
  }

  // ---------------- Program ----------------
  public parse(): Program {
    const body: Statement[] = [];
    while (!this.match(TokenType.EOF)) {
      const stmt = this.parseStatement();
      if (stmt) body.push(stmt);
    }
    return { type: "Program", body };
  }

  private skipNewlines() {
    while (this.match(TokenType.NEWLINE)) this.pos++;
  }

  private skipComments() {
    while (this.match(TokenType.COMMENT)) {
      this.pos++;
      this.skipNewlines();
    }
  }

  // ---------------- Statements ----------------
  private parseStatement(): Statement | null {
    this.skipNewlines();
    this.skipComments();
    const t = this.current();

    if (t.type === TokenType.IDENTIFIER) {
      if (t.value === "print") return this.parsePrintStatement();

      const next = this.peek();
      if (next && next.type === TokenType.ASSIGN) return this.parseAssignment();

      return this.parseExpressionStatement();
    }

    if (t.type === TokenType.NUMBER || t.type === TokenType.STRING)
      return this.parseExpressionStatement();

    if (t.type === TokenType.NEWLINE) {
      this.pos++;
      return null;
    }

    throw new Error(`Unexpected token: ${t.type}`);
  }

  private parsePrintStatement(): ExpressionStatement {
    this.eat(TokenType.IDENTIFIER, "print");

    const args: Expression[] = [];
    while (!this.match(TokenType.NEWLINE) && !this.match(TokenType.EOF)) {
      args.push(this.parseExpression(0));
      if (this.match(TokenType.COMMA)) this.eat(TokenType.COMMA);
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
    const id = this.eat(TokenType.IDENTIFIER);
    this.eat(TokenType.ASSIGN);
    const right = this.parseExpression(0);
    this.skipNewlines();
    return {
      type: "Assignment",
      left: { type: "Identifier", name: id.value },
      right,
    };
  }

  private parseExpressionStatement(): ExpressionStatement {
    const expr = this.parseExpression(0);
    this.skipNewlines();
    return { type: "ExpressionStatement", expression: expr };
  }

  // -----------------------------------------------------
  // ---------------- Pratt Parsing Core -----------------
  // -----------------------------------------------------

  // Binding powers
  private lbp(type: TokenType): number {
    switch (type) {
      case TokenType.PLUS:
      case TokenType.MINUS:
        return 10;
      case TokenType.STAR:
      case TokenType.SLASH:
      case TokenType.MOD:
        return 20;
      default:
        return 0;
    }
  }

  // Prefix parse functions
  private parsePrefix(t: Token): Expression {
    switch (t.type) {
      case TokenType.NUMBER:
        return { type: "NumberLiteral", value: t.value };

      case TokenType.STRING:
        return { type: "StringLiteral", value: t.value };

      case TokenType.BOOLEAN:
        return { type: "BooleanLiteral", value: t.value };

      case TokenType.IDENTIFIER:
        return { type: "Identifier", name: t.value };

      case TokenType.LPAREN: {
        const expr = this.parseExpression(0);
        this.eat(TokenType.RPAREN);
        return expr;
      }

      default:
        throw new Error("Unexpected token in prefix: " + t.type);
    }
  }

  // Infix parse functions
  private parseInfix(left: Expression, t: Token): Expression {
    switch (t.type) {
      case TokenType.PLUS:
      case TokenType.MINUS:
      case TokenType.STAR:
      case TokenType.SLASH:
      case TokenType.MOD: {
        const right = this.parseExpression(this.lbp(t.type));
        return {
          type: "BinaryExpression",
          left,
          operator: t.value,
          right,
        };
      }

      case TokenType.LPAREN: {
        // function call
        const args: Expression[] = [];
        if (!this.match(TokenType.RPAREN)) {
          do {
            args.push(this.parseExpression(0));
          } while (this.match(TokenType.COMMA) && this.next());
        }
        this.eat(TokenType.RPAREN);
        return {
          type: "CallExpression",
          callee: left as Identifier,
          args,
        };
      }

      default:
        throw new Error("Unexpected infix token: " + t.type);
    }
  }

  // Pratt loop
  private parseExpression(minBP: number): Expression {
    const t = this.next();
    let left = this.parsePrefix(t);

    for (;;) {
      const op = this.current();
      const bp = this.lbp(op.type);
      if (bp <= minBP) break;

      this.next();
      left = this.parseInfix(left, op);
    }

    return left;
  }
}
