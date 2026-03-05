# FlowForge OSS

Automate Everything. Own Everything.

## App de clips virales
Esta demo permite subir videos y generar clips pensados para redes sociales usando `ffmpeg`.

### Requisitos
- Node.js 18+
- ffmpeg + ffprobe disponibles en el PATH

### Uso rápido
```bash
npm install
npm start
```
Luego abre `http://localhost:3000`.

### Parámetros de extracción
- Clips por video: entre **1 y 6** (default: 3)
- Duración por clip: entre **5 y 60 segundos** (default: 15)

### ¿Cómo funciona?
- Sube un video desde la interfaz web.
- El backend calcula segmentos uniformes y recorta con `ffmpeg`.
- Descarga los clips generados en formato MP4.

### Tests
```bash
npm test
```
Incluye pruebas unitarias para validar el cálculo de segmentos y el parseo de opciones.

## Instalación rápida
```bash
git clone https://github.com/boyhavana/flowforge-oss.git
cd flowforge-oss
docker compose up -d --build
```

## Contribuir
Lee CONTRIBUTING.md para más información.

## Licencia
MIT License
