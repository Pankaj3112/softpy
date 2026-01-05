import { compile } from "./utils";

describe("Comments", () => {
  test("should ignore comments", () => {
    const input = `
# This is a comment
x = 10 # Inline comment
`;
    const output = compile(input);
    expect(output).toContain("let x = 10;");
    // Comments are not preserved in codegen currently, which is fine.
    // We just want to ensure they don't break compilation.
  });
});
