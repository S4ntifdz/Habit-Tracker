# 🚀 Guía para convertir a APK con PWABuilder

## 📱 Pasos para generar tu APK

### 1. **Preparar la aplicación**
- ✅ Todos los archivos PWA están listos en la carpeta `public/`
- ✅ Manifest.json configurado con iconos y metadatos
- ✅ Service Worker implementado para funcionalidad offline
- ✅ Iconos en todos los tamaños requeridos (72x72 hasta 512x512)
- ✅ Iconos maskables para Android

### 2. **Usar PWABuilder**
1. Ve a [PWABuilder.com](https://www.pwabuilder.com/)
2. Ingresa la URL de tu aplicación web desplegada
3. Haz clic en "Start" para analizar tu PWA
4. Selecciona "Android" en las opciones de plataforma
5. Configura las opciones del APK:
   - **Package ID**: `com.s4ntifdz.atomichabits`
   - **App Name**: `Hábitos Atómicos`
   - **Version**: `1.0.0`
   - **Signing**: Usa la opción de firma automática o sube tu keystore

### 3. **Configuraciones recomendadas para Android**
```json
{
  "packageId": "com.s4ntifdz.atomichabits",
  "name": "Hábitos Atómicos",
  "launcherName": "Hábitos Atómicos",
  "version": "1.0.0",
  "versionCode": 1,
  "minSdkVersion": 21,
  "targetSdkVersion": 33,
  "orientation": "portrait",
  "iconUrl": "/icon-512x512.png",
  "maskableIconUrl": "/icon-512x512-maskable.png",
  "monochromeIconUrl": "/icon-512x512.png",
  "backgroundColor": "#1E293B",
  "themeColor": "#3B82F6",
  "navigationColor": "#FFFFFF",
  "display": "standalone",
  "startUrl": "/"
}
```

### 4. **Características incluidas**
- 🔄 **Funcionalidad offline** con Service Worker
- 📱 **Iconos adaptativos** para Android (maskables)
- 🎨 **Splash screen** personalizada
- 📊 **Shortcuts** de aplicación (accesos directos)
- 🔔 **Soporte para notificaciones push** (preparado)
- 💾 **Almacenamiento local** con IndexedDB/localStorage
- 🌐 **Soporte multi-idioma** (español)

### 5. **Archivos incluidos**
```
public/
├── manifest.json              # Manifest PWA principal
├── pwabuilder-sw.js          # Service Worker
├── icon-72x72.png            # Icono 72x72
├── icon-96x96.png            # Icono 96x96
├── icon-128x128.png          # Icono 128x128
├── icon-144x144.png          # Icono 144x144
├── icon-152x152.png          # Icono 152x152
├── icon-192x192.png          # Icono 192x192
├── icon-384x384.png          # Icono 384x384
├── icon-512x512.png          # Icono 512x512
├── icon-192x192-maskable.png # Icono maskable 192x192
├── icon-512x512-maskable.png # Icono maskable 512x512
├── apple-touch-icon.png      # Icono para iOS
├── favicon.ico               # Favicon
├── browserconfig.xml         # Configuración para Windows
├── robots.txt                # SEO
└── sitemap.xml              # Mapa del sitio
```

### 6. **Verificar antes de generar APK**
- [ ] La aplicación funciona correctamente en el navegador
- [ ] Todos los iconos se muestran correctamente
- [ ] El manifest.json es válido (puedes verificar en Chrome DevTools)
- [ ] El Service Worker se registra sin errores
- [ ] La aplicación funciona offline

### 7. **Después de generar el APK**
1. Descarga el APK generado por PWABuilder
2. Prueba la instalación en un dispositivo Android
3. Verifica que todas las funcionalidades trabajen correctamente
4. Si todo está bien, puedes publicar en Google Play Store

## 🎯 Características específicas de la app

### **Funcionalidades principales**
- ✅ Seguimiento de hábitos semanales
- ✅ Planner de actividades con horarios
- ✅ Estadísticas y rachas de progreso
- ✅ Vinculación entre actividades y hábitos
- ✅ Interfaz optimizada para móvil
- ✅ Almacenamiento local persistente

### **Optimizaciones PWA**
- 🚀 Carga rápida con Service Worker
- 📱 Diseño responsive y mobile-first
- 💾 Funciona completamente offline
- 🎨 Iconos adaptativos para Android
- ⚡ Instalable desde el navegador

## 🔧 Troubleshooting

### **Si PWABuilder no detecta tu PWA correctamente:**
1. Verifica que el manifest.json sea accesible desde `/manifest.json`
2. Asegúrate de que el Service Worker se registre correctamente
3. Verifica que todos los iconos existan y sean accesibles
4. Usa Chrome DevTools > Application > Manifest para verificar

### **Si el APK no funciona correctamente:**
1. Verifica los permisos en el manifest
2. Asegúrate de que la URL de inicio sea correcta
3. Verifica que no haya errores de CORS
4. Prueba la aplicación web en un navegador móvil primero

---

¡Tu aplicación está lista para convertirse en APK! 🎉