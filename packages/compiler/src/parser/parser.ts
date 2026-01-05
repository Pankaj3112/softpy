import {
  Program,
  Statement,
  Assignment,
  ExpressionStatement,
  Expression,
  Identifier,
  IfStatement,
  ElifClause,
  ElseClause,
  WhileStatement,
  ForStatement,
} from "./ast";
import { Token, TokenType } from "../lexer/token";

// ============================================================================
// Parselet Interfaces
// ============================================================================

interface PrefixParselet {
  parse(parser: Parser, token: Token): Expression;
}

interface InfixParselet {
  parse(parser: Parser, left: Expression, token: Token): Expression;
  getPrecedence(): number;
}

// ============================================================================
// Prefix Parselets
// ============================================================================

class LiteralParselet implements PrefixParselet {
  constructor(private literalType: string) {}

  parse(_parser: Parser, token: Token): Expression {
    return { type: this.literalType, value: token.value } as Expression;
  }
}

class IdentifierParselet implements PrefixParselet {
  parse(_parser: Parser, token: Token): Expression {
    return { type: "Identifier", name: token.value };
  }
}

class GroupParselet implements PrefixParselet {
  parse(parser: Parser, _token: Token): Expression {
    const expr = parser.parseExpression(0);
    parser.eat(TokenType.RPAREN);
    return expr;
  }
}

class UnaryParselet implements PrefixParselet {
  constructor(private precedence: number) {}

  parse(parser: Parser, token: Token): Expression {
    const right = parser.parseExpression(this.precedence);
    return {
      type: "UnaryExpression",
      operator: token.value,
      argument: right,
    };
  }
}

// ============================================================================
// Infix Parselets
// ============================================================================

class BinaryOpParselet implements InfixParselet {
  constructor(
    private precedence: number,
    private rightAssociative = false,
  ) {}

  getPrecedence(): number {
    return this.precedence;
  }

  parse(parser: Parser, left: Expression, token: Token): Expression {
    const adjustment = this.rightAssociative ? 1 : 0;
    const right = parser.parseExpression(this.precedence - adjustment);
    return {
      type: "BinaryExpression",
      left,
      operator: token.value,
      right,
    };
  }
}

class CallParselet implements InfixParselet {
  getPrecedence(): number {
    return Precedence.CALL;
  }

  parse(parser: Parser, left: Expression, _token: Token): Expression {
    const args: Expression[] = [];

    if (!parser.match(TokenType.RPAREN)) {
      do {
        if (parser.match(TokenType.COMMA)) {
          parser.eat(TokenType.COMMA);
        }
        args.push(parser.parseExpression(0));
      } while (parser.match(TokenType.COMMA));
    }

    parser.eat(TokenType.RPAREN);

    return {
      type: "CallExpression",
      callee: left as Identifier,
      args,
    };
  }
}

// ============================================================================
// Precedence Levels
// ============================================================================

enum Precedence {
  LOWEST = 0,
  OR = 4,
  AND = 5,
  COMPARISON = 8,
  ADDITIVE = 10,
  MULTIPLICATIVE = 20,
  UNARY = 30,
  CALL = 100,
}

// ============================================================================
// Statement Parser Type
// ============================================================================

type StatementParser = (parser: Parser) => Statement;

// ============================================================================
// Main Parser Class
// ============================================================================

export class Parser {
  private tokens: Token[];
  private pos = 0;

  private prefixParselets = new Map<TokenType, PrefixParselet>();
  private infixParselets = new Map<TokenType, InfixParselet>();
  private statementParsers = new Map<string, StatementParser>();

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.registerDefaultParselets();
    this.registerDefaultStatements();
  }

  // ============================================================================
  // Registration Methods
  // ============================================================================

  private registerDefaultParselets() {
    // Literals
    this.registerPrefix(TokenType.NUMBER, new LiteralParselet("NumberLiteral"));
    this.registerPrefix(TokenType.STRING, new LiteralParselet("StringLiteral"));
    this.registerPrefix(
      TokenType.BOOLEAN,
      new LiteralParselet("BooleanLiteral"),
    );

    // Identifiers and grouping
    this.registerPrefix(TokenType.IDENTIFIER, new IdentifierParselet());
    this.registerPrefix(TokenType.LPAREN, new GroupParselet());

    // Unary operators
    this.registerPrefix(TokenType.NOT, new UnaryParselet(Precedence.UNARY));
    this.registerPrefix(TokenType.PLUS, new UnaryParselet(Precedence.UNARY));
    this.registerPrefix(TokenType.MINUS, new UnaryParselet(Precedence.UNARY));
    this.registerPrefix(
      TokenType.BITWISE_NOT,
      new UnaryParselet(Precedence.UNARY),
    );

    // Logical operators
    this.registerInfix(TokenType.OR, new BinaryOpParselet(Precedence.OR));
    this.registerInfix(TokenType.AND, new BinaryOpParselet(Precedence.AND));

    // Comparison operators
    const comparisonOps = [
      TokenType.GT,
      TokenType.LT,
      TokenType.GTE,
      TokenType.LTE,
      TokenType.EQUAL,
      TokenType.NOT_EQUAL,
    ];
    comparisonOps.forEach((op) => {
      this.registerInfix(op, new BinaryOpParselet(Precedence.COMPARISON));
    });

    // Arithmetic operators
    const additiveOps = [TokenType.PLUS, TokenType.MINUS];
    additiveOps.forEach((op) => {
      this.registerInfix(op, new BinaryOpParselet(Precedence.ADDITIVE));
    });

    const multiplicativeOps = [TokenType.STAR, TokenType.SLASH, TokenType.MOD];
    multiplicativeOps.forEach((op) => {
      this.registerInfix(op, new BinaryOpParselet(Precedence.MULTIPLICATIVE));
    });

    // Function calls
    this.registerInfix(TokenType.LPAREN, new CallParselet());
  }

  private registerDefaultStatements() {
    this.registerStatement("print", this.parsePrintStatement.bind(this));
  }

  public registerPrefix(type: TokenType, parselet: PrefixParselet) {
    this.prefixParselets.set(type, parselet);
  }

  public registerInfix(type: TokenType, parselet: InfixParselet) {
    this.infixParselets.set(type, parselet);
  }

  public registerStatement(keyword: string, parser: StatementParser) {
    this.statementParsers.set(keyword, parser);
  }

  // ============================================================================
  // Token Navigation
  // ============================================================================

  private current(): Token {
    return (
      this.tokens[this.pos] ?? {
        type: TokenType.EOF,
        value: "",
        line: 0,
        column: 0,
      }
    );
  }

  private next(): Token {
    const token = this.current();
    this.pos++;
    return token;
  }

  private peek(offset = 1): Token | null {
    return this.tokens[this.pos + offset] ?? null;
  }

  public eat(type: TokenType, value?: string): Token {
    const token = this.current();
    if (token.type !== type || (value !== undefined && token.value !== value)) {
      throw new Error(
        `Expected ${type}${value ? ` '${value}'` : ""} at line ${token.line}, got ${token.type} '${token.value}'`,
      );
    }
    this.pos++;
    return token;
  }

  public match(type: TokenType): boolean {
    return this.current().type === type;
  }

  private isAtEnd(): boolean {
    return this.current().type === TokenType.EOF;
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private skipTrivia() {
    while (this.match(TokenType.NEWLINE) || this.match(TokenType.COMMENT)) {
      this.pos++;
    }
  }

  // ============================================================================
  // Entry Point
  // ============================================================================

  public parse(): Program {
    const body: Statement[] = [];
    while (!this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) body.push(stmt);
    }
    return { type: "Program", body };
  }

  // ============================================================================
  // Statement Parsing
  // ============================================================================

  private parseStatement(): Statement | null {
    this.skipTrivia();

    if (this.isAtEnd()) return null;

    const token = this.current();

    // Control flow statements
    if (token.type === TokenType.IF) {
      return this.parseIfStatement();
    }

    if (token.type === TokenType.WHILE) {
      return this.parseWhileStatement();
    }

    if (token.type === TokenType.FOR) {
      return this.parseForStatement();
    }

    // Identifier-based statements
    if (token.type === TokenType.IDENTIFIER) {
      // Check for registered statement keywords (like 'print')
      const parser = this.statementParsers.get(token.value);
      if (parser) {
        return parser(this);
      }

      // Check for assignment
      const next = this.peek();
      if (next?.type === TokenType.ASSIGN) {
        return this.parseAssignment();
      }

      // Fall through to expression statement
      return this.parseExpressionStatement();
    }

    // Expression statements
    if (this.prefixParselets.has(token.type)) {
      return this.parseExpressionStatement();
    }

    // Skip stray newlines
    if (token.type === TokenType.NEWLINE) {
      this.pos++;
      return null;
    }

    throw new Error(`Unexpected token ${token.type} at line ${token.line}`);
  }

  private parsePrintStatement(parser: Parser): ExpressionStatement {
    parser.eat(TokenType.IDENTIFIER, "print");

    const args: Expression[] = [];
    while (!parser.match(TokenType.NEWLINE) && !parser.isAtEnd()) {
      args.push(parser.parseExpression(Precedence.LOWEST));
      if (parser.match(TokenType.COMMA)) {
        parser.eat(TokenType.COMMA);
      } else {
        break;
      }
    }

    parser.skipTrivia();

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
    const identifier = this.eat(TokenType.IDENTIFIER);
    this.eat(TokenType.ASSIGN);
    const right = this.parseExpression(Precedence.LOWEST);
    this.skipTrivia();

    return {
      type: "Assignment",
      left: { type: "Identifier", name: identifier.value },
      right,
    };
  }

  private parseExpressionStatement(): ExpressionStatement {
    const expr = this.parseExpression(Precedence.LOWEST);
    this.skipTrivia();
    return { type: "ExpressionStatement", expression: expr };
  }

  private parseBlock(): Statement[] {
    if (!this.match(TokenType.INDENT)) {
      throw new Error(`Expected indented block at line ${this.current().line}`);
    }
    this.eat(TokenType.INDENT);

    const statements: Statement[] = [];
    while (!this.match(TokenType.DEDENT) && !this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) statements.push(stmt);
    }

    this.eat(TokenType.DEDENT);
    return statements;
  }

  private parseIfStatement(): IfStatement {
    this.eat(TokenType.IF);

    const condition = this.parseExpression(Precedence.LOWEST);
    this.eat(TokenType.COLON);
    this.skipTrivia();

    const consequent = this.parseBlock();

    const alternate: (ElifClause | ElseClause)[] = [];

    // Parse elif clauses
    while (this.match(TokenType.ELIF)) {
      this.eat(TokenType.ELIF);
      const elifCondition = this.parseExpression(Precedence.LOWEST);
      this.eat(TokenType.COLON);
      this.skipTrivia();

      const elifConsequent = this.parseBlock();

      alternate.push({
        type: "ElifClause",
        condition: elifCondition,
        consequent: elifConsequent,
      });
    }

    // Parse else clause
    if (this.match(TokenType.ELSE)) {
      this.eat(TokenType.ELSE);
      this.eat(TokenType.COLON);
      this.skipTrivia();

      const elseConsequent = this.parseBlock();

      alternate.push({
        type: "ElseClause",
        consequent: elseConsequent,
      });
    }

    return {
      type: "IfStatement",
      condition,
      consequent,
      alternate: alternate.length > 0 ? alternate : undefined,
    };
  }

  private parseWhileStatement(): WhileStatement {
    this.eat(TokenType.WHILE);
    const condition = this.parseExpression(Precedence.LOWEST);
    this.eat(TokenType.COLON);
    this.skipTrivia();

    const body = this.parseBlock();

    return {
      type: "WhileStatement",
      condition,
      body,
    };
  }

  private parseForStatement(): ForStatement {
    this.eat(TokenType.FOR);
    const variable = this.eat(TokenType.IDENTIFIER);
    this.eat(TokenType.IN);
    const iterable = this.parseExpression(Precedence.LOWEST);
    this.eat(TokenType.COLON);
    this.skipTrivia();

    const body = this.parseBlock();

    return {
      type: "ForStatement",
      variable: { type: "Identifier", name: variable.value },
      iterable,
      body,
    };
  }

  // ============================================================================
  // Expression Parsing - Pratt Parser
  // ============================================================================

  public parseExpression(minPrecedence: number): Expression {
    const token = this.next();
    const prefix = this.prefixParselets.get(token.type);

    if (!prefix) {
      throw new Error(
        `No prefix parselet for ${token.type} at line ${token.line}`,
      );
    }

    let left = prefix.parse(this, token);

    while (!this.isAtEnd()) {
      const op = this.current();
      const infix = this.infixParselets.get(op.type);

      if (!infix || infix.getPrecedence() <= minPrecedence) {
        break;
      }

      this.next();
      left = infix.parse(this, left, op);
    }

    return left;
  }
}
