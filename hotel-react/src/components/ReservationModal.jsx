import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { reservationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DatePicker from './DatePicker';
import CustomAlert from './CustomAlert';

const ReservationModal = ({ show, onHide, room, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: '2',
    specialRequests: ''
  });
  const [occupiedDates, setOccupiedDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successAlert, setSuccessAlert] = useState({ show: false, message: '' });

  useEffect(() => {
    if (show && room) {
      console.log('🚀 MODAL OPENED FOR ROOM:', room.name, 'ID:', room.id);
      setFormData({
        checkIn: '',
        checkOut: '',
        guests: '2',
        specialRequests: ''
      });
      setError('');
      loadOccupiedDates();
    }
  }, [show, room]);

  useEffect(() => {
    console.log('📊 FormData updated:', formData);
  }, [formData]);

  const loadOccupiedDates = async () => {
    try {
      console.log('📡 Fetching occupied dates for room', room.id);
      const response = await fetch(`http://localhost:3001/api/rooms/${room.id}/occupied-dates`);
      const data = await response.json();
      console.log('✅ Received data:', data);
      console.log('✅ Occupied dates:', data.occupiedDates);
      setOccupiedDates(data.occupiedDates || []);
    } catch (err) {
      console.error('❌ Error:', err);
      setOccupiedDates([]);
    }
  };

  const hasOccupiedDatesInRange = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return false;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      if (occupiedDates.includes(dateStr)) {
        return true;
      }
    }
    return false;
  };

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    if (!room) return 0;
    return calculateNights() * room.price;
  };

  const handleCheckInChange = (date) => {
    console.log('📅 Check-in changed to:', date);
    setFormData(prev => {
      const newData = {...prev, checkIn: date};
      console.log('New formData:', newData);
      return newData;
    });
  };

  const handleCheckOutChange = (date) => {
    console.log('📅 Check-out changed to:', date);
    setFormData(prev => {
      const newData = {...prev, checkOut: date};
      console.log('New formData:', newData);
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Debes iniciar sesión para hacer una reserva');
      return;
    }

    if (!formData.checkIn || !formData.checkOut) {
      setError('Por favor completa las fechas de check-in y check-out');
      return;
    }

    if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
      setError('La fecha de check-out debe ser posterior a la de check-in');
      return;
    }

    if (hasOccupiedDatesInRange(formData.checkIn, formData.checkOut)) {
      setError('Las fechas seleccionadas incluyen días ocupados. Por favor elige otras fechas.');
      return;
    }

    try {
      setError('');
      setLoading(true);

      const reservationData = {
        roomId: room.id,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        adults: parseInt(formData.guests),
        children: 0,
        guestFirstName: user.firstName || 'Usuario',
        guestLastName: user.lastName || 'Invitado',
        guestEmail: user.email,
        guestPhone: user.phone || '000-000-0000',
        specialRequests: formData.specialRequests
      };

      await reservationsAPI.createReservation(reservationData);
      
      setFormData({
        checkIn: '',
        checkOut: '',
        guests: '2',
        specialRequests: ''
      });
      
      // Cerrar modal inmediatamente
      onHide();
      
      // Si hay callback de éxito, usarlo (para HomePage y RoomDetailsPage)
      if (onSuccess) {
        onSuccess();
      } else {
        // Si no hay callback, mostrar alert interno
        setSuccessAlert({ show: true, message: '✅ ¡Reserva creada exitosamente! Proceda con el pago para confirmar su reserva.' });
        setTimeout(() => {
          setSuccessAlert({ show: false, message: '' });
        }, 5000);
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message;
      if (errorMessage === 'Room not available for selected dates') {
        setError('La habitación no está disponible para las fechas seleccionadas. Por favor elige otras fechas.');
      } else {
        setError(errorMessage || 'Error al crear la reserva');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!room) return null;

  const nights = calculateNights();
  const total = calculateTotal();

  return (
    <>
      {successAlert.show && (
        <CustomAlert
          variant="success"
          message={successAlert.message}
          show={successAlert.show}
        />
      )}
      
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{room.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <h6 className="text-muted">{room.type}</h6>
            <p><i className="fas fa-users me-2"></i>Hasta {room.capacity} huéspedes</p>
          <h5 className="text-primary">${room.price}/noche</h5>
        </div>

        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Selecciona las fechas de tu estadía</Form.Label>
            <p className="text-muted small mb-2">
              Haz clic en la fecha de check-in, luego en la fecha de check-out. 
              Para cambiar el check-in, haz clic sobre él para borrarlo.
            </p>
            <DatePicker
              checkInDate={formData.checkIn}
              checkOutDate={formData.checkOut}
              onCheckInChange={handleCheckInChange}
              onCheckOutChange={handleCheckOutChange}
              occupiedDates={occupiedDates}
              minDate={new Date().toISOString().split('T')[0]}
              onError={(msg) => setError(msg)}
            />
          </Form.Group>

          {formData.checkIn && formData.checkOut && (
            <Row className="mb-3">
              <Col md={6}>
                <div className="p-2 bg-light rounded">
                  <small className="text-muted">Check-in:</small>
                  <div className="fw-bold">{new Date(formData.checkIn + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                </div>
              </Col>
              <Col md={6}>
                <div className="p-2 bg-light rounded">
                  <small className="text-muted">Check-out:</small>
                  <div className="fw-bold">{new Date(formData.checkOut + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                </div>
              </Col>
            </Row>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Número de huéspedes</Form.Label>
            <Form.Select
              value={formData.guests}
              onChange={(e) => setFormData({...formData, guests: e.target.value})}
              required
            >
              {[...Array(room.capacity)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} huésped{i > 0 ? 'es' : ''}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Solicitudes especiales (opcional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.specialRequests}
              onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
              placeholder="Ej: Cama extra, vista al mar, celebración especial..."
            />
          </Form.Group>

          {nights > 0 && (
            <div className="bg-primary text-white p-3 rounded mb-3">
              <h6 className="mb-2">Resumen de la reserva:</h6>
              <Row>
                <Col>
                  <strong>Noches:</strong> {nights}
                </Col>
                <Col>
                  <strong>Huéspedes:</strong> {formData.guests}
                </Col>
                <Col className="text-end">
                  <strong>Total: ${total}</strong>
                </Col>
              </Row>
            </div>
          )}

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading || !formData.checkIn || !formData.checkOut}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Procesando...
                </>
              ) : (
                'Confirmar Reserva'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
    </>
  );
};

export default ReservationModal;
