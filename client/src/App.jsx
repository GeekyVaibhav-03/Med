import { Routes, Route, Navigate } from 'react-router-dom';
import AdminRoute from './routes/AdminRoute';
import DoctorRoute from './routes/DoctorRoute';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Unauthorized from './pages/Unauthorized';
import About from './pages/About';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Public pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
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
            <ProtectedRoute>
              <DoctorRoute />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
