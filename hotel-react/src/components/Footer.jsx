import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <Container>
        <Row>
          <Col md={4} className="mb-3">
            <h5>
              <i className="fas fa-gem me-2"></i>
              Azure Suites
            </h5>
            <p className="text-light">
              Donde el lujo se encuentra con la sofisticación. 
              Una experiencia inolvidable te espera.
            </p>
            <div className="social-links">
              <a href="#" className="text-light me-3">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-light me-3">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-light me-3">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-light">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </Col>
          
          <Col md={2} className="mb-3">
            <h6>Enlaces Rápidos</h6>
            <ul className="list-unstyled">
              <li><a href="#home" className="text-light text-decoration-none">Inicio</a></li>
              <li><a href="#rooms" className="text-light text-decoration-none">Habitaciones</a></li>
              <li><a href="#contact" className="text-light text-decoration-none">Contacto</a></li>
              <li><a href="/reservations" className="text-light text-decoration-none">Reservas</a></li>
            </ul>
          </Col>
          
          <Col md={3} className="mb-3">
            <h6>Contacto</h6>
            <div className="contact-info">
              <p className="mb-1">
                <i className="fas fa-map-marker-alt me-2"></i>
                Av. Principal 123, Centro
              </p>
              <p className="mb-1">
                <i className="fas fa-phone me-2"></i>
                +1 (555) 123-4567
              </p>
              <p className="mb-1">
                <i className="fas fa-envelope me-2"></i>
                info@azuresuites.com
              </p>
            </div>
          </Col>
          
          <Col md={3} className="mb-3">
            <h6>Horarios</h6>
            <div className="hours-info">
              <p className="mb-1">
                <strong>Check-in:</strong> 3:00 PM
              </p>
              <p className="mb-1">
                <strong>Check-out:</strong> 11:00 AM
              </p>
              <p className="mb-1">
                <strong>Recepción:</strong> 24/7
              </p>
              <p className="mb-1">
                <strong>Restaurante:</strong> 6:00 AM - 11:00 PM
              </p>
            </div>
          </Col>
        </Row>
        
        <hr className="my-4" />
        
        <Row className="align-items-center">
          <Col md={6}>
            <p className="mb-0 text-muted">
              &copy; 2024 Azure Suites. Todos los derechos reservados.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <div className="footer-links">
              <a href="#" className="text-muted text-decoration-none me-3">Política de Privacidad</a>
              <a href="#" className="text-muted text-decoration-none me-3">Términos de Servicio</a>
              <a href="#" className="text-muted text-decoration-none">Cookies</a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
