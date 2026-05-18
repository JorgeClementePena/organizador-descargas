const fs = require("fs");
const { crearDestinoSeguro, moverArchivo } = require("./archivos");
const { escribirLog, logFile } = require("./logger");
const { leerLote, listarLotes, obtenerUltimoLote } = require("./movimientos");

function parseArgs(argv) {
  const args = {
    dryRun: false,
    list: false,
    lote: null
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    if (arg === "--list") {
      args.list = true;
      continue;
    }

    if (arg === "--lote") {
      args.lote = argv[++i];
      continue;
    }

    throw new Error(`Argumento no reconocido: ${arg}`);
  }

  return args;
}

function imprimirLotes() {
  const lotes = listarLotes();

  if (lotes.length === 0) {
    console.log("No hay lotes de movimientos.");
    return;
  }

  for (const lote of lotes) {
    console.log(`${lote.id} | ${lote.fecha} | movimientos: ${lote.movimientos}`);
  }
}

function resolverLote(id) {
  const lotes = listarLotes();

  if (id) {
    return lotes.find((lote) => lote.id === id) || null;
  }

  return obtenerUltimoLote();
}

function crearPlanUndo(lote) {
  const reservados = new Set();

  return lote.movimientos
    .slice()
    .reverse()
    .map((movimiento) => {
      if (!fs.existsSync(movimiento.destino)) {
        return {
          ...movimiento,
          restaurarA: movimiento.origen,
          omitido: true,
          motivo: "el archivo movido ya no existe en destino"
        };
      }

      return {
        ...movimiento,
        restaurarA: crearDestinoSeguro(movimiento.origen, reservados),
        omitido: false
      };
    });
}

function imprimirPlan(plan, opciones) {
  console.log(opciones.dryRun ? "Undo en modo prueba" : "Undo real");
  console.log("");

  for (const item of plan) {
    if (item.omitido) {
      console.log(`OMITIDO: ${item.destino} | ${item.motivo}`);
      continue;
    }

    console.log(`${item.destino} -> ${item.restaurarA}`);
  }

  console.log("");
  console.log(`Restaurables: ${plan.filter((item) => !item.omitido).length}`);
  console.log(`Omitidos: ${plan.filter((item) => item.omitido).length}`);

  if (opciones.dryRun) {
    console.log("");
    console.log("No se restauro nada. Usa npm run undo para deshacer de verdad.");
  }

  console.log(`Log: ${logFile}`);
}

function aplicarUndo(plan) {
  let restaurados = 0;

  for (const item of plan) {
    if (item.omitido) {
      escribirLog(`UNDO OMITIDO | ${item.destino} | ${item.motivo}`);
      continue;
    }

    moverArchivo(item.destino, item.restaurarA);
    escribirLog(`UNDO | ${item.destino} -> ${item.restaurarA}`);
    restaurados++;
  }

  return restaurados;
}

function main() {
  const opciones = parseArgs(process.argv);

  if (opciones.list) {
    imprimirLotes();
    return;
  }

  const loteInfo = resolverLote(opciones.lote);

  if (!loteInfo) {
    console.log("No hay lote para deshacer.");
    return;
  }

  const lote = leerLote(loteInfo.ruta);
  const plan = crearPlanUndo(lote);

  console.log(`Lote: ${loteInfo.id}`);
  imprimirPlan(plan, opciones);

  if (opciones.dryRun) {
    escribirLog(`UNDO DRY-RUN | lote=${loteInfo.id} restaurables=${plan.filter((item) => !item.omitido).length}`);
    return;
  }

  const restaurados = aplicarUndo(plan);
  escribirLog(`UNDO APPLY | lote=${loteInfo.id} restaurados=${restaurados}`);
  console.log("");
  console.log(`Restaurados correctamente: ${restaurados}`);
}

main();
