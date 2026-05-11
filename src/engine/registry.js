const commands = [];

export function register(entry) {
  commands.push(entry);
}

export function dispatch(raw, store) {
  const cmd = raw.trim().toUpperCase();
  const stage = store.getStage();

  for (const entry of commands) {
    const match = entry.pattern.exec(cmd);
    if (!match) continue;

    // Stage gating
    if (entry.stages !== "*") {
      const valid = Array.isArray(entry.stages) ? entry.stages : [entry.stages];
      if (!valid.includes(stage)) {
        return {
          response: entry.stageWarning || `** COMMAND NOT VALID AT THIS STAGE\n><`,
          action: null,
        };
      }
    }

    const data = entry.parse ? entry.parse(match, raw) : {};
    return entry.execute(data, store, raw);
  }

  return {
    response: `FORMAT NOT RECOGNIZED - ${cmd}\nENTER HELP OR ? FOR ASSISTANCE\n><`,
    action: null,
  };
}

export function getPreview(partial) {
  if (!partial || partial.length < 2) return null;
  const cmd = partial.toUpperCase();
  for (const entry of commands) {
    if (entry.preview) {
      const hint = entry.preview(cmd);
      if (hint) return hint;
    }
  }
  return null;
}
