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

  test("generates if-elif-else statement", () => {
    const ast: Program = {
      type: "Program",
      body: [
        {
          type: "IfStatement",
          condition: { type: "Identifier", name: "x" },
          consequent: [
            {
              type: "ExpressionStatement",
              expression: {
                type: "CallExpression",
                callee: { type: "Identifier", name: "print" },
                args: [{ type: "StringLiteral", value: "x" }],
              },
            },
          ],
          alternate: [
            {
              type: "ElifClause",
              condition: { type: "Identifier", name: "y" },
              consequent: [
                {
                  type: "ExpressionStatement",
                  expression: {
                    type: "CallExpression",
                    callee: { type: "Identifier", name: "print" },
                    args: [{ type: "StringLiteral", value: "y" }],
                  },
                },
              ],
            },
            {
              type: "ElseClause",
              consequent: [
                {
                  type: "ExpressionStatement",
                  expression: {
                    type: "CallExpression",
                    callee: { type: "Identifier", name: "print" },
                    args: [{ type: "StringLiteral", value: "z" }],
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const generator = new CodeGenerator();
    const code = generator.generate(ast);

    expect(code).toBe(
      'if (x) {\n  console.log("x");\n} else if (y) {\n  console.log("y");\n} else {\n  console.log("z");\n}',
    );
  });

  test("generates nested if statement", () => {
    const ast: Program = {
      type: "Program",
      body: [
        {
          type: "IfStatement",
          condition: { type: "Identifier", name: "x" },
          consequent: [
            {
              type: "IfStatement",
              condition: { type: "Identifier", name: "y" },
              consequent: [
                {
                  type: "ExpressionStatement",
                  expression: {
                    type: "CallExpression",
                    callee: { type: "Identifier", name: "print" },
                    args: [{ type: "StringLiteral", value: "y" }],
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const generator = new CodeGenerator();
    const code = generator.generate(ast);

    expect(code).toBe('if (x) {\n  if (y) {\n    console.log("y");\n  }\n}');
  });
});
