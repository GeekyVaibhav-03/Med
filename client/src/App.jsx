import { Routes, Route, Navigate } from 'react-router-dom';
import AdminRoute from './routes/AdminRoute';
import DoctorRoute from './routes/DoctorRoute';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Public login page */}
        <Route path="/login" element={<Login />} />
        
        {/* Public signup page */}
        <Route path="/signup" element={<Signup />} />

        {/* Unauthorized page */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected admin and doctor routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminRoute />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/*"
          element={
            <ProtectedRoute role="doctor">
              <DoctorRoute />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
