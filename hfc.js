async function exportarPDFYExcel() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 15;

  // Título
  doc.setFontSize(14);
  doc.text("INVENTARIO " + document.getElementById("movil").value + " HFC", 10, y);
  y += 10;

  doc.setFontSize(10);
  doc.text("Tipo Movil: " + document.getElementById("movil").value, 10, y);
  y += 6;
  doc.text("Tipo Vehiculo: " + document.getElementById("vehiculo").value, 10, y);
  y += 6;
  doc.text("Fecha: " + document.getElementById("fecha").value, 10, y);
  y += 6;
  doc.text("Tecnico 1: " + document.getElementById("tec_1").value, 10, y);
  y += 6;
  doc.text("Tecnico 2: " + document.getElementById("tec_2").value, 10, y);
  y += 6;
  doc.text("Auxilia 1: " + document.getElementById("aux_1").value, 10, y);
  y += 6;
  doc.text("Auxilia 1: " + document.getElementById("aux_2").value, 10, y);
  y += 6;
  doc.text("Placa Vehiculo: " + document.getElementById("placa").value, 10, y);
  y += 10;

  
   // Obtener las filas de la tabla
  const filas = document.querySelectorAll("#tabla tbody tr");
  const categorias = [];

  let categoriaActual = "";

  filas.forEach(fila => {
    // Si es una fila de categoría
    if (fila.classList.contains("categoria")) {
      categoriaActual = fila.innerText.trim();
      return; // Continuar con la siguiente fila
    }

    // Si es una fila de encabezado (debe ser ignorada)
    if (fila.classList.contains("encabezados")) {
      return; // Saltar encabezados
    }

    // Si es una fila con datos de elementos
    const celdas = fila.querySelectorAll("td");
    if (celdas.length < 3) return; // Saltar filas que no tienen datos

    const elemento = celdas[0].innerText; // El nombre del elemento
    const cantidad = Number(celdas[1].querySelector("input").value || 0); // La cantidad
    const estado = celdas[2].querySelector("select").value; // El estado

    if (estado === "NA") return; // Si el estado es "NA", no lo incluyo en el PDF

    // Agregar el ítem con la categoría, placa y movil a la lista
    categorias.push({
      categoria: categoriaActual,
      elemento: elemento,
      cantidad: cantidad,
      estado: estado,
      placa: document.getElementById("placa").value,
      movil: document.getElementById("movil").value
    });
  });

  // Resumen General en el PDF
  doc.setFontSize(12);
  doc.text("Resumen General", 10, y);
  y += 8;

  doc.setFontSize(9);

  let resumenGeneral = {};
  categorias.forEach(item => {
    if (!resumenGeneral[item.categoria]) resumenGeneral[item.categoria] = { total: 0, buenos: 0, faltantes: 0 };
    resumenGeneral[item.categoria].total++;
    if (item.estado === "Bueno") resumenGeneral[item.categoria].buenos++;
    if (item.estado === "No tiene") resumenGeneral[item.categoria].faltantes++;
  });

  Object.keys(resumenGeneral).forEach(cat => {
    const data = resumenGeneral[cat];
    const porcentaje = Math.round((data.buenos / data.total) * 100);
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
      `${cat}: ${porcentaje}% Bueno | No tiene: ${data.faltantes} | Estado: ${estadoTexto}`,
      10,
      y
    );
    y += 5;
  });

  y += 8;

  // Detalle por categoría en el PDF
  Object.keys(resumenGeneral).forEach(cat => {
    const items = categorias.filter(item => item.categoria === cat);

    if (y > 260) {
      doc.addPage();
      y = 15;
    }

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`${cat}`, 10, y);
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

  // Guardar el PDF
  doc.save("inventario_HFC_" + document.getElementById("movil").value + "_" + document.getElementById("placa").value);

  // ---- Generar Excel ----
  const excelData = [];
  // Agregar encabezados de columnas
  excelData.push(["Categoría", "Elemento", "Cantidad", "Estado", "Placa", "Tipo Movil"]);

  // Agregar cada elemento al Excel
  categorias.forEach(item => {
    excelData.push([item.categoria, item.elemento, item.cantidad, item.estado, item.placa, item.movil]);
  });

  // Crear una hoja de trabajo con los datos
  const ws = XLSX.utils.aoa_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventario HFC");

  // Guardar el archivo Excel
  XLSX.writeFile(wb, "inventario_HFC_" + document.getElementById("movil").value + "_" + document.getElementById("placa").value + ".xlsx");
}
