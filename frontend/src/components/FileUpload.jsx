import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Alert, ProgressBar, Badge, Row, Col } from 'react-bootstrap';
import '../styles/FileUpload.css';

/**
 * Componente FileUpload con soporte para:
 * - Drag & Drop (escritorio)
 * - Touch events (móviles/tablets)
 * - Múltiples archivos
 * - Preview de imágenes
 * - WebStorage para recordar preferencias
 */
const FileUpload = ({ onFilesSelected, maxFiles = 5, acceptedTypes = 'image/*' }) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState('');
  const [preferences, setPreferences] = useState({
    showPreviews: true,
    autoUpload: false
  });
  
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Detectar si es dispositivo táctil
  useEffect(() => {
    const checkTouchDevice = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch);
    };
    
    checkTouchDevice();
    window.addEventListener('resize', checkTouchDevice);
    
    return () => window.removeEventListener('resize', checkTouchDevice);
  }, []);

  // Cargar preferencias desde localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem('fileUploadPreferences');
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        setPreferences(parsed);
      } catch (e) {
        console.error('Error parsing preferences:', e);
      }
    }

    // Guardar estadísticas en sessionStorage
    const uploadCount = parseInt(sessionStorage.getItem('uploadCount') || '0');
    sessionStorage.setItem('uploadCount', (uploadCount + 1).toString());
  }, []);

  // Guardar preferencias en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('fileUploadPreferences', JSON.stringify(preferences));
  }, [preferences]);

  // Validar archivo
  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      return { valid: false, error: `${file.name} excede el tamaño máximo de 5MB` };
    }

    // Validar tipo de archivo
    const acceptedTypesArray = acceptedTypes.split(',').map(t => t.trim());
    const isValidType = acceptedTypesArray.some(type => {
      if (type === 'image/*') {
        return file.type.startsWith('image/');
      }
      return file.type === type;
    });

    if (!isValidType) {
      return { valid: false, error: `${file.name} no es un tipo de archivo válido` };
    }

    return { valid: true };
  };

  // Procesar archivos seleccionados
  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList);
    
    if (files.length + newFiles.length > maxFiles) {
      setError(`Solo puedes subir un máximo de ${maxFiles} archivos`);
      return;
    }

    const validFiles = [];
    const errors = [];

    newFiles.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        // Crear preview para imágenes
        const fileWithPreview = {
          file,
          id: Math.random().toString(36).substr(2, 9),
          preview: null,
          uploaded: false
        };

        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            fileWithPreview.preview = reader.result;
            setFiles(prev => prev.map(f => 
              f.id === fileWithPreview.id ? fileWithPreview : f
            ));
          };
          reader.readAsDataURL(file);
        }

        validFiles.push(fileWithPreview);
      } else {
        errors.push(validation.error);
      }
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      setTimeout(() => setError(''), 5000);
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      if (onFilesSelected) {
        onFilesSelected(validFiles.map(f => f.file));
      }

      // Guardar en sessionStorage la última actividad
      sessionStorage.setItem('lastUploadTime', new Date().toISOString());
    }
  };

  // Eventos de Drag & Drop (escritorio)
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Solo desactivar si salimos del dropZone completamente
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  // Eventos táctiles (móviles/tablets)
  const handleTouchStart = (e) => {
    setIsDragging(true);
  };

  const handleTouchEnd = (e) => {
    setIsDragging(false);
  };

  // Click para seleccionar archivos
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Remover archivo
  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Limpiar todos los archivos
  const clearAll = () => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Simular progreso de carga (en una app real, esto vendría del backend)
  const simulateUpload = (fileId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      
      if (progress >= 100) {
        clearInterval(interval);
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, uploaded: true } : f
        ));
      }
    }, 200);
  };

  // Toggle preferencias
  const togglePreference = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="file-upload-component">
      {/* Zona de Drop */}
      <Card
        ref={dropZoneRef}
        className={`drop-zone cursor-pointer ${isDragging ? 'dragging' : ''} ${isTouchDevice ? 'touch-device' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onTouchStart={isTouchDevice ? handleTouchStart : undefined}
        onTouchEnd={isTouchDevice ? handleTouchEnd : undefined}
        onClick={handleClick}
      >
        <Card.Body className="text-center py-5">
          <i className={`fas ${isTouchDevice ? 'fa-hand-pointer' : 'fa-cloud-upload-alt'} fa-3x mb-3 text-primary`}></i>
          <h5>
            {isTouchDevice 
              ? 'Toca aquí para seleccionar archivos' 
              : 'Arrastra archivos aquí o haz clic para seleccionar'}
          </h5>
          <p className="text-muted mb-0">
            Máximo {maxFiles} archivos • Tamaño máximo: 5MB por archivo
          </p>
          <Badge bg="info" className="mt-2">
            {isTouchDevice ? 'Modo Táctil' : 'Modo Escritorio'}
          </Badge>
        </Card.Body>
      </Card>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes}
        onChange={handleFileInputChange}
        className="hidden-input"
      />

      {/* Mensajes de error */}
      {error && (
        <Alert variant="danger" className="mt-3" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Preferencias (usando localStorage) */}
      <Card className="mt-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span><i className="fas fa-cog me-2"></i>Preferencias</span>
          <small className="text-muted">Guardadas en localStorage</small>
        </Card.Header>
        <Card.Body>
          <div className="d-flex gap-3 flex-wrap">
            <Button
              size="sm"
              variant={preferences.showPreviews ? 'primary' : 'outline-primary'}
              onClick={() => togglePreference('showPreviews')}
            >
              <i className={`fas fa-eye${preferences.showPreviews ? '' : '-slash'} me-2`}></i>
              Mostrar Previews
            </Button>
            <Button
              size="sm"
              variant={preferences.autoUpload ? 'primary' : 'outline-primary'}
              onClick={() => togglePreference('autoUpload')}
            >
              <i className={`fas fa-upload me-2`}></i>
              Auto-subir
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Lista de archivos */}
      {files.length > 0 && (
        <Card className="mt-3">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>
              <i className="fas fa-file-image me-2"></i>
              Archivos Seleccionados ({files.length}/{maxFiles})
            </span>
            <Button size="sm" variant="outline-danger" onClick={clearAll}>
              <i className="fas fa-trash me-2"></i>Limpiar Todo
            </Button>
          </Card.Header>
          <Card.Body>
            <Row>
              {files.map((fileObj) => (
                <Col key={fileObj.id} xs={12} sm={6} md={4} lg={3} className="mb-3">
                  <Card className="h-100 file-card">
                    {preferences.showPreviews && fileObj.preview && (
                      <div className="preview-container">
                        <Card.Img 
                          variant="top" 
                          src={fileObj.preview} 
                          alt={fileObj.file.name}
                          className="file-preview-image"
                        />
                      </div>
                    )}
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <small className="text-truncate flex-grow-1" title={fileObj.file.name}>
                          {fileObj.file.name}
                        </small>
                        <Button
                          size="sm"
                          variant="link"
                          className="text-danger p-0 ms-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(fileObj.id);
                          }}
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </div>
                      <small className="text-muted d-block mb-2">
                        {(fileObj.file.size / 1024).toFixed(2)} KB
                      </small>
                      
                      {uploadProgress[fileObj.id] !== undefined && (
                        <ProgressBar 
                          now={uploadProgress[fileObj.id]} 
                          label={`${uploadProgress[fileObj.id]}%`}
                          variant={fileObj.uploaded ? 'success' : 'primary'}
                          className="mb-2"
                        />
                      )}
                      
                      {!fileObj.uploaded && uploadProgress[fileObj.id] === undefined && (
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="w-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            simulateUpload(fileObj.id);
                          }}
                        >
                          <i className="fas fa-upload me-2"></i>Subir
                        </Button>
                      )}
                      
                      {fileObj.uploaded && (
                        <Badge bg="success" className="w-100">
                          <i className="fas fa-check me-2"></i>Subido
                        </Badge>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Información de sesión (usando sessionStorage) */}
      <Card className="mt-3 bg-light">
        <Card.Body>
          <small className="text-muted">
            <i className="fas fa-info-circle me-2"></i>
            <strong>SessionStorage:</strong> Subidas en esta sesión: {sessionStorage.getItem('uploadCount') || 0}
            {sessionStorage.getItem('lastUploadTime') && (
              <> • Última actividad: {new Date(sessionStorage.getItem('lastUploadTime')).toLocaleTimeString()}</>
            )}
          </small>
        </Card.Body>
      </Card>
    </div>
  );
};

export default FileUpload;
