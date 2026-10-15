# 💸 Gestor de Gastos para Poliestudiantes

Una aplicación móvil moderna para Android desarrollada con **Expo (React Native)** y **TypeScript** que permite a estudiantes universitarios registrar y visualizar sus gastos mensuales.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Expo](https://img.shields.io/badge/expo-SDK%2057-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-6.0.3-blue.svg)
![React Native](https://img.shields.io/badge/react--native-0.86.3-blue.svg)

>  **Este proyecto es la base para un taller progresivo de desarrollo móvil**. 
Los alumnos comenzarán con esta versión base (sin persistencia de datos) y avanzarán implementando AsyncStorage, SQLite 
---
##  Instalación y Configuración

### Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Node.js** versión 18 o superior ([Descargar aquí](https://nodejs.org/))
- ✅ **npm** o **yarn** (viene con Node.js)


###  Instalar dependencias

```bash
npm install
```

Este comando instalará todas las dependencias necesarias listadas en `package.json`. Puede tomar varios minutos la primera vez.

### Instalación manual de cada dependencia (opcional)

`npm install` ya instala todo lo anterior. Si empiezas un proyecto desde cero o necesitas reinstalar una dependencia puntual, estos son los comandos de cada una. Usa `npx expo install` para que Expo elija la versión compatible con el SDK 57.

**Núcleo (Expo, React y React Native):**

```bash
npx expo install expo
npx expo install react react-dom react-native
npx expo install expo-router
npx expo install expo-constants expo-linking expo-status-bar expo-system-ui expo-splash-screen
```

**Interfaz y efecto Liquid Glass:**

```bash
npx expo install expo-blur
npx expo install expo-linear-gradient
npx expo install expo-glass-effect
npx expo install expo-image
npx expo install expo-symbols
npx expo install expo-font
npx expo install @expo/ui
```

**Animaciones, gestos y navegación:**

```bash
npx expo install react-native-reanimated react-native-worklets
npx expo install react-native-gesture-handler
npx expo install react-native-safe-area-context
npx expo install react-native-screens
```

**Utilidades de dispositivo y web:**

```bash
npx expo install expo-device
npx expo install expo-web-browser
npx expo install react-native-web
```

| Dependencia | Para qué sirve |
|-------------|----------------|
| `expo` | Framework base para React Native |
| `react`, `react-dom`, `react-native` | Librerías centrales de la UI |
| `expo-router` | Navegación basada en archivos |
| `expo-constants`, `expo-linking`, `expo-status-bar`, `expo-system-ui`, `expo-splash-screen` | Soporte de Expo Router y del sistema |
| `expo-blur` | Efectos de desenfoque (blur) |
| `expo-linear-gradient` | Gradientes nativos |
| `expo-glass-effect` | Efecto de cristal nativo |
| `expo-image`, `expo-symbols`, `expo-font` | Imágenes, iconos y fuentes |
| `@expo/ui` | Componentes nativos de Expo |
| `react-native-reanimated`, `react-native-worklets` | Animaciones fluidas |
| `react-native-gesture-handler` | Gestos táctiles |
| `react-native-safe-area-context`, `react-native-screens` | Áreas seguras y pantallas nativas |
| `expo-device`, `expo-web-browser` | Información del dispositivo y navegador |
| `react-native-web` | Ejecutar la app en el navegador |
