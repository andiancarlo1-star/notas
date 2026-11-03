# Manual de Usuario - Control Escolar v1.9

Plataforma web de gestion escolar para administrar grados, materias, tareas, calificaciones y reportes academicos.

---

## Contenido

1. [Acceso al Sistema](#1-acceso-al-sistema)
2. [Cuentas de Demostracion](#2-cuentas-de-demostracion)
3. [Panel de Administrador](#3-panel-de-administrador)
4. [Panel de Director](#4-panel-de-director)
5. [Panel de Maestro](#5-panel-de-maestro)
6. [Panel de Alumno](#6-panel-de-alumno)
7. [Flujo Completo de Uso](#7-flujo-completo-de-uso)
8. [Glosario](#8-glosario)

---

## 1. Acceso al Sistema

1. Abre el navegador y ve a `http://localhost:8080`
2. Se muestra la pantalla de inicio de sesion con un recuadro azul
3. Ingresa tu **correo electronico** y **contrasena**
4. Haz clic en **"Iniciar sesion"**
5. Si las credenciales son correctas, el sistema redirige al panel correspondiente a tu rol
6. Si hay error, se muestra un mensaje en rojo debajo del formulario

Para cerrar sesion, haz clic en el boton rojo **"Cerrar sesion"** en la parte inferior del sidebar izquierdo.

---

## 2. Cuentas de Demostracion

| Correo | Contrasena | Rol |
|--------|-----------|-----|
| admin@demo.local | Demo2026! | Administrador |
| director@demo.local | Demo2026! | Director |
| maestro@demo.local | Demo2026! | Maestro |
| alumno@demo.local | Demo2026! | Alumno |

Las cuentas se muestran en la pantalla de login para referencia rapida.

---

## 3. Panel de Administrador

El administrador tiene acceso total al sistema. Su panel contiene 11 secciones en el sidebar izquierdo.

### 3.1 Dashboard

Muestra un resumen general del sistema con 8 tarjetas de metricas:

| Metrica | Descripcion |
|---------|-------------|
| Usuarios | Total de usuarios registrados |
| Alumnos | Total de alumnos en el sistema |
| Materias | Total de materias creadas |
| Tareas | Total de tareas (activas + cerradas) |
| Tareas Activas | Tareas que estan abiertas para entrega |
| Entregas | Total de entregas realizadas por alumnos |
| Ciclos | Ciclos escolares creados |
| Bimestres Abiertos | Bimestres en estado ABIERTO |

Ademas muestra:
- **Usuarios por rol**: Cantidad de admin, director, maestro y alumno
- **Top Maestros**: Los maestros con mas materias asignadas
- **Materias por Grado**: Cuantas materias tiene cada grado

### 3.2 Gestionar Directores

Permite crear, editar y eliminar directores.

**Crear director:**
1. Haz clic en **"+ Crear Director"**
2. Completa: Nombre completo, Correo electronico, Contrasena (minimo 6 caracteres)
3. Haz clic en **"Crear"**

**Editar director:**
1. En la tabla, haz clic en **"Editar"** junto al director
2. Modifica los campos necesarios (la contrasena se deja vacia si no se cambia)
3. Haz clic en **"Actualizar"**

**Eliminar director:**
1. Haz clic en el icono de basura junto al director
2. Confirma la eliminacion en el dialogo

### 3.3 Gestionar Maestros

Identico a Gestionar Directores pero para maestros. Mismas acciones: crear, editar, eliminar.

**Crear maestro:**
1. Haz clic en **"+ Crear Maestro"**
2. Completa: Nombre completo, Correo electronico, Contrasena
3. Haz clic en **"Crear"**

### 3.4 Gestionar Grados

Administra los grados escolares y asigna maestros guia.

**Crear grado:**
1. Haz clic en **"+ Crear Grado"**
2. Completa: Nombre (ej. "1ro"), Seccion (ej. "A")
3. Selecciona un **Maestro Guia** del dropdown (opcional)
4. Haz clic en **"Crear"**

**Asignar maestro guia:**
- Al crear o editar un grado, el dropdown "Maestro Guia" muestra todos los maestros disponibles
- El maestro guia es el encargado del grupo y puede ver las boletas de sus alumnos
- Puede dejarse vacio si aun no se asigna

**Editar grado:**
1. Haz clic en **"Editar"** junto al grado
2. Modifica nombre, seccion o maestro guia
3. Haz clic en **"Actualizar"**

### 3.5 Gestionar Alumnos

Administra los registros de alumnos y los vincula a cuentas de usuario.

**Crear alumno:**
1. Haz clic en **"+ Crear Alumno"**
2. Completa: Nombres, Apellidos, selecciona el Grado
3. Opcionalmente vincula una cuenta de usuario existente (rol: alumno)
4. Haz clic en **"Crear"**

**Vincular alumno a usuario:**
- Si se creo un usuario con rol "alumno" primero, se puede vincular desde la edicion del alumno
- Esto permite que el alumno inicie sesion y vea sus tareas y boletas

**Filtrar alumnos:**
- Usa el dropdown de Grado para filtrar por grado especifico
- Usa la barra de busqueda para buscar por nombre

### 3.6 Gestionar Materias

Crea y administra las materias de cada grado.

**Crear materia:**
1. Haz clic en **"+ Crear Materia"**
2. Escribe el nombre (ej. "Matematicas")
3. Selecciona el Grado al que pertenece
4. Haz clic en **"Crear"**

### 3.7 Asignar Materias

Asocia maestros con materias especificas. Es un proceso de 3 pasos:

1. **Selecciona el Grado** -> Aparece la lista de materias de ese grado
2. **Selecciona la Materia** -> Aparece la lista de maestros disponibles
3. **Selecciona el Maestro** -> Haz clic en **"Asignar"**

El maestro ahora podra ver esa materia en su panel y crear tareas para ella.

### 3.8 Ver Asignaciones

Visualiza todas las asignaciones maestro-materia existentes:

1. Selecciona un maestro del dropdown para ver sus materias asignadas
2. Usa la barra de busqueda para filtrar por materia, grado o seccion
3. Se muestra una tarjeta por cada materia asignada con su grado y seccion

### 3.9 Ciclos y Bimestres

Administra el calendario academico en dos partes:

**Crear ciclo escolar:**
1. En el formulario izquierdo "Nuevo ciclo":
   - Nombre (ej. "2025-2026")
   - Fecha de inicio
   - Fecha de fin
2. Haz clic en **"Crear ciclo"**

**Crear bimestre:**
1. En el formulario derecho "Nuevo bimestre":
   - Selecciona el Ciclo
   - Numero (1, 2, 3 o 4)
   - Nombre (ej. "Primer Bimestre")
   - Fecha de inicio y fin
2. Haz clic en **"Crear bimestre"**

**Cerrar bimestre (IMPORTANTE):**
- En la tabla de bimestres, los que estan en estado **ABIERTO** tienen un boton "Cerrar"
- Al hacer clic, se muestra un aviso: *"Cerrar el bimestre? Se consolidaran las notas y se bloquearan sus tareas"*
- Al confirmar, el sistema automaticamente:
  1. Calcula el promedio ponderado de cada alumno por materia
  2. Guarda los promedios en la tabla de cierre
  3. Cambia todas las tareas del bimestre a estado CERRADA
  4. Registra quien cerro el bimestre y la fecha
- **Una vez cerrado, no se puede revertir**

### 3.10 Reportes

Genera documentos PDF con las calificaciones:

**Boletas masivas:**
1. Selecciona un bimestre cerrado
2. Haz clic en **"Descargar boletas"**
3. Se descarga un PDF con todas las tarjetas de calificaciones

**Acta por materia:**
1. Selecciona un bimestre
2. Selecciona una materia
3. Haz clic en **"Generar acta"**
4. Se descarga el acta con las calificaciones de esa materia

**Alumnos por grado:**
- Haz clic en **"Descargar reporte"** para obtener un listado de alumnos organizados por grado

### 3.11 Mi Perfil

Permite editar tu informacion personal y cambiar tu contrasena.

**Editar datos:**
1. Modifica tu nombre o correo
2. Haz clic en **"Guardar cambios"**

**Cambiar contrasena:**
1. Ingresa tu contrasena actual
2. Ingresa la nueva contrasena (minimo 6 caracteres)
3. Haz clic en **"Cambiar contrasena"**

---

## 4. Panel de Director

El director tiene las mismas funciones que el administrador, excepto:
- **No puede gestionar directores** (esa pestaña no aparece)
- Si puede gestionar maestros, grados, alumnos, materias, asignaciones, bimestres y reportes

El sidebar muestra 10 secciones (todas menos "Gestionar Directores").

---

## 5. Panel de Maestro

El maestro tiene 4 secciones en su panel.

### 5.1 Mis Materias

Muestra todas las materias que tienes asignadas en una tabla con:
- Nombre de la materia
- Grado
- Seccion

**Acciones disponibles por materia:**

#### Ver tareas
1. Haz clic en **"Ver tareas"**
2. Se abre un modal con todas las tareas de esa materia
3. La tabla muestra: Titulo, Puntaje maximo, Peso (ponderacion), Fecha de entrega, Estado

**Crear tarea:**
1. Haz clic en **"+ Agregar tarea"**
2. Completa el formulario:
   - **Titulo** (obligatorio): Ej. "Guia de ejercicios 1"
   - **Descripcion**: Instrucciones detalladas
   - **Fecha de entrega**: Selecciona una fecha
   - **Bimestre**: Selecciona un bimestre ABIERTO
   - **Puntaje maximo**: Valor maximo que se puede obtener (default: 10)
   - **Ponderacion (peso)**: Peso de la tarea en el promedio del bimestre (default: 10)
3. Haz clic en **"Guardar tarea"**
4. La tarea se asigna automaticamente a todos los alumnos del grado

#### Calificar tarea
1. Haz clic en **"Calificar"** en la tarea correspondiente
2. Se abre un modal con la lista de alumnos
3. Para cada alumno puedes ver:
   - Si entrego archivo o no
   - El comentario que adjunto
   - Campo para escribir el **punteo** (calificacion)
   - Campo para escribir retroalimentacion
4. Haz clic en el icono de guardar (disco) junto a cada alumno
5. Puedes calificar alumnos individualmente

#### Editar tarea
1. Haz clic en **"Editar"**
2. Modifica titulo, descripcion o fecha de entrega
3. Haz clic en **"Guardar"**

#### Cerrar/Reabrir tarea
- Haz clic en **"Cerrar"** para bloquear la tarea (los alumnos ya no podran entregar)
- Haz clic en **"Reabrir"** para volver a abrirla

#### Eliminar tarea
- Haz clic en **"Eliminar"** y confirma

### 5.2 Mis Grados

Muestra los grados en los que das clases.

1. Haz clic en **"Ver alumnos"** junto a un grado
2. Se abre un modal con dos paneles:
   - **Panel izquierdo**: Lista de alumnos (selecciona uno)
   - **Panel derecho**: Tareas del alumno seleccionado con su calificacion
3. Para calificar un alumno en una tarea:
   - Escribe la nota en el campo numerico
   - Haz clic en el icono de guardar (disco)
   - Si necesitas editar, haz clic en el lapiz y vuelve a guardar

### 5.3 Boletas (si eres maestro guia)

Solo funciona si el administrador te asigno como **maestro guia** de un grado.

1. Selecciona tu **Grado** del dropdown
2. Selecciona un **Bimestre** cerrado
3. Se muestra una tabla con: Alumno, Materia, Promedio
4. En la parte inferior aparece el **Promedio General** del grupo

### 5.4 Mi Perfil

Igual que en el panel del administrador: editar nombre, correo y contrasena.

---

## 6. Panel de Alumno

El alumno tiene 3 secciones en su panel.

### 6.1 Mis Tareas

Muestra todas las tareas asignadas en tarjetas. Cada tarjeta muestra:
- Materia (etiqueta azul)
- Estado: ACTIVA (verde) o CERRADA (rojo)
- Titulo de la tarea
- Descripcion
- Fecha de entrega
- Nota: tu calificacion / puntaje maximo
- Peso de la tarea
- Archivo entregado (si lo hay)

**Entregar tarea:**
1. Solo puedes entregar tareas con estado **ACTIVA**
2. Selecciona un archivo: PDF, DOCX, PPTX, PNG o JPEG (maximo 10 MB)
3. Escribe un comentario opcional
4. Haz clic en **"Entregar"**
5. La tarea se marca como entregada

**Nota:** Puedes entregar varias veces la misma tarea (se sobreescribe la anterior).

### 6.2 Mis Boletas

Muestra los bimestres cerrados que tienen calificaciones registradas.

1. Se muestra una lista de tarjetas, una por bimestre cerrado
2. Cada tarjeta muestra el nombre del bimestre y el ciclo escolar
3. Haz clic en **"Descargar PDF"** para obtener tu tarjeta de calificaciones
4. El PDF contiene: tus datos, tus calificaciones por materia y tu promedio general

### 6.3 Mi Perfil

Igual que en los otros paneles: editar nombre, correo y contrasena.

---

## 7. Flujo Completo de Uso

### Paso 1: Configuracion inicial (Administrador)

1. Crear el ciclo escolar y los 4 bimestres
2. Crear los grados y asignar maestros guia
3. Crear las materias para cada grado
4. Crear las cuentas de los maestros
5. Asignar materias a cada maestro
6. Crear las cuentas de los alumnos y vincularlas a sus registros

### Paso 2: Operacion diaria (Maestro)

1. Iniciar sesion con tu cuenta
2. Ir a "Mis Materias" y hacer clic en "Ver tareas"
3. Crear tareas seleccionando el bimestre correcto, el puntaje y la ponderacion
4. Los alumnos reciben la tarea automaticamente
5. Cuando los alumnos entregan, ir a "Calificar" y asignar notas
6. Repetir para cada materia y bimestre

### Paso 3: Entregas (Alumno)

1. Iniciar sesion con tu cuenta
2. Ir a "Mis Tareas" para ver las tareas asignadas
3. Seleccionar archivo y entregar
4. Ver las notas cuando el maestro las califique
5. Ir a "Mis Boletas" para descargar reportes de bimestres cerrados

### Paso 4: Cierre de bimestre (Administrador/Director)

1. Ir a "Ciclos y Bimestres"
2. Verificar que todas las tareas esten calificadas
3. Hacer clic en "Cerrar" en el bimestre correspondiente
4. El sistema consolida todas las notas automaticamente
5. Los alumnos pueden ver y descargar sus boletas

---

## 8. Glosario

| Termino | Definicion |
|---------|-----------|
| **Ciclo escolar** | Periodo academico completo (ej. "2025-2026") |
| **Bimestre** | Periodo de evaluacion dentro del ciclo (1 a 4 por ciclo) |
| **Grado** | Nivel educativo (ej. "1ro", "2do", "3ro") |
| **Seccion** | Grupo dentro del grado (ej. "A", "B") |
| **Materia** | Asignatura que se imparte en un grado (ej. "Matematicas") |
| **Tarea** | Actividad evaluada asignada por el maestro |
| **Puntaje maximo** | Nota maxima que se puede obtener en una tarea |
| **Ponderacion** | Peso de la tarea en el promedio del bimestre |
| **Maestro guia** | Maestro encargado de un grado (puede ver boletas del grupo) |
| **Boleta** | Tarjeta de calificaciones por bimestre (PDF) |
| **Cierre de bimestre** | Proceso que consolida las notas y bloquea las tareas |
| **Entrega** | Archivo que el alumno sube como respuesta a una tarea |

---

## Informacion Tecnica

- **Frontend**: React 18 con Vite
- **Backend**: Node.js con Express
- **Base de datos**: MySQL 8.4
- **Puerto del sistema**: http://localhost:8080
- **Puerto de la API**: http://localhost:4000
- **Contraseña de todas las cuentas demo**: Demo2026!
- **Codificacion**: UTF-8 (soporta tildes y eñes correctamente)
