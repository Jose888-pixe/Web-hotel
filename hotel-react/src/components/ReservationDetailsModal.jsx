import React from 'react';
import { Modal, Badge, Row, Col } from 'react-bootstrap';
import '../styles/ReservationDetailsModal.css';

const ReservationDetailsModal = ({ show, onHide, reservation }) => {
  if (!reservation) return null;

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'warning', text: 'Pendiente', icon: 'fa-clock' },
      confirmed: { bg: 'info', text: 'Confirmada', icon: 'fa-check-circle' },
      'checked-in': { bg: 'primary', text: 'Check-in', icon: 'fa-door-open' },
      'checked-out': { bg: 'success', text: 'Check-out', icon: 'fa-door-closed' },
      cancelled: { bg: 'danger', text: 'Cancelada', icon: 'fa-times-circle' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <Badge bg={config.bg} className="status-badge">
        <i className={`fas ${config.icon} me-1`}></i>
        {config.text}
      </Badge>
    );
  };

  const getPaymentBadge = (paymentStatus) => {
    return paymentStatus === 'paid' ? (
      <Badge bg="success" className="payment-badge">
        <i className="fas fa-check-circle me-1"></i>
        Pagado
      </Badge>
    ) : (
      <Badge bg="warning" className="payment-badge">
        <i className="fas fa-clock me-1"></i>
        Pendiente
      </Badge>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateNights = () => {
    const checkIn = new Date(reservation.checkIn);
    const checkOut = new Date(reservation.checkOut);
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg"
      centered
      className="reservation-details-modal"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="w-100">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <i className="fas fa-file-invoice me-2 text-primary"></i>
              Detalles de Reserva
            </div>
            <div>
              {getStatusBadge(reservation.status)}
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="pt-2">
        {/* Reservation Number */}
        <div className="reservation-number-section mb-4">
          <div className="text-center p-3 bg-light rounded">
            <small className="text-muted d-block mb-1">Número de Reserva</small>
            <h4 className="mb-0 text-primary fw-bold">{reservation.reservationNumber}</h4>
          </div>
        </div>

        {/* Guest Information */}
        <div className="info-section mb-4">
          <h6 className="section-title">
            <i className="fas fa-user me-2"></i>
            Información del Huésped
          </h6>
          <Row>
            <Col md={6}>
              <div className="info-item">
                <span className="info-label">Nombre:</span>
                <span className="info-value">
                  {reservation.user ? 
                    `${reservation.user.firstName} ${reservation.user.lastName}` : 
                    'No disponible'
                  }
                </span>
              </div>
            </Col>
            <Col md={6}>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{reservation.user?.email || 'No disponible'}</span>
              </div>
            </Col>
            <Col md={6}>
              <div className="info-item">
                <span className="info-label">Teléfono:</span>
                <span className="info-value">{reservation.user?.phone || 'No disponible'}</span>
              </div>
            </Col>
            <Col md={6}>
              <div className="info-item">
                <span className="info-label">Huéspedes:</span>
                <span className="info-value">
                  <i className="fas fa-users me-1"></i>
                  {reservation.adults} adultos, {reservation.children} niños
                </span>
              </div>
            </Col>
          </Row>
        </div>

        {/* Room Information */}
        <div className="info-section mb-4">
          <h6 className="section-title">
            <i className="fas fa-bed me-2"></i>
            Información de la Habitación
          </h6>
          <Row>
            <Col md={6}>
              <div className="info-item">
                <span className="info-label">Habitación:</span>
                <span className="info-value">
                  {reservation.room ? 
                    `${reservation.room.number} - ${reservation.room.name}` : 
                    'No disponible'
                  }
                </span>
              </div>
            </Col>
            <Col md={6}>
              <div className="info-item">
                <span className="info-label">Tipo:</span>
                <span className="info-value">
                  <Badge bg="secondary">{reservation.room?.type || 'N/A'}</Badge>
                </span>
              </div>
            </Col>
            <Col md={6}>
              <div className="info-item">
                <span className="info-label">Precio por noche:</span>
                <span className="info-value">${reservation.room?.price || 0}</span>
              </div>
            </Col>
            <Col md={6}>
              <div className="info-item">
                <span className="info-label">Capacidad:</span>
                <span className="info-value">{reservation.room?.capacity || 0} personas</span>
              </div>
            </Col>
          </Row>
        </div>

        {/* Dates Information */}
        <div className="info-section mb-4">
          <h6 className="section-title">
            <i className="fas fa-calendar-alt me-2"></i>
            Fechas de Estadía
          </h6>
          <Row>
            <Col md={6}>
              <div className="date-card check-in">
                <div className="date-icon">
                  <i className="fas fa-sign-in-alt"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Check-in</small>
                  <strong>{formatDate(reservation.checkIn)}</strong>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="date-card check-out">
                <div className="date-icon">
                  <i className="fas fa-sign-out-alt"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Check-out</small>
                  <strong>{formatDate(reservation.checkOut)}</strong>
                </div>
              </div>
            </Col>
          </Row>
          <div className="text-center mt-3">
            <Badge bg="info" className="nights-badge">
              <i className="fas fa-moon me-1"></i>
              {calculateNights()} {calculateNights() === 1 ? 'noche' : 'noches'}
            </Badge>
          </div>
        </div>

        {/* Payment Information */}
        <div className="info-section mb-3">
          <h6 className="section-title">
            <i className="fas fa-credit-card me-2"></i>
            Información de Pago
          </h6>
          <Row>
            <Col md={6}>
              <div className="info-item">
                <span className="info-label">Estado de Pago:</span>
                <span className="info-value">{getPaymentBadge(reservation.paymentStatus)}</span>
              </div>
            </Col>
            <Col md={6}>
              <div className="info-item">
                <span className="info-label">Método:</span>
                <span className="info-value">
                  {reservation.paymentMethod ? 
                    reservation.paymentMethod.replace('_', ' ').toUpperCase() : 
                    'No especificado'
                  }
                </span>
              </div>
            </Col>
          </Row>
          
          {/* Total Amount */}
          <div className="total-amount-card mt-3">
            <div className="d-flex justify-content-between align-items-center">
              <span className="total-label">Total a Pagar:</span>
              <span className="total-value">${reservation.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {reservation.specialRequests && (
          <div className="info-section">
            <h6 className="section-title">
              <i className="fas fa-comment-dots me-2"></i>
              Solicitudes Especiales
            </h6>
            <div className="special-requests-box">
              {reservation.specialRequests}
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ReservationDetailsModal;
