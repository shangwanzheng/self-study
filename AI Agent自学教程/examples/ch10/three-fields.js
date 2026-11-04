function threeFields(agent) {
  const found = String(agent.sentence).match(/\d+/g);
  const limitYuan = found && found.length > 0 ? Number(found[0]) : undefined;
  const claimedYuan = found && found.length > 1 ? Number(found[1]) : undefined;
  const overYuan = limitYuan !== undefined && claimedYuan !== undefined ? claimedYuan - limitYuan : undefined;
  const fields = { limitYuan: limitYuan, claimedYuan: claimedYuan, overYuan: overYuan };
  const missing = ['limitYuan', 'claimedYuan', 'overYuan'].filter(function (key) {
    return fields[key] === undefined;
  });
  if (missing.length) return { ok: false, missing: missing };
  return { ok: true, fields: fields };
}
