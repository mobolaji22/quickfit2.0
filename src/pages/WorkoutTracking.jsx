import { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../styles/WorkoutTracking.css";

const WorkoutTracking = () => {
  const { user, updateUserData } = useContext(UserContext);
  const [workouts, setWorkouts] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [selectedBodyPart, setSelectedBodyPart] = useState("");
  const [error, setError] = useState("");
  const [completedWorkouts, setCompletedWorkouts] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      const url = "https://exercisedb.p.rapidapi.com/exercises";
      const options = {
        method: "GET",
        headers: {
          "x-rapidapi-key": import.meta.env.VITE_EXERCISE_KEY,
          "x-rapidapi-host": "exercisedb.p.rapidapi.com",
        },
      };

      try {
        const response = await fetch(url, options);
        const result = await response.json();
        if (Array.isArray(result)) {
          setWorkouts(result);
        } else {
          setError("Failed to fetch workouts.");
        }
      } catch {
        setError("Failed to fetch workouts.");
      }
    };

    fetchWorkouts();
  }, []);

  useEffect(() => {
    localStorage.setItem("workouts", JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    const loadCompletedWorkouts = () => {
      const date = new Date().toLocaleDateString();
      const workoutData =
        JSON.parse(localStorage.getItem(`${user.username}-workoutData`)) || {};
      setCompletedWorkouts(workoutData[date] || []);
    };

    loadCompletedWorkouts();
  }, [user.username]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (selectedWorkout && selectedDuration > 0) {
      setTimer(selectedDuration * 60);
      setIsRunning(true);
      setIsPaused(false);

      intervalRef.current = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 0) {
            clearInterval(intervalRef.current);
            markWorkoutAsComplete();
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    } else {
      setError("Please select a workout and set a duration.");
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resumeTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    setIsRunning(true);
    setIsPaused(false);
    intervalRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 0) {
          clearInterval(intervalRef.current);
          markWorkoutAsComplete();
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimer(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleAddWorkout = (workout) => {
    setSelectedWorkout(workout);
  };

  const removeWorkout = () => {
    setSelectedWorkout(null);
    setSelectedDuration(0);
    resetTimer();
  };

  const markWorkoutAsComplete = () => {
    if (selectedWorkout) {
      const date = new Date().toLocaleDateString();
      const workoutData =
        JSON.parse(localStorage.getItem(`${user.username}-workoutData`)) || {};
      const workoutsForDate = workoutData[date] || [];

      const caloriesBurned = selectedDuration * 10; // Example calorie calculation

      workoutsForDate.push({
        ...selectedWorkout,
        duration: selectedDuration,
        date,
        caloriesBurned,
      });

      localStorage.setItem(
        `${user.username}-workoutData`,
        JSON.stringify({ ...workoutData, [date]: workoutsForDate })
      );

      updateUserData((prevData) => ({
        ...prevData,
        workoutsCompleted: prevData.workoutsCompleted + 1,
        totalWorkoutTime: prevData.totalWorkoutTime + selectedDuration,
        caloriesBurned: prevData.caloriesBurned + caloriesBurned,
        activeMinutes: prevData.activeMinutes + selectedDuration,
      }));

      resetTimer();
      setCompletedWorkouts(workoutsForDate);
    }
  };

  const filteredWorkouts = workouts
    .filter((workout) =>
      workout.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((workout) =>
      selectedBodyPart ? workout.bodyPart === selectedBodyPart : true
    );

  const bodyPartOptions = [
    ...new Set(workouts.map((workout) => workout.bodyPart)),
  ];

  return (
    <div className="workout-tracking">
      <h2>Workout Tracking</h2>

      <div className="navigation-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/food-water">Food & Water Tracking</Link>
        {user?.gender !== "male" && (
          <Link to="/menstrual">Menstrual Cycle</Link>
        )}
        <Link to="/journal">Journal</Link>
        <Link to="/activities">Activities</Link>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="workout-selection">
        <h3>Select Workout</h3>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search workouts"
        />
        <select onChange={(e) => handleAddWorkout(JSON.parse(e.target.value))}>
          <option value="">Select a workout</option>
          {filteredWorkouts.map((workout) => (
            <option key={workout.id} value={JSON.stringify(workout)}>
              {workout.name}
            </option>
          ))}
        </select>
        <select onChange={(e) => setSelectedBodyPart(e.target.value)}>
          <option value="">Select body part</option>
          {bodyPartOptions.map((part) => (
            <option key={part} value={part}>
              {part}
            </option>
          ))}
        </select>
        {selectedWorkout && (
          <div className="workout-details">
            <h4>{selectedWorkout.name}</h4>
            <p>
              <strong>Target:</strong> {selectedWorkout.target}
            </p>
            <p>
              <strong>Secondary Muscles:</strong>{" "}
              {selectedWorkout.secondaryMuscles.join(", ")}
            </p>
            <p>
              <strong>Equipment:</strong> {selectedWorkout.equipment}
            </p>
            <p>{selectedWorkout.instructions}</p>
            {selectedWorkout.gifUrl && (
              <img src={selectedWorkout.gifUrl} alt={selectedWorkout.name} />
            )}
          </div>
        )}
        {selectedWorkout && (
          <>
            <input
              type="number"
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(Number(e.target.value))}
              placeholder="Duration (mins)"
            />
            <button onClick={removeWorkout}>Remove Workout</button>
          </>
        )}
      </div>

      <div className="timer-section">
        <h3>Timer</h3>
        <p>
          Time Remaining: {Math.floor(timer / 60)}:{timer % 60}
        </p>
        <button onClick={startTimer} disabled={isRunning}>
          Start
        </button>
        <button onClick={pauseTimer} disabled={!isRunning || isPaused}>
          Pause
        </button>
        <button onClick={resumeTimer} disabled={!isPaused}>
          Resume
        </button>
        <button onClick={resetTimer}>Reset</button>
        <button onClick={markWorkoutAsComplete} disabled={isRunning}>
          Mark Workout as Complete
        </button>
      </div>

      <div className="completed-workouts">
        <h3>Completed Workouts</h3>
        <ul>
          {completedWorkouts.map((workout, index) => (
            <li key={index}>
              {workout.name} - Duration: {workout.duration} mins - Calories
              Burned: {workout.caloriesBurned}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WorkoutTracking;
