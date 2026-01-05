import { compile } from "./utils";

describe("While Loops", () => {
  test("should compile basic while loop", () => {
    const input = `
while True:
  print("Looping")
`;
    const output = compile(input);
    expect(output).toContain("while (true) {");
    expect(output).toContain('  console.log("Looping");');
    expect(output).toContain("}");
  });

  test("should compile while loop with condition", () => {
    const input = `
while x < 10:
  print(x)
`;
    const output = compile(input);
    expect(output).toContain("while ((x < 10)) {");
    expect(output).toContain("  console.log(x);");
    expect(output).toContain("}");
  });
});
