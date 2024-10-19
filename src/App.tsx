import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Chatbot from './components/Chatbot';
import UserProfile from './components/UserProfile';
import { UserCircle } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-md p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">HeartGuard AI</h1>
            {isAuthenticated && (
              <div className="flex items-center">
                <a href="/profile" className="text-gray-600 hover:text-blue-600 mr-4">Profile</a>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-600 hover:text-blue-600"
                >
                  <UserCircle className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>
        <div className="container mx-auto mt-8 p-4">
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/chat" />} />
            <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/chat" />} />
            <Route path="/chat" element={isAuthenticated ? <Chatbot /> : <Navigate to="/login" />} />
            <Route path="/profile" element={isAuthenticated ? <UserProfile /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to={isAuthenticated ? "/chat" : "/login"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;