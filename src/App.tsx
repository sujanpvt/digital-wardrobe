import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { OutfitProvider } from './contexts/OutfitContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Wardrobe from './pages/Wardrobe';
import DressUp from './pages/DressUp';
import Outfits from './pages/Outfits';
import Laundry from './pages/Laundry';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <OutfitProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/wardrobe" 
                  element={
                    <ProtectedRoute>
                      <Wardrobe />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dress-up" 
                  element={
                    <ProtectedRoute>
                      <DressUp />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/outfits" 
                  element={
                    <ProtectedRoute>
                      <Outfits />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/laundry" 
                  element={
                    <ProtectedRoute>
                      <Laundry />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </OutfitProvider>
    </AuthProvider>
  );
}

export default App;