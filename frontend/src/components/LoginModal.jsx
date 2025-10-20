import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import RegisterModal from './RegisterModal';

const LoginModal = ({ show, onHide }) => {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(credentials.email, credentials.password);
      onHide();
      setCredentials({ email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCredentials({ email: '', password: '' });
    setError('');
    onHide();
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Iniciar Sesión</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                required
              />
            </Form.Group>
            <div className="d-grid">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </div>
          </Form>
          <hr />
          <div className="text-center">
            <p className="mb-2">¿No tienes una cuenta?</p>
            <Button 
              variant="outline-primary" 
              onClick={() => {
                handleClose();
                setShowRegister(true);
              }}
            >
              Registrarse como Usuario
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <RegisterModal 
        show={showRegister} 
        onHide={() => setShowRegister(false)}
        onSuccess={handleRegisterSuccess}
      />
    </>
  );
};

export default LoginModal;
