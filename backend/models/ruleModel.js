const mongoose = require("mongoose");

const nodeSchema = new mongoose.Schema({
  type: { type: String, enum: ['operator', 'operand'], required: true },
  value: { type: String, required: true },
  left: { type: this },
  right: { type: this }
});

const ruleSchema = new mongoose.Schema({
  ruleName: { type: String, required: true, unique: true },
  ast: nodeSchema,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Rule", ruleSchema);
