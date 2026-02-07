async function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 15;

  // Título
  doc.setFontSize(14);
  doc.text("INFORME DE INVENTARIO", 10, y);
  y += 10;

  doc.setFontSize(10);
  doc.text("Tipo Movil: " + document.getElementById("movil").value, 10, y);
  y += 6;
  doc.text("Tipo Vehiculo: " + document.getElementById("vehiculo").value, 10, y);
  y += 6;
  doc.text("Fecha: " + document.getElementById("fecha").value, 10, y);
  y += 6;
  doc.text("Tecnico Empalmador: " + document.getElementById("empalmador").value, 10, y);
  y += 6;
  doc.text("Tecnico Mediro: " + document.getElementById("medidor").value, 10, y);
  y += 6;
  doc.text("Tecnico Liniero: " + document.getElementById("liniero").value, 10, y);
  y += 6;
  doc.text("Placa Vehiculo: " + document.getElementById("placa").value, 10, y);
  y += 10;

  const filas = document.querySelectorAll("#tabla tbody tr");
  const categorias = {};

  filas.forEach(fila => {
    const celdas = fila.querySelectorAll("td");

    const categoria = celdas[0].innerText;
    const elemento = celdas[1].innerText;
    const cantidad = Number(celdas[2].querySelector("input").value || 0);
    const estado = celdas[3].querySelector("select").value;

    // Si es NA, no se incluye
    if (estado === "NA") return;

    if (!categorias[categoria]) categorias[categoria] = [];
    categorias[categoria].push({ elemento, cantidad, estado });
  });

  // Resumen General
  doc.setFontSize(12);
  doc.text("Resumen General", 10, y);
  y += 8;

  doc.setFontSize(9);

  Object.keys(categorias).forEach(cat => {
    const items = categorias[cat];
    const total = items.length;
    const buenos = items.filter(i => i.estado === "Bueno").length;
    const porcentaje = total === 0 ? 0 : Math.round((buenos / total) * 100);
    const faltantes = items.filter(i => i.estado === "No tiene").length;

    let estadoTexto = "CRÍTICO";
    doc.setTextColor(200, 0, 0);

    if (porcentaje >= 80) {
      estadoTexto = "OK";
      doc.setTextColor(0, 150, 0);
    } else if (porcentaje >= 50) {
      estadoTexto = "ALERTA";
      doc.setTextColor(255, 165, 0);
    }

    doc.text(
      `${cat}: ${porcentaje}% Bueno | No tiene: ${faltantes} | Estado: ${estadoTexto}`,
      10,
      y
    );
    y += 5;
  });

  y += 8;

  // Detalle por categoría
  Object.keys(categorias).forEach(cat => {
    const items = categorias[cat];

    if (y > 260) {
      doc.addPage();
      y = 15;
    }

    const total = items.length;
    const buenos = items.filter(i => i.estado === "Bueno").length;
    const porcentaje = total === 0 ? 0 : Math.round((buenos / total) * 100);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`${cat} - ${porcentaje}% Bueno`, 10, y);
    y += 6;

    // ----------------- ENCABEZADOS CON FONDO -----------------
    doc.setFillColor(60, 60, 60); // fondo gris oscuro
    doc.rect(15, y - 4, 180, 6, "F");

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255); // texto blanco
    doc.text("Elemento", 20, y);
    doc.text("Cant.", 140, y);
    doc.text("Estado", 170, y);
    y += 8;

    const noBueno = items.filter(i => i.estado !== "Bueno");
    const bueno = items.filter(i => i.estado === "Bueno");

    // NO BUENO (fondo rojo)
    noBueno.forEach(item => {
      if (y > 280) {
        doc.addPage();
        y = 15;
      }

      doc.setFillColor(255, 220, 220);
      doc.rect(15, y - 4, 180, 5, "F");

      doc.setTextColor(0, 0, 0);
      doc.text(item.elemento, 20, y);
      doc.text(item.cantidad.toString(), 140, y);
      doc.text(item.estado, 170, y);
      y += 5;
    });

    // BUENO (zebra)
    let zebra = false;
    bueno.forEach(item => {
      if (y > 280) {
        doc.addPage();
        y = 15;
      }

      if (zebra) {
        doc.setFillColor(240, 240, 240);
        doc.rect(15, y - 4, 180, 5, "F");
      }

      doc.setTextColor(0, 0, 0);
      doc.text(item.elemento, 20, y);
      doc.text(item.cantidad.toString(), 140, y);
      doc.text(item.estado, 170, y);
      y += 5;

      zebra = !zebra;
    });

    y += 8;
  });

  doc.save("inventario_estado_encabezado.pdf");
}