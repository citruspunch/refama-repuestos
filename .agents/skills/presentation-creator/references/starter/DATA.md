# Evidence inventory: analytical teaching example

This starter contains no experimental dataset or claims about a particular project's results. Its analytical model is only a removable demonstration of the presentation components.

| Visual / claim | Source and derivation |
| --- | --- |
| Unit-step response | `src/model.js`: exact solution of τ dy/dt + y = u, with u(t ≥ 0) = 1 and y(0) = 0 |
| Time-constant scenarios | Explicit teaching choices τ = 1 s and 2 s in `STORY`; Explore permits 0.5–2 s |
| Sampled curves | Exact equation evaluated every 0.02 s, including both endpoints of [0, 4] s; no numerical integration |
| Live output readout | The same `responseAt(time, tau)` equation as the plotted samples |
| 63.2% after one time constant | 100 × (1 − exp(−1)), rounded only for display |
| Equilibrium one | Limit of 1 − exp(−t/τ) as t → ∞ for τ > 0, not the last plotted sample |

Time and time constants are seconds; input/output are dimensionless. The model is linear, stable, first order, constant-parameter, and has no delay, noise, saturation, or coupling. It is a declared analytical example, not an empirical prediction.

The moving SVG reveal interpolates visually along the sampled polyline; it does not create observations. Both comparison traces use the same grid and axes. Provenance lives here and in the appendix rather than repetitive audience-facing `.src` footers.

When adapting the presentation, replace this inventory with actual source/version references, scenario metadata, transformations, units, solver/sample settings, assumptions, and any required attribution. Keep pure model tests and numerical claims consistent with those sources.
