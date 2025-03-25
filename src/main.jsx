import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Renderizando el componente raíz
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Verificando si estamos en un entorno adecuado para Electron (si se usa ipcRenderer)
if (window && window.ipcRenderer) {
  window.ipcRenderer.on("main-process-message", (_event, message) => {
    console.log(message);
  });
} else {
  console.warn("No se ha encontrado ipcRenderer, asegúrate de estar en un entorno Electron.");
}