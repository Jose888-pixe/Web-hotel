import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';

const PaymentModal = ({ show, onHide, reservation, onPaymentSuccess }) => {
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: 'credit_card'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update amount when reservation changes
  useEffect(() => {
    if (reservation) {
      setPaymentData(prev => ({
        ...prev,
        amount: reservation.totalAmount
      }));
    }
  }, [reservation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('💳 Processing payment:', {
      reservationId: reservation.id,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod
    });

    try {
      const paymentPayload = {
        reservationId: reservation.id,
        amount: parseFloat(paymentData.amount) || 0,
        paymentMethod: paymentData.paymentMethod
      };

      console.log('Sending payment payload:', paymentPayload);

      const response = await fetch(`http://localhost:3001/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Payment error:', errorData);
        throw new Error(errorData.message || 'Error al procesar el pago');
      }

      const result = await response.json();
      console.log('Payment success:', result);

      onPaymentSuccess();
      onHide();
    } catch (err) {
      console.error('Payment exception:', err);
      setError(err.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  if (!reservation) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <i className="fas fa-credit-card me-2"></i>
          Procesar Pago
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <div className="mb-3">
          <strong>Reserva:</strong> {reservation.reservationNumber}
        </div>
        <div className="mb-3">
          <strong>Huésped:</strong> {reservation.guestFirstName} {reservation.guestLastName}
        </div>
        <div className="mb-4">
          <strong>Total:</strong> <span className="h5 text-primary">${reservation.totalAmount}</span>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Monto</Form.Label>
            <Form.Control
              type="text"
              value={paymentData.amount}
              readOnly
              disabled
              className="input-readonly-disabled"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Método de Pago</Form.Label>
            <Form.Select
              value={paymentData.paymentMethod}
              onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
              required
            >
              <option value="credit_card">Tarjeta de Crédito</option>
              <option value="debit_card">Tarjeta de Débito</option>
              <option value="cash">Efectivo</option>
              <option value="bank_transfer">Transferencia Bancaria</option>
            </Form.Select>
          </Form.Group>

          <Alert variant="info" className="mb-3">
            <i className="fas fa-info-circle me-2"></i>
            <small>El ID de transacción se generará automáticamente</small>
          </Alert>

          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <Button variant="secondary" onClick={onHide} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Procesando...
                </>
              ) : (
                'Procesar Pago'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default PaymentModal;
