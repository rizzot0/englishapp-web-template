# EnglishApp - Aplicación Educativa Web

Una aplicación web interactiva para aprender inglés de forma divertida a través de juegos educativos.

## Juegos Disponibles

- Memory Game: Encuentra pares de palabras e imágenes
- Typing Game: Practica escritura con imágenes
- Math Game: Resuelve problemas matemáticos y identifica partes del cuerpo
- Sorting Game: Ordena elementos en secuencia correcta
- Sound Matching: Empareja sonidos con imágenes
- Identification Game: Identifica objetos y palabras

## Tecnologías Utilizadas

- React 18 con Vite
- Framer Motion para animaciones
- React Router para navegación
- CSS3 con efectos modernos
- Service Workers para funcionalidad offline
- Web Audio API para efectos de sonido
- Supabase para almacenamiento de estadísticas y progreso
- xlsx para exportar a Excel
- jspdf y html2canvas para exportar a PDF
- react-icons para iconografía moderna

## Instalación Local

```bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]

# Instalar dependencias
npm install

# Instalar dependencias adicionales para exportación y panel de profesor
npm install xlsx jspdf html2canvas react-icons

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

## Deploy en Netlify

1. Conecta tu repositorio de GitHub a Netlify
2. Netlify detectará automáticamente la configuración de Vite
3. El deploy se realizará automáticamente en cada push

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18

Archivos de configuración:
- netlify.toml: Configuración específica de Netlify
- public/_redirects: Configuración de SPA routing
- public/manifest.json: Configuración PWA

## Características

- Diseño responsivo: Optimizado para móviles y tablets
- Animaciones fluidas: Efectos visuales atractivos
- Sistema de audio: Música de fondo y efectos de sonido
- Modo oscuro/claro: Tema personalizable
- Estadísticas: Seguimiento del progreso del usuario
- Filtros avanzados: Filtra estadísticas por juego, tema y fecha
- Exportación de datos: Exporta estadísticas y gráficos a PDF y Excel
- Panel del Profesor: Acceso protegido con login, visualización y exportación de datos avanzados
- PWA: Funcionalidad offline y posibilidad de instalar como app

## PWA Features

- Instalable como aplicación nativa
- Funcionamiento offline
- Notificaciones push (configurable)
- Interfaz adaptativa

## Temáticas Educativas

- Frutas: apple, banana, grapes, etc.
- Animales: cat, dog, elephant, etc.
- Colores: red, blue, green, yellow
- Familia: mother, father, brother, sister
- Partes del Cuerpo: eye, nose, mouth, ear
- Días y Meses: Monday, Tuesday, January, etc.

## Configuración de Desarrollo

Variables de entorno:
```
VITE_APP_TITLE=EnglishApp
VITE_APP_VERSION=1.0.0
```

Scripts disponibles:
- npm run dev: Servidor de desarrollo
- npm run build: Construcción para producción
- npm run preview: Vista previa de la construcción
- npm run lint: Análisis de código

## Estadísticas y Progreso

La aplicación incluye un sistema completo de seguimiento de progreso:
- Puntuaciones por juego y temática
- Tiempo total de juego
- Días consecutivos jugando
- Mejores puntuaciones
- Métricas avanzadas: WPM, accuracy, errores promedio
- Filtros: por juego, tema y fecha
- Exportación: a PDF y Excel (datos y gráficos)
- Panel del Profesor: acceso a estadísticas globales y exportación

## Panel del Profesor

- Acceso protegido por contraseña (por defecto: `profesor123`)
- Visualización de gráficos de rendimiento general
- Filtros avanzados por juego, tema y fecha
- Exportación de datos y gráficos a PDF/Excel
- Acceso desde la página de estadísticas mediante botón dedicado

## Sistema de Audio

- Música de fondo opcional
- Efectos de sonido para interacciones
- Control de volumen independiente
- Persistencia de preferencias de audio

**EnglishApp** - Aprende inglés de forma divertida y efectiva. 