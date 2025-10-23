const nodemailer = require('nodemailer');

// Create transporter
let transporter;

// For development: Use Ethereal (test email service)
// For production: Use real SMTP service
const initializeTransporter = async () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
    // Use configured SMTP service
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      // Add timeout and connection settings
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,   // 10 seconds
      socketTimeout: 15000,      // 15 seconds
      // Gmail specific settings
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5
    });
    console.log('📧 Email service configured with custom SMTP');
    console.log(`📧 Host: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}`);
    console.log(`📧 User: ${process.env.EMAIL_USER}`);
    console.log(`📧 Secure: ${process.env.EMAIL_SECURE}`);
    
    // Verify connection
    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified successfully');
    } catch (error) {
      console.error('❌ SMTP connection verification failed:', error.message);
      console.error('⚠️  Emails may not be sent. Check your credentials and settings.');
    }
  } else {
    // Use Ethereal for testing (creates temporary account)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log('📧 Email service using Ethereal (test mode)');
    console.log(`📧 Preview emails at: https://ethereal.email/messages`);
    console.log(`📧 User: ${testAccount.user}`);
    console.log(`📧 Pass: ${testAccount.pass}`);
  }
  
  return transporter;
};

// Email templates
const emailTemplates = {
  // Welcome email when user registers
  welcome: (user) => ({
    subject: '¡Bienvenido a Azure Suites Hotel!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏨 Azure Suites Hotel</h1>
          </div>
          <div class="content">
            <h2>¡Hola ${user.firstName}!</h2>
            <p>Gracias por registrarte en <strong>Azure Suites Hotel</strong>.</p>
            <p>Tu cuenta ha sido creada exitosamente. Ahora puedes:</p>
            <ul>
              <li>✅ Reservar habitaciones</li>
              <li>✅ Ver tus reservas</li>
              <li>✅ Gestionar tu perfil</li>
            </ul>
            <p>Esperamos que disfrutes de una experiencia inolvidable con nosotros.</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3003'}" class="button">
                Ir al Sitio Web
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Azure Suites Hotel. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Reservation confirmed
  reservationConfirmed: (reservation, room, user) => ({
    subject: `Reserva Confirmada - ${reservation.reservationNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #38ef7d; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; color: #666; }
          .value { color: #333; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Reserva Confirmada</h1>
          </div>
          <div class="content">
            <h2>¡Hola ${user.firstName}!</h2>
            <p>Tu reserva ha sido <strong>confirmada exitosamente</strong>.</p>
            
            <div class="info-box">
              <h3>📋 Detalles de la Reserva</h3>
              <div class="detail-row">
                <span class="label">Número de Reserva:</span>
                <span class="value">${reservation.reservationNumber}</span>
              </div>
              <div class="detail-row">
                <span class="label">Habitación:</span>
                <span class="value">${room.name} (#${room.number})</span>
              </div>
              <div class="detail-row">
                <span class="label">Check-in:</span>
                <span class="value">${new Date(reservation.checkIn).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div class="detail-row">
                <span class="label">Check-out:</span>
                <span class="value">${new Date(reservation.checkOut).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div class="detail-row">
                <span class="label">Huéspedes:</span>
                <span class="value">${reservation.adults} adulto(s)${reservation.children > 0 ? `, ${reservation.children} niño(s)` : ''}</span>
              </div>
              <div class="detail-row">
                <span class="label">Total:</span>
                <span class="value" style="font-size: 1.2em; color: #38ef7d; font-weight: bold;">$${reservation.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <p><strong>⏰ Horarios de Check-in/Check-out:</strong></p>
            <ul>
              <li>Check-in: A partir de las 15:00 hrs</li>
              <li>Check-out: Hasta las 12:00 hrs</li>
            </ul>

            <p>Te enviaremos un recordatorio un día antes de tu llegada.</p>
            <p>¡Esperamos verte pronto!</p>
          </div>
          <div class="footer">
            <p>Si tienes alguna pregunta, contáctanos.</p>
            <p>© ${new Date().getFullYear()} Azure Suites Hotel</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Reservation cancelled
  reservationCancelled: (reservation, room, user) => ({
    subject: `Reserva Cancelada - ${reservation.reservationNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f45c43; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Reserva Cancelada</h1>
          </div>
          <div class="content">
            <h2>Hola ${user.firstName},</h2>
            <p>Tu reserva <strong>${reservation.reservationNumber}</strong> ha sido cancelada.</p>
            
            <div class="info-box">
              <p><strong>Habitación:</strong> ${room.name} (#${room.number})</p>
              <p><strong>Fechas:</strong> ${new Date(reservation.checkIn).toLocaleDateString('es-ES')} - ${new Date(reservation.checkOut).toLocaleDateString('es-ES')}</p>
            </div>

            <p>Si no solicitaste esta cancelación o tienes alguna duda, por favor contáctanos inmediatamente.</p>
            <p>Esperamos poder servirte en otra ocasión.</p>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3003'}" class="button">
                Ver Otras Habitaciones
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Azure Suites Hotel</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Check-in reminder (1 day before)
  checkInReminder: (reservation, room, user) => ({
    subject: `Recordatorio: Check-in mañana - ${reservation.reservationNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f5576c; }
          .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 ¡Tu estadía comienza mañana!</h1>
          </div>
          <div class="content">
            <h2>Hola ${user.firstName},</h2>
            <p>Te recordamos que mañana es tu <strong>día de check-in</strong> en Azure Suites Hotel.</p>
            
            <div class="highlight">
              <h3 style="margin: 0; color: #f5576c;">📅 Mañana, ${new Date(reservation.checkIn).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
            </div>

            <div class="info-box">
              <h3>📋 Detalles de tu Reserva</h3>
              <p><strong>Reserva:</strong> ${reservation.reservationNumber}</p>
              <p><strong>Habitación:</strong> ${room.name} (#${room.number})</p>
              <p><strong>Check-in:</strong> ${new Date(reservation.checkIn).toLocaleDateString('es-ES')}</p>
              <p><strong>Check-out:</strong> ${new Date(reservation.checkOut).toLocaleDateString('es-ES')}</p>
              <p><strong>Huéspedes:</strong> ${reservation.adults} adulto(s)${reservation.children > 0 ? `, ${reservation.children} niño(s)` : ''}</p>
            </div>

            <p><strong>📍 Información Importante:</strong></p>
            <ul>
              <li>Horario de check-in: A partir de las 15:00 hrs</li>
              <li>Trae tu documento de identidad</li>
              <li>Puedes hacer check-in anticipado en recepción</li>
            </ul>

            <p><strong>🚗 ¿Cómo llegar?</strong></p>
            <p>Estamos ubicados en el corazón de la ciudad. Ofrecemos estacionamiento gratuito.</p>

            <p>¡Estamos ansiosos por recibirte!</p>
          </div>
          <div class="footer">
            <p>¿Necesitas modificar tu reserva? Contáctanos.</p>
            <p>© ${new Date().getFullYear()} Azure Suites Hotel</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // New reservation notification to operators (with rotation)
  newReservationOperator: (reservation, room, user, operatorName) => ({
    subject: `Nueva Reserva - ${reservation.reservationNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; color: #666; }
          .value { color: #333; }
          .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🆕 Nueva Reserva Recibida</h1>
          </div>
          <div class="content">
            <h2>Hola ${operatorName},</h2>
            <p>Se ha recibido una nueva reserva que requiere tu atención.</p>
            
            <div class="info-box">
              <h3>📋 Información de la Reserva</h3>
              <div class="detail-row">
                <span class="label">Número de Reserva:</span>
                <span class="value">${reservation.reservationNumber}</span>
              </div>
              <div class="detail-row">
                <span class="label">Estado:</span>
                <span class="value" style="color: #ffc107; font-weight: bold;">⏳ PENDIENTE</span>
              </div>
              <div class="detail-row">
                <span class="label">Creada:</span>
                <span class="value">${new Date(reservation.createdAt).toLocaleString('es-ES')}</span>
              </div>
            </div>

            <div class="info-box">
              <h3>👤 Datos del Huésped</h3>
              <div class="detail-row">
                <span class="label">Nombre:</span>
                <span class="value">${reservation.guestFirstName} ${reservation.guestLastName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Email:</span>
                <span class="value">${reservation.guestEmail}</span>
              </div>
              <div class="detail-row">
                <span class="label">Teléfono:</span>
                <span class="value">${reservation.guestPhone}</span>
              </div>
            </div>

            <div class="info-box">
              <h3>🏨 Detalles de la Estadía</h3>
              <div class="detail-row">
                <span class="label">Habitación:</span>
                <span class="value">${room.name} (#${room.number})</span>
              </div>
              <div class="detail-row">
                <span class="label">Check-in:</span>
                <span class="value">${new Date(reservation.checkIn).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div class="detail-row">
                <span class="label">Check-out:</span>
                <span class="value">${new Date(reservation.checkOut).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div class="detail-row">
                <span class="label">Huéspedes:</span>
                <span class="value">${reservation.adults} adulto(s)${reservation.children > 0 ? `, ${reservation.children} niño(s)` : ''}</span>
              </div>
              <div class="detail-row">
                <span class="label">Total:</span>
                <span class="value" style="font-size: 1.2em; color: #667eea; font-weight: bold;">$${reservation.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            ${reservation.specialRequests ? `
            <div class="alert">
              <h4 style="margin-top: 0;">💬 Mensaje del Huésped:</h4>
              <p style="margin: 0;">${reservation.specialRequests}</p>
            </div>
            ` : ''}

            <p><strong>⚠️ Acción Requerida:</strong></p>
            <ul>
              <li>Revisar y confirmar la reserva</li>
              <li>Verificar disponibilidad de la habitación</li>
              <li>Contactar al huésped si es necesario</li>
            </ul>

            <p style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3003'}/operator" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">
                Ver en Panel de Operador
              </a>
            </p>
          </div>
          <div class="footer">
            <p>Este email fue enviado automáticamente por el sistema de reservas.</p>
            <p>© ${new Date().getFullYear()} Azure Suites Hotel</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Contact form message to operators
  contactMessage: (contactData, operatorName) => ({
    subject: `Nuevo Mensaje de Contacto - ${contactData.subject || 'Sin asunto'}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #6dd5ed; }
          .message-box { background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin: 20px 0; }
          .detail-row { padding: 8px 0; }
          .label { font-weight: bold; color: #666; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📩 Nuevo Mensaje de Contacto</h1>
          </div>
          <div class="content">
            <h2>Hola ${operatorName},</h2>
            <p>Has recibido un nuevo mensaje desde el formulario de contacto.</p>
            
            <div class="info-box">
              <h3>👤 Información del Remitente</h3>
              <div class="detail-row">
                <span class="label">Nombre:</span> ${contactData.name}
              </div>
              <div class="detail-row">
                <span class="label">Email:</span> <a href="mailto:${contactData.email}">${contactData.email}</a>
              </div>
              <div class="detail-row">
                <span class="label">Asunto:</span> ${contactData.subject || 'Sin asunto'}
              </div>
              <div class="detail-row">
                <span class="label">Fecha:</span> ${new Date().toLocaleString('es-ES')}
              </div>
            </div>

            <div class="message-box">
              <h4>💬 Mensaje:</h4>
              <p style="white-space: pre-wrap;">${contactData.message}</p>
            </div>

            <p><strong>⚠️ Recuerda responder al cliente lo antes posible.</strong></p>
          </div>
          <div class="footer">
            <p>Este email fue enviado automáticamente por el sistema.</p>
            <p>© ${new Date().getFullYear()} Azure Suites Hotel</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function
const sendEmail = async (to, template) => {
  const startTime = Date.now();
  try {
    if (!transporter) {
      console.log('📧 Initializing email transporter...');
      await initializeTransporter();
    }

    console.log(`📧 Sending email to: ${to}`);
    console.log(`📧 Subject: ${template.subject}`);

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Azure Suites Hotel" <noreply@azuresuites.com>',
      to: to,
      subject: template.subject,
      html: template.html
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Email sent successfully in ${duration}ms`);
    console.log(`📧 Message ID: ${info.messageId}`);
    
    // If using Ethereal, log preview URL
    if (nodemailer.getTestMessageUrl(info)) {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return { success: true, messageId: info.messageId, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Error sending email after ${duration}ms:`, error.message);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    
    // Provide more helpful error messages
    let userMessage = error.message;
    if (error.code === 'ETIMEDOUT') {
      userMessage = 'Email service timeout. Please check your internet connection and SMTP settings.';
    } else if (error.code === 'EAUTH') {
      userMessage = 'Email authentication failed. Please verify your email credentials.';
    } else if (error.code === 'ECONNECTION') {
      userMessage = 'Cannot connect to email server. Please check SMTP host and port.';
    }
    
    return { success: false, error: userMessage, details: error.message };
  }
};

module.exports = {
  initializeTransporter,
  sendEmail,
  emailTemplates
};
