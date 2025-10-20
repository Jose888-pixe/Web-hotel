import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Alert, Nav, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { roomsAPI, reservationsAPI, usersAPI } from '../services/api';

const AdminPage = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Room modal states
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFormData, setRoomFormData] = useState({
    number: '',
    name: '',
    type: 'single',
    price: '',
    capacity: '',
    description: '',
    floor: '1',
    size: ''
  });
  
  // User modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'visitor'
  });

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'operator')) {
      loadData();
    }
  }, [user, activeSection]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeSection === 'dashboard') {
        // Load all data for dashboard
        await Promise.all([
          loadRooms(),
          loadReservations(),
          user?.role === 'admin' ? loadUsers() : Promise.resolve()
        ]);
      } else if (activeSection === 'rooms') {
        await loadRooms();
      } else if (activeSection === 'reservations') {
        await loadReservations();
      } else if (activeSection === 'users' && user?.role === 'admin') {
        await loadUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    const response = await roomsAPI.getRooms();
    setRooms(response.data.rooms || []);
  };

  const loadReservations = async () => {
    const response = await reservationsAPI.getReservations();
    setReservations(response.data.reservations || []);
  };

  const loadUsers = async () => {
    const response = await usersAPI.getUsers();
    setUsers(response.data.users || []);
  };

  const deleteReservation = async (reservationId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
      return;
    }

    try {
      await reservationsAPI.deleteReservation(reservationId);
      loadReservations();
      alert('Reserva eliminada correctamente');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar la reserva');
    }
  };

  const updateReservationStatus = async (reservationId, status) => {
    try {
      await reservationsAPI.updateReservation(reservationId, { status });
      loadReservations();
      alert('Estado de reserva actualizado correctamente');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar la reserva');
    }
  };

  const viewReservationDetails = async (reservationId) => {
    try {
      const response = await reservationsAPI.getReservation(reservationId);
      const reservation = response.data.reservation;
      const details = `
Detalles de la Reserva

Número de Reserva: ${reservation.reservationNumber}
Huésped: ${reservation.guestFirstName} ${reservation.guestLastName}
Email: ${reservation.guestEmail}
Teléfono: ${reservation.guestPhone}

Habitación: ${reservation.room?.number} - ${reservation.room?.name}
Tipo: ${reservation.room?.type}

Check-in: ${new Date(reservation.checkIn).toLocaleDateString()}
Check-out: ${new Date(reservation.checkOut).toLocaleDateString()}
Adultos: ${reservation.adults}
Niños: ${reservation.children}

Estado: ${reservation.status}
Estado de Pago: ${reservation.paymentStatus}
Total: $${reservation.totalAmount}

${reservation.specialRequests ? `Solicitudes Especiales: ${reservation.specialRequests}` : ''}
      `;
      alert(details);
    } catch (err) {
      alert('Error al cargar los detalles de la reserva');
    }
  };

  // Room management functions
  const deleteRoom = async (roomId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta habitación?')) {
      return;
    }

    try {
      await roomsAPI.deleteRoom(roomId);
      loadRooms();
      alert('Habitación eliminada correctamente');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar la habitación');
    }
  };

  const editRoom = (room) => {
    setEditingRoom(room);
    setRoomFormData({
      number: room.number,
      name: room.name,
      type: room.type,
      price: room.price,
      capacity: room.capacity,
      description: room.description || '',
      floor: room.floor || '1',
      size: room.size || ''
    });
    setShowRoomModal(true);
  };

  const addRoom = () => {
    setEditingRoom(null);
    setRoomFormData({
      number: '',
      name: '',
      type: 'single',
      price: '',
      capacity: '',
      description: '',
      floor: '1',
      size: ''
    });
    setShowRoomModal(true);
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await roomsAPI.updateRoom(editingRoom.id, roomFormData);
        alert('Habitación actualizada correctamente');
      } else {
        await roomsAPI.createRoom(roomFormData);
        alert('Habitación creada correctamente');
      }
      setShowRoomModal(false);
      loadRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar la habitación');
    }
  };

  // User management functions
  const deleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    try {
      await usersAPI.deleteUser(userId);
      loadUsers();
      alert('Usuario eliminado correctamente');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar el usuario');
    }
  };

  const editUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      phone: user.phone || '',
      role: user.role
    });
    setShowUserModal(true);
  };

  const changeUserPassword = async (user) => {
    const newPassword = prompt(`Cambiar contraseña para: ${user.firstName} ${user.lastName}\n\nIngrese la nueva contraseña (mínimo 6 caracteres):`);
    if (newPassword && newPassword.length >= 6) {
      try {
        await usersAPI.updateUser(user.id, { password: newPassword });
        alert('Contraseña actualizada correctamente');
      } catch (err) {
        alert(err.response?.data?.message || 'Error al actualizar la contraseña');
      }
    } else if (newPassword) {
      alert('La contraseña debe tener al menos 6 caracteres');
    }
  };

  const addUser = () => {
    setEditingUser(null);
    setUserFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      role: 'visitor'
    });
    setShowUserModal(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updateData = { ...userFormData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await usersAPI.updateUser(editingUser.id, updateData);
        alert('Usuario actualizado correctamente');
      } else {
        if (!userFormData.password || userFormData.password.length < 6) {
          alert('La contraseña debe tener al menos 6 caracteres');
          return;
        }
        await usersAPI.createUser(userFormData);
        alert('Usuario creado correctamente');
      }
      setShowUserModal(false);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar el usuario');
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'operator')) {
    return <Navigate to="/" />;
  }

  return (
    <Container fluid className="py-3 mt-5">
      <Row>
        {/* Sidebar */}
        <Col md={3} lg={2}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                {user.role === 'admin' ? 'Panel Admin' : 'Panel Operador'}
              </h6>
            </Card.Header>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link
                  active={activeSection === 'dashboard'}
                  onClick={() => setActiveSection('dashboard')}
                  className="text-start"
                >
                  <i className="fas fa-tachometer-alt me-2"></i>Dashboard
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeSection === 'rooms'}
                  onClick={() => setActiveSection('rooms')}
                  className="text-start"
                >
                  <i className="fas fa-bed me-2"></i>Habitaciones
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeSection === 'reservations'}
                  onClick={() => setActiveSection('reservations')}
                  className="text-start"
                >
                  <i className="fas fa-calendar me-2"></i>Reservas
                </Nav.Link>
              </Nav.Item>
              {user.role === 'admin' && (
                <Nav.Item>
                  <Nav.Link
                    active={activeSection === 'users'}
                    onClick={() => setActiveSection('users')}
                    className="text-start"
                  >
                    <i className="fas fa-users me-2"></i>Usuarios
                  </Nav.Link>
                </Nav.Item>
              )}
            </Nav>
          </Card>
        </Col>

        {/* Main Content */}
        <Col md={9} lg={10}>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {activeSection === 'dashboard' && <DashboardSection rooms={rooms} reservations={reservations} users={users} loading={loading} />}
          {activeSection === 'rooms' && <RoomsSection 
            rooms={rooms} 
            loading={loading}
            onAdd={addRoom}
            onEdit={editRoom}
            onDelete={deleteRoom}
          />}
          {activeSection === 'reservations' && <ReservationsSection 
            reservations={reservations} 
            loading={loading}
            onDelete={deleteReservation}
            onUpdateStatus={updateReservationStatus}
            onViewDetails={viewReservationDetails}
          />}
          {activeSection === 'users' && user.role === 'admin' && <UsersSection 
            users={users} 
            loading={loading}
            onAdd={addUser}
            onEdit={editUser}
            onChangePassword={changeUserPassword}
            onDelete={deleteUser}
          />}
        </Col>
      </Row>

      {/* Room Modal */}
      <Modal show={showRoomModal} onHide={() => setShowRoomModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingRoom ? 'Editar Habitación' : 'Agregar Habitación'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRoomSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Número de Habitación *</Form.Label>
                  <Form.Control
                    type="text"
                    value={roomFormData.number}
                    onChange={(e) => setRoomFormData({...roomFormData, number: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo *</Form.Label>
                  <Form.Select
                    value={roomFormData.type}
                    onChange={(e) => setRoomFormData({...roomFormData, type: e.target.value})}
                    required
                  >
                    <option value="single">Individual</option>
                    <option value="double">Doble</option>
                    <option value="suite">Suite</option>
                    <option value="deluxe">Deluxe</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                type="text"
                value={roomFormData.name}
                onChange={(e) => setRoomFormData({...roomFormData, name: e.target.value})}
                required
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Precio por Noche *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={roomFormData.price}
                    onChange={(e) => setRoomFormData({...roomFormData, price: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Capacidad *</Form.Label>
                  <Form.Control
                    type="number"
                    value={roomFormData.capacity}
                    onChange={(e) => setRoomFormData({...roomFormData, capacity: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Piso</Form.Label>
                  <Form.Control
                    type="number"
                    value={roomFormData.floor}
                    onChange={(e) => setRoomFormData({...roomFormData, floor: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Tamaño (m²)</Form.Label>
              <Form.Control
                type="number"
                value={roomFormData.size}
                onChange={(e) => setRoomFormData({...roomFormData, size: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={roomFormData.description}
                onChange={(e) => setRoomFormData({...roomFormData, description: e.target.value})}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowRoomModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                {editingRoom ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* User Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? 'Editar Usuario' : 'Agregar Usuario'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUserSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    value={userFormData.firstName}
                    onChange={(e) => setUserFormData({...userFormData, firstName: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido *</Form.Label>
                  <Form.Control
                    type="text"
                    value={userFormData.lastName}
                    onChange={(e) => setUserFormData({...userFormData, lastName: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña {editingUser ? '(dejar vacío para no cambiar)' : '*'}</Form.Label>
              <Form.Control
                type="password"
                value={userFormData.password}
                onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                required={!editingUser}
                minLength={6}
                placeholder={editingUser ? 'Dejar vacío para mantener la actual' : 'Mínimo 6 caracteres'}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="tel"
                value={userFormData.phone}
                onChange={(e) => setUserFormData({...userFormData, phone: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rol *</Form.Label>
              <Form.Select
                value={userFormData.role}
                onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                required
              >
                <option value="visitor">Visitante</option>
                <option value="operator">Operador</option>
                <option value="admin">Administrador</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowUserModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                {editingUser ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

const DashboardSection = ({ rooms = [], reservations = [], users = [], loading }) => {
  // Show loading state
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando estadísticas...</p>
      </div>
    );
  }

  // Calcular estadísticas
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
  
  const activeReservations = reservations.filter(r => 
    ['confirmed', 'checked-in'].includes(r.status)
  ).length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkInsToday = reservations.filter(r => {
    const checkIn = new Date(r.checkIn);
    checkIn.setHours(0, 0, 0, 0);
    return checkIn.getTime() === today.getTime();
  }).length;
  
  const totalRevenue = reservations
    .filter(r => r.paymentStatus === 'paid')
    .reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  
  const pendingPayments = reservations
    .filter(r => r.paymentStatus === 'pending')
    .reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  
  // Reservas por estado
  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;
  const checkedInCount = reservations.filter(r => r.status === 'checked-in').length;
  const pendingCount = reservations.filter(r => r.status === 'pending').length;
  const cancelledCount = reservations.filter(r => r.status === 'cancelled').length;
  
  // Usuarios por rol
  const adminCount = users.filter(u => u.role === 'admin').length;
  const operatorCount = users.filter(u => u.role === 'operator').length;
  const visitorCount = users.filter(u => u.role === 'visitor').length;
  
  // Tasa de ocupación
  const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0;

  return (
    <div>
      <h2 className="mb-4">
        <i className="fas fa-chart-line me-2"></i>
        Dashboard - Estadísticas en Tiempo Real
      </h2>
      
      {/* Tarjetas principales */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="text-white bg-primary h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Card.Title className="mb-1">Total Habitaciones</Card.Title>
                  <h2 className="mb-0">{totalRooms}</h2>
                  <small>Disponibles: {availableRooms}</small>
                </div>
                <i className="fas fa-door-open fa-3x opacity-50"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-white bg-success h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Card.Title className="mb-1">Reservas Activas</Card.Title>
                  <h2 className="mb-0">{activeReservations}</h2>
                  <small>Check-ins hoy: {checkInsToday}</small>
                </div>
                <i className="fas fa-calendar-check fa-3x opacity-50"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-white bg-danger h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Card.Title className="mb-1">Ocupación</Card.Title>
                  <h2 className="mb-0">{occupancyRate}%</h2>
                  <small>{occupiedRooms} de {totalRooms} ocupadas</small>
                </div>
                <i className="fas fa-chart-pie fa-3x opacity-50"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-white bg-warning h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Card.Title className="mb-1">Mantenimiento</Card.Title>
                  <h2 className="mb-0">{maintenanceRooms}</h2>
                  <small>Habitaciones en servicio</small>
                </div>
                <i className="fas fa-tools fa-3x opacity-50"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-white bg-info h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Card.Title className="mb-1">Ingresos Totales</Card.Title>
                  <h2 className="mb-0">${totalRevenue.toFixed(2)}</h2>
                  <small>Pendiente: ${pendingPayments.toFixed(2)}</small>
                </div>
                <i className="fas fa-dollar-sign fa-3x opacity-50"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráficos y estadísticas detalladas */}
      <Row>
        {/* Estado de Habitaciones */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-bed me-2"></i>
                Estado de Habitaciones
              </h5>
            </Card.Header>
            <Card.Body>
              {totalRooms > 0 ? (
                <>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span><i className="fas fa-circle text-success me-2"></i>Disponibles</span>
                      <strong>{availableRooms}</strong>
                    </div>
                    <div className="progress mb-3" style={{height: '25px'}}>
                      <div className="progress-bar bg-success" style={{width: `${(availableRooms/totalRooms)*100}%`}}>
                        {((availableRooms/totalRooms)*100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span><i className="fas fa-circle text-danger me-2"></i>Ocupadas</span>
                      <strong>{occupiedRooms}</strong>
                    </div>
                    <div className="progress mb-3" style={{height: '25px'}}>
                      <div className="progress-bar bg-danger" style={{width: `${(occupiedRooms/totalRooms)*100}%`}}>
                        {((occupiedRooms/totalRooms)*100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span><i className="fas fa-circle text-warning me-2"></i>Mantenimiento</span>
                      <strong>{maintenanceRooms}</strong>
                    </div>
                    <div className="progress" style={{height: '25px'}}>
                      <div className="progress-bar bg-warning" style={{width: `${(maintenanceRooms/totalRooms)*100}%`}}>
                        {((maintenanceRooms/totalRooms)*100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted text-center">No hay habitaciones registradas</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Estado de Reservas */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-calendar-alt me-2"></i>
                Estado de Reservas
              </h5>
            </Card.Header>
            <Card.Body>
              {reservations.length > 0 ? (
                <>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span><Badge bg="success">Confirmadas</Badge></span>
                      <strong>{confirmedCount}</strong>
                    </div>
                    <div className="progress mb-3" style={{height: '20px'}}>
                      <div className="progress-bar bg-success" style={{width: `${(confirmedCount/reservations.length)*100}%`}}></div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span><Badge bg="info">Check-in</Badge></span>
                      <strong>{checkedInCount}</strong>
                    </div>
                    <div className="progress mb-3" style={{height: '20px'}}>
                      <div className="progress-bar bg-info" style={{width: `${(checkedInCount/reservations.length)*100}%`}}></div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span><Badge bg="warning">Pendientes</Badge></span>
                      <strong>{pendingCount}</strong>
                    </div>
                    <div className="progress mb-3" style={{height: '20px'}}>
                      <div className="progress-bar bg-warning" style={{width: `${(pendingCount/reservations.length)*100}%`}}></div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span><Badge bg="danger">Canceladas</Badge></span>
                      <strong>{cancelledCount}</strong>
                    </div>
                    <div className="progress" style={{height: '20px'}}>
                      <div className="progress-bar bg-danger" style={{width: `${(cancelledCount/reservations.length)*100}%`}}></div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted text-center">No hay reservas registradas</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Usuarios por Rol */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-users me-2"></i>
                Usuarios por Rol
              </h5>
            </Card.Header>
            <Card.Body>
              {users.length > 0 ? (
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Rol</th>
                      <th className="text-end">Cantidad</th>
                      <th className="text-end">Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><Badge bg="danger">Administradores</Badge></td>
                      <td className="text-end">{adminCount}</td>
                      <td className="text-end">{((adminCount/users.length)*100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td><Badge bg="warning">Operadores</Badge></td>
                      <td className="text-end">{operatorCount}</td>
                      <td className="text-end">{((operatorCount/users.length)*100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td><Badge bg="primary">Visitantes</Badge></td>
                      <td className="text-end">{visitorCount}</td>
                      <td className="text-end">{((visitorCount/users.length)*100).toFixed(1)}%</td>
                    </tr>
                    <tr className="table-active">
                      <td><strong>Total</strong></td>
                      <td className="text-end"><strong>{users.length}</strong></td>
                      <td className="text-end"><strong>100%</strong></td>
                    </tr>
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted text-center">No hay usuarios registrados</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Resumen Financiero */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-money-bill-wave me-2"></i>
                Resumen Financiero
              </h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover size="sm">
                <tbody>
                  <tr>
                    <td><i className="fas fa-check-circle text-success me-2"></i>Pagos Confirmados</td>
                    <td className="text-end">
                      <strong className="text-success">${totalRevenue.toFixed(2)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td><i className="fas fa-clock text-warning me-2"></i>Pagos Pendientes</td>
                    <td className="text-end">
                      <strong className="text-warning">${pendingPayments.toFixed(2)}</strong>
                    </td>
                  </tr>
                  <tr className="table-active">
                    <td><strong><i className="fas fa-calculator me-2"></i>Total Esperado</strong></td>
                    <td className="text-end">
                      <strong className="text-primary">${(totalRevenue + pendingPayments).toFixed(2)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td><i className="fas fa-chart-line me-2"></i>Promedio por Reserva</td>
                    <td className="text-end">
                      ${reservations.length > 0 ? ((totalRevenue + pendingPayments) / reservations.length).toFixed(2) : '0.00'}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const RoomsSection = ({ rooms, loading, onAdd, onEdit, onDelete }) => {
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Habitaciones</h2>
        <Button variant="primary" onClick={onAdd}>
          <i className="fas fa-plus me-2"></i>Agregar Habitación
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
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
                  style={{ cursor: 'pointer' }}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <h5 className="mb-1">
                      <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} me-2`}></i>
                      <Badge bg="secondary" className="me-2">{group.type}</Badge>
                      {group.name}
                    </h5>
                    <small className="text-muted">
                      {group.rooms.length} habitaciones | ${group.price}/noche | Capacidad: {group.capacity}
                    </small>
                  </div>
                  <div>
                    <Badge bg="success" className="me-1">{availableCount} disponibles</Badge>
                    <Badge bg="danger" className="me-1">{occupiedCount} ocupadas</Badge>
                    <Badge bg="warning">{maintenanceCount} mantenimiento</Badge>
                  </div>
                </Card.Header>
                
                {isExpanded && (
                  <Card.Body className="p-0">
                    <Table className="mb-0" striped hover>
                      <thead className="table-light">
                        <tr>
                          <th>Número</th>
                          <th>Piso</th>
                          <th>Estado</th>
                          <th>Activa</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.rooms.map(room => (
                          <tr key={room.id}>
                            <td><strong>#{room.number}</strong></td>
                            <td>{room.floor}°</td>
                            <td>
                              <Badge bg={
                                room.status === 'available' ? 'success' :
                                room.status === 'occupied' ? 'danger' :
                                room.status === 'maintenance' ? 'warning' :
                                'secondary'
                              }>
                                {room.status === 'available' ? 'Disponible' :
                                 room.status === 'occupied' ? 'Ocupada' :
                                 room.status === 'maintenance' ? 'Mantenimiento' :
                                 room.status}
                              </Badge>
                            </td>
                            <td>
                              {room.isActive ? (
                                <i className="fas fa-check-circle text-success"></i>
                              ) : (
                                <i className="fas fa-times-circle text-danger"></i>
                              )}
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => onEdit(room)}
                                  title="Editar"
                                >
                                  <i className="fas fa-edit"></i>
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => onDelete(room.id)}
                                  title="Eliminar"
                                >
                                  <i className="fas fa-trash"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ReservationsSection = ({ reservations, loading, onDelete, onUpdateStatus, onViewDetails }) => (
  <div>
    <h2 className="mb-4">Reservas</h2>
    
    {loading ? (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    ) : reservations.length === 0 ? (
      <div className="text-center py-5">
        <p className="text-muted">No hay reservas disponibles</p>
      </div>
    ) : (
      <div className="table-responsive">
        <Table striped>
          <thead>
            <tr>
              <th>Reserva #</th>
              <th>Habitación</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Huéspedes</th>
              <th>Estado</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(reservation => (
              <tr key={reservation.id}>
                <td>{reservation.reservationNumber || reservation.id}</td>
                <td>{reservation.room?.name || `Habitación ${reservation.roomId}`}</td>
                <td>{new Date(reservation.checkIn).toLocaleDateString('es-ES')}</td>
                <td>{new Date(reservation.checkOut).toLocaleDateString('es-ES')}</td>
                <td>{reservation.adults + (reservation.children || 0)}</td>
                <td>
                  <Badge bg={
                    reservation.status === 'confirmed' ? 'success' :
                    reservation.status === 'pending' ? 'warning' :
                    reservation.status === 'cancelled' ? 'danger' :
                    'secondary'
                  }>
                    {reservation.status}
                  </Badge>
                </td>
                <td>${reservation.totalAmount?.toLocaleString() || 'N/A'}</td>
                <td>
                  <div className="btn-group btn-group-sm">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => onViewDetails(reservation.id)}
                      title="Ver detalles"
                    >
                      <i className="fas fa-eye"></i>
                    </Button>
                    <Button 
                      variant="outline-success" 
                      size="sm"
                      onClick={() => onUpdateStatus(reservation.id, 'confirmed')}
                      disabled={reservation.status === 'confirmed'}
                      title="Confirmar"
                    >
                      <i className="fas fa-check"></i>
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => onDelete(reservation.id)}
                      title="Eliminar"
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    )}
  </div>
);

const UsersSection = ({ users, loading, onAdd, onEdit, onChangePassword, onDelete }) => (
  <div>
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2>Usuarios</h2>
      <Button variant="primary" onClick={onAdd}>
        <i className="fas fa-plus me-2"></i>Agregar Usuario
      </Button>
    </div>
    
    {loading ? (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    ) : (
      <div className="table-responsive">
        <Table striped>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>
                  <Badge bg={
                    user.role === 'admin' ? 'danger' :
                    user.role === 'operator' ? 'warning' :
                    'primary'
                  }>
                    {user.role}
                  </Badge>
                </td>
                <td>
                  <Badge bg={user.isActive ? 'success' : 'secondary'}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>
                <td>
                  <div className="btn-group btn-group-sm">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => onEdit(user)}
                      title="Editar"
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button 
                      variant="outline-warning" 
                      size="sm"
                      onClick={() => onChangePassword(user)}
                      title="Cambiar contraseña"
                    >
                      <i className="fas fa-key"></i>
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => onDelete(user.id)}
                      title="Eliminar"
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    )}
  </div>
);

export default AdminPage;
