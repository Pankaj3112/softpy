import { compile } from "./utils";

describe("Literals", () => {
  test("should compile number literals", () => {
    const input = "print(123)";
    const output = compile(input);
    expect(output).toContain("console.log(123);");
  });

  test("should compile string literals", () => {
    const input = 'print("Hello World")';
    const output = compile(input);
    expect(output).toContain('console.log("Hello World");');
  });

  test("should compile boolean literals", () => {
    const input = "print True, False";
    const output = compile(input);
    expect(output).toContain("console.log(true, false);");
  });
});
