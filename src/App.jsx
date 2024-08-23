// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import WorkoutTracking from "./pages/WorkoutTracking";
import MenstrualTracker from "./pages/MenstrualTracker";
import ActivityPlanning from "./pages/ActivityPlanning";
import Journaling from "./pages/Journaling";
import FoodWaterTracking from "./pages/FoodWaterTracking";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/workout" element={<WorkoutTracking />} />
          <Route path="/menstrual" element={<MenstrualTracker />} />
          <Route path="/activities" element={<ActivityPlanning />} />
          <Route path="/journal" element={<Journaling />} />
          <Route path="/food-water" element={<FoodWaterTracking />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
