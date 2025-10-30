export function shallowEqual(a: any, b: any) {
  if (a === b) return true
  if (!a || !b) return false
  const ka = Object.keys(a),
    kb = Object.keys(b)
  if (ka.length !== kb.length) return false
  for (const k of ka) if (a[k] !== b[k]) return false
  return true
}
