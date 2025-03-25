import React, { useState } from "react";

export default function UseBoardPage() {
  const [dmc, setDmc] = useState(""); // DMC ingresado por el usuario
  const [mensaje, setMensaje] = useState(null); // Mensaje de éxito
  const [error, setError] = useState(null); // Manejo de errores

  const handleUsarTarjeta = async () => {
    setError(null); // Limpiar errores anteriores
    setMensaje(null); // Limpiar mensaje anterior

    // Validación de DMC ingresado
    if (!dmc.trim()) {
      setError("Debe ingresar un DMC válido.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/usar/${dmc}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Si la respuesta no es ok, obtenemos el mensaje de error
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      // Si la respuesta es exitosa, mostramos el mensaje de éxito
      setMensaje("Tarjeta usada con éxito.");
    } catch (err) {
      // Si ocurre un error, lo mostramos
      setError(`Error al usar la tarjeta: ${err.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      <h1 className="text-2xl font-semibold text-center text-gray-700 mb-6">
        Usar tarjeta
      </h1>

      <section className="flex gap-2 mb-4">
        <input
          type="text"
          value={dmc}
          onChange={(e) => setDmc(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Escribe el DMC"
        />
        <button
          onClick={handleUsarTarjeta}
          className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 focus:ring-2 focus:ring-green-400 transition"
        >
          Usar
        </button>
      </section>

      {/* Mensaje de error */}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}

      {/* Mensaje de éxito */}
      {mensaje && <p className="text-green-500 text-center mt-4">{mensaje}</p>}
    </div>
  );
}
