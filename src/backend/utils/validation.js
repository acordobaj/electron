// Validación simple de datos de entrada
export const validateUserInput = (nombre, password, role_id) => {
    if (!nombre || !password || !role_id) {
      throw new Error("Todos los campos son obligatorios.");
    }
  
    if (nombre.length < 3 || nombre.length > 50) {
      throw new Error("El nombre debe tener entre 3 y 50 caracteres.");
    }
  
    if (password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres.");
    }
  };
  