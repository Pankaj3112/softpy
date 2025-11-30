import { CodeGenerator } from "../src/codegen/codegen";
import { Program } from "../src/parser/ast";

describe("CodeGenerator", () => {
  test("generates assignment", () => {
    const ast: Program = {
      type: "Program",
      body: [
        {
          type: "Assignment",
          left: { type: "Identifier", name: "x" },
          right: { type: "NumberLiteral", value: "10" },
        },
      ],
    };

    const generator = new CodeGenerator();
    const code = generator.generate(ast);

    expect(code).toBe("let x = 10;");
  });

  test("generates binary expression", () => {
    const ast: Program = {
      type: "Program",
      body: [
        {
          type: "ExpressionStatement",
          expression: {
            type: "BinaryExpression",
            left: { type: "NumberLiteral", value: "10" },
            operator: "+",
            right: { type: "NumberLiteral", value: "20" },
          },
        },
      ],
    };

    const generator = new CodeGenerator();
    const code = generator.generate(ast);

    expect(code).toBe("10 + 20;");
  });

  test("generates print statement", () => {
    const ast: Program = {
      type: "Program",
      body: [
        {
          type: "ExpressionStatement",
          expression: {
            type: "CallExpression",
            callee: { type: "Identifier", name: "print" },
            args: [{ type: "StringLiteral", value: "Hello" }],
          },
        },
      ],
    };

    const generator = new CodeGenerator();
    const code = generator.generate(ast);

    expect(code).toBe('console.log("Hello");');
  });

  test("generates print statement with multiple args", () => {
    const ast: Program = {
      type: "Program",
      body: [
        {
          type: "ExpressionStatement",
          expression: {
            type: "CallExpression",
            callee: { type: "Identifier", name: "print" },
            args: [
              { type: "StringLiteral", value: "Hello" },
              { type: "NumberLiteral", value: "123" },
            ],
          },
        },
      ],
    };

    const generator = new CodeGenerator();
    const code = generator.generate(ast);

    expect(code).toBe('console.log("Hello", 123);');
  });

  test("generates generic function call", () => {
    const ast: Program = {
      type: "Program",
      body: [
        {
          type: "ExpressionStatement",
          expression: {
            type: "CallExpression",
            callee: { type: "Identifier", name: "myFunc" },
            args: [
              { type: "NumberLiteral", value: "1" },
              { type: "NumberLiteral", value: "2" },
            ],
          },
        },
      ],
    };

    const generator = new CodeGenerator();
    const code = generator.generate(ast);

    expect(code).toBe("myFunc(1, 2);");
  });

  test("generates multiple statements", () => {
    const ast: Program = {
      type: "Program",
      body: [
        {
          type: "Assignment",
          left: { type: "Identifier", name: "x" },
          right: { type: "NumberLiteral", value: "1" },
        },
        {
          type: "Assignment",
          left: { type: "Identifier", name: "y" },
          right: { type: "NumberLiteral", value: "2" },
        },
      ],
    };

    const generator = new CodeGenerator();
    const code = generator.generate(ast);

    expect(code).toBe("let x = 1;\nlet y = 2;");
  });
});
