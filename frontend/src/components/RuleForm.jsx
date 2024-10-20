// RuleForm.jsx
import React, { useState, useEffect, useRef } from "react";
import "./RuleForm.css";
import axios from "axios";
import Tree from "react-d3-tree";
import { FaTrash, FaPlus } from "react-icons/fa"; 

const RuleForm = () => {
  const [ruleName, setRuleName] = useState("");
  const [ruleString, setRuleString] = useState("");
  const [userData, setUserData] = useState({
    age: "",
    department: "",
    salary: "",
    experience: "",
    spend: "",
  });
  const [rules, setRules] = useState([]);
  const [selectedRules, setSelectedRules] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [astData, setAstData] = useState(null);
  const treeContainerRef = useRef(null); 

  useEffect(() => {
    fetchRules();
  }, []);

  useEffect(() => {
    if (error || message) {
      const timer = setTimeout(() => {
        setError("");
        setMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, message]);

  const fetchRules = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/rules");
      setRules(response.data);
    } catch {
      setError("Failed to fetch rules");
    }
  };

  const handleCreateRule = async () => {
    if (!ruleName.trim() || !ruleString.trim()) {
      setError("Rule name and rule string cannot be empty.");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/rules/create", {
        ruleName,
        ruleString,
      });
      setRuleName("");
      setRuleString("");
      setMessage("Rule created successfully");
      fetchRules();
      if (res.data.ast) {
        const transformedAST = transformAST(res.data.ast);
        setAstData(transformedAST);
        scrollToTree();
      } else {
        setError("AST data is missing in the response.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create rule");
    }
  };

  const handleModifyRule = async () => {
    if (!ruleName.trim() || !ruleString.trim()) {
      setError("Rule name and rule string cannot be empty.");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/rules/modify", {
        ruleName,
        ruleString,
      });
      setRuleName("");
      setRuleString("");
      setMessage("Rule modified successfully");
      fetchRules();
      if (res.data.ast) {
        const transformedAST = transformAST(res.data.ast);
        setAstData(transformedAST);
        scrollToTree();
      } else {
        setError("AST data is missing in the response.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to modify rule");
    }
  };

  const handleEvaluateRule = async () => {
    const { age, department, salary, experience, spend } = userData;
    if (
      age === "" ||
      department.trim() === "" ||
      salary === "" ||
      experience === "" ||
      spend === ""
    ) {
      setError("All user data fields are required for evaluation.");
      setMessage("");
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:5000/api/rules/evaluateAll",
        {
          userData: {
            age: Number(age),
            department: department.trim(),
            salary: Number(salary),
            experience: Number(experience),
            spend: Number(spend),
          },
        }
      );
      const eligibilityMessage = res.data.isEligible
        ? "Eligible"
        : "Not Eligible";
      setMessage(`You are ${eligibilityMessage}`);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to evaluate rules");
      setMessage("");
    }
  };

  const handleCombineRules = async () => {
    if (selectedRules.length < 2) {
      setError("Please select at least two rules to combine.");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/rules/combine", {
        ruleNames: selectedRules,
      });
      setMessage("Rules combined successfully");
      setSelectedRules([]);
      fetchRules();
      if (res.data.ast) {
        const transformedAST = transformAST(res.data.ast);
        setAstData(transformedAST);
        scrollToTree();
      } else {
        setError("AST data is missing in the response.");
        setAstData(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to combine rules");
      setAstData(null);
    }
  };

  const handleDeleteRule = async (ruleNameToDelete) => {
    if (
      !window.confirm(
        `Are you sure you want to delete rule "${ruleNameToDelete}"?`
      )
    ) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/rules/${ruleNameToDelete}`);
      setMessage("Rule deleted successfully");
      fetchRules();
      if (astData && astData.name === ruleNameToDelete) {
        setAstData(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete rule");
    }
  };

  const dismissNotification = () => {
    setError("");
    setMessage("");
  };

  const transformAST = (ast) => {
    if (!ast) return null;

    const traverse = (node) => {
      if (!node) return null;

      const transformedNode = {
        name: node.value || "Undefined",
      };

      const children = [];

      // Adjust these based on your actual AST structure
      if (node.left) children.push(traverse(node.left));
      if (node.right) children.push(traverse(node.right));
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child) => children.push(traverse(child)));
      }

      if (children.length > 0) {
        transformedNode.children = children;
      }

      return transformedNode;
    };

    return traverse(ast);
  };

  const scrollToTree = () => {
    if (treeContainerRef.current) {
      treeContainerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCheckboxChange = (ruleName) => {
    if (selectedRules.includes(ruleName)) {
      setSelectedRules(selectedRules.filter((name) => name !== ruleName));
    } else {
      setSelectedRules([...selectedRules, ruleName]);
    }
  };

  const renderRectSvgNode = ({ nodeDatum, toggleNode }) => (
    <g>
      <rect
        width="200"
        height="80"
        x="-100"
        y="-40"
        rx="5"
        ry="5"
        fill="rgb(149, 188, 239)"
        stroke="#4a5568"
        strokeWidth="2"
        onClick={toggleNode}
      />
      <text
        fill="#2d3748"
        strokeWidth="1"
        x="-90"
        y="0"
        dy=".35em"
        fontSize="14"
        textAnchor="start"
      >
        {nodeDatum.name}
      </text>
      {nodeDatum.attributes?.department && (
        <text fill="#4a5568" x="-90" y="20" dy=".35em" fontSize="12">
          Dept: {nodeDatum.attributes.department}
        </text>
      )}
    </g>
  );

  return (
    <div className="main-container">
      {(error || message) && (
        <div className={`notification ${error ? "error" : "message"}`}>
          <span>{error || message}</span>
          <button className="close-button" onClick={dismissNotification}>
            &times;
          </button>
        </div>
      )}
      <div className="left-column">
        <h2>Create/Modify Rule</h2>
        <input
          type="text"
          placeholder="Enter rule name"
          value={ruleName}
          onChange={(e) => setRuleName(e.target.value)}
        />
        <input
          type="text"
          placeholder='Enter rule (e.g., age > 30 AND department = "Sales")'
          value={ruleString}
          onChange={(e) => setRuleString(e.target.value)}
        />
        <div className="buttons-container">
          <button onClick={handleCreateRule} className="create">
            Create Rule
          </button>
          <button onClick={handleModifyRule} className="modify">
            Modify Rule
          </button>
        </div>

        <h2>Evaluate Rules</h2>
        <input
          type="number"
          placeholder="Age"
          value={userData.age}
          onChange={(e) => setUserData({ ...userData, age: e.target.value })}
        />
        <input
          type="text"
          placeholder="Department"
          value={userData.department}
          onChange={(e) =>
            setUserData({ ...userData, department: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Salary"
          value={userData.salary}
          onChange={(e) => setUserData({ ...userData, salary: e.target.value })}
        />
        <input
          type="number"
          placeholder="Experience"
          value={userData.experience}
          onChange={(e) =>
            setUserData({ ...userData, experience: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Spend"
          value={userData.spend}
          onChange={(e) => setUserData({ ...userData, spend: e.target.value })}
        />
        <button onClick={handleEvaluateRule} className="evaluate">
          Evaluate Rules
        </button>
      </div>

      <div className="middle-column" ref={treeContainerRef}>
        <h2>AST Visualization (Select from Existing Rules)</h2>
        <div className="tree-container">
          {astData ? (
            <Tree
              data={astData}
              orientation="vertical"
              renderCustomNodeElement={renderRectSvgNode}
              translate={{ x: 280, y: 100 }}
              separation={{ siblings: 2, nonSiblings: 2.5 }}
              zoomable={true}
              collapsible={false}
              pathFunc="step"
              nodeSize={{ x: 150, y: 150 }}
            />
          ) : (
            <p>
              No AST to display. Create or select a rule to visualize its AST.
            </p>
          )}
        </div>
      </div>

      <div className="right-column">
        <div className="combine-rules-section">
          <h2>Combine Rules</h2>
          <div className="rule-list-container">
            <ul className="rule-list">
              {rules.map((rule) => (
                <li
                  key={rule.ruleName}
                  onClick={() => handleCheckboxChange(rule.ruleName)}
                >
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedRules.includes(rule.ruleName)}
                      onChange={() => {}} 
                    />
                    <span className="rule-name">{rule.ruleName}</span>
                  </label>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); 
                      handleDeleteRule(rule.ruleName);
                    }}
                    className="delete-rule"
                    title={`Delete ${rule.ruleName}`}
                  >
                    <FaTrash style={{ marginRight: "5px" }} /> Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="combine-button-container">
            <button onClick={handleCombineRules} className="combine">
              Combine Selected Rules
            </button>
          </div>
        </div>

        <div className="existing-rules-section">
          <h2>Existing Rules</h2>
          <div className="rule-list-container">
            <ul className="rule-list">
              {rules.map((rule) => (
                <li key={rule.ruleName}>
                  <span
                    className="rule-name"
                    onClick={() => {
                      axios
                        .get(`http://localhost:5000/api/rules/${rule.ruleName}`)
                        .then((res) => {
                          console.log("API Response:", res.data); 
                          if (res.data && res.data.ast) {
                            const transformedAST = transformAST(res.data.ast);
                            console.log("Transformed AST:", transformedAST); 
                            setAstData(transformedAST);
                            scrollToTree();
                          } else {
                            setError("AST data is missing in the response.");
                            setAstData(null);
                          }
                        })
                        .catch((err) => {
                          console.error("API Error:", err); 
                          setError("Failed to fetch rule details.");
                          setAstData(null);
                        });
                    }}
                  >
                    {rule.ruleName}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRule(rule.ruleName);
                    }}
                    className="delete-rule"
                    title={`Delete ${rule.ruleName}`}
                  >
                    <FaTrash style={{ marginRight: "5px" }} /> Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuleForm;
