import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../styles/ActivityPlanning.css";

const useWeather = (city) => {
  const [weather, setWeather] = useState(null);
  const [weatherAlert, setWeatherAlert] = useState("");

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${
            import.meta.env.VITE_WEATHER_API_KEY
          }`
        );
        if (!response.ok) throw new Error("Failed to fetch weather data.");
        const data = await response.json();
        if (data.cod === 200) {
          setWeather(data);
          checkWeatherAlert(data);
        } else {
          setWeather(null);
          setWeatherAlert("Weather information is not available.");
        }
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setWeatherAlert("Error fetching weather data.");
      }
    };

    fetchWeather();
  }, [city]);

  const checkWeatherAlert = (data) => {
    const temp = data.main.temp;
    const weatherCondition = data.weather[0].main.toLowerCase();

    if (
      temp < 0 ||
      weatherCondition === "storm" ||
      weatherCondition === "rain"
    ) {
      setWeatherAlert(
        "Alert: Bad weather conditions detected. Please take precautions."
      );
    } else {
      setWeatherAlert("");
    }
  };

  return { weather, weatherAlert };
};

const ActivityPlanning = () => {
  const { user } = useContext(UserContext);
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({
    description: "",
    date: new Date().toLocaleString(),
    completed: false,
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [filter, setFilter] = useState("all");
  const [city, setCity] = useState("New York");
  const [feedback, setFeedback] = useState("");

  const { weather, weatherAlert } = useWeather(city);

  useEffect(() => {
    if (user) {
      const storedActivities =
        JSON.parse(localStorage.getItem(`${user.username}-activities`)) || [];
      setActivities(storedActivities);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewActivity((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddActivity = () => {
    if (newActivity.description) {
      const updatedActivities = [...activities, { ...newActivity }];
      setActivities(updatedActivities);
      localStorage.setItem(
        `${user.username}-activities`,
        JSON.stringify(updatedActivities)
      );
      setNewActivity({
        description: "",
        date: new Date().toLocaleString(),
        completed: false,
      });
      setFeedback("Activity added successfully!");
    } else {
      setFeedback("Please provide a description.");
    }
    setTimeout(() => setFeedback(""), 3000);
  };

  const handleToggleCompleted = (index) => {
    const updatedActivities = [...activities];
    updatedActivities[index].completed = !updatedActivities[index].completed;
    setActivities(updatedActivities);
    localStorage.setItem(
      `${user.username}-activities`,
      JSON.stringify(updatedActivities)
    );
  };

  const handleEditActivity = (index, description) => {
    const updatedActivities = [...activities];
    updatedActivities[index].description = description;
    setActivities(updatedActivities);
    localStorage.setItem(
      `${user.username}-activities`,
      JSON.stringify(updatedActivities)
    );
    setEditingIndex(null);
    setEditDescription("");
  };

  const handleDeleteActivity = (index) => {
    const updatedActivities = activities.filter((_, i) => i !== index);
    setActivities(updatedActivities);
    localStorage.setItem(
      `${user.username}-activities`,
      JSON.stringify(updatedActivities)
    );
    setEditingIndex(null);
  };

  const filteredActivities =
    filter === "all"
      ? activities
      : activities.filter((activity) =>
          filter === "completed" ? activity.completed : !activity.completed
        );

  return (
    <div className="activity-planning">
      <h2>Activity Planning</h2>

      <div className="navigation-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/food-water">Food & Water Tracking</Link>
        {user?.gender !== "male" && (
          <Link to="/menstrual">Menstrual Cycle</Link>
        )}
        <Link to="/workout">Workouts</Link>
        <Link to="/journal">Journaling</Link>
      </div>

      <div className="activity-form">
        <input
          type="text"
          name="description"
          value={newActivity.description}
          onChange={handleChange}
          placeholder="New Activity"
        />
        <input
          type="text"
          name="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City for Weather"
        />
        <button onClick={handleAddActivity}>Add Activity</button>
        {feedback && <p className="feedback">{feedback}</p>}
      </div>

      {weather && (
        <div className="weather-info">
          <h4>Current Weather in {weather.name}</h4>
          <p>Temperature: {weather.main.temp}°C</p>
          <p>Condition: {weather.weather[0].main}</p>
          {weatherAlert && <p className="weather-alert">{weatherAlert}</p>}
        </div>
      )}

      <div className="activity-list">
        <h3>My Activities</h3>
        <div className="filter-buttons">
          <button
            onClick={() => setFilter("all")}
            className={filter === "all" ? "active" : ""}
          >
            All
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={filter === "completed" ? "active" : ""}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter("incomplete")}
            className={filter === "incomplete" ? "active" : ""}
          >
            Incomplete
          </button>
        </div>

        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity, index) => (
            <div key={index} className="activity-item">
              <p>{activity.description}</p>
              <p>{activity.date.split(",")[1]}</p>
              {editingIndex === index ? (
                <div className="activity-edit">
                  <input
                    type="text"
                    value={editDescription || activity.description}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                  <button
                    onClick={() => handleEditActivity(index, editDescription)}
                    className="update-button"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleToggleCompleted(index)}
                    className={activity.completed ? "completed" : ""}
                  >
                    {activity.completed ? "Mark Incomplete" : "Mark Complete"}
                  </button>
                  <button onClick={() => handleDeleteActivity(index)}>
                    Delete
                  </button>
                  <button onClick={() => setEditingIndex(null)}>Cancel</button>
                </div>
              ) : (
                <div className="activity-actions">
                  <button
                    onClick={() => {
                      setEditDescription(activity.description);
                      setEditingIndex(index);
                    }}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDeleteActivity(index)}>
                    Delete
                  </button>
                  <button
                    onClick={() => handleToggleCompleted(index)}
                    className={activity.completed ? "completed" : ""}
                  >
                    {activity.completed ? "Mark Incomplete" : "Mark Complete"}
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No activities found.</p>
        )}
      </div>
    </div>
  );
};

export default ActivityPlanning;
