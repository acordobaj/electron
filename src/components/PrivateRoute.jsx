import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ requiredRoles, children }) => {
  // Obtener roles desde localStorage
  const storedRoles = localStorage.getItem('roles');
  let roles = [];

  // Verificar que storedRoles no sea 'undefined' o null
  if (storedRoles && storedRoles !== 'undefined') {
    try {
      roles = JSON.parse(storedRoles) || [];
    } catch (error) {
      console.error('Error parsing roles:', error);
      roles = [];
    }
  }

  // Verificar si el usuario tiene los roles requeridos
  const hasRequiredRole = roles.some(role => requiredRoles.some(requiredRole => requiredRole.id === role.id));

  // Si el usuario no tiene los roles requeridos, redirigir a login
  if (!hasRequiredRole) {
    return <Navigate to="/login" />;
  }

  // Si tiene el rol requerido, renderizar el contenido
  return children;
};

export default PrivateRoute;