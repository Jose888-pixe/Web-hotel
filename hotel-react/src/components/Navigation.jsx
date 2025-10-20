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
              <Nav.Link as={Link} to="/">Inicio</Nav.Link>
              <Nav.Link href="#rooms">Habitaciones</Nav.Link>
              <Nav.Link href="#services">Servicios</Nav.Link>
              <Nav.Link href="#contact">Contacto</Nav.Link>
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
                  className="text-light"
                  style={{ cursor: 'pointer' }}
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
