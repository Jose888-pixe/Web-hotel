import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { roomsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReservationModal from '../components/ReservationModal';
import ContactForm from '../components/ContactForm';

const HomePage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    checkIn: '',
    checkOut: '',
    adults: '2',
    children: '0',
    type: '',
    minPrice: '',
    maxPrice: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async (searchFilters) => {
    try {
      setLoading(true);
      setError('');
      const response = await roomsAPI.getRooms(searchFilters);
      const allRooms = response.data.rooms || [];
      
      // Group rooms by type and name, show only one per type
      const grouped = {};
      allRooms.forEach(room => {
        const key = `${room.type}_${room.name}`;
        if (!grouped[key]) {
          grouped[key] = room;
        }
      });
      
      setRooms(Object.values(grouped));
    } catch (err) {
      setError('Error al cargar las habitaciones');
      console.error('Error loading rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadRooms(filters);
  };

  const handleReserve = (room) => {
    if (!user) {
      alert('Debes iniciar sesión para hacer una reserva');
      return;
    }
    setSelectedRoom(room);
    setShowReservationModal(true);
  };

  return (
    <div>
      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-overlay"></div>
        <Container className="h-100">
          <Row className="h-100 align-items-center">
            <Col lg={8} className="mx-auto text-center text-white">
              <h1 className="hero-title mb-4">Bienvenido a Azure Suites</h1>
              <p className="hero-subtitle mb-5">
                Donde la elegancia moderna se encuentra con el confort excepcional.
              </p>
              <div className="hero-buttons">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="me-3" 
                  onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Explorar Habitaciones
                </Button>
                <Button 
                  variant="outline-light" 
                  size="lg" 
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Contactar
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Quick Booking Section */}
      <section className="quick-booking py-5 bg-light">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <Card className="shadow-lg border-0">
                <Card.Body className="p-4">
                  <h3 className="text-center mb-4">Reserva Rápida</h3>
                  <Form onSubmit={handleSearch}>
                    <Row>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Check-in</Form.Label>
                          <Form.Control
                            type="date"
                            value={filters.checkIn}
                            onChange={(e) => setFilters({...filters, checkIn: e.target.value})}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Check-out</Form.Label>
                          <Form.Control
                            type="date"
                            value={filters.checkOut}
                            onChange={(e) => setFilters({...filters, checkOut: e.target.value})}
                            min={filters.checkIn || new Date().toISOString().split('T')[0]}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group className="mb-3">
                          <Form.Label>Adultos</Form.Label>
                          <Form.Select
                            value={filters.adults}
                            onChange={(e) => setFilters({...filters, adults: e.target.value})}
                          >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group className="mb-3">
                          <Form.Label>Niños</Form.Label>
                          <Form.Select
                            value={filters.children}
                            onChange={(e) => setFilters({...filters, children: e.target.value})}
                          >
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group className="mb-3">
                          <Form.Label>&nbsp;</Form.Label>
                          <div className="d-grid gap-2">
                            <Button type="submit" variant="primary">
                              Buscar
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            >
                              <i className={`fas fa-chevron-${showAdvancedFilters ? 'up' : 'down'} me-1`}></i>
                              Filtros
                            </Button>
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    {showAdvancedFilters && (
                      <Row className="mt-3 p-3 bg-light rounded">
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Tipo de Habitación</Form.Label>
                            <Form.Select
                              value={filters.type}
                              onChange={(e) => setFilters({...filters, type: e.target.value})}
                            >
                              <option value="">Todos los tipos</option>
                              <option value="single">Individual</option>
                              <option value="double">Doble</option>
                              <option value="suite">Suite</option>
                              <option value="deluxe">Deluxe</option>
                              <option value="presidential">Presidencial</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Precio Mínimo</Form.Label>
                            <Form.Control
                              type="number"
                              placeholder="$0"
                              value={filters.minPrice}
                              onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                              min="0"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Precio Máximo</Form.Label>
                            <Form.Control
                              type="number"
                              placeholder="$1000"
                              value={filters.maxPrice}
                              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                              min="0"
                            />
                          </Form.Group>
                        </Col>
                        <Col xs={12}>
                          <div className="d-flex gap-2">
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => {
                                setFilters({
                                  checkIn: '',
                                  checkOut: '',
                                  adults: '2',
                                  children: '0',
                                  type: '',
                                  minPrice: '',
                                  maxPrice: ''
                                });
                                loadRooms();
                              }}
                            >
                              <i className="fas fa-times me-1"></i>
                              Limpiar Filtros
                            </Button>
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={() => loadRooms(filters)}
                            >
                              <i className="fas fa-search me-1"></i>
                              Aplicar Filtros
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    )}
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title">Nuestras Habitaciones</h2>
            <p className="section-subtitle">Descubre el lujo y confort en cada una de nuestras habitaciones</p>
          </div>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Row>
            {loading ? (
              <Col className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando habitaciones...</span>
                </div>
              </Col>
            ) : rooms.length > 0 ? (
              rooms.map((room) => (
                <Col lg={4} md={6} key={room.id} className="mb-4 fade-in-up">
                  <div className="room-card">
                    <div className="room-image">
                      <img 
                        src={room.images && room.images.length > 0 
                          ? (typeof room.images[0] === 'string' ? room.images[0] : room.images[0].url)
                          : 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop'}
                        alt={room.name}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop';
                        }}
                      />
                      <div className="room-price">${room.price}/noche</div>
                    </div>
                    <div className="room-content">
                      <h4>{room.name}</h4>
                      <p className="room-type">{room.type}</p>
                      <div className="room-features">
                        <span>
                          <i className="fas fa-users"></i>
                          {` ${room.capacity} personas`}
                        </span>
                        <span>
                          <i className="fas fa-bed"></i>
                          {` ${room.beds || 1} camas`}
                        </span>
                      </div>
                    </div>
                    <div className="room-actions">
                      <Button 
                        variant="outline-primary" 
                        onClick={() => navigate(`/room/${room.id}`)}
                      >
                        Ver Detalles
                      </Button>
                      <Button variant="primary" onClick={() => handleReserve(room)}>
                        Reservar
                      </Button>
                    </div>
                  </div>
                </Col>
              ))
            ) : (
              <Col className="text-center py-5">
                <p className="text-muted">No se encontraron habitaciones.</p>
              </Col>
            )}
          </Row>
        </Container>
      </section>

      {/* Services Section */}
      <section id="services" className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title">Nuestros Servicios</h2>
            <p className="section-subtitle">
              Disfruta de una experiencia completa con nuestras instalaciones y servicios de primera clase
            </p>
          </div>
          
          <Row className="g-4">
            <Col lg={3} md={6}>
              <Card className="service-card h-100 text-center border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="service-icon mb-3">
                    <i className="fas fa-wifi fa-3x text-primary"></i>
                  </div>
                  <h5 className="mb-3">WiFi de Alta Velocidad</h5>
                  <p className="text-muted">Internet de alta velocidad gratuito en todas las áreas del hotel</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6}>
              <Card className="service-card h-100 text-center border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="service-icon mb-3">
                    <i className="fas fa-spa fa-3x text-primary"></i>
                  </div>
                  <h5 className="mb-3">Spa & Wellness</h5>
                  <p className="text-muted">Centro de spa completo con masajes, sauna y tratamientos de belleza</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6}>
              <Card className="service-card h-100 text-center border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="service-icon mb-3">
                    <i className="fas fa-utensils fa-3x text-primary"></i>
                  </div>
                  <h5 className="mb-3">Restaurante Buffet</h5>
                  <p className="text-muted">Buffet internacional con cocina local e internacional disponible 24/7</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6}>
              <Card className="service-card h-100 text-center border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="service-icon mb-3">
                    <i className="fas fa-swimming-pool fa-3x text-primary"></i>
                  </div>
                  <h5 className="mb-3">Piscina Infinity</h5>
                  <p className="text-muted">Piscina infinity con vista al mar y área de descanso</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6}>
              <Card className="service-card h-100 text-center border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="service-icon mb-3">
                    <i className="fas fa-dumbbell fa-3x text-primary"></i>
                  </div>
                  <h5 className="mb-3">Gimnasio</h5>
                  <p className="text-muted">Gimnasio equipado con máquinas de última generación</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6}>
              <Card className="service-card h-100 text-center border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="service-icon mb-3">
                    <i className="fas fa-umbrella-beach fa-3x text-primary"></i>
                  </div>
                  <h5 className="mb-3">Acceso a Playa</h5>
                  <p className="text-muted">Acceso directo a playa privada con servicio de toallas y sombrillas</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6}>
              <Card className="service-card h-100 text-center border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="service-icon mb-3">
                    <i className="fas fa-concierge-bell fa-3x text-primary"></i>
                  </div>
                  <h5 className="mb-3">Servicio de Conserjería</h5>
                  <p className="text-muted">Asistencia personalizada 24/7 para todas tus necesidades</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6}>
              <Card className="service-card h-100 text-center border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="service-icon mb-3">
                    <i className="fas fa-parking fa-3x text-primary"></i>
                  </div>
                  <h5 className="mb-3">Estacionamiento</h5>
                  <p className="text-muted">Estacionamiento privado gratuito con servicio de valet</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-5 bg-dark text-white">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center mb-5">
              <h2 className="section-title text-white">Contáctanos</h2>
              <p className="section-subtitle text-light">
                Estamos aquí para hacer tu estancia inolvidable
              </p>
            </Col>
          </Row>
          <Row>
            <Col lg={6} className="mb-4">
              <div className="contact-info">
                <h4 className="mb-4">Información de Contacto</h4>
                <div className="mb-3">
                  <i className="fas fa-map-marker-alt me-3 text-primary"></i>
                  <span>Dique Cabra Corral, Salta, Argentina</span>
                </div>
                <div className="mb-3">
                  <i className="fas fa-phone me-3 text-primary"></i>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="mb-3">
                  <i className="fas fa-envelope me-3 text-primary"></i>
                  <span>info@azuresuites.com</span>
                </div>
                <div className="mb-3">
                  <i className="fas fa-clock me-3 text-primary"></i>
                  <span>Atención 24/7</span>
                </div>
                
                {/* Mapa de ubicación */}
                <div className="mt-4">
                  <h5 className="mb-3">Nuestra Ubicación</h5>
                  <div className="map-container" style={{height: '300px', borderRadius: '10px', overflow: 'hidden'}}>
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28649.84!2d-65.3!3d-25.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x941f0e8b8b8b8b8b%3A0x8b8b8b8b8b8b8b8b!2sDique%20Cabra%20Corral%2C%20Salta!5e0!3m2!1ses!2sar!4v1234567890123!5m2!1ses!2sar"
                      width="100%"
                      height="100%"
                      style={{border: 0}}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Ubicación del Hotel"
                    ></iframe>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="contact-form">
                <h4 className="mb-4">Envíanos un Mensaje</h4>
                <ContactForm />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <ReservationModal
        show={showReservationModal}
        onHide={() => setShowReservationModal(false)}
        room={selectedRoom}
      />
    </div>
  );
};

export default HomePage;
