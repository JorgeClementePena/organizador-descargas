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

function obtenerClases(config) {
  const classes = config.professorMode?.classes || [];
  const mapa = new Map();

  for (const clase of classes) {
    mapa.set(normalizarToken(clase), limpiarSegmentoRuta(clase.toUpperCase()));
  }

  return mapa;
}

function quitarLetraFinal(texto) {
  return String(texto || "")
    .trim()
    .replace(/[a-z]$/i, "")
    .trim();
}

function obtenerGruposSinLetra(config) {
  const mapa = new Map();
  const classes = config.professorMode?.classes || [];
  const courses = config.professorMode?.classLetterRequiredCourses || [];

  for (const clase of classes) {
    const base = quitarLetraFinal(clase);

    if (base) {
      mapa.set(normalizarToken(base), limpiarSegmentoRuta(base.toUpperCase()));
    }
  }

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

function buscarGrupo(tokens, grupos) {
  for (let i = 0; i < tokens.length; i++) {
    const token = normalizarToken(tokens[i]);

    if (grupos.has(token)) {
      return {
        index: i,
        grupo: grupos.get(token)
      };
    }

    if (i + 1 < tokens.length) {
      const combinado = normalizarToken(`${tokens[i]}${tokens[i + 1]}`);

      if (grupos.has(combinado)) {
        return {
          index: i,
          endIndex: i + 1,
          grupo: grupos.get(combinado)
        };
      }
    }
  }

  return null;
}

function esExtensionProfesorPermitida(nombreArchivo, modo) {
  const extension = path.extname(nombreArchivo).toLowerCase();

  return modo.allowedExtensions.length === 0 || modo.allowedExtensions.includes(extension);
}

function crearAvisoProfesorSinClase(nombreArchivo, config) {
  const modo = config.professorMode;

  if (!modo?.enabled || !esExtensionProfesorPermitida(nombreArchivo, modo)) {
    return null;
  }

  const tokens = dividirNombreArchivo(nombreArchivo);
  const clases = obtenerClases(config);

  if (buscarGrupo(tokens, clases)) {
    return null;
  }

  const gruposSinLetra = obtenerGruposSinLetra(config);
  const grupoSinLetra = buscarGrupo(tokens, gruposSinLetra);

  if (!grupoSinLetra) {
    return null;
  }

  const tokensAlumno = tokens.slice(0, grupoSinLetra.index);

  if (tokensAlumno.length < 2) {
    return null;
  }

  return {
    motivo: `documento de profesor sin letra de clase (${grupoSinLetra.grupo}); anade A/B, por ejemplo 4ºA`,
    aviso: true,
    profesor: {
      grupo: grupoSinLetra.grupo,
      tipo: "clase sin letra"
    }
  };
}

function parsearDocumentoProfesor(nombreArchivo, config) {
  const modo = config.professorMode;

  if (!modo?.enabled) {
    return null;
  }

  if (!esExtensionProfesorPermitida(nombreArchivo, modo)) {
    return null;
  }

  const tokens = dividirNombreArchivo(nombreArchivo);
  const clases = obtenerClases(config);
  const claseEncontrada = buscarGrupo(tokens, clases);
  const cursos = obtenerCursos(config);
  const grupoEncontrado = claseEncontrada || buscarGrupo(tokens, cursos);

  if (!grupoEncontrado) {
    return null;
  }

  const tokensAlumno = tokens.slice(0, grupoEncontrado.index);

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
    curso: grupoEncontrado.grupo,
    clase: claseEncontrada?.grupo || null,
    categoria: `Profesor ${grupoEncontrado.grupo}`
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
  crearAvisoProfesorSinClase,
  parsearDocumentoProfesor
};
