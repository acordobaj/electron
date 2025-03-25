import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];  // Obtener el token desde las cabeceras

  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado. Se requiere token.' });
  }

  try {
    const decoded = jwt.verify(token, 'mi_clave_secreta');
    req.user = decoded;  // Guardar la información decodificada del usuario
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Token inválido o expirado.' });
  }
};

export default verifyToken;