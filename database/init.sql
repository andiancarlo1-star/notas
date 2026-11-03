SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(160) NOT NULL,
  correo VARCHAR(190) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  rol ENUM('admin','director','maestro','alumno') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS grados (
  id_grado BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  seccion VARCHAR(20) NOT NULL,
  maestro_guia_id BIGINT UNSIGNED NULL,
  UNIQUE KEY uq_grado_seccion (nombre, seccion),
  CONSTRAINT fk_grado_guia FOREIGN KEY (maestro_guia_id) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS alumnos (
  id_alumno BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NULL UNIQUE,
  nombres VARCHAR(120) NOT NULL,
  apellidos VARCHAR(120) NOT NULL,
  grado_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_alumno_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  CONSTRAINT fk_alumno_grado FOREIGN KEY (grado_id) REFERENCES grados(id_grado),
  KEY idx_alumnos_grado_nombre (grado_id, apellidos, nombres)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS materias (
  id_materia BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  grado_id BIGINT UNSIGNED NOT NULL,
  CONSTRAINT fk_materia_grado FOREIGN KEY (grado_id) REFERENCES grados(id_grado),
  UNIQUE KEY uq_materia_grado (nombre, grado_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS materias_maestros (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  maestro_id BIGINT UNSIGNED NOT NULL,
  materia_id BIGINT UNSIGNED NOT NULL,
  CONSTRAINT fk_mm_maestro FOREIGN KEY (maestro_id) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_mm_materia FOREIGN KEY (materia_id) REFERENCES materias(id_materia) ON DELETE CASCADE,
  UNIQUE KEY uq_maestro_materia (maestro_id, materia_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ciclos_escolares (
  id_ciclo BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado ENUM('ACTIVO','CERRADO') NOT NULL DEFAULT 'ACTIVO'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bimestres (
  id_bimestre BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ciclo_id BIGINT UNSIGNED NOT NULL,
  numero TINYINT UNSIGNED NOT NULL,
  nombre VARCHAR(80) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado ENUM('ABIERTO','CERRADO') NOT NULL DEFAULT 'ABIERTO',
  cerrado_por BIGINT UNSIGNED NULL,
  cerrado_at DATETIME NULL,
  CONSTRAINT fk_bimestre_ciclo FOREIGN KEY (ciclo_id) REFERENCES ciclos_escolares(id_ciclo) ON DELETE CASCADE,
  CONSTRAINT fk_bimestre_cerrado_por FOREIGN KEY (cerrado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  UNIQUE KEY uq_bimestre_ciclo_numero (ciclo_id, numero),
  KEY idx_bimestre_ciclo_estado (ciclo_id, estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tareas (
  id_tarea BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  materia_id BIGINT UNSIGNED NOT NULL,
  maestro_id BIGINT UNSIGNED NOT NULL,
  bimestre_id BIGINT UNSIGNED NULL,
  titulo VARCHAR(180) NOT NULL,
  descripcion TEXT NULL,
  fecha_entrega DATETIME NULL,
  puntaje_maximo DECIMAL(7,2) NOT NULL DEFAULT 100,
  ponderacion DECIMAL(7,2) NOT NULL DEFAULT 100,
  estado ENUM('ACTIVA','CERRADA') NOT NULL DEFAULT 'ACTIVA',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tarea_materia FOREIGN KEY (materia_id) REFERENCES materias(id_materia),
  CONSTRAINT fk_tarea_maestro FOREIGN KEY (maestro_id) REFERENCES usuarios(id_usuario),
  CONSTRAINT fk_tarea_bimestre FOREIGN KEY (bimestre_id) REFERENCES bimestres(id_bimestre),
  KEY idx_tareas_materia_bimestre (materia_id, bimestre_id, estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tarea_detalle (
  tarea_id BIGINT UNSIGNED NOT NULL,
  alumno_id BIGINT UNSIGNED NOT NULL,
  punteo DECIMAL(7,2) NULL,
  entregado BOOLEAN NOT NULL DEFAULT FALSE,
  observacion TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (tarea_id, alumno_id),
  CONSTRAINT fk_td_tarea FOREIGN KEY (tarea_id) REFERENCES tareas(id_tarea) ON DELETE CASCADE,
  CONSTRAINT fk_td_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id_alumno) ON DELETE CASCADE,
  KEY idx_td_alumno (alumno_id, tarea_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS entregas_tareas (
  id_entrega BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tarea_id BIGINT UNSIGNED NOT NULL,
  alumno_id BIGINT UNSIGNED NOT NULL,
  archivo_nombre VARCHAR(255) NULL,
  archivo_url VARCHAR(500) NULL,
  comentario TEXT NULL,
  entregado_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_entrega_tarea FOREIGN KEY (tarea_id) REFERENCES tareas(id_tarea) ON DELETE CASCADE,
  CONSTRAINT fk_entrega_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id_alumno) ON DELETE CASCADE,
  UNIQUE KEY uq_entrega_tarea_alumno (tarea_id, alumno_id),
  KEY idx_entrega_tarea_fecha (tarea_id, entregado_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cierre_bimestre_alumnos (
  id_cierre BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bimestre_id BIGINT UNSIGNED NOT NULL,
  alumno_id BIGINT UNSIGNED NOT NULL,
  materia_id BIGINT UNSIGNED NOT NULL,
  promedio DECIMAL(7,2) NOT NULL,
  cerrado_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cierre_bimestre_alumno_materia (bimestre_id, alumno_id, materia_id),
  CONSTRAINT fk_cierre_bimestre FOREIGN KEY (bimestre_id) REFERENCES bimestres(id_bimestre),
  CONSTRAINT fk_cierre_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id_alumno),
  CONSTRAINT fk_cierre_materia FOREIGN KEY (materia_id) REFERENCES materias(id_materia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_log (
  id_log BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NULL,
  accion VARCHAR(100) NOT NULL,
  tabla VARCHAR(100) NOT NULL,
  detalle TEXT NULL,
  ip VARCHAR(45) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_usuario (usuario_id),
  KEY idx_audit_fecha (created_at),
  CONSTRAINT fk_audit_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

