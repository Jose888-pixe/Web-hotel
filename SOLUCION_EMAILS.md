# 🔧 Solución: Emails No Funcionan en Render

## 🔍 Problema Identificado

Los emails dejaron de funcionar después de subir el proyecto a Render porque **faltaban las variables de entorno de email en el archivo `render.yaml`**.

---

## ✅ Cambios Realizados

### **1. Actualizado `render.yaml`**

Se agregaron las siguientes variables de entorno al servicio backend:

```yaml
- key: FRONTEND_URL
  value: https://azure-suites.onrender.com
- key: EMAIL_HOST
  value: smtp.gmail.com
- key: EMAIL_PORT
  value: 587
- key: EMAIL_SECURE
  value: false
- key: EMAIL_USER
  sync: false  # Se configura manualmente en Render Dashboard
- key: EMAIL_PASSWORD
  sync: false  # Se configura manualmente en Render Dashboard
- key: EMAIL_FROM
  value: "Azure Suites Hotel <noreply@azuresuites.com>"
```

### **2. Creado Script de Verificación**

Se creó `backend/checkEmailConfig.js` para verificar la configuración:

```bash
cd backend
npm run check:email
```

Este script muestra:
- ✅ Qué variables están configuradas
- ❌ Qué variables faltan
- 🔍 Validaciones adicionales (port, formato, etc.)

### **3. Documentación Creada**

- `RENDER_EMAIL_CONFIG.md` - Guía completa de configuración en Render
- `SOLUCION_EMAILS.md` - Este archivo, resumen del problema

---

## 🚀 Pasos para Activar los Emails

### **Paso 1: Configurar Variables Sensibles en Render**

1. Ve a https://dashboard.render.com
2. Selecciona el servicio **azure-suites-backend**
3. Ve a **Environment**
4. Agrega estas dos variables:

   **EMAIL_USER:**
   - Key: `EMAIL_USER`
   - Value: `azuresuitshotel@gmail.com`
   - Marca como **Secret** ✅

   **EMAIL_PASSWORD:**
   - Key: `EMAIL_PASSWORD`
   - Value: `[tu contraseña de aplicación de Gmail]`
   - Marca como **Secret** ✅

⚠️ **IMPORTANTE:** Usa una **Contraseña de Aplicación**, no tu contraseña normal.
- Genera una aquí: https://myaccount.google.com/apppasswords
- Primero activa la Verificación en 2 pasos si no la tienes

### **Paso 2: Hacer Push del Código Actualizado**

```bash
git add render.yaml backend/package.json backend/checkEmailConfig.js RENDER_EMAIL_CONFIG.md SOLUCION_EMAILS.md
git commit -m "Fix: Add email environment variables to render.yaml"
git push origin master
```

Render detectará el cambio y hará un nuevo deploy automáticamente.

### **Paso 3: Verificar el Deploy**

1. Espera a que termine el deploy en Render
2. Ve a **Logs** del servicio backend
3. Busca estas líneas:

```
✅ Database connected
✅ Database synced
✅ Email service initialized
📧 Email service configured with custom SMTP  ← DEBE DECIR ESTO
✅ Cron jobs initialized
```

Si dice `📧 Email service using Ethereal (test mode)` → Las variables NO están configuradas.

---

## 🧪 Probar que Funcione

### **Opción 1: Desde el Frontend**

1. Ve a tu sitio en Render
2. Registra un nuevo usuario
3. Revisa el inbox del email → Debería llegar email de bienvenida

### **Opción 2: Verificar Configuración Localmente**

```bash
cd backend
npm run check:email
```

Deberías ver:
```
✅ EMAIL_HOST          = smtp.gmail.com
✅ EMAIL_PORT          = 587
✅ EMAIL_USER          = azuresuitshotel@gmail.com
✅ EMAIL_PASSWORD      = ***CONFIGURED***
✅ EMAIL_SECURE        = false
✅ EMAIL_FROM          = "Azure Suites Hotel <noreply@azuresuites.com>"
✅ FRONTEND_URL        = https://azure-suites.onrender.com

Configured: 7/7

✅ ALL EMAIL VARIABLES CONFIGURED!
   Emails should work in production.
```

---

## 📧 Emails que se Envían

Una vez configurado correctamente:

| Evento | Destinatario | Cuándo |
|--------|--------------|--------|
| Usuario se registra | Usuario | Inmediato |
| Nueva reserva | Operador (rotación) | Inmediato |
| Reserva confirmada | Usuario | Al confirmar |
| Reserva cancelada | Usuario | Al cancelar |
| Check-in mañana | Usuario | 9:00 AM diario |
| Mensaje de contacto | Operador (rotación) | Inmediato |

---

## 🐛 Troubleshooting

### **Problema: "Missing credentials for PLAIN"**

**Causa:** `EMAIL_USER` o `EMAIL_PASSWORD` no están en Render  
**Solución:** Agrégalas en Environment del Dashboard

### **Problema: "Invalid login" o "Authentication failed"**

**Causa:** Contraseña incorrecta o no es App Password  
**Solución:** 
1. Ve a https://myaccount.google.com/apppasswords
2. Genera una nueva contraseña de aplicación
3. Actualiza `EMAIL_PASSWORD` en Render

### **Problema: Logs dicen "Email service using Ethereal"**

**Causa:** Las variables de email no están configuradas  
**Solución:** Verifica que `EMAIL_HOST` y `EMAIL_USER` estén en Render Environment

### **Problema: Emails se envían pero no llegan**

**Posibles causas:**
1. Gmail bloqueó el envío → Revisa email de advertencia en tu Gmail
2. Emails van a spam → Revisa carpeta de spam
3. Email destino no existe → Verifica el email del destinatario

---

## 📝 Checklist

Marca cuando completes cada paso:

- [ ] Variables agregadas a `render.yaml`
- [ ] `EMAIL_USER` configurado en Render Dashboard
- [ ] `EMAIL_PASSWORD` configurado en Render Dashboard (App Password)
- [ ] Código pusheado a GitHub
- [ ] Deploy completado en Render
- [ ] Logs muestran "Email service configured with custom SMTP"
- [ ] Email de prueba (registro de usuario) funciona
- [ ] Email de nueva reserva llega a operador
- [ ] Email de confirmación llega a usuario

---

## 🎯 Resultado Esperado

Después de configurar correctamente:

✅ **Local:**
```bash
npm run check:email
# → Muestra todas las variables configuradas
```

✅ **Render Logs:**
```
📧 Email service configured with custom SMTP
✅ Email service initialized
```

✅ **Funcionalidad:**
- Usuarios reciben email de bienvenida
- Operadores reciben notificaciones de reservas
- Usuarios reciben confirmaciones y recordatorios

---

## 💡 Notas Importantes

1. **No subir credenciales al código** - Por eso `EMAIL_USER` y `EMAIL_PASSWORD` tienen `sync: false`
2. **Variables públicas** (como `EMAIL_HOST`) van directo en `render.yaml`
3. **Variables sensibles** se configuran manualmente en Render Dashboard
4. **FRONTEND_URL** debe ser el dominio real de producción
5. Los cambios en Environment de Render requieren **re-deploy** para aplicarse

---

## 🆘 ¿Necesitas Ayuda?

Si después de seguir todos los pasos los emails siguen sin funcionar:

1. Ejecuta `npm run check:email` y comparte la salida
2. Comparte los logs de Render (primeras 50 líneas del deploy)
3. Verifica que tengas activada la Verificación en 2 pasos en Google

---

**¡Listo!** 🎉 Los emails deberían funcionar ahora en producción.
