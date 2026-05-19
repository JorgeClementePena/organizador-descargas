const fs = require("fs");
const path = require("path");
const { crearAvisoProfesorSinClase, crearDestinoProfesor } = require("./profesor");

function obtenerExtension(nombreArchivo) {
  return path.extname(nombreArchivo).toLowerCase();
}

function esArchivoReciente(stats, minAgeMinutes) {
  if (!minAgeMinutes || minAgeMinutes <= 0) {
    return false;
  }

  const edadMs = Date.now() - stats.mtimeMs;
  const edadMinutos = edadMs / 1000 / 60;

  return edadMinutos < minAgeMinutes;
}

function buscarRegla(nombreArchivo, config) {
  const extension = obtenerExtension(nombreArchivo);

  return config.rules.find((rule) => rule.extensions.includes(extension)) || config.fallback;
}

function crearDestinoSeguro(destino, reservados = new Set()) {
  const parsed = path.parse(destino);
  let candidato = destino;
  let contador = 1;

  while (fs.existsSync(candidato) || reservados.has(candidato.toLowerCase())) {
    candidato = path.join(parsed.dir, `${parsed.name} (${contador})${parsed.ext}`);
    contador++;
  }

  reservados.add(candidato.toLowerCase());
  return candidato;
}

function listarEntradas(config) {
  if (!fs.existsSync(config.sourceDir)) {
    throw new Error(`No existe la carpeta origen: ${config.sourceDir}`);
  }

  return fs.readdirSync(config.sourceDir, { withFileTypes: true });
}

function crearPlan(config, opciones = {}) {
  const entradas = listarEntradas(config);
  const reservados = new Set();
  const acciones = [];
  const omitidos = [];

  for (const entrada of entradas) {
    if (!entrada.isFile()) {
      omitidos.push({
        nombre: entrada.name,
        motivo: "no es un archivo"
      });
      continue;
    }

    const nombreNormalizado = entrada.name.toLowerCase();
    const extension = obtenerExtension(entrada.name);

    if (config.ignoreNames.includes(nombreNormalizado)) {
      omitidos.push({
        nombre: entrada.name,
        motivo: "nombre ignorado"
      });
      continue;
    }

    if (config.ignoreExtensions.includes(extension)) {
      omitidos.push({
        nombre: entrada.name,
        motivo: "extension ignorada"
      });
      continue;
    }

    const origen = path.join(config.sourceDir, entrada.name);
    const stats = fs.statSync(origen);

    if (!opciones.includeRecent && esArchivoReciente(stats, config.minAgeMinutes)) {
      omitidos.push({
        nombre: entrada.name,
        motivo: `archivo reciente, menos de ${config.minAgeMinutes} min`
      });
      continue;
    }

    const avisoProfesor = crearAvisoProfesorSinClase(entrada.name, config);

    if (avisoProfesor) {
      omitidos.push({
        nombre: entrada.name,
        motivo: avisoProfesor.motivo,
        aviso: avisoProfesor.aviso,
        profesor: avisoProfesor.profesor
      });
      continue;
    }

    const destinoProfesor = crearDestinoProfesor(entrada.name, config);
    const regla = destinoProfesor || buscarRegla(entrada.name, config);
    const carpetaDestino = path.join(config.targetBaseDir, regla.folder || regla.carpeta);
    const destinoBase = path.join(carpetaDestino, entrada.name);
    const destino = crearDestinoSeguro(destinoBase, reservados);

    acciones.push({
      categoria: regla.name || regla.categoria,
      nombre: entrada.name,
      origen,
      destino,
      inteligente: Boolean(destinoProfesor),
      profesor: destinoProfesor?.datos || null
    });
  }

  return {
    acciones,
    omitidos
  };
}

function moverArchivo(origen, destino) {
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.renameSync(origen, destino);
}

module.exports = {
  crearDestinoSeguro,
  crearPlan,
  moverArchivo
};
