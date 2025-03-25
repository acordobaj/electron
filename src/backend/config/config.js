import dotenv from 'dotenv';
import process from 'process';

// Cargar las variables de entorno desde un archivo .env
dotenv.config();

const config = {
    JWT_SECRET: process.env.JWT_SECRET || 'miClaveSecreta',  // Asegúrate de tener esta variable en tu archivo .env
    JWT_EXPIRATION: '1h',  // Configuración para la expiración del JWT
};

export default config;