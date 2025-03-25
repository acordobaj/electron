import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [roles, setRoles] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Función para obtener los roles desde la API
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/roles/roles');
      if (response.data && response.data.roles) {
        setRoles(response.data.roles); // Asignar los roles al estado
      } else {
        setMessage('No se encontraron roles.');
      }
    } catch (error) {
      setMessage('Hubo un error al cargar los roles.');
      console.error('Error al obtener roles', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Llamar a fetchRoles cuando el componente se monta
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Validación del formulario
  const validateForm = () => {
    if (!nombre || !password || !roleId) {
      setMessage('Todos los campos son obligatorios.');
      return false;
    }
    return true;
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Enviar la solicitud de registro al backend
      const response = await axios.post('http://localhost:3000/api/auth/register', {
        nombre,
        password,
        role_id: roleId || 2, // Enviar role_id o asignar 2 por defecto
      });

      // Mensaje de éxito
      setMessage(response.data.message);
      setNombre('');
      setPassword('');
      setRoleId('');
    } catch (error) {
      setMessage('Hubo un error al registrar al usuario.');
      console.error('Error al registrar usuario', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Registro de Usuario</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ingrese su nombre"
              required
              className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Contraseña */}
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

          {/* Rol */}
          <div>
            <label htmlFor="role_id" className="block text-sm font-medium text-gray-700">Rol</label>
            <select
              id="role_id"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un rol</option>
              {loading ? (
                <option disabled>Cargando roles...</option>
              ) : (
                roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.nombre}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Botón de Registro */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Registrar
          </button>
        </form>

        {/* Mensaje de estado */}
        {message && (
          <p className={`mt-4 text-center text-sm ${message.includes('éxito') ? 'text-green-500' : 'text-red-500'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;