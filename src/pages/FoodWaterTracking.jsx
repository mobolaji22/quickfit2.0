import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../styles/FoodWaterTracking.css";

const FoodWaterTracking = () => {
  const { user } = useContext(UserContext);
  const [food, setFood] = useState("");
  const [nutritionData, setNutritionData] = useState(null);
  const [foodLog, setFoodLog] = useState([]);
  const [suggestions, setSuggestions] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFoodLog, setShowFoodLog] = useState(false);
  const [waterConsumed, setWaterConsumed] = useState(0);
  const [waterLog, setWaterLog] = useState([]);
  const recommendedWaterIntake = user?.gender === "male" ? 3.7 : 2.7;

  const fetchNutritionData = async () => {
    if (!food.trim()) {
      setFeedback("Please enter a valid food item.");
      setTimeout(() => setFeedback(""), 3000);
      return;
    }

    setLoading(true);

    const url = `https://edamam-edamam-nutrition-analysis.p.rapidapi.com/api/nutrition-data?nutrition-type=cooking&ingr=${encodeURIComponent(
      food
    )}`;
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": import.meta.env.VITE_FOODWATERTRACKING_KEY,
        "x-rapidapi-host": "edamam-edamam-nutrition-analysis.p.rapidapi.com",
      },
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setNutritionData(result);
      generateSuggestions(result);
      setFeedback("Nutrition data fetched successfully!");
    } catch (error) {
      console.error("Error fetching nutrition data:", error);
      setFeedback(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  const generateSuggestions = (nutrition) => {
    let suggestions = "";
    const calories = nutrition?.calories || 0;

    if (user?.fitnessGoal === "lose weight" && calories > 200) {
      suggestions = "Consider a lower-calorie option or smaller portion.";
    } else if (user?.fitnessGoal === "gain muscle" && calories < 200) {
      suggestions = "Consider adding a protein-rich food to your meal.";
    }

    setSuggestions(suggestions);
  };

  const handleFoodInput = (e) => {
    setFood(e.target.value);
  };

  const handleSearchClick = () => {
    fetchNutritionData();
  };

  const logFoodConsumed = () => {
    if (nutritionData && user) {
      const newFoodLog = [...foodLog, { food, nutritionData }];
      setFoodLog(newFoodLog);

      const totalCalories = newFoodLog.reduce(
        (sum, log) => sum + log.nutritionData.calories,
        0
      );
      localStorage.setItem(
        `${user.username}-foodLog`,
        JSON.stringify(newFoodLog)
      );
      localStorage.setItem(`${user.username}-calories`, totalCalories);
      localStorage.setItem(
        `${user.username}-food-water`,
        JSON.stringify({
          calories: totalCalories,
          water: localStorage.getItem(`${user.username}-water`) || 0,
        })
      );

      setFeedback("Food logged successfully.");
      setFood("");
      setNutritionData(null);
    } else {
      setFeedback("No food data to log.");
    }

    setTimeout(() => setFeedback(""), 3000);
  };

  const logWaterConsumed = () => {
    if (waterConsumed > 0) {
      const newWaterLog = [...waterLog, waterConsumed];
      setWaterLog(newWaterLog);

      const totalWater = newWaterLog.reduce((sum, log) => sum + log, 0);
      localStorage.setItem(
        `${user.username}-waterLog`,
        JSON.stringify(newWaterLog)
      );
      localStorage.setItem(`${user.username}-water`, totalWater);
      localStorage.setItem(
        `${user.username}-food-water`,
        JSON.stringify({
          calories: localStorage.getItem(`${user.username}-calories`) || 0,
          water: totalWater,
        })
      );

      setFeedback("Water logged successfully.");
      setWaterConsumed(0);
    } else {
      setFeedback("Please enter a valid water amount.");
    }

    setTimeout(() => setFeedback(""), 3000);
  };

  useEffect(() => {
    if (user) {
      const storedFoodLog =
        JSON.parse(localStorage.getItem(`${user.username}-foodLog`)) || [];
      setFoodLog(storedFoodLog);

      const storedWaterLog =
        JSON.parse(localStorage.getItem(`${user.username}-waterLog`)) || [];
      setWaterLog(storedWaterLog);
    }
  }, [user]);

  const toggleFoodLog = () => {
    setShowFoodLog(!showFoodLog);
  };

  return (
    <div className="food-water-tracking">
      <h2>Food & Water Tracking</h2>

      <div className="navigation-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/workout">Workouts</Link>
        <Link to="/activities">Plan Your Day</Link>
        <Link to="/journal">Journal</Link>
        {user?.gender !== "male" && (
          <Link to="/menstrual">Menstrual Cycle</Link>
        )}
      </div>

      <div className="tracking-forms">
        <div className="food-tracking">
          <p>
            Enter an ingredient list for what you are cooking, like &apos;1 cup
            rice, 10 oz chickpeas&apos;, etc. Enter each ingredient followed by
            a comma.
          </p>
          <input
            type="text"
            value={food}
            onChange={handleFoodInput}
            placeholder="Enter food item"
            aria-label="Food item input"
          />
          <button onClick={handleSearchClick} disabled={loading}>
            {loading ? <span className="spinner"></span> : "Search"}
          </button>
          {loading ? (
            <p>Loading...</p>
          ) : (
            nutritionData && (
              <div className="nutrition-info">
                <h4>Nutrition Data for {food}</h4>
                <p>Calories: {nutritionData.calories}</p>
                <p>
                  Fat: {nutritionData.totalNutrients.FAT?.quantity}{" "}
                  {nutritionData.totalNutrients.FAT?.unit}
                </p>
                <p>
                  Protein: {nutritionData.totalNutrients.PROCNT?.quantity}{" "}
                  {nutritionData.totalNutrients.PROCNT?.unit}
                </p>
                <p>
                  Carbs: {nutritionData.totalNutrients.CHOCDF?.quantity}{" "}
                  {nutritionData.totalNutrients.CHOCDF?.unit}
                </p>
                <p>{suggestions}</p>
                <button onClick={logFoodConsumed}>Log Food as Consumed</button>
              </div>
            )
          )}
          {feedback && (
            <p className="feedback" aria-live="polite">
              {feedback}
            </p>
          )}
        </div>

        <div className="water-tracking">
          <h4>Recommended Water Intake: {recommendedWaterIntake} liters</h4>
          <input
            type="number"
            value={waterConsumed}
            onChange={(e) => setWaterConsumed(parseFloat(e.target.value))}
            placeholder="Enter water amount in liters"
            aria-label="Water intake input"
          />
          <button onClick={logWaterConsumed}>Log Water as Consumed</button>
          <p>
            Total Water Consumed Today:{" "}
            {waterLog.reduce((sum, log) => sum + log, 0)} liters
          </p>
        </div>
      </div>

      <div className="logs">
        {foodLog.length > 0 && (
          <div className="food-log">
            <button onClick={toggleFoodLog}>
              {showFoodLog ? "Hide Food Log" : "Show Food Log"}
            </button>
            {showFoodLog && (
              <>
                <h3>Consumed Foods</h3>
                <ul>
                  {foodLog.map((log, index) => (
                    <li key={index}>
                      <strong>{log.food}</strong>: {log.nutritionData.calories}{" "}
                      calories
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodWaterTracking;
