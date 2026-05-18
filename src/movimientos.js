const fs = require("fs");
const path = require("path");

const movimientosDir = path.join(__dirname, "../logs/movimientos");

function asegurarMovimientosDir() {
  if (!fs.existsSync(movimientosDir)) {
    fs.mkdirSync(movimientosDir, { recursive: true });
  }
}

function crearIdLote(fecha = new Date()) {
  return fecha.toISOString().replace(/[:.]/g, "-");
}

function guardarLoteMovimientos(acciones, resumen = {}) {
  asegurarMovimientosDir();

  const id = crearIdLote();
  const ruta = path.join(movimientosDir, `${id}.json`);
  const lote = {
    id,
    fecha: new Date().toISOString(),
    resumen,
    movimientos: acciones.map((accion) => ({
      categoria: accion.categoria,
      nombre: accion.nombre,
      origen: accion.origen,
      destino: accion.destino
    }))
  };

  fs.writeFileSync(ruta, JSON.stringify(lote, null, 2), "utf8");

  return {
    id,
    ruta
  };
}

function listarLotes() {
  asegurarMovimientosDir();

  return fs.readdirSync(movimientosDir)
    .filter((archivo) => archivo.endsWith(".json"))
    .map((archivo) => {
      const ruta = path.join(movimientosDir, archivo);
      const lote = JSON.parse(fs.readFileSync(ruta, "utf8"));

      return {
        id: lote.id || path.basename(archivo, ".json"),
        fecha: lote.fecha,
        ruta,
        movimientos: Array.isArray(lote.movimientos) ? lote.movimientos.length : 0
      };
    })
    .sort((a, b) => String(b.fecha || b.id).localeCompare(String(a.fecha || a.id)));
}

function obtenerUltimoLote() {
  return listarLotes()[0] || null;
}

function leerLote(ruta) {
  return JSON.parse(fs.readFileSync(ruta, "utf8"));
}

module.exports = {
  guardarLoteMovimientos,
  leerLote,
  listarLotes,
  obtenerUltimoLote
};
