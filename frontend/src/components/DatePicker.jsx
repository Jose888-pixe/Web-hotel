import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import logger from '../utils/logger';
import '../styles/DatePicker.css';

const DatePicker = ({ checkInDate, checkOutDate, onCheckInChange, onCheckOutChange, occupiedDates = [], minDate, onError }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    logger.log('🗓️ DatePicker received occupiedDates:', occupiedDates);
    logger.log('🗓️ Total occupied dates:', occupiedDates.length);
  }, [occupiedDates]);

  useEffect(() => {
    logger.log('🗓️ Check-in date:', checkInDate);
    logger.log('🗓️ Check-out date:', checkOutDate);
  }, [checkInDate, checkOutDate]);

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateOccupied = (dateStr) => {
    const isOccupied = occupiedDates.includes(dateStr);
    return isOccupied;
  };

  const isDateDisabled = (dateStr) => {
    if (minDate) {
      return new Date(dateStr) < new Date(minDate);
    }
    return false;
  };

  const handleDateClick = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    logger.log('🔵 Date clicked:', dateStr);
    
    // Si la fecha está ocupada, no permitir selección
    if (isDateOccupied(dateStr)) {
      logger.log('❌ Date is occupied, cannot select');
      if (onError) onError('⛔ Esta fecha no tiene habitaciones disponibles. Por favor selecciona otro día.');
      return;
    }

    // Si la fecha está deshabilitada (pasada), no permitir selección
    if (isDateDisabled(dateStr)) {
      logger.log('❌ Date is disabled, cannot select');
      return;
    }

    // Si se hace clic en la fecha de check-in actual, borrarla
    if (dateStr === checkInDate) {
      logger.log('🗑️ Clearing check-in');
      onCheckInChange('');
      onCheckOutChange('');
      return;
    }

    // Si no hay check-in, establecerlo
    if (!checkInDate) {
      logger.log('✅ Setting check-in:', dateStr);
      onCheckInChange(dateStr);
      onCheckOutChange('');
      return;
    }

    // Si ya hay check-in, el siguiente clic es para check-out
    const clickedDate = new Date(dateStr);
    const currentCheckIn = new Date(checkInDate);

    // No permitir check-out antes del check-in (permite el mismo día para estadías de 1 día)
    if (clickedDate < currentCheckIn) {
      logger.log('❌ Check-out must be after or equal to check-in');
      if (onError) onError('La fecha de salida no puede ser anterior a la fecha de entrada');
      return;
    }

    // Verificar que no haya fechas ocupadas en el rango
    const hasOccupied = hasOccupiedDatesInRange(checkInDate, dateStr);
    if (hasOccupied) {
      logger.log('❌ Range has occupied dates');
      if (onError) onError('El rango seleccionado incluye fechas ocupadas. Por favor elige otras fechas.');
      return;
    }

    // Establecer check-out
    logger.log('✅ Setting check-out:', dateStr);
    onCheckOutChange(dateStr);
  };

  const hasOccupiedDatesInRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      if (isDateOccupied(dateStr)) {
        return true;
      }
    }
    return false;
  };

  const isInRange = (dateStr) => {
    if (!checkInDate || !checkOutDate) return false;
    const date = new Date(dateStr);
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    return date >= start && date <= end;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth);
    const firstDay = firstDayOfMonth(currentMonth);
    
    // Log occupied dates for current month
    const currentMonthOccupied = occupiedDates.filter(date => {
      const d = new Date(date);
      return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    });
    if (currentMonthOccupied.length > 0) {
      logger.log(`🔴 Occupied dates in ${currentMonth.getMonth() + 1}/${currentMonth.getFullYear()}:`, currentMonthOccupied);
    }
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isOccupied = isDateOccupied(dateStr);
      const isDisabled = isDateDisabled(dateStr);
      const isCheckIn = checkInDate === dateStr;
      const isCheckOut = checkOutDate === dateStr;
      const inRange = isInRange(dateStr);
      
      days.push(
        <div
          key={day}
          className={`calendar-day cursor-pointer ${isOccupied ? 'occupied' : ''} ${isDisabled ? 'disabled' : ''} ${isCheckIn ? 'check-in' : ''} ${isCheckOut ? 'check-out' : ''} ${inRange && !isCheckIn && !isCheckOut ? 'in-range' : ''}`}
          onClick={() => handleDateClick(day)}
          title={isOccupied ? 'Sin disponibilidad - Todas las habitaciones están ocupadas' : isDisabled ? 'Fecha pasada' : ''}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="custom-datepicker">
      <div className="calendar-header">
        <Button variant="outline-primary" size="sm" onClick={prevMonth}>
          <i className="fas fa-chevron-left"></i>
        </Button>
        <span className="calendar-month">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <Button variant="outline-primary" size="sm" onClick={nextMonth}>
          <i className="fas fa-chevron-right"></i>
        </Button>
      </div>
      
      <div className="calendar-weekdays">
        <div>Dom</div>
        <div>Lun</div>
        <div>Mar</div>
        <div>Mié</div>
        <div>Jue</div>
        <div>Vie</div>
        <div>Sáb</div>
      </div>
      
      <div className="calendar-grid">
        {renderCalendar()}
      </div>
      
      <div className="calendar-legend mt-3">
        <small>
          <span className="legend-item">
            <span className="legend-color available"></span> Disponible
          </span>
          <span className="legend-item ms-3">
            <span className="legend-color occupied"></span> Ocupado/Mantenimiento
          </span>
          <span className="legend-item ms-3">
            <span className="legend-color selected"></span> Seleccionado
          </span>
        </small>
      </div>
    </div>
  );
};

export default DatePicker;
