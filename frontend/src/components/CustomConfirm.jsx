import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import '../styles/CustomConfirm.css';

/**
 * Componente de confirmación personalizado con iconos y colores
 * @param {Object} props
 * @param {boolean} props.show - Mostrar modal
 * @param {function} props.onHide - Función al cerrar
 * @param {function} props.onConfirm - Función al confirmar
 * @param {string} props.title - Título del modal
 * @param {string} props.message - Mensaje del modal
 * @param {string} props.type - Tipo: 'danger', 'warning', 'info', 'success'
 * @param {string} props.confirmText - Texto del botón confirmar
 * @param {string} props.cancelText - Texto del botón cancelar
 */
const CustomConfirm = ({ 
  show, 
  onHide, 
  onConfirm, 
  title = '¿Estás seguro?',
  message = '¿Deseas continuar con esta acción?',
  type = 'warning',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}) => {
  
  const getIcon = () => {
    switch(type) {
      case 'danger':
        return 'fa-exclamation-triangle';
      case 'warning':
        return 'fa-exclamation-circle';
      case 'info':
        return 'fa-info-circle';
      case 'success':
        return 'fa-check-circle';
      default:
        return 'fa-question-circle';
    }
  };

  const getColor = () => {
    switch(type) {
      case 'danger':
        return '#dc3545';
      case 'warning':
        return '#ffc107';
      case 'info':
        return '#0dcaf0';
      case 'success':
        return '#198754';
      default:
        return '#6c757d';
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onHide();
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
      className="custom-confirm-modal"
    >
      <Modal.Body className="text-center p-4">
        <div 
          className={`confirm-icon-wrapper confirm-icon-wrapper-${variant} mb-3`}
        >
          <i 
            className={`fas ${getIcon()} confirm-icon confirm-icon-${variant}`}
          ></i>
        </div>
        
        <h4 className="confirm-title mb-3">{title}</h4>
        <p className="confirm-message text-muted mb-4">{message}</p>
        
        <div className="d-flex gap-2 justify-content-center">
          <Button 
            variant="outline-secondary" 
            onClick={onHide}
            className="px-4"
          >
            <i className="fas fa-times me-2"></i>
            {cancelText}
          </Button>
          <Button 
            variant={type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'primary'}
            onClick={handleConfirm}
            className="px-4"
          >
            <i className="fas fa-check me-2"></i>
            {confirmText}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default CustomConfirm;
