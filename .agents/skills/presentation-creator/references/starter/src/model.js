// Removable analytical teaching example, NOT measurements or project results.
// Model: tau * dy/dt + y = u; u(t >= 0) = 1; y(0) = 0.
// t/tau/duration/interval are seconds. y and the input are dimensionless.
// Provenance and limitations: ../DATA.md. No numerical solver is needed.
export const DURATION = 4

export function responseAt(t, tau) {
  if (!Number.isFinite(t) || t < 0 || !Number.isFinite(tau) || tau <= 0) throw new RangeError("Expected t >= 0 and tau > 0, both finite")
  return 1 - Math.exp(-t / tau)
}

export function sampleResponse({ tau, duration = DURATION, interval = 0.02 }) {
  if (![duration, interval].every((v) => Number.isFinite(v) && v > 0)) throw new RangeError("Expected positive finite sampling settings")
  const count = Math.ceil(duration / interval)
  if (count > 100_000) throw new RangeError("Too many samples for an interactive teaching example")
  return Array.from({ length: count + 1 }, (_, i) => {
    const t = Math.min(i * interval, duration)
    return { t, y: responseAt(t, tau) }
  })
}
