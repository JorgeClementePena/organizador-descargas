function parseArgs(argv) {
  const args = {
    apply: false,
    dryRun: false,
    json: false,
    includeRecent: false,
    configPath: null,
    sourceDir: null,
    targetBaseDir: null
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--apply") {
      args.apply = true;
      continue;
    }

    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    if (arg === "--json") {
      args.json = true;
      continue;
    }

    if (arg === "--include-recent") {
      args.includeRecent = true;
      continue;
    }

    if (arg === "--config") {
      args.configPath = argv[++i];
      continue;
    }

    if (arg === "--source") {
      args.sourceDir = argv[++i];
      continue;
    }

    if (arg === "--target") {
      args.targetBaseDir = argv[++i];
      continue;
    }

    throw new Error(`Argumento no reconocido: ${arg}`);
  }

  if (!args.apply) {
    args.dryRun = true;
  }

  if (args.apply && args.dryRun) {
    throw new Error("Usa --apply o --dry-run, no ambos a la vez.");
  }

  return args;
}

module.exports = {
  parseArgs
};
