import React, { useState, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { roomsAPI } from '../services/api';
import CustomAlert from './CustomAlert';
import '../styles/AddRoomModal.css';

const AddRoomModal = ({ show, onHide, onRoomAdded, rooms = [] }) => {
  const [mode, setMode] = useState(null); // null | 'existing' | 'new'
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [existingRoomTypes, setExistingRoomTypes] = useState([]);
  
  const [formData, setFormData] = useState({
    number: '',
    type: 'standard',
    name: '',
    description: '',
    price: '',
    capacity: 2,
    size: '',
    floor: 1,
    images: [],
    features: {
      wifi: true,
      tv: true,
      airConditioning: true,
      safe: false,
      minibar: false,
      balcony: false,
      oceanView: false,
      cityView: false,
      jacuzzi: false,
      roomService: false,
      breakfast: false,
      parking: false
    }
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Obtener tipos de habitación existentes al abrir el modal
  React.useEffect(() => {
    if (show && rooms.length > 0) {
      // Agrupar habitaciones por tipo y nombre
      const typesMap = {};
      rooms.forEach(room => {
        const key = `${room.type}_${room.name}`;
        if (!typesMap[key]) {
          typesMap[key] = {
            type: room.type,
            name: room.name,
            price: room.price,
            capacity: room.capacity,
            size: room.size,
            description: room.description,
            features: room.features,
            images: room.images || [],
            count: 0
          };
        }
        typesMap[key].count++;
      });
      setExistingRoomTypes(Object.values(typesMap));
    }
  }, [show, rooms]);

  const roomTypes = [
    { value: 'standard', label: 'Estándar' },
    { value: 'deluxe', label: 'Deluxe' },
    { value: 'suite', label: 'Suite' },
    { value: 'presidential', label: 'Presidencial' },
    { value: 'single', label: 'Individual' },
    { value: 'double', label: 'Doble' },
    { value: 'family', label: 'Familiar' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureChange = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('Máximo 5 imágenes permitidas');
      return;
    }
    setSelectedFiles(files);
    setError('');
  };

  const handleSelectImages = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validaciones según el modo
      if (mode === 'existing') {
        // Modo: Agregar de tipo existente
        if (!formData.number || !selectedRoomType) {
          setError('Por favor completa todos los campos obligatorios');
          setLoading(false);
          return;
        }

        // Usar datos del tipo seleccionado
        const roomData = {
          number: formData.number,
          floor: parseInt(formData.floor) || 1,
          type: selectedRoomType.type,
          name: selectedRoomType.name,
          description: selectedRoomType.description,
          price: selectedRoomType.price,
          capacity: selectedRoomType.capacity,
          size: selectedRoomType.size,
          features: selectedRoomType.features,
          status: 'available',
          isActive: true
        };

        console.log('Creating room from existing type:', roomData);

        const response = await roomsAPI.createRoomFromType(roomData);
        
        setSuccess('¡Habitación creada exitosamente!');
        
        if (onRoomAdded) {
          onRoomAdded(response.data.room);
        }

        setTimeout(() => {
          resetForm();
          onHide();
        }, 2000);

      } else if (mode === 'new') {
        // Modo: Crear nuevo tipo
        if (!formData.number || !formData.name || !formData.price) {
          setError('Por favor completa todos los campos obligatorios');
          setLoading(false);
          return;
        }

        // Validar que haya al menos una imagen
        if (selectedFiles.length === 0) {
          setError('Debes agregar al menos una imagen');
          setLoading(false);
          return;
        }

        // Preparar datos para enviar
        const roomData = {
          ...formData,
          price: parseFloat(formData.price) || 0,
          capacity: parseInt(formData.capacity) || 1,
          size: parseFloat(formData.size) || 0,
          floor: parseInt(formData.floor) || 1,
          images: selectedFiles, // Archivos seleccionados
          status: 'available',
          isActive: true
        };

        console.log('Creating room with data:', roomData);

        // Crear habitación
        const response = await roomsAPI.createRoom(roomData);
        
        console.log('Room created:', response.data);

        setSuccess('¡Habitación creada exitosamente!');
        
        // Notificar al componente padre
        if (onRoomAdded) {
          onRoomAdded(response.data.room);
        }

        // Limpiar formulario después de 2 segundos
        setTimeout(() => {
          resetForm();
          onHide();
        }, 2000);
      }

    } catch (err) {
      console.error('Error creating room:', err);
      setError(err.response?.data?.message || 'Error al crear la habitación');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMode(null);
    setSelectedRoomType(null);
    setFormData({
      number: '',
      type: 'standard',
      name: '',
      description: '',
      price: '',
      capacity: 2,
      size: '',
      floor: 1,
      images: [],
      features: {
        wifi: true,
        tv: true,
        airConditioning: true,
        safe: false,
        minibar: false,
        balcony: false,
        oceanView: false,
        cityView: false,
        jacuzzi: false,
        roomService: false,
        breakfast: false,
        parking: false
      }
    });
    setSelectedFiles([]);
    setError('');
    setSuccess('');
  };

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    setError('');
  };

  const handleRoomTypeSelect = (roomType) => {
    setSelectedRoomType(roomType);
    setError('');
  };

  const goBack = () => {
    if (mode === 'existing' && selectedRoomType) {
      setSelectedRoomType(null);
    } else {
      setMode(null);
    }
    setError('');
  };

  return (
    <Modal 
      show={show} 
      onHide={() => {
        resetForm();
        onHide();
      }} 
      size="xl"
      centered
      className="add-room-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-plus-circle me-2 text-primary"></i>
          {mode === null && 'Agregar Nueva Habitación'}
          {mode === 'existing' && !selectedRoomType && 'Seleccionar Tipo de Habitación'}
          {mode === 'existing' && selectedRoomType && `Agregar ${selectedRoomType.name}`}
          {mode === 'new' && 'Crear Nuevo Tipo de Habitación'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <CustomAlert
          show={!!error}
          variant="danger"
          title="Error"
          message={error}
          onClose={() => setError('')}
          autoClose={false}
        />
        
        <CustomAlert
          show={!!success}
          variant="success"
          title="¡Éxito!"
          message={success}
          autoClose={true}
          duration={3000}
        />

        {/* Paso 1: Seleccionar Modo */}
        {mode === null && (
          <div className="mode-selection">
            <p className="text-muted mb-4">
              Selecciona cómo deseas agregar la habitación:
            </p>
            <Row className="g-4">
              <Col md={6}>
                <div 
                  className="mode-card" 
                  onClick={() => handleModeSelect('existing')}
                  style={{ cursor: 'pointer', border: '2px solid #e0e0e0', borderRadius: '10px', padding: '30px', textAlign: 'center', transition: 'all 0.3s' }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.backgroundColor = '#f8f9ff';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ fontSize: '60px', color: '#667eea', marginBottom: '20px' }}>
                    <i className="fas fa-clone"></i>
                  </div>
                  <h5 className="mb-3">De Tipo Existente</h5>
                  <p className="text-muted mb-0">
                    Agrega una habitación basada en un tipo que ya existe.
                    Solo necesitas el número y piso.
                  </p>
                  {existingRoomTypes.length > 0 && (
                    <Badge bg="primary" className="mt-3">
                      {existingRoomTypes.length} tipo(s) disponible(s)
                    </Badge>
                  )}
                </div>
              </Col>
              <Col md={6}>
                <div 
                  className="mode-card" 
                  onClick={() => handleModeSelect('new')}
                  style={{ cursor: 'pointer', border: '2px solid #e0e0e0', borderRadius: '10px', padding: '30px', textAlign: 'center', transition: 'all 0.3s' }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#38ef7d';
                    e.currentTarget.style.backgroundColor = '#f0fff4';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ fontSize: '60px', color: '#38ef7d', marginBottom: '20px' }}>
                    <i className="fas fa-plus-square"></i>
                  </div>
                  <h5 className="mb-3">Nuevo Tipo</h5>
                  <p className="text-muted mb-0">
                    Crea un nuevo tipo de habitación desde cero.
                    Configura nombre, precio, fotos y características.
                  </p>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* Paso 2: Seleccionar Tipo Existente */}
        {mode === 'existing' && !selectedRoomType && (
          <div className="room-type-selection">
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={goBack}
              className="mb-3"
            >
              <i className="fas fa-arrow-left me-2"></i>
              Volver
            </Button>
            
            <p className="text-muted mb-4">
              Selecciona el tipo de habitación que deseas agregar:
            </p>

            {existingRoomTypes.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                <p className="text-muted">No hay tipos de habitación creados aún.</p>
                <Button variant="primary" onClick={() => handleModeSelect('new')}>
                  <i className="fas fa-plus me-2"></i>
                  Crear Primer Tipo
                </Button>
              </div>
            ) : (
              <Row className="g-3">
                {existingRoomTypes.map((roomType, index) => (
                  <Col md={6} key={index}>
                    <div
                      className="room-type-card"
                      onClick={() => handleRoomTypeSelect(roomType)}
                      style={{
                        border: '2px solid #e0e0e0',
                        borderRadius: '10px',
                        padding: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = '#667eea';
                        e.currentTarget.style.backgroundColor = '#f8f9ff';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = '#e0e0e0';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="mb-1">{roomType.name}</h6>
                          <Badge bg="secondary" className="me-2">{roomType.type}</Badge>
                          <Badge bg="info">{roomType.count} habitación(es)</Badge>
                        </div>
                        <div className="text-end">
                          <div className="text-primary fw-bold">${roomType.price}/noche</div>
                          <small className="text-muted">{roomType.capacity} persona(s)</small>
                        </div>
                      </div>
                      <p className="text-muted small mb-2">
                        {roomType.description?.substring(0, 100)}{roomType.description?.length > 100 ? '...' : ''}
                      </p>
                      <div className="d-flex gap-2 flex-wrap">
                        {roomType.features?.wifi && <Badge bg="light" text="dark"><i className="fas fa-wifi"></i></Badge>}
                        {roomType.features?.tv && <Badge bg="light" text="dark"><i className="fas fa-tv"></i></Badge>}
                        {roomType.features?.airConditioning && <Badge bg="light" text="dark"><i className="fas fa-snowflake"></i></Badge>}
                        {roomType.features?.balcony && <Badge bg="light" text="dark"><i className="fas fa-door-open"></i></Badge>}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        )}

        {/* Paso 3a: Formulario Simple (Tipo Existente) */}
        {mode === 'existing' && selectedRoomType && (
          <Form onSubmit={handleSubmit}>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={goBack}
              className="mb-3"
            >
              <i className="fas fa-arrow-left me-2"></i>
              Cambiar Tipo
            </Button>

            <div className="alert alert-info mb-4">
              <strong><i className="fas fa-info-circle me-2"></i>Tipo Seleccionado:</strong> {selectedRoomType.name}
              <br />
              <small>Esta habitación heredará todas las características del tipo seleccionado.</small>
            </div>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Número de Habitación *</Form.Label>
                  <Form.Control
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    placeholder="Ej: 101, 202, 305"
                    required
                  />
                  <Form.Text className="text-muted">
                    Ingresa un número único para esta habitación
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Piso *</Form.Label>
                  <Form.Control
                    type="number"
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    min="1"
                    max="50"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="border rounded p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
              <h6 className="mb-3"><i className="fas fa-info-circle me-2"></i>Detalles del Tipo</h6>
              <Row>
                <Col md={4}>
                  <strong>Precio:</strong>
                  <div className="text-primary">${selectedRoomType.price}/noche</div>
                </Col>
                <Col md={4}>
                  <strong>Capacidad:</strong>
                  <div>{selectedRoomType.capacity} persona(s)</div>
                </Col>
                <Col md={4}>
                  <strong>Tamaño:</strong>
                  <div>{selectedRoomType.size} m²</div>
                </Col>
              </Row>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={() => { resetForm(); onHide(); }} disabled={loading}>
                <i className="fas fa-times me-2"></i>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Creando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Crear Habitación
                  </>
                )}
              </Button>
            </div>
          </Form>
        )}

        {/* Paso 3b: Formulario Completo (Nuevo Tipo) */}
        {mode === 'new' && (
          <Form onSubmit={handleSubmit}>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={goBack}
              className="mb-3"
            >
              <i className="fas fa-arrow-left me-2"></i>
              Volver
            </Button>
            
            {/* Información Básica */}
            <div className="form-section">
            <h5 className="section-title">
              <i className="fas fa-info-circle me-2"></i>
              Información Básica
            </h5>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Número de Habitación *</Form.Label>
                  <Form.Control
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    placeholder="Ej: 101, 202"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo *</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    {roomTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Piso *</Form.Label>
                  <Form.Control
                    type="number"
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    min="1"
                    max="50"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre de la Habitación *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ej: Suite Ejecutiva Premium"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Descripción *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe las características y comodidades de la habitación..."
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Precio por Noche ($) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="185.00"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Capacidad (personas) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Tamaño (m²) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    placeholder="35"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Imágenes */}
          <div className="form-section">
            <h5 className="section-title">
              <i className="fas fa-images me-2"></i>
              Imágenes de la Habitación
            </h5>
            <p className="text-muted small mb-3">Sube al menos una imagen de la habitación (máximo 5 imágenes).</p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden-input"
            />
            
            <div className="mb-3">
              <Button 
                variant="outline-primary" 
                onClick={handleSelectImages}
                className="w-100"
                type="button"
              >
                <i className="fas fa-cloud-upload-alt me-2"></i>
                {selectedFiles.length > 0 
                  ? `${selectedFiles.length} imagen(es) seleccionada(s)` 
                  : 'Seleccionar Imágenes'}
              </Button>
            </div>

            {selectedFiles.length > 0 && (
              <div className="selected-files-list">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="file-item d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-image text-primary me-2"></i>
                      <small>{file.name}</small>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeFile(index)}
                      type="button"
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Características */}
          <div className="form-section">
            <h5 className="section-title">
              <i className="fas fa-check-circle me-2"></i>
              Características y Amenidades
            </h5>
            
            <Row>
              {Object.keys(formData.features).map((feature) => (
                <Col md={3} key={feature}>
                  <Form.Check
                    type="checkbox"
                    id={`feature-${feature}`}
                    label={getFeatureLabel(feature)}
                    checked={formData.features[feature]}
                    onChange={() => handleFeatureChange(feature)}
                    className="mb-2"
                  />
                </Col>
              ))}
            </Row>
          </div>

            {/* Botones */}
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="outline-secondary" onClick={() => { resetForm(); onHide(); }} disabled={loading}>
                <i className="fas fa-times me-2"></i>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Creando...
                  </>
                ) : (
                  <> <i className="fas fa-save me-2"></i>
                    Crear Habitación
                  </>
                )}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

// Helper para traducir nombres de características
const getFeatureLabel = (feature) => {
  const labels = {
    wifi: 'WiFi',
    tv: 'TV',
    airConditioning: 'Aire Acondicionado',
    safe: 'Caja Fuerte',
    minibar: 'Minibar',
    balcony: 'Balcón',
    oceanView: 'Vista al Mar',
    cityView: 'Vista a la Ciudad',
    jacuzzi: 'Jacuzzi',
    roomService: 'Servicio a Habitación',
    breakfast: 'Desayuno Incluido',
    parking: 'Estacionamiento'
  };
  return labels[feature] || feature;
};

export default AddRoomModal;
