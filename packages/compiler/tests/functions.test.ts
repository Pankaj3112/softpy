import { compile } from "./utils";

describe("Functions", () => {
  test("should compile function call", () => {
    const input = "myFunc(1, 2)";
    const output = compile(input);
    expect(output).toContain("myFunc(1, 2);");
  });

  test("should compile function call with no args", () => {
    const input = "myFunc()";
    const output = compile(input);
    expect(output).toContain("myFunc();");
  });

  test("should compile nested function calls", () => {
    const input = "myFunc(otherFunc(1))";
    const output = compile(input);
    expect(output).toContain("myFunc(otherFunc(1));");
  });
});
