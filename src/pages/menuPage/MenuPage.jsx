import React, { useState, useEffect, useCallback } from "react";
import { Line } from "react-chartjs-2";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import axios from "axios";
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from "chart.js";

// Registra los elementos necesarios para Chart.js
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const FAMILIAS = [
  { value: '', label: 'Selecciona una familia' },
  { value: 'FED1', label: 'FED1.0' },
  { value: 'FED2', label: 'FED2.0' },
  { value: 'WL', label: 'WL' },
  { value: 'WSE4', label: 'WSE4' },
  { value: 'PP6', label: 'PARK PILOT' },
  { value: 'BRP', label: 'BRP' },
  { value: 'CLUSTER', label: 'CLUSTER' },
  { value: 'PAD2', label: 'PAD2' },
  { value: 'FPXR', label: 'FPXR' },
  { value: 'LPM', label: 'LPM' },
  { value: 'BK3', label: 'BK3' },
  { value: 'BK4 POWER', label: 'BK4 POWER' },
  { value: 'BK4 LOGIC', label: 'BK4 LOGIC' },
  { value: 'CCON FILTER', label: 'CharCON FILTER' },
  { value: 'CCON MAIN', label: 'CharCON MAIN' },
];

const MenuPage = () => {
  const [tarjetas, setTarjetas] = useState([]);
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState('');
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Usos por Tarjeta',
        data: [],
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  });

  // Función para obtener los datos de las tarjetas
  const fetchTarjetas = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:3000/tarjetas");
      setTarjetas(response.data);
    } catch (error) {
      console.error("Error al obtener los datos de las tarjetas:", error);
    }
  }, []);

  // Filtrar los datos de tarjetas por la familia seleccionada
  useEffect(() => {
    fetchTarjetas();
  }, [fetchTarjetas]);

  useEffect(() => {
    // Filtrar las tarjetas según la familia seleccionada
    const filteredTarjetas = familiaSeleccionada
      ? tarjetas.filter((tarjeta) => tarjeta.familia === familiaSeleccionada)
      : tarjetas;

    const labels = filteredTarjetas.map((tarjeta) => tarjeta.dmc);
    const data = filteredTarjetas.map((tarjeta) => tarjeta.veces_usada);

    setChartData({
      labels: labels,
      datasets: [
        {
          label: 'Usos por Tarjeta',
          data: data,
          fill: false,
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1,
        },
      ],
    });
  }, [familiaSeleccionada, tarjetas]);

  const handleFamiliaChange = (event) => {
    setFamiliaSeleccionada(event.target.value);
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen p-4 bg-gray-50">
      <div className="w-full max-w-lg mb-6">
        <FormControl fullWidth>
          <InputLabel id="familia-select-label">Selecciona una familia</InputLabel>
          <Select
            labelId="familia-select-label"
            value={familiaSeleccionada}
            onChange={handleFamiliaChange}
            label="Selecciona una familia"
            variant="outlined"
            className="border border-gray-300 rounded-lg"
          >
            {FAMILIAS.map((familia) => (
              <MenuItem key={familia.value} value={familia.value}>
                {familia.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className="w-full max-w-4xl">
        <Line data={chartData} options={{
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Usos por Tarjeta',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            },
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'DMC',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Usos',
              },
              min: 0,
            },
          },
        }} />
      </div>
    </div>
  );
};

export default MenuPage;