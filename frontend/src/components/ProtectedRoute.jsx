import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para proteger rutas que requieren autenticación y roles específicos
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente hijo a renderizar si está autorizado
 * @param {string[]} props.allowedRoles - Array de roles permitidos (ej: ['admin', 'operator'])
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Si no hay usuario, redirigir a home
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Si hay roles específicos requeridos, verificar
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Usuario autenticado pero sin permisos suficientes
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Acceso Denegado</h4>
          <p>No tienes permisos para acceder a esta página.</p>
          <hr />
          <p className="mb-0">
            <a href="/" className="alert-link">Volver al inicio</a>
          </p>
        </div>
      </div>
    );
  }

  // Usuario autenticado y con permisos correctos
  return children;
};

export default ProtectedRoute;
