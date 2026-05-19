const fs = require("fs");
const os = require("os");
const path = require("path");

const defaultConfigPath = path.join(__dirname, "../config.json");

function expandPath(value) {
  if (!value) {
    return value;
  }

  let expanded = String(value);

  expanded = expanded.replace(/^~(?=\\|\/|$)/, os.homedir());

  for (const [key, envValue] of Object.entries(process.env)) {
    expanded = expanded.replaceAll(`%${key}%`, envValue);
  }

  return path.resolve(expanded);
}

function normalizarExtension(extension) {
  const texto = String(extension || "").trim().toLowerCase();

  if (!texto) {
    return "";
  }

  return texto.startsWith(".") ? texto : `.${texto}`;
}

function validarConfig(config) {
  if (!config.sourceDir) {
    throw new Error("config.json necesita sourceDir.");
  }

  if (!config.targetBaseDir) {
    throw new Error("config.json necesita targetBaseDir.");
  }

  if (!Array.isArray(config.rules)) {
    throw new Error("config.json necesita rules como array.");
  }
}

function cargarConfig(opciones = {}) {
  const configPath = opciones.configPath
    ? path.resolve(opciones.configPath)
    : defaultConfigPath;

  const contenido = fs.readFileSync(configPath, "utf8");
  const config = JSON.parse(contenido);

  if (opciones.sourceDir) {
    config.sourceDir = opciones.sourceDir;
  }

  if (opciones.targetBaseDir) {
    config.targetBaseDir = opciones.targetBaseDir;
  }

  validarConfig(config);

  return {
    ...config,
    configPath,
    sourceDir: expandPath(config.sourceDir),
    targetBaseDir: expandPath(config.targetBaseDir),
    minAgeMinutes: Number(config.minAgeMinutes || 0),
    ignoreExtensions: (config.ignoreExtensions || []).map(normalizarExtension),
    ignoreNames: (config.ignoreNames || []).map((name) => String(name).toLowerCase()),
    professorMode: {
      enabled: config.professorMode?.enabled === true,
      folder: config.professorMode?.folder || "Profesor",
      allowedExtensions: (config.professorMode?.allowedExtensions || []).map(normalizarExtension),
      courses: config.professorMode?.courses || [],
      classes: config.professorMode?.classes || [],
      classLetterRequiredCourses: config.professorMode?.classLetterRequiredCourses || []
    },
    rules: config.rules.map((rule) => ({
      ...rule,
      extensions: (rule.extensions || []).map(normalizarExtension)
    })),
    fallback: config.fallback || {
      name: "Otros",
      folder: "Otros"
    }
  };
}

module.exports = {
  cargarConfig,
  expandPath,
  normalizarExtension
};
