import React, { useState, useEffect } from "react";
import axios from "axios";

export default function RegisterViewPage() {
  const [tarjetas, setTarjetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alerta, setAlerta] = useState(false);

  useEffect(() => {
    const fetchTarjetas = async () => {
      try {
        const response = await axios.get("http://localhost:3000/tarjetas");
        setTarjetas(response.data);
        // Comprobar si alguna tarjeta lleva más de 13 días sin usarse
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 13);

        const tarjetasInactivas = response.data.filter((tarjeta) => {
          const fechaCreacion = new Date(tarjeta.fecha_creacion);
          return fechaCreacion < fechaLimite;
        });

        if (tarjetasInactivas.length > 0) {
          setAlerta(true);
        }
      } catch (error) {
        setError("Error al cargar los datos. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchTarjetas();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <section className="p-6 border border-gray-300 shadow-lg rounded-lg bg-white">
        <h2 className="text-2xl font-semibold text-center mb-6">Registro de tarjetas</h2>

        {/* Alerta de tarjetas inactivas */}
        {alerta && (
          <div className="bg-yellow-300 p-4 mb-4 text-center text-yellow-800 font-semibold rounded-md">
            Algunas familias llevan más de 13 días sin usarse. ¡Revisa sus registros!
          </div>
        )}

        {/* Mensaje de carga */}
        {loading && (
          <p className="text-center text-gray-600 text-lg">
            Cargando tarjetas... por favor espera.
          </p>
        )}

        {/* Mensaje de error */}
        {error && <p className="text-center text-red-600 text-lg">{error}</p>}

        {/* Tabla de tarjetas */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 shadow-sm">
              <thead className="bg-gray-200">
                <tr className="text-gray-700 text-sm uppercase">
                  <th className="px-4 py-2 border" scope="col">DMC</th>
                  <th className="px-4 py-2 border" scope="col">Familia</th>
                  <th className="px-4 py-2 border" scope="col">Línea</th>
                  <th className="px-4 py-2 border" scope="col">Fecha de creación</th>
                  <th className="px-4 py-2 border" scope="col">Veces usada</th>
                </tr>
              </thead>
              <tbody>
                {tarjetas.length > 0 ? (
                  tarjetas.map((tarjeta) => (
                    <tr key={tarjeta.id} className="hover:bg-gray-50 text-center">
                      <td className="border px-4 py-2">{tarjeta.dmc}</td>
                      <td className="border px-4 py-2">{tarjeta.familia}</td>
                      <td className="border px-4 py-2">{tarjeta.linea}</td>
                      <td className="border px-4 py-2">{tarjeta.fecha_creacion}</td>
                      <td className="border px-4 py-2">{tarjeta.veces_usada}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="border px-4 py-2 text-center text-gray-500">
                      No hay tarjetas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}