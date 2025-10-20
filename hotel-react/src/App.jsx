import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import RoomDetailsPage from './pages/RoomDetailsPage';
import ReservationsPage from './pages/ReservationsPage';
import AdminPage from './pages/AdminPage';
import OperatorPage from './pages/OperatorPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

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
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/operator" element={<OperatorPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
