import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavClick = (sectionId) => {
    // Si no estamos en la página principal, navegar primero
    if (window.location.pathname !== '/') {
      navigate('/');
      // Esperar a que se cargue la página y luego hacer scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleHomeClick = (e) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <Navbar variant="dark" expand="lg" className="navbar fixed-top">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <i className="fas fa-gem me-2"></i>
            Azure Suites
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/" onClick={handleHomeClick}>Inicio</Nav.Link>
              <Nav.Link href="#rooms" onClick={() => handleNavClick('rooms')}>Habitaciones</Nav.Link>
              <Nav.Link href="#services" onClick={() => handleNavClick('services')}>Servicios</Nav.Link>
              <Nav.Link href="#contact" onClick={() => handleNavClick('contact')}>Contacto</Nav.Link>
            </Nav>
            <Nav>
              {user ? (
                <NavDropdown 
                  title={
                    <>
                      <i className="fas fa-user-circle me-1"></i>
                      {user.firstName || user.email}
                    </>
                  } 
                  id="user-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/reservations">
                    Mis Reservas
                  </NavDropdown.Item>
                  {user.role === 'admin' && (
                    <NavDropdown.Item as={Link} to="/admin">
                      Panel de Administración
                    </NavDropdown.Item>
                  )}
                  {user.role === 'operator' && (
                    <NavDropdown.Item as={Link} to="/operator">
                      Panel de Operador
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    Cerrar Sesión
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Nav.Link 
                  onClick={() => setShowLoginModal(true)} 
                  className="text-light cursor-pointer"
                >
                  <i className="fas fa-user me-1"></i>
                  Iniciar Sesión
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <LoginModal 
        show={showLoginModal} 
        onHide={() => setShowLoginModal(false)} 
      />
    </>
  );
};

export default Navigation;
