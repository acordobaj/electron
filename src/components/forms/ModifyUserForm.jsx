import React from 'react'

export default function ModifyUserForm() {
  return (
    <div className="mt-4 bg-gray-100 p-4 rounded shadow">
          <h2 className="text-lg font-bold mb-2">Cambiar contraseña</h2>
          <form className="space-y-4">
        
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                ID usuario
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingresa el dmc"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Contraseña nueva
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingresa la nueva contraseña"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Repetir contraseña
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Repetir contraseña"
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white font-semibold px-4 py-2 rounded hover:bg-green-600 transition duration-300"
            >
              Cambiar
            </button>
          </form>
        </div>
  )
}
