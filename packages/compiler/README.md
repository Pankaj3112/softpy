# Softpy Compiler

Softpy is a Python-inspired language that compiles to JavaScript.

## Installation

You can install Softpy globally:

```bash
npm install -g @softpy/compiler
```

Or use it locally in a project:

```bash
npm install @softpy/compiler
npx softpy example.spy
```

---

## Usage

Create a `.spy` file with your code. For example, `example.spy`:

```spy
# Variables and arithmetic
x = 10
y = 5
z = x + y * 2

# Boolean logic
isValid = True and not False
hasValue = True or False

# Print statement (comma-separated)
print "Result:", z
print x, "+", y, "=", z

# Function calls
print(x, y, z)
```

Run it with:

```bash
softpy example.spy
```

---

## Language Features

### Data Types

- **Numbers**: `42`, `123`
- **Strings**: `"Hello, World!"`
- **Booleans**: `True`, `False`

### Variables

```spy
name = "Softpy"
version = 1
isActive = True
```

### Operators

**Arithmetic Operators:**

- Addition: `+`
- Subtraction: `-`
- Multiplication: `*`
- Division: `/`
- Modulo: `%`

```spy
result = 10 + 5 * 2  # Respects operator precedence
```

**Logical Operators:**

- AND: `and`
- OR: `or`
- NOT: `not`

```spy
x = True and False
y = not x or True
```

### Expressions

- **Parenthesized expressions** for grouping: `(x + y) * z`
- **Operator precedence**: Follows standard mathematical rules
- **Unary expressions**: `not isValid`

### Statements

**Print Statement:**

```spy
# Comma-separated values
print x, y, z

# Note: print(x, y) syntax not yet supported
```

**Function Calls:**

```spy
# Generic function call syntax
myFunc(arg1, arg2)
```

### Comments

```spy
# This is a single-line comment
x = 10  # Comments can be inline
```

---

## Compilation

Softpy compiles to JavaScript:

```spy
x = True and not False
print x
```

Compiles to:

```javascript
let x = true && !false;
console.log(x);
```

---

## Coming Soon

- Comparison operators: `==`, `!=`, `<`, `>`, `<=`, `>=`
- Control flow: `if`, `else`, `while`, `for`
- Function definitions: `func myFunc(x, y)`
- Lists and dictionaries
- More built-in functions

---

## License

MIT
