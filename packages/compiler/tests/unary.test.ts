import { compile } from "./utils";

describe("Unary Operators Integration", () => {
  test("should compile logical NOT", () => {
    const input = "print(not True)";
    const output = compile(input);
    expect(output).toContain("console.log(!true);");
  });

  test("should compile unary minus", () => {
    const input = "print(-1)";
    const output = compile(input);
    expect(output).toContain("console.log(-1);");
  });

  test("should compile unary plus", () => {
    const input = "print(+1)";
    const output = compile(input);
    expect(output).toContain("console.log(+1);");
  });

  test("should compile bitwise NOT", () => {
    const input = "print(~1)";
    const output = compile(input);
    expect(output).toContain("console.log(~1);");
  });

  test("should compile nested unary operators", () => {
    const input = "print(- -1)";
    const output = compile(input);
    expect(output).toContain("console.log(--1)");
  });
});
