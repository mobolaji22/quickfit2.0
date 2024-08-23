import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [caloriesGained, setCaloriesGained] = useState(0);
  const [waterIntake, setWaterIntake] = useState(0);
  const [menstrualCycle, setMenstrualCycle] = useState({
    startDate: "",
    duration: 0,
  });
  const [totalCaloriesBurned, setTotalCaloriesBurned] = useState(0);

  const calculateBMI = () => {
    const heightInMeters = user?.height / 100;
    return (user?.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  useEffect(() => {
    const foodWaterData =
      JSON.parse(localStorage.getItem(`${user.username}-food-water`)) || {};
    setCaloriesGained(foodWaterData.calories || 0);
    setWaterIntake(foodWaterData.water || 0);

    const menstrualData = JSON.parse(
      localStorage.getItem(`${user.username}-menstrualData`)
    ) || {
      startDate: "",
      duration: 0,
    };
    setMenstrualCycle(menstrualData);

    const workoutData =
      JSON.parse(localStorage.getItem(`${user.username}-workoutData`)) || {};
    setTotalCaloriesBurned(workoutData.totalCaloriesBurned || 0);
  }, [user.username]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="dashboard">
      <div className="navigation-links">
        <Link to="/food-water">Food & Water Tracking</Link>
        <Link to="/workout">Workout Tracking</Link>
        {user.gender !== "male" && <Link to="/menstrual">Menstrual Cycle</Link>}
        <Link to="/journal">Journal</Link>
        <Link to="/activities">Activities</Link>
      </div>

      <div className="logout">
        <button onClick={handleLogout}>Logout</button>
      </div>
      <h1>Welcome, {user.username}</h1>
      <p>
        <strong>Age:</strong> {user.age} years
      </p>
      <p>
        <strong>Height:</strong> {user.height} cm
      </p>
      <p>
        <strong>Weight:</strong> {user.weight} kg
      </p>
      <p>
        <strong>Goal:</strong> {user.fitnessGoal}
      </p>
      <p>
        <strong>Activity Level:</strong> {user.activityLevel}
      </p>
      <p>
        <strong>BMI:</strong> {calculateBMI()}
      </p>

      <div className="dashboard-metrics">
        <h2>Metrics</h2>
        <p>
          <strong>Calories Gained:</strong> {caloriesGained} kcal
        </p>
        <p>
          <strong>Water Intake:</strong> {waterIntake} ml
        </p>
        <p>
          <strong>Total Calories Burned:</strong> {totalCaloriesBurned} kcal
        </p>
        <p>
          <strong>Total Workouts Completed: </strong>
          {user.workoutsCompleted}
        </p>
        <p>
          <strong>Total Workout Time:</strong> {user.totalWorkoutTime} mins
        </p>
        <p>
          <strong>Calories Burned:</strong> {user.caloriesBurned}
        </p>
        <p>
          <strong>Active Minutes:</strong> {user.activeMinutes} mins
        </p>
        {user.gender !== "male" && (
          <div className="menstrual-cycle">
            <h2>Menstrual Cycle</h2>
            <p>
              <strong>Last Period Start Date:</strong>{" "}
              {menstrualCycle.startDate}
            </p>
            <p>
              <strong>Cycle Duration:</strong> {menstrualCycle.duration} days
            </p>
            <p>
              <strong>Next Expected Period:</strong>{" "}
              {menstrualCycle.startDate &&
                menstrualCycle.duration &&
                new Date(
                  new Date(menstrualCycle.startDate).setDate(
                    new Date(menstrualCycle.startDate).getDate() +
                      menstrualCycle.duration
                  )
                ).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      <div className="recommendations">
        <h3>Personalized Recommendations</h3>
        {user.fitnessGoal === "lose weight" && (
          <p>Focus on cardio exercises and maintaining a caloric deficit.</p>
        )}
        {user.fitnessGoal === "gain muscle" && (
          <p>Incorporate strength training and ensure a protein-rich diet.</p>
        )}
        {user.fitnessGoal === "maintain" && (
          <p>
            Balance your workout routine with a mix of cardio and strength
            training.
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
