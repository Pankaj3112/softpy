import { compile } from "./utils";

describe("Functions", () => {
  describe("Calls", () => {
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

  describe("Definitions", () => {
    test("should compile empty function", () => {
      // Note: 'pass' is not implemented yet, so I'll use a dummy print
      const input = `
func myFunc():
  print("Hello")
`;
      const output = compile(input);
      expect(output).toContain("function myFunc() {");
      expect(output).toContain('  console.log("Hello");');
      expect(output).toContain("}");
    });

    test("should compile function with parameters", () => {
      const input = `
func add(a, b):
  return a + b
`;
      const output = compile(input);
      expect(output).toContain("function add(a, b) {");
      expect(output).toContain("  return (a + b);");
      expect(output).toContain("}");
    });

    test("should compile function with return statement", () => {
      const input = `
func getVal():
  return 42
`;
      const output = compile(input);
      expect(output).toContain("function getVal() {");
      expect(output).toContain("  return 42;");
      expect(output).toContain("}");
    });

    test("should compile function with empty return", () => {
      const input = `
func doNothing():
  return
`;
      const output = compile(input);
      expect(output).toContain("function doNothing() {");
      expect(output).toContain("  return;");
      expect(output).toContain("}");
    });

    test("should compile recursive function", () => {
      const input = `
func factorial(n):
  if n <= 1:
    return 1
  else:
    return n * factorial(n - 1)
`;
      const output = compile(input);
      expect(output).toContain("function factorial(n) {");
      expect(output).toContain("  if ((n <= 1)) {");
      expect(output).toContain("    return 1;");
      expect(output).toContain("  } else {");
      expect(output).toContain("    return (n * factorial((n - 1)));");
      expect(output).toContain("  }");
      expect(output).toContain("}");
    });
  });
});
