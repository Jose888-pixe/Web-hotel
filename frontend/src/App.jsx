import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import OperatorPage from './pages/OperatorPage';
import ReservationsPage from './pages/ReservationsPage';
import RoomDetailsPage from './pages/RoomDetailsPage';
import Footer from './components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/room/:id" element={<RoomDetailsPage />} />
              <Route path="/reservations" element={<ReservationsPage />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/operator" 
                element={
                  <ProtectedRoute allowedRoles={['operator', 'admin']}>
                    <OperatorPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
