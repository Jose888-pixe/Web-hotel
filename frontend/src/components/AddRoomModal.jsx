import React, { useState, useRef } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { roomsAPI } from '../services/api';
import CustomAlert from './CustomAlert';
import '../styles/AddRoomModal.css';

const AddRoomModal = ({ show, onHide, onRoomAdded }) => {
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
      // Validaciones
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

    } catch (err) {
      console.error('Error creating room:', err);
      setError(err.response?.data?.message || 'Error al crear la habitación');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
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

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="xl"
      centered
      className="add-room-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-plus-circle me-2 text-primary"></i>
          Agregar Nueva Habitación
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

        <Form onSubmit={handleSubmit}>
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
            <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
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
