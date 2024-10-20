const express = require("express");
const router = express.Router();
const {
  createRule,
  combineRules,
  evaluateAllRules, 
  modifyRule,
  getAllRules,
  getRule,
  deleteRule,
} = require("../controllers/ruleController.js");

// API routes
router.post("/create", createRule);
router.post("/combine", combineRules);
router.post("/evaluateAll", evaluateAllRules); 
router.post("/modify", modifyRule);
router.get("/", getAllRules);
router.get("/:ruleName", getRule);
router.delete("/:ruleName", deleteRule);

module.exports = router;
