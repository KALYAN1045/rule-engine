const mongoose = require("mongoose");

// Mongoose Schema for storing AST structure
const ruleSchema = new mongoose.Schema({
  ruleName: { type: String, required: true }, // 'ruleName' is required
  ast: { type: Object, required: true }, // AST for the rule
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Rule", ruleSchema);
