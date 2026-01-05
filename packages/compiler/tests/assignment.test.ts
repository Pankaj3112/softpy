import { compile } from "./utils";

describe("Assignment", () => {
  test("should compile assignment", () => {
    const input = "x = 10";
    const output = compile(input);
    expect(output).toContain("var x = 10;");
  });

  test("should compile assignment with expression", () => {
    const input = "x = 10 + 20";
    const output = compile(input);
    expect(output).toContain("var x = (10 + 20);");
  });
});
