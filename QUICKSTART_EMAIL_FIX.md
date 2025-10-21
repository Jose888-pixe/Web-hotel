# ⚡ Quick Fix: Emails en Render

## 🎯 Problema
Los emails NO funcionaban en Render porque faltaban variables de entorno.

## ✅ Solución (3 pasos)

### **1️⃣ Push del Código Actualizado**

```bash
git add .
git commit -m "Fix: Add email variables to render.yaml"
git push origin master
```

### **2️⃣ Configurar en Render Dashboard**

1. Ve a: https://dashboard.render.com
2. Selecciona: **azure-suites-backend**
3. Click: **Environment**
4. Agrega estas 2 variables:

```
EMAIL_USER = azuresuitshotel@gmail.com
EMAIL_PASSWORD = [tu contraseña de aplicación]
```

⚠️ Marca ambas como **Secret**

**¿No tienes contraseña de aplicación?**
→ https://myaccount.google.com/apppasswords

### **3️⃣ Verificar**

Espera el deploy y revisa los logs. Debe decir:

```
✅ Email service initialized
📧 Email service configured with custom SMTP
```

---

## 🧪 Probar

1. Registra un usuario nuevo
2. Debería recibir email de bienvenida
3. ✅ ¡Listo!

---

## 📚 Más Info

- Guía completa: `SOLUCION_EMAILS.md`
- Configuración detallada: `RENDER_EMAIL_CONFIG.md`
- Verificar config: `cd backend && npm run check:email`

---

**Archivos modificados:**
- ✅ `render.yaml` - Agregadas variables de email
- ✅ `backend/checkEmailConfig.js` - Nuevo script de verificación
- ✅ `backend/package.json` - Agregado comando `check:email`
