const path = require("path");

function quitarAcentos(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizarToken(texto) {
  return quitarAcentos(texto)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function formatearNombre(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúüñ -]/gi, "")
    .replace(/\s+/g, "-");
}

function limpiarSegmentoRuta(texto) {
  return String(texto || "")
    .replace(/[<>:"/\\|?*]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function obtenerCursos(config) {
  const courses = config.professorMode?.courses || [];
  const mapa = new Map();

  for (const curso of courses) {
    mapa.set(normalizarToken(curso), limpiarSegmentoRuta(curso.toUpperCase()));
  }

  return mapa;
}

function dividirNombreArchivo(nombreArchivo) {
  const parsed = path.parse(nombreArchivo);
  return parsed.name
    .split(/[._\-\s]+/)
    .map((parte) => parte.trim())
    .filter(Boolean);
}

function buscarCurso(tokens, cursos) {
  for (let i = 0; i < tokens.length; i++) {
    const token = normalizarToken(tokens[i]);

    if (cursos.has(token)) {
      return {
        index: i,
        curso: cursos.get(token)
      };
    }

    if (i + 1 < tokens.length) {
      const combinado = normalizarToken(`${tokens[i]}${tokens[i + 1]}`);

      if (cursos.has(combinado)) {
        return {
          index: i,
          endIndex: i + 1,
          curso: cursos.get(combinado)
        };
      }
    }
  }

  return null;
}

function parsearDocumentoProfesor(nombreArchivo, config) {
  const modo = config.professorMode;

  if (!modo?.enabled) {
    return null;
  }

  const extension = path.extname(nombreArchivo).toLowerCase();

  if (modo.allowedExtensions.length > 0 && !modo.allowedExtensions.includes(extension)) {
    return null;
  }

  const tokens = dividirNombreArchivo(nombreArchivo);
  const cursos = obtenerCursos(config);
  const cursoEncontrado = buscarCurso(tokens, cursos);

  if (!cursoEncontrado) {
    return null;
  }

  const tokensAlumno = tokens.slice(0, cursoEncontrado.index);

  if (tokensAlumno.length < 2) {
    return null;
  }

  const apellido = tokensAlumno[tokensAlumno.length - 1];
  const nombre = tokensAlumno.slice(0, -1).join("-");
  const alumno = `${formatearNombre(apellido)}.${formatearNombre(nombre)}`;

  return {
    nombre: limpiarSegmentoRuta(nombre),
    apellido: limpiarSegmentoRuta(apellido),
    alumno: limpiarSegmentoRuta(alumno),
    curso: cursoEncontrado.curso,
    categoria: `Profesor ${cursoEncontrado.curso}`
  };
}

function crearDestinoProfesor(nombreArchivo, config) {
  const datos = parsearDocumentoProfesor(nombreArchivo, config);

  if (!datos) {
    return null;
  }

  return {
    categoria: datos.categoria,
    carpeta: path.join(config.professorMode.folder, datos.curso, datos.alumno),
    datos
  };
}

module.exports = {
  crearDestinoProfesor,
  parsearDocumentoProfesor
};
