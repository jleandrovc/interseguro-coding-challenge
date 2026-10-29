# interseguro-coding-challenge

# Interseguro Coding Challenge

Solución técnica para la factorización QR de matrices mediante una arquitectura de microservicios con **Go + Fiber**, **Node.js + Express** y **React + Vite**.

El proyecto permite ingresar una matriz, calcular su factorización QR y obtener estadísticas combinadas sobre las matrices resultantes.

## 1. Arquitectura

La solución está compuesta por tres servicios:

| Servicio | Tecnología | Puerto local | Responsabilidad |
|---|---|---:|---|
| Frontend | React + Vite | 5173 | Interfaz para ingresar matrices y visualizar resultados |
| API principal | Go + Fiber | 8080 | Validación de matrices, factorización QR e integración |
| Servicio de estadísticas | Node.js + Express | 3001 | Cálculo de estadísticas sobre Q y R |

### Flujo de procesamiento

1. El usuario ingresa una matriz en el frontend.
2. React envía una petición `POST /api/v1/qr` a la API Go.
3. Go valida la matriz y calcula su factorización QR utilizando Gonum.
4. Go envía las matrices Q y R al servicio de estadísticas Node.js.
5. Node calcula las estadísticas combinadas y devuelve el resultado.
6. Go integra los resultados y responde al frontend.
7. React presenta las matrices Q y R, las estadísticas y los indicadores de diagonalidad.

## 2. Requisitos

### Para ejecutar con Docker Compose

- Docker Desktop o Docker Engine.
- Docker Compose.

No necesitas instalar Go ni Node.js localmente si ejecutas toda la solución mediante Docker Compose.

### Para ejecutar directamente en macOS

- Go, con una versión compatible con el proyecto.
- Node.js y npm.
- Las dependencias de Go y Node.js instaladas.

Puedes comprobar las herramientas instaladas con:

```bash
go version
node --version
npm --version
docker --version
docker compose version
```

## 3. Estructura del proyecto

```text
interseguro-coding-challenge/
├── README.md
├── api-go/
│   ├── cmd/
│   ├── internal/
│   └── go.mod
├── api-node/
│   ├── src/
│   ├── package.json
│   └── ...
├── frontend/
│   ├── src/
│   ├── vite.config.js
│   ├── package.json
│   └── ...
├── docker-compose.yml
└── ...
```

La estructura mostrada es orientativa. Los archivos adicionales dependen de la implementación actual del proyecto.

## 4. Ejecución con Docker Compose

Esta es la forma recomendada de levantar todos los servicios utilizando la configuración definida para Docker.

Desde la raíz del proyecto:

```bash
docker compose up --build
```

Una vez que los servicios estén iniciados, abre:

- Frontend: `http://localhost:5173`
- API Go: `http://localhost:8080/health`
- API Node: `http://localhost:3001/health`

Para detener los servicios, pulsa `Ctrl + C` en la terminal donde se ejecuta Compose. Después puedes ejecutar:

```bash
docker compose down
```

### Comunicación entre contenedores

Dentro de Docker Compose, los servicios se comunican mediante sus nombres DNS.

Por ejemplo, la API Go utiliza el nombre del servicio Node definido en `docker-compose.yml`, como `api-node`, para realizar llamadas internas.

No debes sustituir ese nombre por `localhost` dentro de un contenedor: allí, `localhost` representa al propio contenedor.

## 5. Ejecución local en macOS sin Docker

Este procedimiento permite ejecutar cada componente directamente en tu Mac, utilizando tres terminales para mantener los procesos activos.

No requiere modificar ni desplegar recursos en Azure.

### 5.1. Iniciar el servicio Node.js

Abre una terminal:

```bash
cd ~/Downloads/interseguro-coding-challenge/api-node
npm install
npm start
```

El servicio debe quedar escuchando en el puerto `3001`.

Mantén esta terminal abierta.

Comprueba el endpoint de salud desde el navegador:

`http://localhost:3001/health`

### 5.2. Iniciar la API Go

Abre una segunda terminal:

```bash
cd ~/Downloads/interseguro-coding-challenge/api-go
```

Configura la URL local del servicio Node:

```bash
export NODE_API_URL="http://localhost:3001/api/v1/statistics"
export HTTP_TIMEOUT_SECONDS=5
```

Inicia la API:

```bash
go run ./cmd/server
```

Go debe quedar escuchando en el puerto `8080`.

Mantén esta terminal abierta.

Comprueba el endpoint de salud:

`http://localhost:8080/health`

**Importante:** cuando Go se ejecuta directamente en macOS, utiliza `localhost:3001` para llamar a Node. No utilices la URL interna de Azure ni el nombre DNS de Docker Compose.

### 5.3. Iniciar el frontend React + Vite

Abre una tercera terminal:

```bash
cd ~/Downloads/interseguro-coding-challenge/frontend
npm install
npm run dev
```

Vite mostrará la dirección local de desarrollo. Normalmente es:

`http://localhost:5173`

Abre la dirección que aparezca en la terminal.

### 5.4. Configuración del proxy local de Vite

Cuando ejecutas el frontend directamente en macOS, el proxy de desarrollo debe apuntar a la API Go en el puerto `8080`.

La configuración correspondiente en `frontend/vite.config.js` es:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

Esta configuración permite que las peticiones del frontend a `/api/...` sean reenviadas a Go.

Si modificas el archivo mientras Vite está ejecutándose y el cambio no se aplica, detén Vite con `Ctrl + C` y vuelve a iniciarlo con `npm run dev`.

### 5.5. Detener los servicios locales

Para detener cada componente:

1. Ve a la terminal de Node y pulsa `Ctrl + C`.
2. Ve a la terminal de Go y pulsa `Ctrl + C`.
3. Ve a la terminal de Vite y pulsa `Ctrl + C`.

No necesitas ejecutar comandos de Azure para iniciar o detener el entorno local.

## 6. Uso de la aplicación

1. Abre el frontend.
2. Ingresa una matriz rectangular en formato JSON.
3. Pulsa **Calcular QR**.
4. Revisa las matrices Q y R, junto con las estadísticas calculadas.

Ejemplo de entrada:

```json
[[1,2],[3,4],[5,6]]
```

La matriz debe tener al menos tantas filas como columnas, de acuerdo con las restricciones descritas en este documento.

## 7. Contratos de las API

### 7.1. API Go: `POST /api/v1/qr`

Esta API recibe una matriz y devuelve su factorización QR junto con las estadísticas.

Solicitud:

```json
{
  "matrix": [
    [1, 2],
    [3, 4],
    [5, 6]
  ]
}
```

Respuesta ilustrativa:

```json
{
  "q": [[0, 0], [0, 0], [0, 0]],
  "r": [[0, 0], [0, 0]],
  "statistics": {
    "max": 0,
    "min": 0,
    "sum": 0,
    "average": 0,
    "diagonal": {
      "q": false,
      "r": false,
      "any": false
    }
  }
}
```

Los valores numéricos de este ejemplo son marcadores ilustrativos, no resultados reales de la matriz. La API devuelve los valores calculados.

### 7.2. Node.js: `POST /api/v1/statistics`

Recibe las matrices Q y R para calcular las estadísticas combinadas.

Solicitud:

```json
{
  "q": [[1, 0], [0, 1]],
  "r": [[2, 3], [0, 4]]
}
```

Respuesta:

```json
{
  "max": 4,
  "min": 0,
  "sum": 10,
  "average": 1.6666666667,
  "diagonal": {
    "q": true,
    "r": false,
    "any": true
  }
}
```

Las estadísticas se calculan sobre el conjunto combinado de elementos de Q y R.

## 8. Decisiones técnicas y ambigüedades

### Factorización QR

El enunciado menciona “rotación” en la arquitectura, pero la funcionalidad solicitada en otra sección pide explícitamente factorización QR.

Esta implementación prioriza QR. Conviene confirmar la discrepancia con el evaluador.

### QR reducida

Se utiliza QR reducida:

\[
A = QR
\]

Para una matriz de entrada de tamaño \(m \times n\), con \(m \geq n\):

- Q tiene tamaño \(m \times n\).
- R tiene tamaño \(n \times n\).

Las matrices anchas, en las que \(m < n\), se rechazan para mantener el contrato definido por esta implementación.

### Estadísticas combinadas

Las estadísticas se calculan considerando todos los elementos de Q y R:

- Máximo.
- Mínimo.
- Suma total.
- Promedio.
- Indicadores de diagonalidad para Q, R y cualquiera de ellas.

### Diagonalidad y precisión numérica

La diagonalidad requiere que la matriz sea cuadrada.

Se permite una tolerancia de `1e-9` para considerar los errores de coma flotante. El indicador `any` es verdadero si Q o R es diagonal según esa regla.

Los resultados de QR pueden contener pequeñas diferencias numéricas. Para validar la factorización, debe compararse el producto \(Q \times R\) con la matriz original usando una tolerancia, no mediante igualdad exacta.

## 9. Pruebas

### Pruebas de Node.js

Desde la raíz del proyecto:

```bash
docker compose run --rm api-node npm test
```

### Pruebas de Go

```bash
docker compose run --rm api-go go test ./...
```

Estos comandos ejecutan las pruebas dentro del entorno de Docker Compose.

Si deseas ejecutar las pruebas directamente en macOS, entra en la carpeta de cada servicio y ejecuta los comandos de pruebas definidos por su configuración. La existencia de scripts específicos de prueba depende de los archivos actuales de cada componente.

### Pruebas manuales

Puedes validar el funcionamiento integral mediante la interfaz web y comprobar los endpoints de salud de Go y Node.

## 10. Configuración local frente a Docker y Azure

Las direcciones dependen de dónde se ejecuta cada servicio.

| Entorno | Go → Node | Vite → Go |
|---|---|---|
| macOS, sin Docker | `http://localhost:3001` | `http://localhost:8080` |
| Docker Compose | Nombre DNS del servicio Node, definido en Compose | Nombre DNS del servicio Go, definido en Compose |
| Azure Container Apps | URL interna HTTPS de Node, configurada mediante `NODE_API_URL` | Proxy o ruta de API definida por el despliegue |

No reutilices automáticamente las direcciones de un entorno en otro. Las variables de entorno y los destinos del proxy deben corresponder al entorno donde se ejecutan los servicios.

## 11. Seguridad y consideraciones de producción

Antes de exponer el sistema públicamente, se recomienda:

- Añadir autenticación JWT si corresponde a los requisitos.
- Implementar límites explícitos de filas, columnas y tamaño de entrada.
- Aplicar rate limiting.
- Añadir métricas, registros y monitorización.
- Configurar TLS/HTTPS.
- Revisar los errores devueltos al cliente y evitar revelar información interna.
- Gestionar las variables de entorno y secretos fuera del código fuente.

La autenticación JWT se considera opcional en el enunciado de referencia.

## 12. Resumen de comandos

### Docker Compose

```bash
cd ~/Downloads/interseguro-coding-challenge
docker compose up --build
```

### Entorno local sin Docker

Terminal 1 — Node:

```bash
cd ~/Downloads/interseguro-coding-challenge/api-node
npm install
npm start
```

Terminal 2 — Go:

```bash
cd ~/Downloads/interseguro-coding-challenge/api-go
export NODE_API_URL="http://localhost:3001/api/v1/statistics"
export HTTP_TIMEOUT_SECONDS=5
go run ./cmd/server
```

Terminal 3 — Frontend:

```bash
cd ~/Downloads/interseguro-coding-challenge/frontend
npm install
npm run dev
```

**Frontend local:** `http://localhost:5173`

**API Go local:** `http://localhost:8080/health`

**API Node local:** `http://localhost:3001/health`
