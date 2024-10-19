import React, { useState } from "react";
import axios from "axios";

const RuleForm = () => {
  const [ruleName, setRuleName] = useState(""); // State for ruleName
  const [ruleString, setRuleString] = useState("");
  const [userData, setUserData] = useState({
    age: "",
    department: "",
    salary: "",
    experience: "",
  });
  const [result, setResult] = useState(null);

  const handleCreateRule = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/rules/create", {
        ruleName, // Include ruleName
        ruleString,
      });
      console.log(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEvaluateRule = async () => {
    const res = await axios.post("http://localhost:5000/api/rules/evaluate", {
      ast: ruleString,
      userData,
    });
    setResult(res.data.result);
  };

  return (
    <div>
      <h2>Create Rule</h2>
      <input
        type="text"
        placeholder="Enter rule name"
        value={ruleName}
        onChange={(e) => setRuleName(e.target.value)} // Input field for ruleName
      />
      <input
        type="text"
        placeholder="Enter rule"
        value={ruleString}
        onChange={(e) => setRuleString(e.target.value)}
      />
      <button onClick={handleCreateRule}>Create Rule</button>

      <h2>Evaluate Rule</h2>
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
      <button onClick={handleEvaluateRule}>Evaluate Rule</button>

      {result !== null && <h3>Result: {result ? "True" : "False"}</h3>}
    </div>
  );
};

export default RuleForm;
