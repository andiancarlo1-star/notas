const express = require('express');
const PDFDocument = require('pdfkit');
const pool = require('../config/db');
const { verificarAdminODirector } = require('../middlewares/auth.middleware');

const router = express.Router();
const esNumero = (v) => Number.isInteger(Number(v)) && Number(v) > 0;

router.get('/boletas/:bimestreId', verificarAdminODirector, async (req, res) => {
  try {
    const bimestreId = Number(req.params.bimestreId);
    if (!esNumero(bimestreId)) return res.status(400).json({ msg: 'bimestre_id inválido' });

    const [bimestres] = await pool.query(
      'SELECT b.*, c.nombre AS ciclo FROM bimestres b JOIN ciclos_escolares c ON c.id_ciclo = b.ciclo_id WHERE b.id_bimestre = ?',
      [bimestreId]
    );
    if (!bimestres.length) return res.status(404).json({ msg: 'Bimestre no encontrado' });

    const [alumnos] = await pool.query(`
      SELECT DISTINCT a.id_alumno, a.nombres, a.apellidos, g.nombre AS grado, g.seccion
      FROM cierre_bimestre_alumnos cba
      JOIN alumnos a ON a.id_alumno = cba.alumno_id
      JOIN grados g ON g.id_grado = a.grado_id
      WHERE cba.bimestre_id = ?
      ORDER BY g.nombre, g.seccion, a.apellidos, a.nombres
    `, [bimestreId]);

    if (!alumnos.length) return res.status(404).json({ msg: 'No hay calificaciones consolidadas para este bimestre' });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="boletas-${bimestres[0].nombre.replace(/\s+/g, '_')}.pdf"`);
    doc.pipe(res);

    for (let i = 0; i < alumnos.length; i++) {
      const al = alumnos[i];
      if (i > 0) doc.addPage();

      doc.fillColor('#17365d').fontSize(20).text('Tarjeta de Calificaciones', { align: 'center' });
      doc.moveDown(0.3).fontSize(11).fillColor('#333').text(`Ciclo: ${bimestres[0].ciclo} | Periodo: ${bimestres[0].nombre}`, { align: 'center' });
      doc.moveDown(1).fontSize(12).text(`Estudiante: ${al.nombres} ${al.apellidos}`);
      doc.text(`Grado: ${al.grado} - ${al.seccion}`);

      const [notas] = await pool.query(`
        SELECT m.nombre, cba.promedio
        FROM cierre_bimestre_alumnos cba
        JOIN materias m ON m.id_materia = cba.materia_id
        WHERE cba.bimestre_id = ? AND cba.alumno_id = ?
        ORDER BY m.nombre
      `, [bimestreId, al.id_alumno]);

      doc.moveDown();
      if (notas.length) {
        const x = 50; const y = doc.y; const w = 500;
        doc.fillColor('#17365d').rect(x, y, w, 24).fill();
        doc.fillColor('white').fontSize(10).text('Materia', x + 10, y + 7).text('Promedio', x + 400, y + 7, { width: 80, align: 'right' });
        let rowY = y + 24;
        notas.forEach((n, idx) => {
          if (idx % 2 === 0) { doc.fillColor('#edf3f8').rect(x, rowY, w, 22).fill(); }
          doc.fillColor('#222').fontSize(10).text(n.nombre, x + 10, rowY + 6).text(Number(n.promedio).toFixed(2), x + 400, rowY + 6, { width: 80, align: 'right' });
          rowY += 22;
        });
        const promedio = (notas.reduce((t, n) => t + Number(n.promedio), 0) / notas.length).toFixed(2);
        doc.fillColor('#17365d').rect(x, rowY + 6, w, 28).fill();
        doc.fillColor('white').fontSize(12).text(`Promedio general: ${promedio}`, x + 10, rowY + 14, { align: 'right', width: w - 20 });
      } else {
        doc.text('Sin calificaciones consolidadas');
      }
    }

    doc.end();
  } catch (err) {
    console.error('[reportes/boletas]', err);
    if (!res.headersSent) res.status(500).json({ msg: 'Error al generar reporte' });
  }
});

router.get('/acta/:bimestreId/:materiaId', verificarAdminODirector, async (req, res) => {
  try {
    const { bimestreId, materiaId } = req.params;
    if (!esNumero(bimestreId) || !esNumero(materiaId)) return res.status(400).json({ msg: 'IDs inválidos' });

    const [bimestres] = await pool.query(
      'SELECT b.*, c.nombre AS ciclo FROM bimestres b JOIN ciclos_escolares c ON c.id_ciclo = b.ciclo_id WHERE b.id_bimestre = ?',
      [bimestreId]
    );
    if (!bimestres.length) return res.status(404).json({ msg: 'Bimestre no encontrado' });

    const [materia] = await pool.query('SELECT m.nombre, g.nombre AS grado, g.seccion FROM materias m JOIN grados g ON g.id_grado = m.grado_id WHERE m.id_materia = ?', [materiaId]);
    if (!materia.length) return res.status(404).json({ msg: 'Materia no encontrada' });

    const [calificaciones] = await pool.query(`
      SELECT a.nombres, a.apellidos, cba.promedio
      FROM cierre_bimestre_alumnos cba
      JOIN alumnos a ON a.id_alumno = cba.alumno_id
      WHERE cba.bimestre_id = ? AND cba.materia_id = ?
      ORDER BY a.apellidos, a.nombres
    `, [bimestreId, materiaId]);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="acta-${materia[0].nombre.replace(/\s+/g, '_')}.pdf"`);
    doc.pipe(res);

    doc.fillColor('#17365d').fontSize(18).text('Acta de Calificaciones', { align: 'center' });
    doc.moveDown(0.3).fontSize(11).fillColor('#333').text(`${materia[0].grado} - ${materia[0].seccion} | ${materia[0].nombre}`, { align: 'center' });
    doc.text(`Ciclo: ${bimestres[0].ciclo} | Periodo: ${bimestres[0].nombre}`, { align: 'center' });
    doc.moveDown(1.5);

    const x = 50; const y = doc.y; const w = 500;
    doc.fillColor('#17365d').rect(x, y, w, 22).fill();
    doc.fillColor('white').fontSize(10).text('#', x + 10, y + 6, { width: 30 }).text('Alumno', x + 40, y + 6, { width: 300 }).text('Promedio', x + 400, y + 6, { width: 80, align: 'right' });

    let rowY = y + 22;
    calificaciones.forEach((c, idx) => {
      if (idx % 2 === 0) { doc.fillColor('#edf3f8').rect(x, rowY, w, 20).fill(); }
      doc.fillColor('#222').fontSize(10)
        .text(idx + 1, x + 10, rowY + 5, { width: 30 })
        .text(`${c.apellidos} ${c.nombres}`, x + 40, rowY + 5, { width: 300 })
        .text(Number(c.promedio).toFixed(2), x + 400, rowY + 5, { width: 80, align: 'right' });
      rowY += 20;
    });

    doc.moveDown(2).fontSize(9).fillColor('#555').text('Documento generado por Control Escolar.', 50, 760, { align: 'center' });
    doc.end();
  } catch (err) {
    console.error('[reportes/acta]', err);
    if (!res.headersSent) res.status(500).json({ msg: 'Error al generar acta' });
  }
});

router.get('/alumnos-por-grado', verificarAdminODirector, async (req, res) => {
  try {
    const [data] = await pool.query(`
      SELECT g.nombre AS grado, g.seccion, COUNT(a.id_alumno) AS total_alumnos
      FROM grados g
      LEFT JOIN alumnos a ON a.grado_id = g.id_grado
      GROUP BY g.id_grado
      ORDER BY g.nombre, g.seccion
    `);
    res.json(data);
  } catch (err) {
    console.error('[reportes/alumnos-por-grado]', err);
    res.status(500).json({ msg: 'Error al generar reporte' });
  }
});

module.exports = router;
