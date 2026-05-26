# FutbolStats

Aplicación web de estadísticas de fútbol — SUT para práctica de Cypress, Postman y MySQL.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React + React Router + Axios + Tailwind CSS |
| Backend | Node.js + Express.js + JWT + Sequelize ORM |
| Base de datos | MySQL |

## Setup

### 1. Requisitos previos
- Node.js 18+
- MySQL corriendo en localhost:3306

### 2. Backend

```bash
cd backend
npm install
```

Editá `backend/.env` y configurá tu contraseña de MySQL si tenés una:
```
DB_PASSWORD=tu_password
```

```bash
# Crear la base de datos
npx sequelize-cli db:create

# Crear las tablas
npx sequelize-cli db:migrate

# Cargar datos de prueba
npx sequelize-cli db:seed:all

# Iniciar el servidor
npm run dev
```

El backend corre en: http://localhost:3000
Verificar: http://localhost:3000/health

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend corre en: http://localhost:5173

## Credenciales de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Admin | admin@futbolstats.com | admin1234 |
| Viewer | viewer@futbolstats.com | viewer1234 |

## Comandos útiles

```bash
# Resetear la base de datos completa
cd backend && npm run db:reset

# Ver logs del servidor
npm run dev
```
