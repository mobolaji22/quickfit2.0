import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../styles/MenstrualTracker.css";

const MenstrualTracker = () => {
  const { user } = useContext(UserContext);
  const [cycleData, setCycleData] = useState({
    startDate: "",
    duration: 0,
    symptoms: [],
  });
  const [inputStartDate, setInputStartDate] = useState("");
  const [inputDuration, setInputDuration] = useState(0);
  const [newSymptom, setNewSymptom] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [symptomError, setSymptomError] = useState("");

  useEffect(() => {
    if (user) {
      const storedCycleData = JSON.parse(
        localStorage.getItem(`${user.username}-menstrualData`)
      ) || { startDate: "", duration: 0, symptoms: [] };
      setCycleData(storedCycleData);
      setInputStartDate(storedCycleData.startDate);
      setInputDuration(storedCycleData.duration);
    }
  }, [user]);

  const validateInputs = () => {
    if (!inputStartDate) return "Start Date is required.";
    if (inputDuration <= 0) return "Duration must be greater than 0.";
    return "";
  };

  const handleSaveCycle = () => {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      setSuccess("");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const updatedData = {
      ...cycleData,
      startDate: inputStartDate,
      duration: inputDuration,
    };
    setCycleData(updatedData);
    localStorage.setItem(
      `${user.username}-menstrualData`,
      JSON.stringify(updatedData)
    );
    setSuccess("Cycle data saved successfully!");
    setError("");
    setTimeout(() => setSuccess(""), 3000);
    setInputStartDate("");
    setInputDuration(0);
  };

  const handleAddSymptom = () => {
    if (newSymptom.trim()) {
      if (cycleData.symptoms.includes(newSymptom.trim())) {
        setSymptomError("This symptom is already logged.");
        setTimeout(() => setSymptomError(""), 3000);
        return;
      }

      const updatedSymptoms = [...cycleData.symptoms, newSymptom.trim()];
      const updatedData = { ...cycleData, symptoms: updatedSymptoms };
      setCycleData(updatedData);
      localStorage.setItem(
        `${user.username}-menstrualData`,
        JSON.stringify(updatedData)
      );
      setNewSymptom("");
      setSymptomError("");
    } else {
      setSymptomError("Symptom cannot be empty.");
      setTimeout(() => setSymptomError(""), 3000);
    }
  };

  const calculateNextPeriod = () => {
    if (cycleData.startDate && cycleData.duration) {
      const nextPeriod = new Date(
        new Date(cycleData.startDate).setDate(
          new Date(cycleData.startDate).getDate() + cycleData.duration
        )
      );
      return nextPeriod.toLocaleDateString();
    }
    return "N/A";
  };

  return (
    <div className="menstrual-tracker">
      <h2>Menstrual Tracker</h2>
      <div className="navigation-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/workout">Workouts</Link>
        <Link to="/activities">Plan Your Day</Link>
        <Link to="/journal">Journal</Link>
        <Link to="/food-water">Food & Water</Link>
      </div>

      <div className="cycle-input">
        <label>
          Start Date:
          <input
            type="date"
            value={inputStartDate}
            onChange={(e) => setInputStartDate(e.target.value)}
          />
        </label>
        <label>
          Cycle Duration (days):
          <input
            type="number"
            min="1"
            value={inputDuration}
            onChange={(e) => setInputDuration(Number(e.target.value))}
          />
        </label>
        <button onClick={handleSaveCycle}>Save Cycle</button>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>

      <div className="symptoms-input">
        <input
          type="text"
          value={newSymptom}
          onChange={(e) => setNewSymptom(e.target.value)}
          placeholder="Add a symptom..."
        />
        <button onClick={handleAddSymptom}>Add Symptom</button>
        {symptomError && <p className="error">{symptomError}</p>}
      </div>

      <div className="cycle-details">
        <h3>Cycle Details</h3>
        <p>
          <strong>Start Date:</strong> {cycleData.startDate || "N/A"}
        </p>
        <p>
          <strong>Cycle Duration:</strong> {cycleData.duration || "N/A"} days
        </p>
        <p>
          <strong>Next Expected Period:</strong> {calculateNextPeriod()}
        </p>
      </div>

      <div className="symptoms-list">
        <h3>Logged Symptoms</h3>
        {cycleData.symptoms.length > 0 ? (
          <ul>
            {cycleData.symptoms.map((symptom, index) => (
              <li key={index}>{symptom}</li>
            ))}
          </ul>
        ) : (
          <p>No symptoms logged.</p>
        )}
      </div>
    </div>
  );
};

export default MenstrualTracker;
