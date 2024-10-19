const Rule = require("../models/ruleModel.js");

// Helper function to create an AST node
class Node {
  constructor(type, value = null, left = null, right = null) {
    this.type = type; // "operator" or "operand"
    this.value = value; // e.g., "age > 30"
    this.left = left; // Left child
    this.right = right; // Right child
  }
}

// Create rule API
exports.createRule = (req, res) => {
  const { ruleString, ruleName } = req.body;

  // Basic AST parsing (you would build a more complex parser for a real-world case)
  const ast = parseRuleToAST(ruleString);

  const newRule = new Rule({ ruleName, ast });
  newRule
    .save()
    .then((rule) => res.json(rule))
    .catch((err) => res.status(400).json("Error: " + err));
};

// Combine multiple rules into a single AST
exports.combineRules = (req, res) => {
  const { ruleStrings } = req.body;

  // Example logic for combining rules with an OR operator
  let combinedAST = ruleStrings.map(parseRuleToAST).reduce((acc, ast) => {
    return new Node("operator", "OR", acc, ast);
  });

  res.json({ combinedAST });
};

// Evaluate a rule against the user data
exports.evaluateRule = (req, res) => {
  const { ast, userData } = req.body;

  const result = evaluateAST(ast, userData);
  res.json({ result });
};

// Helper function to parse a rule string into AST
function parseRuleToAST(ruleString) {
  // For simplicity, this is just an example parser, you would need to build a robust one
  if (ruleString.includes("AND")) {
    const [left, right] = ruleString.split(" AND ");
    return new Node(
      "operator",
      "AND",
      new Node("operand", left),
      new Node("operand", right)
    );
  }
  if (ruleString.includes("OR")) {
    const [left, right] = ruleString.split(" OR ");
    return new Node(
      "operator",
      "OR",
      new Node("operand", left),
      new Node("operand", right)
    );
  }
  return new Node("operand", ruleString);
}

// Helper function to evaluate AST against user data
function evaluateAST(ast, data) {
  if (ast.type === "operand") {
    // Here we evaluate individual conditions, e.g., "age > 30"
    return evaluateCondition(ast.value, data);
  }
  if (ast.type === "operator") {
    if (ast.value === "AND") {
      return evaluateAST(ast.left, data) && evaluateAST(ast.right, data);
    }
    if (ast.value === "OR") {
      return evaluateAST(ast.left, data) || evaluateAST(ast.right, data);
    }
  }
}

function evaluateCondition(condition, data) {
  // Simplistic condition evaluation (this should be expanded for more complex rules)
  const [key, operator, value] = condition.split(" ");
  if (operator === ">") return data[key] > Number(value);
  if (operator === "<") return data[key] < Number(value);
  if (operator === "=") return data[key] === value;
  return false;
}
