import React from "react";

export default function DeleteUserForm() {
  return (
    <div className="mt-4 bg-gray-100 p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-2">Eliminar Usuario</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            ID usuario
          </label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingresa el ID del usuario"
          />
        </div>

        <button
          type="submit"
          className="bg-red-500 text-white font-semibold px-4 py-2 rounded hover:bg-red-600 transition duration-300"
        >
          Eliminar
        </button>
      </form>
    </div>
  );
}
