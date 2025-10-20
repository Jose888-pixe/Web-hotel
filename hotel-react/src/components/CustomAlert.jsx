import React from 'react';
import { Alert } from 'react-bootstrap';
import '../styles/CustomAlert.css';

const CustomAlert = ({ variant = 'info', title, message, icon, onClose, show = true }) => {
  if (!show) return null;

  const getIcon = () => {
    if (icon) return icon;
    
    switch (variant) {
      case 'success':
        return 'fa-check-circle';
      case 'danger':
      case 'error':
        return 'fa-exclamation-circle';
      case 'warning':
        return 'fa-exclamation-triangle';
      case 'info':
        return 'fa-info-circle';
      default:
        return 'fa-bell';
    }
  };

  const getTitle = () => {
    if (title) return title;
    
    switch (variant) {
      case 'success':
        return '¡Éxito!';
      case 'danger':
      case 'error':
        return 'Error';
      case 'warning':
        return 'Advertencia';
      case 'info':
        return 'Información';
      default:
        return 'Notificación';
    }
  };

  return (
    <Alert 
      variant={variant} 
      dismissible={!!onClose}
      onClose={onClose}
      className="custom-alert azure-alert"
    >
      <div className="d-flex align-items-start">
        <div className="alert-icon me-3">
          <i className={`fas ${getIcon()}`}></i>
        </div>
        <div className="flex-grow-1">
          <Alert.Heading className="alert-title">{getTitle()}</Alert.Heading>
          <p className="alert-message mb-0">{message}</p>
        </div>
      </div>
    </Alert>
  );
};

export default CustomAlert;
