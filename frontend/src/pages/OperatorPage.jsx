import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { reservationsAPI, roomsAPI } from '../services/api';
import CustomAlert from '../components/CustomAlert';
import ReservationDetailsModal from '../components/ReservationDetailsModal';
import logger from '../utils/logger';
import '../styles/AdminPage.css';
import '../styles/OperatorPage.css';

const OperatorPage = () => {
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'credit_card'
  });
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReservationDetails, setSelectedReservationDetails] = useState(null);
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadReservations(), loadRooms()]);
    } catch (err) {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async () => {
    try {
      const response = await reservationsAPI.getReservations();
      setReservations(response.data.reservations || []);
    } catch (err) {
      logger.error('Error loading reservations:', err);
      setError('Error al cargar reservas');
    }
  };

  const loadRooms = async () => {
    try {
      const response = await roomsAPI.getRooms();
      setRooms(response.data.rooms || []);
    } catch (err) {
      logger.error('Error loading rooms:', err);
      setError('Error al cargar habitaciones');
    }
  };

  const updateReservationStatus = async (reservationId, status) => {
    try {
      await reservationsAPI.updateReservation(reservationId, { status });
      setAlert({ show: true, variant: 'success', message: `Estado actualizado a: ${status}` });
      setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 3000);
      loadReservations();
    } catch (err) {
      logger.error('Error updating reservation:', err);
      showAlert('danger', 'Error al actualizar la reserva');
    }
  };

  const showAlert = (variant, message) => {
    setAlert({ show: true, variant, message });
    setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 3000);
  };

  const showConfirmation = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const deleteReservation = async (reservationId) => {
    showConfirmation(
      '¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer.',
      async () => {
        try {
          await reservationsAPI.deleteReservation(reservationId);
          loadReservations();
          showAlert('success', '✅ Reserva eliminada correctamente');
        } catch (err) {
          logger.error('Error deleting reservation:', err);
          showAlert('danger', 'Error al eliminar la reserva');
        }
      }
    );
  };

  const viewReservationDetails = async (reservationId) => {
    try {
      const response = await reservationsAPI.getReservation(reservationId);
      setSelectedReservationDetails(response.data.reservation);
      setShowDetailsModal(true);
    } catch (err) {
      logger.error('Error loading reservation details:', err);
      showAlert('danger', 'Error al cargar los detalles de la reserva');
    }
  };

  const updateRoomStatus = async (roomId, status) => {
    try {
      await roomsAPI.updateRoom(roomId, { status });
      loadRooms();
      showAlert('success', 'Estado de habitación actualizado correctamente');
    } catch (err) {
      logger.error('Error updating room:', err);
      showAlert('danger', 'Error al actualizar la habitación');
    }
  };

  const openMaintenanceModal = (room) => {
    setSelectedRoom(room);
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setMaintenanceDate(tomorrow.toISOString().split('T')[0]);
    setShowMaintenanceModal(true);
  };

  const handleSetMaintenance = async () => {
    if (!maintenanceDate) {
      showAlert('warning', 'Por favor selecciona una fecha');
      return;
    }

    try {
      await roomsAPI.updateRoom(selectedRoom.id, { 
        status: 'maintenance',
        maintenanceUntil: maintenanceDate
      });
      setShowMaintenanceModal(false);
      loadRooms();
      showAlert('success', `Habitación cerrada hasta el ${new Date(maintenanceDate).toLocaleDateString()}`);
    } catch (err) {
      logger.error('Error setting maintenance:', err);
      showAlert('danger', 'Error al cerrar la habitación');
    }
  };

  const handleProcessPayment = async () => {
    try {
      if (!paymentData.amount || paymentData.amount <= 0) {
        showAlert('warning', 'Por favor ingresa un monto válido');
        return;
      }

      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reservationId: selectedReservation.id,
          amount: parseFloat(paymentData.amount),
          method: paymentData.method
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setShowPaymentModal(false);
        setPaymentData({ amount: '', method: 'credit_card' });
        loadReservations();
        
        let message = `Pago procesado correctamente. ID de Transacción: ${data.payment.transactionId}`;
        if (data.reservationDeleted) {
          message += ' La reserva ha sido completada y archivada.';
        }
        setAlert({ show: true, variant: 'success', message });
        setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 5000);
      } else {
        logger.error('Payment error:', data);
        showAlert('danger', data.message || data.error || 'Error al procesar el pago');
      }
    } catch (err) {
      logger.error('Error processing payment:', err);
      showAlert('danger', `Error al procesar el pago: ${err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { variant: 'warning', text: 'Pendiente' },
      'confirmed': { variant: 'success', text: 'Confirmada' },
      'checked-in': { variant: 'info', text: 'Check-in' },
      'checked-out': { variant: 'secondary', text: 'Check-out' },
      'cancelled': { variant: 'danger', text: 'Cancelada' }
    };
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getRoomStatusBadge = (status) => {
    const statusConfig = {
      'available': { variant: 'success', text: 'Disponible' },
      'occupied': { variant: 'danger', text: 'Ocupada' },
      'maintenance': { variant: 'warning', text: 'Mantenimiento' },
      'cleaning': { variant: 'info', text: 'Limpieza' }
    };
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <Container className="py-5 page-container">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 page-container">
      <Row>
        <Col>
          {/* Custom Alert */}
          {alert.show && (
            <CustomAlert
              variant={alert.variant}
              message={alert.message}
              onClose={() => setAlert({ show: false, variant: '', message: '' })}
              show={alert.show}
            />
          )}

          {/* Mapa de Habitaciones */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-map me-2"></i>
                Mapa de Habitaciones
              </h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando habitaciones...</span>
                  </div>
                </div>
              ) : rooms.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No hay habitaciones disponibles</p>
                </div>
              ) : (
                <RoomGroupsView 
                  rooms={rooms}
                  getRoomStatusBadge={getRoomStatusBadge}
                  updateRoomStatus={updateRoomStatus}
                  openMaintenanceModal={openMaintenanceModal}
                />
              )}
            </Card.Body>
          </Card>

          {/* Gestión de Reservas */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-calendar-alt me-2"></i>
                Gestión de Reservas
              </h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Reserva #</th>
                    <th>Huésped</th>
                    <th>Habitación</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td>{reservation.reservationNumber}</td>
                      <td>
                        {reservation.user ? 
                          `${reservation.user.firstName} ${reservation.user.lastName}` : 
                          'Usuario no encontrado'
                        }
                      </td>
                      <td>
                        {reservation.room ? 
                          `${reservation.room.number} - ${reservation.room.name}` : 
                          'Habitación no encontrada'
                        }
                      </td>
                      <td>{new Date(reservation.checkIn).toLocaleDateString()}</td>
                      <td>{new Date(reservation.checkOut).toLocaleDateString()}</td>
                      <td>
                        {getStatusBadge(reservation.status)}
                        <br />
                        <Badge bg={reservation.paymentStatus === 'paid' ? 'success' : 'warning'} className="mt-1">
                          {reservation.paymentStatus === 'paid' ? 'Pago Confirmado' : 'Pago Pendiente'}
                        </Badge>
                      </td>
                      <td>${reservation.totalAmount}</td>
                      <td>
                        <div className="btn-group" role="group">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                            disabled={reservation.status === 'confirmed'}
                          >
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="info"
                            onClick={() => updateReservationStatus(reservation.id, 'checked-in')}
                            disabled={reservation.status !== 'confirmed'}
                          >
                            Check-in
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => updateReservationStatus(reservation.id, 'checked-out')}
                            disabled={reservation.status !== 'checked-in'}
                          >
                            Check-out
                          </Button>
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setPaymentData({...paymentData, amount: reservation.totalAmount});
                              setShowPaymentModal(true);
                            }}
                          >
                            Pago
                          </Button>
                        </div>
                        <div className="btn-group mt-1" role="group">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => viewReservationDetails(reservation.id)}
                          >
                            <i className="fas fa-eye"></i> Ver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => deleteReservation(reservation.id)}
                          >
                            <i className="fas fa-trash"></i> Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de Procesamiento de Pago */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Procesar Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReservation && (
            <>
              <p><strong>Reserva:</strong> {selectedReservation.reservationNumber}</p>
              <p><strong>Huésped:</strong> {selectedReservation.user?.firstName} {selectedReservation.user?.lastName}</p>
              <p><strong>Total:</strong> ${selectedReservation.totalAmount}</p>
              
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Monto</Form.Label>
                  <Form.Control
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                    step="0.01"
                    min="0"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Método de Pago</Form.Label>
                  <Form.Select
                    value={paymentData.method}
                    onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                  >
                    <option value="credit_card">Tarjeta de Crédito</option>
                    <option value="debit_card">Tarjeta de Débito</option>
                    <option value="cash">Efectivo</option>
                    <option value="bank_transfer">Transferencia Bancaria</option>
                  </Form.Select>
                </Form.Group>
                
                <Alert variant="info" className="mb-0">
                  <small>
                    <i className="fas fa-info-circle me-2"></i>
                    El ID de transacción se generará automáticamente
                  </small>
                </Alert>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleProcessPayment}>
            Procesar Pago
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Mantenimiento */}
      <Modal show={showMaintenanceModal} onHide={() => setShowMaintenanceModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cerrar Habitación por Mantenimiento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRoom && (
            <>
              <p><strong>Habitación:</strong> {selectedRoom.number} - {selectedRoom.name}</p>
              <p className="text-muted">Selecciona hasta qué fecha estará cerrada la habitación</p>
              
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Reapertura</Form.Label>
                  <Form.Control
                    type="date"
                    value={maintenanceDate}
                    onChange={(e) => setMaintenanceDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <Form.Text className="text-muted">
                    La habitación se abrirá automáticamente después de esta fecha
                  </Form.Text>
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMaintenanceModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleSetMaintenance}>
            Cerrar Habitación
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .room-status-card {
          transition: all 0.3s ease;
          border: 2px solid #dee2e6;
        }
        
        .room-status-card.available {
          border-color: #28a745;
          background-color: #f8fff9;
        }
        
        .room-status-card.occupied {
          border-color: #dc3545;
          background-color: #fff8f8;
        }
        
        .room-status-card.maintenance {
          border-color: #ffc107;
          background-color: #fffdf5;
        }
        
        .room-status-card.cleaning {
          border-color: #17a2b8;
          background-color: #f8feff;
        }
        
        .room-status-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        /* Asegurar altura consistente en Card.Header */
        .card-header h5 {
          font-size: 1.1rem;
          font-weight: 600;
          line-height: 1.4;
        }
        
        /* Alineación perfecta de la flechita */
        .card-header .fa-chevron-down,
        .card-header .fa-chevron-right {
          color: #6c757d;
          transition: transform 0.2s ease;
        }
        
        /* Espaciado consistente para badges */
        .card-header .badge {
          font-size: 0.75rem;
          padding: 0.35em 0.65em;
        }
      `}</style>

      {/* Confirmation Modal - Estilizado */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered className="confirmation-modal">
        <Modal.Header closeButton className="border-0 bg-white">
          <Modal.Title className="d-flex align-items-center">
            <div className="warning-icon-container me-3">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div>
              <h5 className="mb-0 text-dark">Confirmar Acción</h5>
              <small className="text-muted">Esta acción requiere confirmación</small>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4 px-4">
          <div className="confirmation-message">
            <i className="fas fa-info-circle text-primary me-2"></i>
            <span>{confirmMessage}</span>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 bg-light px-4 py-3">
          <Button variant="outline-secondary" onClick={() => setShowConfirmModal(false)} className="px-4">
            <i className="fas fa-times me-2"></i>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirm} className="px-4">
            <i className="fas fa-check me-2"></i>
            Confirmar Eliminación
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reservation Details Modal */}
      <ReservationDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        reservation={selectedReservationDetails}
      />
    </Container>
  );
};

// Component for grouped room view
const RoomGroupsView = ({ rooms, getRoomStatusBadge, updateRoomStatus, openMaintenanceModal }) => {
  const [expandedGroups, setExpandedGroups] = useState({});

  // Group rooms by type and name
  const groupedRooms = {};
  rooms.forEach(room => {
    const key = `${room.type}_${room.name}`;
    if (!groupedRooms[key]) {
      groupedRooms[key] = {
        type: room.type,
        name: room.name,
        price: room.price,
        capacity: room.capacity,
        rooms: []
      };
    }
    groupedRooms[key].rooms.push(room);
  });

  const toggleGroup = (key) => {
    setExpandedGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div>
      {Object.entries(groupedRooms).map(([key, group]) => {
        const isExpanded = expandedGroups[key];
        const availableCount = group.rooms.filter(r => r.status === 'available').length;
        const occupiedCount = group.rooms.filter(r => r.status === 'occupied').length;
        const maintenanceCount = group.rooms.filter(r => r.status === 'maintenance').length;
        
        return (
          <Card key={key} className="mb-3">
            <Card.Header 
              onClick={() => toggleGroup(key)}
              className="d-flex justify-content-between align-items-center room-group-header"
            >
              <div className="d-flex align-items-start flex-grow-1">
                <i 
                  className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} me-3 mt-1 room-group-chevron`}
                ></i>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-1">
                    <Badge bg="secondary" className="me-2">{group.type}</Badge>
                    <h5 className="mb-0">{group.name}</h5>
                  </div>
                  <small className="text-muted">
                    {group.rooms.length} habitaciones | ${group.price}/noche | Capacidad: {group.capacity}
                  </small>
                </div>
              </div>
              <div className="d-flex gap-1 flex-shrink-0 ms-3">
                <Badge bg="success">{availableCount} disponibles</Badge>
                <Badge bg="danger">{occupiedCount} ocupadas</Badge>
                <Badge bg="warning">{maintenanceCount} mantenimiento</Badge>
              </div>
            </Card.Header>
            
            {isExpanded && (
              <Card.Body className="p-3">
                <Row>
                  {group.rooms.map((room) => (
                    <Col lg={3} md={4} sm={6} key={room.id} className="mb-3">
                      <Card 
                        className={`room-status-card ${room.status} h-100`}
                      >
                        <Card.Body className="text-center">
                          <h6>Habitación {room.number}</h6>
                          <small className="text-muted d-block mb-2">Piso {room.floor}</small>
                          {getRoomStatusBadge(room.status)}
                          {room.maintenanceUntil && room.status === 'maintenance' && (
                            <small className="text-muted d-block mt-1">
                              Hasta: {new Date(room.maintenanceUntil).toLocaleDateString()}
                            </small>
                          )}
                          <div className="mt-2 d-grid gap-1">
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => updateRoomStatus(room.id, 'available')}
                              disabled={room.status === 'available'}
                            >
                              <i className="fas fa-door-open me-1"></i>Abrir
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => openMaintenanceModal(room)}
                              disabled={room.status === 'maintenance'}
                            >
                              <i className="fas fa-wrench me-1"></i>Cerrar
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default OperatorPage;
