import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Spinner, Alert, Nav } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomsAPI, reservationsAPI, usersAPI } from '../services/api';
import { useWebStorage, useUserPreferences, useActionHistory, useFilters } from '../hooks/useWebStorage';
import FileUpload from '../components/FileUpload';
import CustomAlert from '../components/CustomAlert';
import CustomConfirm from '../components/CustomConfirm';
import ReservationDetailsModal from '../components/ReservationDetailsModal';
import AddRoomModal from '../components/AddRoomModal';
import '../styles/AdminPage.css';

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
  
  // Alert and details modal states
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReservationDetails, setSelectedReservationDetails] = useState(null);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  
  // Confirmation modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState('warning');
  
  // Password change modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);
  
  // WebStorage hooks para persistencia
  const { preferences, updatePreference } = useUserPreferences();
  const { history, addAction } = useActionHistory();
  const { filters, updateFilter, resetFilters } = useFilters('adminRooms');
  const [viewMode, setViewMode] = useWebStorage('adminViewMode', 'table', 'local');
  const [lastVisitedSection, setLastVisitedSection] = useWebStorage('lastAdminSection', 'dashboard', 'session');
  
  // Image upload states
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [selectedRoomForImages, setSelectedRoomForImages] = useState(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedRoomForMaintenance, setSelectedRoomForMaintenance] = useState(null);
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [imageDisplayOptions, setImageDisplayOptions] = useState({
    showInHomePage: true,
    showInDetails: true
  });
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [roomImages, setRoomImages] = useWebStorage('roomImages', {}, 'local');

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'operator')) {
      loadData();
      // Guardar última sección visitada en sessionStorage
      setLastVisitedSection(activeSection);
    }
  }, [user, activeSection, setLastVisitedSection]);
  
  // Restaurar última sección visitada al cargar
  useEffect(() => {
    if (lastVisitedSection && lastVisitedSection !== activeSection) {
      setActiveSection(lastVisitedSection);
    }
  }, []);

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

  // Helper function to show confirmation modal
  const showConfirmation = (message, action, type = 'danger') => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmType(type);
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
          // Registrar acción en historial (sessionStorage)
          addAction({ type: 'delete', entity: 'reservation', id: reservationId });
          setAlert({ show: true, variant: 'success', message: '✅ Reserva eliminada correctamente' });
          setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 3000);
        } catch (err) {
          setAlert({ show: true, variant: 'danger', message: err.response?.data?.message || 'Error al eliminar la reserva' });
        }
      }
    );
  };

  const updateReservationStatus = async (reservationId, status) => {
    try {
      await reservationsAPI.updateReservation(reservationId, { status });
      loadReservations();
      setAlert({ show: true, variant: 'success', message: '✅ Estado de reserva actualizado correctamente' });
      setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 3000);
    } catch (err) {
      setAlert({ show: true, variant: 'danger', message: err.response?.data?.message || 'Error al actualizar la reserva' });
    }
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

  // Room management functions
  const deleteRoom = async (roomId) => {
    showConfirmation(
      '¿Estás seguro de que deseas eliminar esta habitación? Esta acción no se puede deshacer.',
      async () => {
        try {
          await roomsAPI.deleteRoom(roomId);
          // Eliminar imágenes asociadas del localStorage
          const updatedImages = { ...roomImages };
          delete updatedImages[roomId];
          setRoomImages(updatedImages);
          loadRooms();
          addAction({ type: 'delete', entity: 'room', id: roomId });
          setAlert({ show: true, variant: 'success', message: '✅ Habitación eliminada correctamente' });
          setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 3000);
        } catch (err) {
          setAlert({ show: true, variant: 'danger', message: err.response?.data?.message || 'Error al eliminar la habitación' });
        }
      }
    );
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
    setShowAddRoomModal(true);
  };

  const handleRoomAdded = async (newRoom) => {
    // Recargar la lista de habitaciones
    await loadRooms();
    // Mostrar alerta de éxito con CustomAlert
    setAlert({
      show: true,
      variant: 'success',
      title: '¡Habitación Creada!',
      message: `La habitación ${newRoom.number} - ${newRoom.name} ha sido creada exitosamente y ya está disponible en el sistema.`,
      autoClose: true,
      duration: 6000
    });
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await roomsAPI.updateRoom(editingRoom.id, roomFormData);
        addAction({ type: 'update', entity: 'room', id: editingRoom.id, name: roomFormData.name });
        setAlert({ show: true, variant: 'success', message: '✅ Habitación actualizada correctamente' });
      } else {
        const response = await roomsAPI.createRoom(roomFormData);
        addAction({ type: 'create', entity: 'room', name: roomFormData.name });
        setAlert({ show: true, variant: 'success', message: '✅ Habitación creada correctamente' });
      }
      setShowRoomModal(false);
      loadRooms();
      setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 3000);
    } catch (err) {
      setAlert({ show: true, variant: 'danger', message: err.response?.data?.message || 'Error al guardar la habitación' });
    }
  };
  
  // Funciones para gestión de imágenes
  const openImageUpload = (room) => {
    setSelectedRoomForImages(room);
    setShowImageUploadModal(true);
  };

  const updateRoomStatus = async (roomId, status) => {
    try {
      await roomsAPI.updateRoom(roomId, { status });
      loadRooms();
      addAction({ type: 'update', entity: 'room', id: roomId, details: `Estado: ${status}` });
      setAlert({ show: true, variant: 'success', message: '✅ Estado de habitación actualizado correctamente' });
      setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 3000);
    } catch (err) {
      setAlert({ show: true, variant: 'danger', message: 'Error al actualizar el estado de la habitación' });
    }
  };

  const openMaintenanceModal = (room) => {
    setSelectedRoomForMaintenance(room);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setMaintenanceDate(tomorrow.toISOString().split('T')[0]);
    setShowMaintenanceModal(true);
  };

  const handleSetMaintenance = async () => {
    if (!maintenanceDate) {
      setAlert({ show: true, variant: 'warning', message: 'Por favor selecciona una fecha' });
      return;
    }

    try {
      await roomsAPI.updateRoom(selectedRoomForMaintenance.id, { 
        status: 'maintenance',
        maintenanceUntil: maintenanceDate
      });
      setShowMaintenanceModal(false);
      loadRooms();
      addAction({ type: 'update', entity: 'room', id: selectedRoomForMaintenance.id, details: 'Mantenimiento programado' });
      setAlert({ show: true, variant: 'success', message: `✅ Habitación cerrada hasta el ${new Date(maintenanceDate).toLocaleDateString()}` });
      setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 3000);
    } catch (err) {
      setAlert({ show: true, variant: 'danger', message: 'Error al cerrar la habitación' });
    }
  };
  
  const handleImagesSelected = (files) => {
    if (!selectedRoomForImages) return;
    
    // Convertir archivos a base64 y guardar
    const processFiles = async () => {
      const processedImages = [];
      
      for (const file of files) {
        const reader = new FileReader();
        const imageData = await new Promise((resolve) => {
          reader.onload = (e) => resolve({
            name: file.name,
            size: file.size,
            data: e.target.result,
            displayIn: {
              homePage: imageDisplayOptions.showInHomePage,
              details: imageDisplayOptions.showInDetails
            },
            uploadedAt: new Date().toISOString()
          });
          reader.readAsDataURL(file);
        });
        processedImages.push(imageData);
      }
      
      // Guardar en localStorage
      const currentImages = roomImages[selectedRoomForImages.id] || [];
      const updatedImages = [...currentImages, ...processedImages];
      saveRoomImages(selectedRoomForImages.id, updatedImages);
      
      setAlert({ 
        show: true, 
        variant: 'success', 
        message: `✅ ${processedImages.length} imagen(es) subida(s) correctamente` 
      });
      setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 3000);
    };
    
    processFiles();
  };
  
  const saveRoomImages = (roomId, images) => {
    setRoomImages(prev => ({
      ...prev,
      [roomId]: images
    }));
    addAction({ type: 'upload_images', entity: 'room', id: roomId, count: images.length });
  };

  const deleteRoomImage = (roomId, imageIndex) => {
    showConfirmation(
      '¿Estás seguro de que deseas eliminar esta imagen?',
      () => {
        const currentImages = roomImages[roomId] || [];
        const updatedImages = currentImages.filter((_, idx) => idx !== imageIndex);
        setRoomImages(prev => ({
          ...prev,
          [roomId]: updatedImages
        }));
        setAlert({ 
          show: true, 
          variant: 'success', 
          message: '✅ Imagen eliminada correctamente' 
        });
        setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 3000);
      }
    );
  };

  const viewImageGallery = (room) => {
    setSelectedRoomForImages(room);
    setShowImageGallery(true);
  };

  // User management functions
  const deleteUser = async (userId) => {
    showConfirmation(
      '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.',
      async () => {
        try {
          await usersAPI.deleteUser(userId);
          loadUsers();
          setAlert({ show: true, variant: 'success', message: '✅ Usuario eliminado correctamente' });
          setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 3000);
        } catch (err) {
          setAlert({ show: true, variant: 'danger', message: err.response?.data?.message || 'Error al eliminar el usuario' });
        }
      }
    );
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

  const changeUserPassword = (user) => {
    setPasswordUser(user);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setAlert({ show: true, variant: 'warning', message: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }
    try {
      await usersAPI.updateUser(passwordUser.id, { password: newPassword });
      setAlert({ show: true, variant: 'success', message: '✅ Contraseña actualizada correctamente' });
      setShowPasswordModal(false);
      setNewPassword('');
      setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 3000);
    } catch (err) {
      setAlert({ show: true, variant: 'danger', message: err.response?.data?.message || 'Error al actualizar la contraseña' });
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
        setAlert({ show: true, variant: 'success', message: '✅ Usuario actualizado correctamente' });
      } else {
        if (!userFormData.password || userFormData.password.length < 6) {
          setAlert({ show: true, variant: 'warning', message: 'La contraseña debe tener al menos 6 caracteres' });
          return;
        }
        await usersAPI.createUser(userFormData);
        setAlert({ show: true, variant: 'success', message: '✅ Usuario creado correctamente' });
      }
      setShowUserModal(false);
      loadUsers();
      setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 3000);
    } catch (err) {
      setAlert({ show: true, variant: 'danger', message: err.response?.data?.message || 'Error al guardar el usuario' });
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'operator')) {
    return <Navigate to="/" />;
  }

  return (
    <Container fluid className="py-3 page-container admin-page">
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
            onUploadImages={openImageUpload}
            onUpdateStatus={updateRoomStatus}
            onOpenMaintenance={openMaintenanceModal}
            roomImages={roomImages}
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
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className={`fas ${editingUser ? 'fa-user-edit' : 'fa-user-plus'} me-2`}></i>
            {editingUser ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUserSubmit}>
            {/* Información Personal */}
            <h6 className="mb-3 text-primary border-bottom pb-2">
              <i className="fas fa-user me-2"></i>
              Información Personal
            </h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    value={userFormData.firstName}
                    onChange={(e) => setUserFormData({...userFormData, firstName: e.target.value})}
                    required
                    placeholder="Ej: Juan"
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
                    placeholder="Ej: Pérez"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Información de Contacto */}
            <h6 className="mb-3 text-primary border-bottom pb-2 mt-3">
              <i className="fas fa-envelope me-2"></i>
              Información de Contacto
            </h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                    required
                    placeholder="usuario@ejemplo.com"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    value={userFormData.phone}
                    onChange={(e) => setUserFormData({...userFormData, phone: e.target.value})}
                    placeholder="+1 234 567 8900"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Seguridad y Acceso */}
            <h6 className="mb-3 text-primary border-bottom pb-2 mt-3">
              <i className="fas fa-lock me-2"></i>
              Seguridad y Acceso
            </h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña {editingUser ? '(opcional)' : '*'}</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showUserPassword ? "text" : "password"}
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                      required={!editingUser}
                      minLength={6}
                      placeholder={editingUser ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
                    />
                    <Button
                      variant="link"
                      className="position-absolute top-50 end-0 translate-middle-y password-toggle-btn"
                      onClick={() => setShowUserPassword(!showUserPassword)}
                      type="button"
                      tabIndex="-1"
                    >
                      <i className={`fas ${showUserPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </Button>
                  </div>
                  {!editingUser && (
                    <Form.Text className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      La contraseña debe tener al menos 6 caracteres
                    </Form.Text>
                  )}
                  {editingUser && (
                    <Form.Text className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Dejar vacío para mantener la contraseña actual
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nivel de Acceso *</Form.Label>
                  <Form.Select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                    required
                  >
                    <option value="visitor">👤 Visitante - Puede hacer reservas</option>
                    <option value="operator">👨‍💼 Operador - Gestiona reservas y habitaciones</option>
                    <option value="admin">👑 Administrador - Acceso total</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    <i className="fas fa-shield-alt me-1"></i>
                    Define los permisos del usuario en el sistema
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Button variant="secondary" onClick={() => setShowUserModal(false)}>
                <i className="fas fa-times me-2"></i>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                <i className={`fas ${editingUser ? 'fa-save' : 'fa-user-plus'} me-2`}></i>
                {editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Custom Alert */}
      <CustomAlert
        show={alert.show}
        variant={alert.variant}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ show: false, variant: '', title: '', message: '' })}
        autoClose={alert.autoClose}
        duration={alert.duration}
      />

      {/* Reservation Details Modal */}
      <ReservationDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        reservation={selectedReservationDetails}
      />

      {/* Add Room Modal */}
      <AddRoomModal
        show={showAddRoomModal}
        onHide={() => setShowAddRoomModal(false)}
        onRoomAdded={handleRoomAdded}
      />

      {/* Confirmation Modal - CustomConfirm */}
      <CustomConfirm
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={handleConfirm}
        title="¿Estás seguro?"
        message={confirmMessage}
        type={confirmType}
        confirmText="Sí, Confirmar"
        cancelText="Cancelar"
      />

      {/* Password Change Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>
            <i className="fas fa-key text-primary me-2"></i>
            Cambiar Contraseña
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePasswordSubmit}>
          <Modal.Body>
            {passwordUser && (
              <div className="mb-3">
                <p className="text-muted mb-3">
                  Usuario: <strong>{passwordUser.firstName} {passwordUser.lastName}</strong>
                </p>
                <Form.Group>
                  <Form.Label>Nueva Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <Form.Text className="text-muted">
                    La contraseña debe tener al menos 6 caracteres
                  </Form.Text>
                </Form.Group>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              <i className="fas fa-save me-2"></i>
              Guardar Contraseña
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Image Upload Modal */}
      <Modal 
        show={showImageUploadModal} 
        onHide={() => setShowImageUploadModal(false)} 
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title>
            <i className="fas fa-images text-primary me-2"></i>
            Subir Imágenes - Habitación {selectedRoomForImages?.number}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRoomForImages && (
            <>
              <div className="mb-3 p-3 bg-light rounded">
                <h6>{selectedRoomForImages.name}</h6>
                <p className="text-muted mb-0">
                  <small>
                    Tipo: {selectedRoomForImages.type} | Piso: {selectedRoomForImages.floor} | 
                    Precio: ${selectedRoomForImages.price}/noche
                  </small>
                </p>
              </div>

              {/* Opciones de visualización */}
              <Card className="mb-3">
                <Card.Header className="bg-white">
                  <small className="fw-bold">
                    <i className="fas fa-cog me-2"></i>
                    ¿Dónde mostrar estas imágenes?
                  </small>
                </Card.Header>
                <Card.Body>
                  <Form.Check
                    type="checkbox"
                    id="showInHomePage"
                    label="Mostrar en página principal (HomePage)"
                    checked={imageDisplayOptions.showInHomePage}
                    onChange={(e) => setImageDisplayOptions(prev => ({
                      ...prev,
                      showInHomePage: e.target.checked
                    }))}
                    className="mb-2"
                  />
                  <Form.Check
                    type="checkbox"
                    id="showInDetails"
                    label="Mostrar en detalles de habitación"
                    checked={imageDisplayOptions.showInDetails}
                    onChange={(e) => setImageDisplayOptions(prev => ({
                      ...prev,
                      showInDetails: e.target.checked
                    }))}
                  />
                  <small className="text-muted d-block mt-2">
                    <i className="fas fa-info-circle me-1"></i>
                    Puedes seleccionar ambas opciones
                  </small>
                </Card.Body>
              </Card>
              
              <FileUpload 
                onFilesSelected={handleImagesSelected}
                maxFiles={5}
                acceptedTypes="image/*"
              />

              {/* Galería de imágenes existentes */}
              {roomImages[selectedRoomForImages.id] && roomImages[selectedRoomForImages.id].length > 0 && (
                <Card className="mt-3">
                  <Card.Header className="bg-white">
                    <small className="fw-bold">
                      <i className="fas fa-images me-2"></i>
                      Imágenes Subidas ({roomImages[selectedRoomForImages.id].length})
                    </small>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      {roomImages[selectedRoomForImages.id].map((img, idx) => (
                        <Col xs={6} md={4} key={idx} className="mb-3">
                          <Card className="image-preview-card">
                            <div className="image-preview-wrapper">
                              <img 
                                src={img.data} 
                                alt={img.name}
                                className="img-fluid rounded room-image-thumbnail"
                              />
                              <Button
                                variant="danger"
                                size="sm"
                                className="delete-image-btn"
                                onClick={() => deleteRoomImage(selectedRoomForImages.id, idx)}
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            </div>
                            <Card.Body className="p-2">
                              <small className="d-block text-truncate">{img.name}</small>
                              <small className="text-muted d-block">
                                {(img.size / 1024).toFixed(1)} KB
                              </small>
                              <div className="mt-1">
                                {img.displayIn?.homePage && (
                                  <Badge bg="primary" className="me-1 room-image-badge">
                                    Home
                                  </Badge>
                                )}
                                {img.displayIn?.details && (
                                  <Badge bg="info" className="room-image-badge">
                                    Details
                                  </Badge>
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              )}
              
              {/* Mostrar historial de acciones recientes */}
              {history.length > 0 && (
                <Card className="mt-3 bg-light">
                  <Card.Header>
                    <small>
                      <i className="fas fa-history me-2"></i>
                      Acciones Recientes (SessionStorage)
                    </small>
                  </Card.Header>
                  <Card.Body className="p-2">
                    {history.slice(0, 3).map((action, idx) => (
                      <small key={action.id} className="d-block text-muted">
                        {idx + 1}. {action.type} - {action.entity} 
                        {action.name && ` (${action.name})`}
                        <span className="float-end">
                          {new Date(action.timestamp).toLocaleTimeString()}
                        </span>
                      </small>
                    ))}
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowImageUploadModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Maintenance Modal */}
      <Modal show={showMaintenanceModal} onHide={() => setShowMaintenanceModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>
            <i className="fas fa-wrench text-warning me-2"></i>
            Cerrar Habitación por Mantenimiento
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRoomForMaintenance && (
            <>
              <p><strong>Habitación:</strong> #{selectedRoomForMaintenance.number} - {selectedRoomForMaintenance.name}</p>
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
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowMaintenanceModal(false)}>
            Cancelar
          </Button>
          <Button variant="warning" onClick={handleSetMaintenance}>
            <i className="fas fa-wrench me-2"></i>
            Cerrar Habitación
          </Button>
        </Modal.Footer>
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
    .reduce((sum, r) => sum + (parseFloat(r.totalAmount) || 0), 0);
  
  const pendingPayments = reservations
    .filter(r => r.paymentStatus === 'pending')
    .reduce((sum, r) => sum + (parseFloat(r.totalAmount) || 0), 0);
  
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
                    <div className="progress mb-3 progress-bar-large">
                      <div className="progress-bar bg-success" style={{width: `${totalRooms > 0 ? (availableRooms/totalRooms)*100 : 0}%`}}>
                        {totalRooms > 0 ? ((availableRooms/totalRooms)*100).toFixed(0) : '0'}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span><i className="fas fa-circle text-danger me-2"></i>Ocupadas</span>
                      <strong>{occupiedRooms}</strong>
                    </div>
                    <div className="progress mb-3 progress-bar-large">
                      <div className="progress-bar bg-danger" style={{width: `${totalRooms > 0 ? (occupiedRooms/totalRooms)*100 : 0}%`}}>
                        {totalRooms > 0 ? ((occupiedRooms/totalRooms)*100).toFixed(0) : '0'}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span><i className="fas fa-circle text-warning me-2"></i>Mantenimiento</span>
                      <strong>{maintenanceRooms}</strong>
                    </div>
                    <div className="progress progress-bar-large">
                      <div className="progress-bar bg-warning" style={{width: `${totalRooms > 0 ? (maintenanceRooms/totalRooms)*100 : 0}%`}}>
                        {totalRooms > 0 ? ((maintenanceRooms/totalRooms)*100).toFixed(0) : '0'}%
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
                    <div className="progress mb-3 progress-bar-medium">
                      <div className="progress-bar bg-success" style={{width: `${(confirmedCount/reservations.length)*100}%`}}></div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span><Badge bg="info">Check-in</Badge></span>
                      <strong>{checkedInCount}</strong>
                    </div>
                    <div className="progress mb-3 progress-bar-medium">
                      <div className="progress-bar bg-info" style={{width: `${(checkedInCount/reservations.length)*100}%`}}></div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span><Badge bg="warning">Pendientes</Badge></span>
                      <strong>{pendingCount}</strong>
                    </div>
                    <div className="progress mb-3 progress-bar-medium">
                      <div className="progress-bar bg-warning" style={{width: `${(pendingCount/reservations.length)*100}%`}}></div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span><Badge bg="danger">Canceladas</Badge></span>
                      <strong>{cancelledCount}</strong>
                    </div>
                    <div className="progress progress-bar-medium">
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
                      <td className="text-end">{users.length > 0 ? ((adminCount/users.length)*100).toFixed(1) : '0'}%</td>
                    </tr>
                    <tr>
                      <td><Badge bg="warning">Operadores</Badge></td>
                      <td className="text-end">{operatorCount}</td>
                      <td className="text-end">{users.length > 0 ? ((operatorCount/users.length)*100).toFixed(1) : '0'}%</td>
                    </tr>
                    <tr>
                      <td><Badge bg="primary">Visitantes</Badge></td>
                      <td className="text-end">{visitorCount}</td>
                      <td className="text-end">{users.length > 0 ? ((visitorCount/users.length)*100).toFixed(1) : '0'}%</td>
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

const RoomsSection = ({ rooms, loading, onAdd, onEdit, onDelete, onUploadImages, onUpdateStatus, onOpenMaintenance, roomImages }) => {
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
    <div className="rooms-section-container">
      {/* Header fijo */}
      <div className="d-flex justify-content-between align-items-center mb-0 rooms-section-header">
        <h2 className="mb-0 rooms-section-title">
          <i className="fas fa-bed me-2"></i>Habitaciones
        </h2>
        <Button variant="primary" onClick={onAdd} size="lg">
          <i className="fas fa-plus-circle me-2"></i>Agregar Habitación
        </Button>
      </div>
      
      {/* Contenido scrollable */}
      <div className="rooms-section-content">
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
                  className="d-flex justify-content-between align-items-center room-group-header-clickable"
                >
                  <div className="d-flex align-items-start flex-grow-1">
                    <i 
                      className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} me-3 mt-1 room-group-header-icon`}
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
                  <Card.Body className="p-0">
                    <Table className="mb-0" striped hover>
                      <thead className="table-light">
                        <tr>
                          <th>Número</th>
                          <th>Piso</th>
                          <th>Estado</th>
                          <th>Imágenes</th>
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
                              {roomImages[room.id] ? (
                                <Badge bg="success">
                                  <i className="fas fa-images me-1"></i>
                                  {roomImages[room.id].length}
                                </Badge>
                              ) : (
                                <Badge bg="secondary">0</Badge>
                              )}
                            </td>
                            <td>
                              {room.isActive ? (
                                <i className="fas fa-check-circle text-success"></i>
                              ) : (
                                <i className="fas fa-times-circle text-danger"></i>
                              )}
                            </td>
                            <td>
                              <div className="d-flex flex-column gap-1">
                                <div className="btn-group btn-group-sm">
                                  <Button 
                                    variant="outline-info" 
                                    size="sm"
                                    onClick={() => onUploadImages(room)}
                                    title="Subir Imágenes"
                                  >
                                    <i className="fas fa-upload"></i>
                                  </Button>
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
                                <div className="btn-group btn-group-sm">
                                  <Button 
                                    variant="outline-success" 
                                    size="sm"
                                    onClick={() => onUpdateStatus(room.id, 'available')}
                                    disabled={room.status === 'available'}
                                    title="Abrir habitación"
                                  >
                                    <i className="fas fa-door-open"></i> Abrir
                                  </Button>
                                  <Button 
                                    variant="outline-warning" 
                                    size="sm"
                                    onClick={() => onOpenMaintenance(room)}
                                    disabled={room.status === 'maintenance'}
                                    title="Cerrar por mantenimiento"
                                  >
                                    <i className="fas fa-wrench"></i> Cerrar
                                  </Button>
                                </div>
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
    <div className="d-flex justify-content-between align-items-center users-section-header">
      <h2 className="users-section-title">
        <i className="fas fa-users me-2"></i>
        Usuarios
      </h2>
      <Button variant="primary" onClick={onAdd} size="lg">
        <i className="fas fa-user-plus me-2"></i>Agregar Usuario
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
