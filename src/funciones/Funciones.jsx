export const registrarTarjeta = async (formData) => {
  try {
    // Crear objeto de datos dinámicamente
    const bodyData = {
      ...formData,
    };

    const response = await fetch("http://localhost:5000/tarjetas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
    });

    // Verificamos si la respuesta fue exitosa
    if (!response.ok) {
      // Intentamos obtener la respuesta como JSON
      let errorMessage = await response.text(); // Asumir que la respuesta es texto
      try {
        // Si el texto es JSON, lo parseamos
        errorMessage = JSON.parse(errorMessage);
      } catch (e) {
        // Si no es JSON, dejamos el texto tal como está
        console.error("Error al parsear la respuesta del servidor como JSON");
      }
      console.error("Error en la solicitud:", errorMessage);
      throw new Error(`Error al registrar la tarjeta: ${response.status} ${response.statusText}`);
    }

    // Si la respuesta es exitosa, la parseamos como JSON
    const data = await response.json();
    return data; // Retornar datos si la respuesta es exitosa
  } catch (error) {
    console.error("Error en la solicitud:", error);
    return false; // Retornar false en caso de error
  }
};

// Función para obtener tarjetas por DMC
export const buscarTarjeta = async (dmc) => {
  try {
    if (!dmc) {
      alert("Por favor, ingresa un DMC válido.");
      return null;
    }

    const response = await fetch(`http://localhost:5000/tarjetas/${dmc}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const tarjeta = await response.json();
      return tarjeta; // Retorna tarjeta si la respuesta es exitosa
    } else {
      alert("Tarjeta no encontrada o hubo un error en la búsqueda.");
      return null;
    }
  } catch (error) {
    console.error("Error al buscar tarjeta:", error);
    alert("Hubo un problema al conectar con el servidor.");
    return null;
  }
};

// Función para usar tarjeta
export const usarTarjeta = async (tarjeta) => {
  try {
    if (!tarjeta) {
      alert("No hay tarjeta seleccionada para usar.");
      return;
    }

    const response = await fetch(`http://localhost:5000/tarjetas/usar/${tarjeta.dmc}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      alert("Tarjeta usada correctamente.");
      const tarjetaActualizada = await response.json();
      return tarjetaActualizada; // Retorna tarjeta actualizada si la respuesta es exitosa
    } else {
      alert("Error al usar la tarjeta.");
      return null;
    }
  } catch (error) {
    console.error("Error al usar la tarjeta:", error);
    alert("Hubo un problema al conectar con el servidor.");
    return null;
  }
};