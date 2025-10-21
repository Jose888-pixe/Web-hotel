import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Carousel } from 'react-bootstrap';
import { roomsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReservationModal from '../components/ReservationModal';
import CustomAlert from '../components/CustomAlert';
import '../styles/RoomDetailsPage.css';

const RoomDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [successAlert, setSuccessAlert] = useState({ show: false, message: '' });
  const [roomImages, setRoomImages] = useState([]);

  useEffect(() => {
    fetchRoomDetails();
    loadRoomImages();
  }, [id]);

  const loadRoomImages = () => {
    const savedImages = localStorage.getItem('roomImages');
    if (savedImages) {
      try {
        const allImages = JSON.parse(savedImages);
        const images = allImages[id] || [];
        const detailsImages = images.filter(img => img.displayIn?.details);
        setRoomImages(detailsImages);
      } catch (e) {
        console.error('Error loading room images:', e);
      }
    }
  };

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const response = await roomsAPI.getRoom(id);
      console.log('Room data received:', response.data);
      let roomData = response.data.room || response.data;
      
      // Parse images if it's a JSON string
      if (roomData.images && typeof roomData.images === 'string') {
        try {
          roomData.images = JSON.parse(roomData.images);
        } catch (e) {
          console.error('Error parsing room images:', e);
          roomData.images = [];
        }
      }
      
      // Ensure images is an array
      if (!Array.isArray(roomData.images)) {
        roomData.images = [];
      }
      
      setRoom(roomData);
      setError('');
    } catch (error) {
      console.error('Error fetching room details:', error);
      setError('No se pudo cargar la información de la habitación');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = () => {
    if (!user) {
      setError('Por favor inicia sesión para reservar');
      setTimeout(() => setError(''), 5000);
      return;
    }
    setShowReservationModal(true);
  };

  const handleReservationSuccess = () => {
    setShowReservationModal(false);
    setSuccessAlert({ show: true, message: '✅ ¡Reserva creada exitosamente! Proceda con el pago para confirmar su reserva.' });
    setTimeout(() => setSuccessAlert({ show: false, message: '' }), 5000);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { bg: 'success', text: 'Disponible' },
      occupied: { bg: 'danger', text: 'Ocupada' },
      maintenance: { bg: 'warning', text: 'Mantenimiento' },
      cleaning: { bg: 'info', text: 'Limpieza' }
    };
    const config = statusConfig[status] || statusConfig.available;
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const getRoomTypeLabel = (type) => {
    const types = {
      single: 'Habitación Individual',
      double: 'Habitación Doble',
      suite: 'Suite',
      deluxe: 'Habitación Deluxe',
      presidential: 'Suite Presidencial'
    };
    return types[type] || type;
  };

  const getFeatureIcon = (feature) => {
    const icons = {
      wifi: 'fa-wifi',
      tv: 'fa-tv',
      airConditioning: 'fa-snowflake',
      minibar: 'fa-glass-martini-alt',
      safe: 'fa-lock',
      balcony: 'fa-door-open',
      jacuzzi: 'fa-hot-tub',
      oceanView: 'fa-water',
      cityView: 'fa-city',
      roomService: 'fa-concierge-bell',
      breakfast: 'fa-coffee',
      parking: 'fa-parking'
    };
    return icons[feature] || 'fa-check';
  };

  const getFeatureLabel = (feature) => {
    const labels = {
      wifi: 'WiFi Gratuito',
      tv: 'TV por Cable',
      airConditioning: 'Aire Acondicionado',
      minibar: 'Minibar',
      safe: 'Caja Fuerte',
      balcony: 'Balcón',
      jacuzzi: 'Jacuzzi',
      oceanView: 'Vista al Mar',
      cityView: 'Vista a la Ciudad',
      roomService: 'Servicio a Habitación',
      breakfast: 'Desayuno Incluido',
      parking: 'Estacionamiento'
    };
    return labels[feature] || feature;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center page-container">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando detalles de la habitación...</p>
      </Container>
    );
  }

  if (error || !room) {
    return (
      <Container className="py-5 page-container">
        <Alert variant="danger">
          {error || 'Habitación no encontrada'}
        </Alert>
        <Button variant="primary" onClick={() => navigate('/')}>
          Volver al Inicio
        </Button>
      </Container>
    );
  }

  return (
    <div className="room-details-page page-container">
      {/* Success Alert */}
      {successAlert.show && (
        <CustomAlert
          variant="success"
          message={successAlert.message}
          onClose={() => setSuccessAlert({ show: false, message: '' })}
          show={successAlert.show}
        />
      )}
      
      {/* Back Button */}
      <Container className="py-3">
        <Button variant="outline-primary" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left me-2"></i>
          Volver a Habitaciones
        </Button>
      </Container>

      {/* Image Gallery */}
      <section className="room-gallery">
        <Container>
          <Carousel>
            {roomImages.length > 0 ? (
              // Mostrar imágenes subidas por el admin
              roomImages.map((image, index) => (
                <Carousel.Item key={index}>
                  <img
                    className="d-block w-100 room-carousel-image"
                    src={image.data}
                    alt={`${room.name} - ${index + 1}`}
                  />
                  <Carousel.Caption>
                    <Badge bg="success" className="mb-2">
                      <i className="fas fa-check-circle me-1"></i>
                      Foto Real del Hotel
                    </Badge>
                  </Carousel.Caption>
                </Carousel.Item>
              ))
            ) : room.images && room.images.length > 0 ? (
              // Mostrar imágenes de la base de datos
              room.images.map((image, index) => (
                <Carousel.Item key={index}>
                  <img
                    className="d-block w-100 room-carousel-image"
                    src={image}
                    alt={`${room.name} - ${index + 1}`}
                  />
                </Carousel.Item>
              ))
            ) : (
              // Imagen por defecto
              <Carousel.Item>
                <img
                  className="d-block w-100 room-carousel-image"
                  src={`https://source.unsplash.com/1200x500/?hotel,room,${room.type}`}
                  alt={room.name}
                />
              </Carousel.Item>
            )}
          </Carousel>
          
          {/* Indicador de imágenes subidas */}
          {roomImages.length > 0 && (
            <div className="text-center mt-3">
              <Badge bg="info" className="px-3 py-2">
                <i className="fas fa-images me-2"></i>
                {roomImages.length} foto{roomImages.length > 1 ? 's' : ''} real{roomImages.length > 1 ? 'es' : ''} del hotel
              </Badge>
            </div>
          )}
          
          {/* Description below carousel */}
          <div className="room-description-section py-4">
            <Container>
              <Card className="shadow-sm">
                <Card.Body>
                  <h4 className="mb-3">
                    <i className="fas fa-info-circle text-primary me-2"></i>
                    Descripción
                  </h4>
                  <p className="lead">{room.description}</p>
                </Card.Body>
              </Card>
            </Container>
          </div>
        </Container>
      </section>

      {/* Room Details */}
      <section className="room-info py-5">
        <Container>
          <Row>
            {/* Left Column - Main Info */}
            <Col lg={8} className="mb-4">
              <Card className="shadow-sm mb-4">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h1 className="mb-2">{room.name}</h1>
                      <p className="text-muted mb-2">{getRoomTypeLabel(room.type)}</p>
                      <div className="mb-3">
                        {getStatusBadge(room.status)}
                        {!room.isActive && (
                          <Badge bg="secondary" className="ms-2">
                            Cerrada Temporalmente
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-end">
                      <h2 className="text-primary mb-0">
                        ${(parseFloat(room.price) || 0).toFixed(2)}
                      </h2>
                      <small className="text-muted">por noche</small>
                    </div>
                  </div>

                  <div className="room-specs mb-4">
                    <Row className="g-3">
                      <Col xs={6} md={3}>
                        <div className="text-center">
                          <i className="fas fa-users fa-2x text-primary mb-2"></i>
                          <p className="mb-0"><strong>Capacidad</strong></p>
                          <p className="text-muted">{room.capacity} personas</p>
                        </div>
                      </Col>
                      <Col xs={6} md={3}>
                        <div className="text-center">
                          <i className="fas fa-ruler-combined fa-2x text-primary mb-2"></i>
                          <p className="mb-0"><strong>Tamaño</strong></p>
                          <p className="text-muted">{room.size} m²</p>
                        </div>
                      </Col>
                      <Col xs={6} md={3}>
                        <div className="text-center">
                          <i className="fas fa-door-open fa-2x text-primary mb-2"></i>
                          <p className="mb-0"><strong>Número</strong></p>
                          <p className="text-muted">#{room.number}</p>
                        </div>
                      </Col>
                      <Col xs={6} md={3}>
                        <div className="text-center">
                          <i className="fas fa-building fa-2x text-primary mb-2"></i>
                          <p className="mb-0"><strong>Piso</strong></p>
                          <p className="text-muted">{room.floor}°</p>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  <hr />

                  <div className="room-features">
                    <h4 className="mb-3">
                      <i className="fas fa-star text-primary me-2"></i>
                      Amenidades
                    </h4>
                    <Row className="g-3">
                      {room.features && typeof room.features === 'object' ? (
                        Object.entries(room.features).map(([key, value]) => {
                          if (value === true || value === 'true') {
                            return (
                              <Col xs={6} md={4} key={key}>
                                <div className="d-flex align-items-center">
                                  <i className={`fas ${getFeatureIcon(key)} text-primary me-2`}></i>
                                  <span>{getFeatureLabel(key)}</span>
                                </div>
                              </Col>
                            );
                          }
                          return null;
                        })
                      ) : (
                        <Col xs={12}>
                          <p className="text-muted">No hay amenidades registradas</p>
                        </Col>
                      )}
                    </Row>
                  </div>
                </Card.Body>
              </Card>

              {/* Policies */}
              <Card className="shadow-sm">
                <Card.Body>
                  <h4 className="mb-3">
                    <i className="fas fa-file-alt text-primary me-2"></i>
                    Políticas del Hotel
                  </h4>
                  <Row>
                    <Col md={6} className="mb-3">
                      <h6><i className="fas fa-clock text-success me-2"></i>Check-in</h6>
                      <p className="text-muted mb-0">A partir de las 15:00</p>
                    </Col>
                    <Col md={6} className="mb-3">
                      <h6><i className="fas fa-clock text-danger me-2"></i>Check-out</h6>
                      <p className="text-muted mb-0">Hasta las 12:00</p>
                    </Col>
                    <Col md={6} className="mb-3">
                      <h6><i className="fas fa-ban-smoking text-warning me-2"></i>Fumar</h6>
                      <p className="text-muted mb-0">Habitación libre de humo</p>
                    </Col>
                    <Col md={6} className="mb-3">
                      <h6><i className="fas fa-paw text-info me-2"></i>Mascotas</h6>
                      <p className="text-muted mb-0">No se permiten mascotas</p>
                    </Col>
                    <Col xs={12}>
                      <h6><i className="fas fa-times-circle text-danger me-2"></i>Cancelación</h6>
                      <p className="text-muted mb-0">
                        Cancelación gratuita hasta 48 horas antes del check-in. 
                        Después se cobrará el 50% del total.
                      </p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* Right Column - Booking Card */}
            <Col lg={4}>
              <Card className="shadow-sm booking-card-sticky">
                <Card.Body>
                  <h4 className="mb-3">Reservar esta habitación</h4>
                  
                  <div className="price-summary mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Precio por noche:</span>
                      <strong>${(parseFloat(room.price) || 0).toFixed(2)}</strong>
                    </div>
                  </div>

                  <hr />

                  <Button 
                    variant={room.status === 'available' && room.isActive ? 'primary' : 'secondary'}
                    size="lg" 
                    className="w-100 mb-3"
                    onClick={handleReserve}
                    disabled={room.status !== 'available' || !room.isActive}
                  >
                    <i className="fas fa-calendar-check me-2"></i>
                    Reservar Ahora
                  </Button>
                  {room.status === 'available' && room.isActive && (
                    <p className="text-center text-muted small mb-0">
                      No se te cobrará hasta que confirmes tu reserva
                    </p>
                  )}

                  <hr />

                  <div className="contact-info">
                    <h6 className="mb-3">¿Necesitas ayuda?</h6>
                    <p className="small text-muted mb-2">
                      <i className="fas fa-phone me-2"></i>
                      +1 (555) 123-4567
                    </p>
                    <p className="small text-muted mb-2">
                      <i className="fas fa-envelope me-2"></i>
                      reservas@azuresuites.com
                    </p>
                    <p className="small text-muted mb-0">
                      <i className="fas fa-clock me-2"></i>
                      Lun - Dom: 24/7
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Reservation Modal */}
      <ReservationModal
        show={showReservationModal}
        onHide={() => setShowReservationModal(false)}
        room={room}
        onSuccess={handleReservationSuccess}
      />
    </div>
  );
};

export default RoomDetailsPage;
