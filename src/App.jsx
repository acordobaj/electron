import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import Navbar from './components/layout/Navbar';
import Login from './pages/auth/Login';
import Register from  './pages/auth/Register';
import RegisterViewPage from './pages/registerViewPage/RegisterViewPage';
import MenuPage from './pages/menuPage/MenuPage';
import BoardsPage from './pages/boardsPage/BoardsPage';
import ControlPanelPage from './pages/controlPanelPage/ControlPanelPage';
import UseBoardPage from './pages/useBoardPage/UseBoardPage';

// Definir un tema global para la aplicación
const theme = {
  colors: {
    primary: "#6200ea",
    secondary: "#03dac6",
    background: "#f5f5f5",
    text: "#333"
  },
  fonts: {
    main: "Arial, sans-serif"
  }
};

// Componente Layout para manejar la visibilidad del Navbar
const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarRoutes = ["/login"];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="bg-gray-200">
      {shouldShowNavbar && <Navbar />}
      {children}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          {/* Rutas sin Navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas con Navbar (Usando "*" para que las subrutas funcionen) */}
          <Route path="*" element={<Layout> {/* Layout incluye el Navbar excepto en "/login" */}
            <Routes>
              <Route path="/" element={<MenuPage />} />
              <Route path="/boardpage" element={<BoardsPage />} />
              <Route path="/controlpanelpage" element={<ControlPanelPage />} />
              <Route path="/registerviewpage" element={<RegisterViewPage />} />
              <Route path="/useboardpage" element={<UseBoardPage />} />
            </Routes>
          </Layout>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;