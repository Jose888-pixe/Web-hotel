# 📧 Configuración de Emails en Render

## ⚠️ Problema Detectado

El archivo `render.yaml` no tenía configuradas las variables de entorno para emails, por lo que el sistema de notificaciones no funcionaba en producción.

## ✅ Solución Implementada

Se agregaron las siguientes variables de entorno al `render.yaml`:

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
  sync: false
- key: EMAIL_PASSWORD
  sync: false
- key: EMAIL_FROM
  value: "Azure Suites Hotel <noreply@azuresuites.com>"
```

---

## 🔧 Pasos para Configurar en Render

### **1. Ir al Dashboard de Render**

1. Ve a https://dashboard.render.com
2. Selecciona el servicio **azure-suites-backend**

### **2. Configurar Variables de Email**

Ve a la sección **Environment** y agrega estas dos variables **sensibles**:

#### **EMAIL_USER**
- **Key:** `EMAIL_USER`
- **Value:** `azuresuitshotel@gmail.com` (o tu email)
- Marca como **Secret** ✅

#### **EMAIL_PASSWORD**
- **Key:** `EMAIL_PASSWORD`
- **Value:** `[tu contraseña de aplicación de Gmail]`
- Marca como **Secret** ✅

**⚠️ IMPORTANTE:** 
- NO uses tu contraseña normal de Gmail
- Usa una **Contraseña de Aplicación**
- Si no tienes una, ve a: https://myaccount.google.com/apppasswords

---

## 🚀 Después de Configurar

### **Opción 1: Hacer Push del render.yaml Actualizado**

```bash
git add render.yaml RENDER_EMAIL_CONFIG.md
git commit -m "Add email environment variables to render.yaml"
git push origin master
```

Render detectará los cambios y hará un nuevo deploy automáticamente.

### **Opción 2: Re-deploy Manual**

1. Ve al Dashboard de Render
2. Click en **azure-suites-backend**
3. Click en **Manual Deploy** → **Deploy latest commit**

---

## ✅ Verificar que Funcione

Después del deploy, revisa los logs en Render:

1. Ve a **Logs** en el dashboard
2. Busca estas líneas:

```
✅ Database connected
✅ Database synced
✅ Email service initialized
📧 Email service configured with custom SMTP
✅ Cron jobs initialized
🌟 Server running on http://localhost:3001
```

Si ves esto: ✅ **Los emails están configurados correctamente**

Si ves esto:
```
📧 Email service using Ethereal (test mode)
```
❌ **Las variables de email NO están configuradas**

---

## 📨 Probar los Emails

Una vez configurado:

1. **Registra un nuevo usuario** → Debería recibir email de bienvenida
2. **Crea una reserva** → El operador debería recibir notificación
3. **Confirma una reserva** (como operador) → El usuario recibe confirmación

---

## 🔍 Troubleshooting

### **Error: "Missing credentials for PLAIN"**

**Causa:** `EMAIL_USER` o `EMAIL_PASSWORD` no están configuradas  
**Solución:** Verifica que las variables estén en Environment de Render

### **Error: "Invalid login"**

**Causa:** Contraseña incorrecta o no es una contraseña de aplicación  
**Solución:** Genera una nueva contraseña de aplicación en Google

### **Emails no se envían pero no hay error**

**Causa:** El sistema está usando Ethereal (modo de prueba)  
**Solución:** Verifica que `EMAIL_HOST` y `EMAIL_USER` estén configurados

---

## 📋 Checklist de Configuración

- [ ] Variables agregadas al `render.yaml`
- [ ] `EMAIL_USER` configurado en Render Dashboard
- [ ] `EMAIL_PASSWORD` configurado en Render Dashboard
- [ ] Contraseña de aplicación de Gmail generada
- [ ] Push del código actualizado
- [ ] Deploy completado exitosamente
- [ ] Logs muestran "Email service configured with custom SMTP"
- [ ] Email de prueba enviado correctamente

---

## 💡 Notas Importantes

1. **Las variables con `sync: false`** deben configurarse manualmente en el Dashboard de Render
2. **No subas las credenciales al código** - Por eso usamos `sync: false`
3. **FRONTEND_URL** debe apuntar al dominio real de tu frontend en Render
4. **EMAIL_FROM** puede ser cualquier nombre, no afecta el envío

---

## 🎯 Resultado Esperado

Una vez configurado correctamente, el sistema enviará automáticamente:

✅ Email de bienvenida al registrarse  
✅ Notificación a operadores de nuevas reservas (con rotación)  
✅ Confirmación de reservas a usuarios  
✅ Cancelación de reservas a usuarios  
✅ Recordatorios de check-in (1 día antes, a las 9 AM)  
✅ Notificaciones de mensajes de contacto a operadores  

---

**¡Listo!** 🚀 Ahora los emails deberían funcionar en producción.
