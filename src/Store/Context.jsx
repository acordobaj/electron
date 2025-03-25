import React, { createContext, useState } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [formularioActivo, setFormularioActivo] = useState("");

  const toggleFormulario = (title) => {
    setFormularioActivo((prevFormulario) =>
      prevFormulario === title ? "" : title
    );
  };

  return (
    <ThemeContext.Provider value={{ formularioActivo, toggleFormulario }}>
      {children}
    </ThemeContext.Provider>
  );
};