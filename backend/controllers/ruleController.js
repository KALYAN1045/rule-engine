const Rule = require("../models/ruleModel.js");

// Valid attributes for rule conditions
const validAttributes = ['age', 'department', 'salary', 'experience', 'spend'];

// Define attribute types
const attributeTypes = {
  age: 'number',
  department: 'string',
  salary: 'number',
  experience: 'number',
  spend: 'number',
};

// Store for user-defined functions
const userDefinedFunctions = {};

class Node {
  constructor(type, value = null, left = null, right = null) {
    this.type = type;
    this.value = value; 
    this.left = left;
    this.right = right; 
  }
}

// Tokenizer Function
function tokenize(ruleString) {
  const tokens = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < ruleString.length; i++) {
    const char = ruleString[i];

    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
      current += char;
    } else if (!inQuotes && ('()'.includes(char) || char === ' ')) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      if ('()'.includes(char)) {
        tokens.push(char);
      }
    } else {
      current += char;
    }
  }

  if (current) tokens.push(current);
  return tokens;
}

// AST Builder Function
function buildAST(tokens) {
  const operatorStack = [];
  const nodeStack = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token === '(') {
      operatorStack.push(token);
      i++;
    } else if (token === ')') {
      while (operatorStack.length && operatorStack[operatorStack.length - 1] !== '(') {
        const operator = operatorStack.pop();
        const right = nodeStack.pop();
        const left = nodeStack.pop();
        nodeStack.push(new Node('operator', operator, left, right));
      }
      operatorStack.pop(); // Remove '('
      i++;
    } else if (['AND', 'OR'].includes(token.toUpperCase())) {
      const upperToken = token.toUpperCase();
      while (
        operatorStack.length &&
        ['AND', 'OR'].includes(operatorStack[operatorStack.length - 1])
      ) {
        const operator = operatorStack.pop();
        const right = nodeStack.pop();
        const left = nodeStack.pop();
        nodeStack.push(new Node('operator', operator, left, right));
      }
      operatorStack.push(upperToken);
      i++;
    } else {
      const key = token;
      const operator = tokens[i + 1];
      const value = tokens[i + 2];

      if (!operator || !value) {
        throw new Error('Invalid condition expression');
      }

      const condition = `${key} ${operator} ${value}`;
      nodeStack.push(new Node('operand', condition));
      i += 3;
    }
  }

  while (operatorStack.length) {
    const operator = operatorStack.pop();
    const right = nodeStack.pop();
    const left = nodeStack.pop();
    nodeStack.push(new Node('operator', operator, left, right));
  }

  if (nodeStack.length !== 1) {
    throw new Error('Invalid AST structure');
  }

  return nodeStack[0];
}

// Parse Rule to AST
function parseRuleToAST(ruleString) {
  const tokens = tokenize(ruleString);
  return buildAST(tokens);
}

// Validate AST
function validateRule(ast) {
  if (ast.type === 'operand') {
    const [attribute, operator, ...valueParts] = ast.value.split(' ');
    const value = valueParts.join(' ');
    if (!validAttributes.includes(attribute)) {
      throw new Error(`Invalid attribute: ${attribute}`);
    }
    if (!['>', '<', '=', '>=', '<=', '!='].includes(operator)) {
      throw new Error(`Invalid operator: ${operator}`);
    }
    const expectedType = attributeTypes[attribute];

    if (expectedType === 'number') {
      const numValue = Number(value.replace(/^['"]|['"]$/g, ''));
      if (isNaN(numValue)) {
        throw new Error(`Invalid numeric value: ${value} for attribute: ${attribute}`);
      }
    } else if (expectedType === 'string') {
      const trimmedValue = value.replace(/^['"]|['"]$/g, ''); 
      if (trimmedValue.length === 0) {
        throw new Error(`Invalid string value: ${value} for attribute: ${attribute}`);
      }
    } else {
      throw new Error(`Unsupported attribute type: ${expectedType} for attribute: ${attribute}`);
    }
  } else if (ast.type === 'operator') {
    if (!['AND', 'OR'].includes(ast.value)) {
      throw new Error(`Invalid operator: ${ast.value}`);
    }
    validateRule(ast.left);
    validateRule(ast.right);
  } else {
    throw new Error(`Invalid node type: ${ast.type}`);
  }
}

// Evaluate AST
function evaluateAST(ast, data) {
  if (ast.type === "operand") {
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
  throw new Error("Invalid AST node");
}

// Evaluate Condition
function evaluateCondition(condition, data) {
  if (condition.includes('(')) {
    const [funcName, argsWithParen] = condition.split('(');
    const args = argsWithParen.slice(0, -1); 
    if (userDefinedFunctions[funcName]) {
      return userDefinedFunctions[funcName](data);
    }
    throw new Error(`Undefined function: ${funcName}`);
  }

  const [key, operator, ...valueParts] = condition.split(' ');
  const value = valueParts.join(' ').replace(/^['"]|['"]$/g, ''); 

  if (!validAttributes.includes(key)) {
    throw new Error(`Invalid attribute: ${key}`);
  }
  if (!data.hasOwnProperty(key)) {
    throw new Error(`Missing data for attribute: ${key}`);
  }

  const dataValue = data[key];
  let compareValue;

  const expectedType = attributeTypes[key];

  if (expectedType === 'number') {
    compareValue = Number(value);
    if (isNaN(compareValue)) {
      throw new Error(`Invalid numeric value: ${value} for attribute: ${key}`);
    }
  } else if (expectedType === 'string') {
    compareValue = value;
  } else {
    throw new Error(`Unsupported attribute type: ${expectedType} for attribute: ${key}`);
  }

  switch (operator) {
    case '>':
      return dataValue > compareValue;
    case '<':
      return dataValue < compareValue;
    case '>=':
      return dataValue >= compareValue;
    case '<=':
      return dataValue <= compareValue;
    case '=':
      return dataValue == compareValue; 
    case '!=':
      return dataValue != compareValue;
    default:
      throw new Error(`Invalid operator: ${operator}`);
  }
}

// Create Rule
exports.createRule = async (req, res) => {
  try {
    const { ruleString, ruleName } = req.body;

    if (!ruleName || !ruleString) {
      return res.status(400).json({ error: "Rule name and Rule string are required." });
    }

    const ast = parseRuleToAST(ruleString);
    validateRule(ast);

    const existingRule = await Rule.findOne({ ruleName });
    if (existingRule) {
      return res.status(400).json({ error: "Rule name already exists." });
    }

    const newRule = new Rule({ ruleName, ast });
    const savedRule = await newRule.save();
    res.json(savedRule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Modify Rule
exports.modifyRule = async (req, res) => {
  try {
    const { ruleName, ruleString } = req.body;

    if (!ruleName || !ruleString) {
      return res.status(400).json({ error: "Rule name and rule string are required." });
    }

    const newAST = parseRuleToAST(ruleString);
    validateRule(newAST);

    const updatedRule = await Rule.findOneAndUpdate(
      { ruleName },
      { ast: newAST },
      { new: true }
    );

    if (!updatedRule) {
      return res.status(404).json({ error: "Rule not found" });
    }

    res.json(updatedRule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Combine Rules
exports.combineRules = async (req, res) => {
  try {
    const { ruleNames } = req.body;

    if (!ruleNames || !Array.isArray(ruleNames) || ruleNames.length === 0) {
      return res.status(400).json({ error: "No rules selected for combination." });
    }

    const rules = await Rule.find({ ruleName: { $in: ruleNames } });

    if (rules.length !== ruleNames.length) {
      return res.status(404).json({ error: "One or more rules not found." });
    }

    const combinedAST = rules.reduce((acc, rule, index) => {
      if (index === 0) {
        return rule.ast;
      }
      return new Node("operator", "OR", acc, rule.ast);
    }, null);

    const combinedRuleName = `Combined: ${ruleNames.join(" + ")}`;

    const existingCombinedRule = await Rule.findOne({ ruleName: combinedRuleName });
    if (existingCombinedRule) {
      return res.status(400).json({ error: "A combined rule with the selected rules already exists." });
    }

    const newCombinedRule = new Rule({
      ruleName: combinedRuleName,
      ast: combinedAST,
    });

    const savedCombinedRule = await newCombinedRule.save();

    res.json(savedCombinedRule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.evaluateAllRules = async (req, res) => {
  try {
    const { userData } = req.body;

    if (!userData) {
      return res.status(400).json({ error: "User data is required." });
    }

    // Fetch all rules from the database
    const rules = await Rule.find({});

    if (rules.length === 0) {
      return res.status(404).json({ error: "No rules found in the system." });
    }

    const evaluationResults = [];

    // Iterate through each rule and evaluate
    for (const rule of rules) {
      try {
        const result = evaluateAST(rule.ast, userData);
        evaluationResults.push({
          ruleName: rule.ruleName,
          passed: result,
        });
      } catch (evaluationError) {
        evaluationResults.push({
          ruleName: rule.ruleName,
          passed: false,
          error: evaluationError.message,
        });
      }
    }

    const isEligible = evaluationResults.every(rule => rule.passed);

    res.json({ 
      isEligible, 
      details: evaluationResults 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Rules
exports.getAllRules = async (req, res) => {
  try {
    const rules = await Rule.find({}, 'ruleName');
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Specific Rule
exports.getRule = async (req, res) => {
  try {
    const { ruleName } = req.params;
    const rule = await Rule.findOne({ ruleName });
    if (!rule) {
      return res.status(404).json({ error: "Rule not found." });
    }
    res.json(rule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Rule
exports.deleteRule = async (req, res) => {
  try {
    const { ruleName } = req.params;
    const deletedRule = await Rule.findOneAndDelete({ ruleName });
    if (!deletedRule) {
      return res.status(404).json({ error: "Rule not found." });
    }
    res.json({ message: "Rule deleted successfully." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
