import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!nombre || !password) {
      setMessage('Todos los campos son obligatorios.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', { nombre, password });
  
      if (response.data && response.data.message === "Inicio de sesión exitoso") {
        const { user, token } = response.data;
  
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
  
        // Redirigir según el role_id
        if (user.role_id === 2) {
          navigate('/');
        } else if (user.role_id === 3) {
          navigate('/boardpage');
        } else if (user.role_id === 4) {
          navigate('/registerviewpage');
        } else {
          navigate('/login'); // Ruta por defecto para otros roles
        }
      } else {
        setMessage('Credenciales inválidas.');
      }
    } catch (error) {
      setMessage('Hubo un error al intentar iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Inicio de Sesión</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre de usuario</label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ingrese su nombre de usuario"
              required
              className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              required
              className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {loading ? 'Cargando...' : 'Iniciar sesión'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center text-sm ${message.includes('éxito') ? 'text-green-500' : 'text-red-500'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;