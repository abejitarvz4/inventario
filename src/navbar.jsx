import './navbar.css'
import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav class="Navbar">
      <div class="navbar-links">
        <Link to="/" class="iniciobtn">Inicio</Link>
        <Link to="/graficas" class="graficasbtn">Graficas</Link>
        <Link to="/productos" class="productosbtn">Productos</Link>
        <Link to="/login" class="loginbtn">Iniciar Sesion</Link>
      </div>
    </nav>
  );
};

export default Navbar