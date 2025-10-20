import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Button } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import { reservationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import CustomAlert from '../components/CustomAlert';
import ReservationDetailsModal from '../components/ReservationDetailsModal';

const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReservationDetails, setSelectedReservationDetails] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadReservations();
    }
  }, [user]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await reservationsAPI.getReservations();
      // Filter reservations to show only current user's reservations
      const userReservations = (response.data.reservations || []).filter(
        reservation => reservation.userId === user.id
      );
      setReservations(userReservations);
    } catch (err) {
      setError('Error al cargar las reservas');
      console.error('Error loading reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { variant: 'warning', text: 'Pendiente' },
      confirmed: { variant: 'success', text: 'Confirmada' },
      cancelled: { variant: 'danger', text: 'Cancelada' },
      completed: { variant: 'info', text: 'Completada' }
    };
    
    const statusInfo = statusMap[status] || { variant: 'secondary', text: status };
    return <Badge bg={statusInfo.variant}>{statusInfo.text}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const viewReservationDetails = async (reservationId) => {
    try {
      const response = await reservationsAPI.getReservation(reservationId);
      setSelectedReservationDetails(response.data.reservation);
      setShowDetailsModal(true);
    } catch (err) {
      setAlert({ show: true, variant: 'danger', message: 'Error al cargar los detalles de la reserva' });
    }
  };

  const cancelReservation = async (reservationId) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    try {
      await reservationsAPI.updateReservation(reservationId, { status: 'cancelled' });
      loadReservations();
      setAlert({ show: true, variant: 'success', message: 'Reserva cancelada correctamente' });
      setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 3000);
    } catch (err) {
      setAlert({ show: true, variant: 'danger', message: err.response?.data?.message || 'Error al cancelar la reserva' });
    }
  };

  const processPayment = (reservation) => {
    setSelectedReservation(reservation);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    await loadReservations();
    setAlert({ show: true, variant: 'success', message: '✅ Pago procesado exitosamente! Su reserva ha sido confirmada.' });
    setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 5000);
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Container className="py-4 page-container" style={{ paddingTop: '120px' }}>
      {/* Custom Alert */}
      {alert.show && (
        <CustomAlert
          variant={alert.variant}
          message={alert.message}
          onClose={() => setAlert({ show: false, variant: '', message: '' })}
          show={alert.show}
        />
      )}
      
      <Row>
        <Col>
          <h1 className="mb-4" style={{ marginTop: '30px' }}>
            {user.role === 'visitor' ? 'Mis Reservas' : 'Todas las Reservas'}
          </h1>
          
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando reservas...</span>
              </Spinner>
            </div>
          ) : reservations.length > 0 ? (
            <Row>
              {reservations.map((reservation) => (
                <Col md={6} lg={4} key={reservation.id} className="mb-4">
                  <Card className="h-100 shadow-sm">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Reserva #{reservation.id}</span>
                      {getStatusBadge(reservation.status)}
                    </Card.Header>
                    <Card.Body>
                      <Card.Title>{reservation.room.name}</Card.Title>
                      <Card.Subtitle className="mb-3 text-muted">
                        {reservation.room.type}
                      </Card.Subtitle>
                      
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span><i className="fas fa-calendar-check me-2"></i>Check-in:</span>
                          <span>{formatDate(reservation.checkIn)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span><i className="fas fa-calendar-times me-2"></i>Check-out:</span>
                          <span>{formatDate(reservation.checkOut)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span><i className="fas fa-moon me-2"></i>Noches:</span>
                          <span>{calculateNights(reservation.checkIn, reservation.checkOut)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span><i className="fas fa-users me-2"></i>Huéspedes:</span>
                          <span>{reservation.adults + reservation.children || reservation.guests}</span>
                        </div>
                      </div>
                      
                      <div className="border-top pt-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold">Total:</span>
                          <span className="h5 mb-0 text-primary">${reservation.totalPrice}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span>Estado de Pago:</span>
                          <Badge bg={reservation.paymentStatus === 'paid' ? 'success' : 'warning'}>
                            {reservation.paymentStatus === 'paid' ? 'Pago Confirmado' : 'Pago Pendiente'}
                          </Badge>
                        </div>
                      </div>
                    </Card.Body>
                    <Card.Footer className="bg-transparent">
                      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => viewReservationDetails(reservation.id)}
                        >
                          Ver Detalles
                        </Button>
                        {reservation.paymentStatus === 'pending' && (
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => processPayment(reservation)}
                            disabled={loading}
                          >
                            <i className="fas fa-credit-card me-1"></i>
                            Pagar Ahora
                          </Button>
                        )}
                        {reservation.status === 'pending' && (
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => cancelReservation(reservation.id)}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-bed fa-3x text-muted mb-3"></i>
              <h3 className="text-muted">No tienes reservas</h3>
              <p className="text-muted">
                Cuando hagas una reserva, aparecerá aquí.
              </p>
              <Button variant="primary" href="/#rooms">
                Explorar Habitaciones
              </Button>
            </div>
          )}
        </Col>
      </Row>

      <PaymentModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        reservation={selectedReservation}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Reservation Details Modal */}
      <ReservationDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        reservation={selectedReservationDetails}
      />
    </Container>
  );
};

export default ReservationsPage;
