import { Lexer } from "../src/lexer/lexer";
import { Parser } from "../src/parser/parser";
import { CodeGenerator } from "../src/codegen/codegen";

export function compile(input: string): string {
  const lexer = new Lexer(input);
  const tokens = [];
  let token;
  do {
    token = lexer.getNextToken();
    tokens.push(token);
  } while (token.type !== "EOF");

  const parser = new Parser(tokens);
  const ast = parser.parse();

  const codegen = new CodeGenerator();
  return codegen.generate(ast);
}
