-- Solo para demos locales. Todas las cuentas usan Demo2026!.
-- Nunca montar este archivo en una instancia pública o de producción.
SET NAMES utf8mb4;

INSERT IGNORE INTO usuarios (id_usuario, nombre, correo, contrasena, rol) VALUES
(1, 'Administrador Demo', 'admin@demo.local',    '$2a$10$2WJU3rCb00E8EX0Ro41i0OXevdJFhl5PeWElb5a/ss.JYkEqa0pIS', 'admin'),
(2, 'Director Demo',      'director@demo.local', '$2a$10$uIHjyXLJqi32MvZghq1ACu2JAOBk5V4qoQ1UH59IfpynxC8Ffj2AK', 'director'),
(3, 'Carlos Méndez',      'maestro@demo.local',  '$2a$10$uIHjyXLJqi32MvZghq1ACu2JAOBk5V4qoQ1UH59IfpynxC8Ffj2AK', 'maestro'),
(4, 'Ana García',         'alumno@demo.local',   '$2a$10$uIHjyXLJqi32MvZghq1ACu2JAOBk5V4qoQ1UH59IfpynxC8Ffj2AK', 'alumno');

INSERT IGNORE INTO grados (id_grado, nombre, seccion) VALUES
(1, '1ro', 'A'), (2, '2do', 'A');

INSERT IGNORE INTO materias (id_materia, nombre, grado_id) VALUES
(1, 'Matemáticas', 1), (2, 'Español', 1), (3, 'Ciencias', 2);

INSERT IGNORE INTO materias_maestros (maestro_id, materia_id) VALUES
(3, 1), (3, 2);

INSERT IGNORE INTO alumnos (id_alumno, usuario_id, nombres, apellidos, grado_id) VALUES
(1, 4, 'Ana', 'García López', 1), (2, NULL, 'Luis', 'Hernández', 1);

INSERT IGNORE INTO ciclos_escolares (id_ciclo, nombre, fecha_inicio, fecha_fin, estado) VALUES
(1, 'Ciclo Escolar 2026', '2026-01-01', '2026-12-31', 'ACTIVO');

INSERT IGNORE INTO bimestres (id_bimestre, ciclo_id, numero, nombre, fecha_inicio, fecha_fin, estado) VALUES
(1, 1, 1, 'Primer bimestre', '2026-01-01', '2026-03-31', 'CERRADO'),
(2, 1, 2, 'Segundo bimestre', '2026-04-01', '2026-06-30', 'CERRADO'),
(3, 1, 3, 'Tercer bimestre', '2026-07-01', '2026-09-30', 'CERRADO'),
(4, 1, 4, 'Cuarto bimestre', '2026-10-01', '2026-12-31', 'ABIERTO');

INSERT IGNORE INTO tareas
  (id_tarea, materia_id, maestro_id, bimestre_id, titulo, descripcion, fecha_entrega, puntaje_maximo, ponderacion, estado)
VALUES
  (1, 1, 3, 4, 'Operaciones básicas', 'Resuelve los ejercicios de suma, resta y multiplicación.', '2026-11-30 23:59:00', 100, 25, 'ACTIVA');

INSERT IGNORE INTO tarea_detalle (tarea_id, alumno_id, punteo, entregado) VALUES
(1, 1, NULL, 0), (1, 2, NULL, 0);
