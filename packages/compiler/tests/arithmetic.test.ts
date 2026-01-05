import { compile } from "./utils";

describe("Arithmetic Operators", () => {
  test("should compile addition", () => {
    const input = "print(1 + 2)";
    const output = compile(input);
    expect(output).toContain("console.log((1 + 2));");
  });

  test("should compile subtraction", () => {
    const input = "print(1 - 2)";
    const output = compile(input);
    expect(output).toContain("console.log((1 - 2));");
  });

  test("should compile multiplication", () => {
    const input = "print(2 * 3)";
    const output = compile(input);
    expect(output).toContain("console.log((2 * 3));");
  });

  test("should compile division", () => {
    const input = "print(4 / 2)";
    const output = compile(input);
    expect(output).toContain("console.log((4 / 2));");
  });

  test("should compile modulo", () => {
    const input = "print(5 % 2)";
    const output = compile(input);
    expect(output).toContain("console.log((5 % 2));");
  });

  test("should respect precedence", () => {
    const input = "print(1 + 2 * 3)";
    const output = compile(input);
    expect(output).toContain("console.log((1 + (2 * 3)));");
  });

  test("should respect parentheses", () => {
    const input = "print((1 + 2) * 3)";
    const output = compile(input);
    // The parser might add extra parens or not, depending on implementation.
    // Based on codegen.ts: `(${left} ${node.operator} ${right})`
    // And GroupParselet just returns the inner expression.
    // So (1+2) becomes a BinaryExpression.
    // Then that is the left of * 3.
    // So ((1 + 2) * 3)
    expect(output).toContain("console.log(((1 + 2) * 3));");
  });
});
