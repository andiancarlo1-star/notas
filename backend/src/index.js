const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();
const { rateLimit, errorHandler, notFound } = require('./middlewares/security.middleware');

const app = express();
const port = Number(process.env.PORT || 4000);

if (process.env.NODE_ENV === 'production') {
  const secret = process.env.JWT_SECRET || '';
  if (secret.length < 32 || /cambie|change|secret|development|desarrollo|demo|example|clave|replace/i.test(secret)) {
    throw new Error('En producción, JWT_SECRET debe ser una clave aleatoria de al menos 32 caracteres.');
  }
  if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD.length < 24 || /demo|password|cambie|change|root/i.test(process.env.DB_PASSWORD)) {
    throw new Error('En producción, DB_PASSWORD debe ser una contraseña aleatoria de al menos 24 caracteres.');
  }
}

app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  credentials: true
}));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const alumnosRoutes = require('./routes/alumnos.routes');
const gradosRoutes = require("./routes/grados.routes");
const materiasRoutes = require("./routes/materias.routes");
const tareasRoutes = require("./routes/tareas.routes");
const maestroRoutes = require("./routes/maestro.routes");
const academicoRoutes = require('./routes/academico.routes');
const entregasRoutes = require('./routes/entregas.routes');
const perfilRoutes = require('./routes/perfil.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const reportesRoutes = require('./routes/reportes.routes');

const authMiddleware = require('./middlewares/auth.middleware');
const { auditLog } = require('./middlewares/security.middleware');

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Demasiados intentos de login' }), authRoutes);
app.use("/api/grados", authMiddleware.verificarAutenticado, auditLog('grados'), gradosRoutes);
app.use('/api/alumnos', authMiddleware.verificarAutenticado, auditLog('alumnos'), alumnosRoutes);
app.use('/api/usuarios', authMiddleware.verificarAutenticado, auditLog('usuarios'), usuariosRoutes);
app.use("/api/materias", authMiddleware.verificarAutenticado, auditLog('materias'), materiasRoutes);
app.use("/api/tareas", authMiddleware.verificarAutenticado, auditLog('tareas'), tareasRoutes);
app.use("/api/maestros", authMiddleware.verificarAutenticado, auditLog('maestros'), maestroRoutes);
app.use('/api/academico', authMiddleware.verificarAutenticado, auditLog('academico'), academicoRoutes);
app.use('/api/entregas', authMiddleware.verificarAutenticado, auditLog('entregas'), entregasRoutes);
app.use('/api/perfil', authMiddleware.verificarAutenticado, perfilRoutes);
app.use('/api/dashboard', authMiddleware.verificarAdminODirector, auditLog('dashboard'), dashboardRoutes);
app.use('/api/reportes', authMiddleware.verificarAutenticado, auditLog('reportes'), reportesRoutes);

app.get('/', (req, res) => {
  res.json({ service: 'Control Escolar API', status: 'ok', version: '2.0' });
});
app.get(['/health', '/api/health'], async (_req, res) => res.json({ status: 'ok' }));

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`Backend corriendo en http://localhost:${port}`));
