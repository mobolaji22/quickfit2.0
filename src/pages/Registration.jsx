import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userModel } from "../data/userModel";
import "../styles/Registration.css";

const Registration = () => {
  const [userData, setUserData] = useState(userModel);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem(userData.username, JSON.stringify(userData));
    navigate("/");
  };

  return (
    <div className="registration">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            value={userData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={userData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            placeholder="Age"
            value={userData.age}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="height">Height (cm)</label>
          <input
            type="number"
            id="height"
            name="height"
            placeholder="Height (cm)"
            value={userData.height}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="weight">Weight (kg)</label>
          <input
            type="number"
            id="weight"
            name="weight"
            placeholder="Weight (kg)"
            value={userData.weight}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={userData.gender}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select your gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="fitnessGoal">Fitness Goal</label>
          <select
            id="fitnessGoal"
            name="fitnessGoal"
            value={userData.fitnessGoal}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select your goal
            </option>
            <option value="lose weight">Lose Weight</option>
            <option value="gain muscle">Gain Muscle</option>
            <option value="maintain">Maintain</option>
          </select>
        </div>

        <div>
          <label htmlFor="activityLevel">Activity Level</label>
          <select
            id="activityLevel"
            name="activityLevel"
            value={userData.activityLevel}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select your activity level
            </option>
            <option value="sedentary">Sedentary</option>
            <option value="lightly active">Lightly Active</option>
            <option value="active">Active</option>
            <option value="very active">Very Active</option>
          </select>
        </div>

        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/">Login here</Link>
      </p>
    </div>
  );
};

export default Registration;
