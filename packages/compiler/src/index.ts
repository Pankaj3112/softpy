import { Lexer } from "./lexer/lexer";
import { Parser } from "./parser/parser";
import { CodeGenerator } from "./codegen/codegen";
import { Token, TokenType } from "./lexer/token";
import { Program } from "./parser/ast";

export { Lexer, Parser, CodeGenerator, TokenType };
export type { Token, Program };

export interface CompileResult {
  code: string;
  tokens?: Token[] | undefined;
  ast?: Program | undefined;
}

export interface CompileOptions {
  debug?: boolean;
}

export function compile(
  source: string,
  options: CompileOptions = {},
): CompileResult {
  // 1. Lexing
  const lexer = new Lexer(source);
  const tokens: Token[] = [];
  let token: Token;

  do {
    token = lexer.getNextToken();
    tokens.push(token);
  } while (token.type !== TokenType.EOF);

  // 2. Parsing
  const parser = new Parser(tokens);
  const ast = parser.parse();

  // 3. Code Generation
  const generator = new CodeGenerator();
  const output = generator.generate(ast);

  return {
    code: output,
    tokens: options.debug ? tokens : undefined,
    ast: options.debug ? ast : undefined,
  };
}
