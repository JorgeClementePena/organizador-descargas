const { crearPlan, moverArchivo } = require("./archivos");
const { cargarConfig } = require("./config");
const { parseArgs } = require("./cli");
const { escribirLog, logFile } = require("./logger");
const { guardarLoteMovimientos } = require("./movimientos");

function imprimirPlan(plan, config, opciones) {
  if (opciones.json) {
    console.log(JSON.stringify({
      modo: opciones.apply ? "apply" : "dry-run",
      sourceDir: config.sourceDir,
      targetBaseDir: config.targetBaseDir,
      acciones: plan.acciones,
      omitidos: plan.omitidos
    }, null, 2));
    return;
  }

  console.log(opciones.apply ? "Modo aplicar" : "Modo prueba");
  console.log(`Origen: ${config.sourceDir}`);
  console.log(`Destino base: ${config.targetBaseDir}`);
  console.log("");

  if (plan.acciones.length === 0) {
    console.log("No hay archivos para mover.");
  } else {
    for (const accion of plan.acciones) {
      console.log(`${accion.categoria}: ${accion.nombre} -> ${accion.destino}`);
    }
  }

  const avisos = plan.omitidos.filter((omitido) => omitido.aviso);

  if (avisos.length > 0) {
    console.log("");
    console.log("Avisos:");

    for (const aviso of avisos) {
      console.log(`- ${aviso.nombre}: ${aviso.motivo}. Se queda en ${config.sourceDir}.`);
    }
  }

  console.log("");
  console.log(`Archivos a mover: ${plan.acciones.length}`);
  console.log(`Entradas omitidas: ${plan.omitidos.length}`);

  if (!opciones.apply) {
    console.log("");
    console.log("No se movio nada. Usa organizador.cmd o npm.cmd run apply para ejecutar los movimientos.");
  }

  console.log(`Log: ${logFile}`);
}

function aplicarPlan(plan) {
  let movidos = 0;
  const movimientos = [];

  for (const accion of plan.acciones) {
    moverArchivo(accion.origen, accion.destino);
    escribirLog(`MOVIDO | ${accion.origen} -> ${accion.destino}`);
    movimientos.push(accion);
    movidos++;
  }

  return {
    movidos,
    movimientos
  };
}

function main() {
  const opciones = parseArgs(process.argv);
  const config = cargarConfig(opciones);
  const plan = crearPlan(config, {
    includeRecent: opciones.includeRecent
  });

  imprimirPlan(plan, config, opciones);

  if (!opciones.apply) {
    escribirLog(`DRY-RUN | acciones=${plan.acciones.length} omitidos=${plan.omitidos.length}`);
    return;
  }

  const resultado = aplicarPlan(plan);
  const lote = resultado.movidos > 0
    ? guardarLoteMovimientos(resultado.movimientos, {
        movidos: resultado.movidos,
        omitidos: plan.omitidos.length,
        sourceDir: config.sourceDir,
        targetBaseDir: config.targetBaseDir
      })
    : null;

  escribirLog(`APPLY | movidos=${resultado.movidos} omitidos=${plan.omitidos.length}`);
  console.log("");
  console.log(`Movidos correctamente: ${resultado.movidos}`);

  if (lote) {
    console.log(`Lote de movimientos: ${lote.ruta}`);
  }
}

main();
