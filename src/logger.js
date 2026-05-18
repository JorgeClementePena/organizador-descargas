const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "../logs");
const logFile = path.join(logDir, "organizador.log");

function asegurarLogDir() {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

function escribirLog(mensaje) {
  asegurarLogDir();
  const linea = `[${new Date().toISOString()}] ${mensaje}`;
  fs.appendFileSync(logFile, `${linea}\n`, "utf8");
}

module.exports = {
  escribirLog,
  logFile
};
