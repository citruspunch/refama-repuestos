import React from "react"
import { BUSINESS, MODEL_NAMES, month, monthRange, number, percent, price } from "./business.js"
import { useCueState, usePresentation } from "./PresentationContext.jsx"
import { BaselineComparison, ForecastChart, ModelBars, PortfolioSales, portfolio, product, productIds, score } from "./Charts.jsx"
import { interiorMonths, productionVariant, replayTotal } from "./analysis.js"
import { Flow, Metric, Note, ProductLabel, Rows, Slide } from "./ui.jsx"
import { BaselineLesson, RegressionLesson, TreesLesson } from "./ModelLessons.jsx"
import { NumberTicker } from "./NumberTicker.jsx"

const qualityCount = (name) => portfolio.quality.find((row) => row.check === name)?.flagged_rows ?? 0

function Cover() {
  const { title } = usePresentation()
  return <section className="slide cover">
    <div className="cover-kicker">
      <span>RUJAF / Refama</span>
      <span>{month(portfolio.analysisDate, false)}</span>
    </div>
    <div className="cover-main">
      <div className="cover-copy">
        <p className="cover-eyebrow">Proyecto de investigación</p>
        <h1>{title}</h1>
        <p className="cover-summary">Pronóstico de ventas y planificación de inventarios para cinco repuestos.</p>
        <dl className="cover-metrics">
          <div><dt>movimientos</dt><dd><NumberTicker value={portfolio.movementCount} /></dd></div>
          <div><dt>métodos</dt><dd><small>Hasta </small><NumberTicker value={portfolio.modelCount} /></dd></div>
          <div><dt>escenarios</dt><dd><NumberTicker value={portfolio.scenarioCount} /></dd></div>
        </dl>
      </div>
      <div className="cover-visual">
        <div className="cover-products"><h3>Cinco repuestos analizados</h3><ol>{productIds.map((id, index) => <li key={id} style={{ "--i": index }}><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel><small>{BUSINESS[id].code}</small></li>)}</ol></div>
      </div>
    </div>
    <div className="cover-footer">
      <p className="cover-context">Andrés Tobar · 23001175<br />Samuel Marroquín · 23006593<br />Jostyne Montenegro · 23003375</p>
      <p className="cover-scope">Investigación de Operaciones</p>
    </div>
  </section>
}

function Business() {
  return <Slide>
    <div className="business-diagram">
      <div className="business-card source">
        <span className="card-badge">Fabricación y mayoreo</span>
        <h3>RUJAF</h3>
        <p>Fabricación y distribución de producto terminado.<br />Conjunto de análisis de cinco Kardex.</p>
      </div>

      <div className="business-connector" aria-hidden="true">
        <span className="connector-pill">Despachos</span>
        <svg className="connector-svg" viewBox="0 0 140 180" fill="none">
          <path d="M 0 90 C 60 90, 80 45, 130 45" pathLength="1" stroke="#d4953a" strokeWidth="2.5" />
          <path d="M 0 90 C 60 90, 80 135, 130 135" pathLength="1" stroke="#d4953a" strokeWidth="2.5" />
          <polygon points="128,40 138,45 128,50" fill="#d4953a" />
          <polygon points="128,130 138,135 128,140" fill="#d4953a" />
        </svg>
      </div>

      <div className="business-destinations">
        <div className="business-card destination refama">
          <h4>Refama</h4>
          <p>Tiendas de venta al detalle.<br />Los despachos no son consumo final.</p>
        </div>

        <div className="business-card destination wholesale">
          <h4>Otros clientes</h4>
          <p>Ventas mayoristas registradas en Kardex.</p>
        </div>
      </div>
    </div>
  </Slide>
}

function Decision() {
  return <Slide>
    <div className="split decision-layout"><p className="statement">Ventas recientes<br />+ inventario disponible</p>
      <Rows items={[
        ["Exceso de producción", "Acumula producto en bodega y compromete capital de trabajo."],
        ["Producción insuficiente", "Genera desabastecimiento y pedidos sin atender."],
      ]} />
    </div>
  </Slide>
}

function Products() {
  const [expanded] = useCueState("ampliados", false)
  return <Slide className="products-slide">
    <table className="comparison-table portfolio-table product-inputs"><thead><tr><th>Producto</th><th>Monto, Q/u.</th><th>Tipo de monto</th><th>Ritmo, u./día</th></tr></thead><tbody>{productIds.map((id) => {
      const item = BUSINESS[id]
      const entry = product(id).catalog
      return <tr key={id}><th><ProductLabel id={id}>{item.shortName}</ProductLabel><small>{item.code}</small></th><td>{price(entry.monto_reportado_gtq)}</td><td>Precio neto</td><td>{number(entry.produccion_aproximada_diaria_min)}{entry.produccion_aproximada_diaria_min !== entry.produccion_aproximada_diaria_max ? ` a ${entry.produccion_aproximada_diaria_max}` : ""}</td></tr>
    })}</tbody></table>
    <p className="small-explanation" key={String(expanded)}>{expanded ? "Cinco precios netos tras descuentos. Ninguno es costo de fabricación, margen o ahorro; el ingreso estimado no equivale a ingreso histórico real." : "Ritmos aproximados por día productivo, no capacidad máxima verificada."}</p>
  </Slide>
}

function Scope() {
  return <Slide>
    <Flow items={[
      { title: "Kardex", text: `${number(portfolio.movementCount)} movimientos de cinco productos.` },
      { title: "Modelos", text: "Selección temporal por producto y canal." },
      { title: "Inventario", text: "Saldos en bodega frente a ventas recientes." },
      { title: "Planificación", text: `${portfolio.scenarioCount} escenarios y simulación diaria retrospectiva.` },
    ]} />
  </Slide>
}

function Origin() {
  return <Slide>
    <div className="split"><div className="source-ledgers">{productIds.map((id, index) => <div key={id} style={{ "--i": index }}><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel><strong>{number(product(id).catalog.movements)}</strong><span>movimientos</span></div>)}</div>
      <Rows items={[
        ["Cinco Kardex", "A y B extraídos de PDF; C, D y E recibidos en CSV."],
        ["Procedencia", "Fecha, página y orden conservados. C mantiene el encabezado Refama."],
        ["Tipos de movimiento", "Ventas separadas de producción, compras, ajustes, traslados y devoluciones."],
      ]} />
    </div>
  </Slide>
}

function Traceability() {
  return <Slide>
    <div className="trace-summary"><Metric value={portfolio.movementCount} animate label="movimientos preservados" /><p>1,062 anteriores + 1,046 incorporados<br />Un consolidado, sin duplicación.</p></div>
    <Flow items={[
      { title: "Archivos fuente", text: "Control de integridad con huellas SHA-256." },
      { title: "Validación", text: "Comprobación de fechas, cantidades y saldos." },
      { title: "Series mensuales", text: `${portfolio.monthCount} de ${portfolio.monthCount} meses conciliados sin diferencias.` },
    ]} />
  </Slide>
}

function Quality() {
  return <Slide>
    <div className="split"><div><Metric value={portfolio.movementCount - productIds.length} animate label="transiciones verificadas" /><p className="large-caption">Sin diferencias aritméticas en saldos.</p></div>
      <div className="quality-list"><div><strong>{qualityCount("negative_balance")}</strong><span>Saldos negativos</span></div><div><strong>{qualityCount("adjustment_requires_context")}</strong><span>Ajustes</span></div><div><strong>{qualityCount("zero_balance")}</strong><span>Eventos con saldo cero</span></div><p>Se conservan cuatro traslados y una venta en cero. La conciliación no certifica stock físico.</p></div>
    </div>
  </Slide>
}

function Sample() {
  return <Slide>
    <div className="split"><Rows items={[
      ["Objetivo", "Salidas registradas como VENTA por RUJAF."],
      ["Canales", "Despachos a Refama y ventas a otros clientes."],
      ["Exclusiones", "Ajustes, producción, compras, traslados y devoluciones."],
    ]} /><div className="sample-periods">{productIds.map((id) => {
      const data = interiorMonths(product(id))
      return <div key={id}><ProductLabel id={id}>{month(data[0].month)} a {month(data.at(-1).month)}</ProductLabel><strong>{data.length}<small> meses</small></strong></div>
    })}<p className="boundary-note">Se excluyen los meses extremos por cobertura no confirmada.</p></div></div>
  </Slide>
}

function Trend() {
  return <Slide>
    <PortfolioSales />
  </Slide>
}

function Channels() {
  return <Slide>
    <p className="chart-intro">Promedio mensual de los últimos 12 meses frente a los primeros 12 meses analizados.</p>
    <table className="comparison-table channels-table portfolio-table"><thead><tr><th>Producto</th><th>Movimientos a Refama</th><th>Otros clientes</th><th>VENTA total</th></tr></thead><tbody>{productIds.map((id) => {
      const stream = (scenario) => product(id).streams.find((row) => row.scenario === scenario)
      return <tr key={id}><th><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel></th>{["refama", "other", "combined"].map((scenario) => <td key={scenario}>{percent(stream(scenario).last_12_vs_first_12)}</td>)}</tr>
    })}</tbody></table>
    <div className="channel-shares" aria-label="Participación histórica de Refama en cada producto">{productIds.map((id) => {
      const share = product(id).channels.find((row) => row.scenario === "refama").all_observed_sales_units / product(id).summary.all_observed_sales_units
      return <div key={id}><div className="share-caption"><span>Refama · {id}</span><strong>{percent(share)}</strong></div><div className="share-bar"><span style={{ width: `${share * 100}%`, background: BUSINESS[id].color }} /></div></div>
    })}</div>
  </Slide>
}

function Variability() {
  return <Slide>
    <table className="comparison-table portfolio-table"><thead><tr><th>Producto</th><th>Media, u./mes</th><th>CV mensual</th><th>Meses en cero</th><th>Mayor racha en cero</th></tr></thead><tbody>{productIds.map((id) => {
      const p = product(id)
      return <tr key={id}><th><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel></th><td>{number(p.summary.monthly_mean, 2)}</td><td>{number(p.summary.monthly_cv, 2)}</td><td>{p.profile.zero_periods} / {p.profile.usable_months}</td><td>{p.profile.longest_zero_run_months} {p.profile.longest_zero_run_months === 1 ? "mes" : "meses"}</td></tr>
    })}</tbody></table>
    <p className="small-explanation">C tiene ventas mensuales frecuentes; E es intermitente. Ceros registrados no prueban demanda nula.</p>
  </Slide>
}

function Seasonality() {
  return <Slide className="seasonality-slide">
    <p className="chart-intro">Diagnósticos anuales sobre los meses interiores de cada producto.</p>
    <table className="comparison-table portfolio-table seasonality-table"><thead><tr><th>Producto</th><th>Correlación a 12 meses</th><th>q armónico, FDR</th><th>Señal armónica</th></tr></thead><tbody>{productIds.map((id) => {
      const s = product(id).seasonality
      return <tr key={id}><th><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel></th><td>{number(s.acf_lag_12, 2)}</td><td>{number(s.harmonic_q_bh, 3)}</td><td>{s.harmonic_evidence_after_fdr ? "Sí" : "No"}</td></tr>
    })}</tbody></table>
    <Note>La señal de A no basta para establecer estacionalidad operativa. C, D y E no muestran señal armónica tras el ajuste.</Note>
  </Slide>
}

function Inventory() {
  const [compare] = useCueState("comparar", false)
  if (compare) return <Slide>
    <table className="comparison-table portfolio-table"><thead><tr><th>Producto</th><th>Saldo, u.</th><th>Media 12 meses, u.</th><th>Cociente en meses</th><th>Corte histórico</th></tr></thead><tbody>{productIds.map((id) => {
      const inventory = product(id).inventory
      return <tr key={id}><th><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel></th><td>{number(inventory.aligned_closing_balance)}</td><td>{number(inventory.trailing_12_mean_sales, 2)}</td><td>{number(inventory.bookkeeping_units_over_trailing12_monthly_sales, 2)}</td><td>{month(inventory.last_interior_month)}</td></tr>
    })}</tbody></table>
  </Slide>
  return <Slide>
    <p className="chart-intro">Cociente en meses: saldo contable / venta media de los últimos 12 meses.</p>
    <div className="inventory-overview">{productIds.map((id) => {
      const inventory = product(id).inventory
      return <article key={id} className={`inventory-reading product-${id.toLowerCase()}`}><ProductLabel id={id}>{month(inventory.last_interior_month)}</ProductLabel>
        <strong className="inventory-ratio">{number(inventory.bookkeeping_units_over_trailing12_monthly_sales, 2)}</strong>
        <dl><div><dt>Saldo</dt><dd>{number(inventory.aligned_closing_balance)} u.</dd></div><div><dt>Media</dt><dd>{number(inventory.trailing_12_mean_sales, 2)} u./mes</dd></div></dl>
      </article>
    })}</div>
    <p className="small-explanation">No certifica stock físico ni disponibilidad futura.</p>
  </Slide>
}

function Demand() {
  return <Slide>
    <div className="demand-flow"><div><span className="label">Demanda no observada</span><h3>Pedidos de clientes</h3><p>Incluye pedidos no atendidos por falta de inventario.</p></div><div className="demand-filter"><h3>Disponibilidad</h3><p>Limita las ventas reales que se logran despachar.</p></div><div><span className="label">Objetivo del modelo</span><h3>Ventas en Kardex</h3><p>Salidas registradas efectivamente por RUJAF.</p></div></div>
  </Slide>
}

function Features() {
  return <Slide>
    <p className="chart-intro">Misma construcción, con datos previos al mes objetivo de cada producto. Ventas en unidades.</p>
    <table className="comparison-table portfolio-table feature-table"><thead><tr><th>Producto y objetivo</th><th>t−3</th><th>t−2</th><th>t−1</th><th>Promedio 3</th></tr></thead><tbody>{productIds.map((id) => {
      const p = product(id)
      const recent = interiorMonths(p).slice(-3)
      return <tr key={id}><th><ProductLabel id={id}>{month(p.forecast.target_month)}</ProductLabel></th>{recent.map((row) => <td key={row.month}>{number(row.sales_units)}</td>)}<td>{number(recent.reduce((sum, row) => sum + row.sales_units, 0) / 3, 2)}</td></tr>
    })}</tbody></table>
    <p className="small-explanation">Siete variables · Tres rezagos, promedio de 3 meses, tendencia y dos señales de calendario.</p>
  </Slide>
}

function Validation() {
  const [test] = useCueState("prueba", false)
  return <Slide>
    <div className="validation-timeline">{productIds.map((id) => <div className="timeline-product" key={id}>
      <ProductLabel id={id}>{product(id).summary.complete_months} meses</ProductLabel>
      <div className="timeline-track" aria-label={`Producto ${id}: 24 meses iniciales, ${product(id).selection.n_validation} meses de validación y 6 de prueba final`}>
        <div className="training" style={{ flex: 24 }}>24 iniciales</div><div className="validation" style={{ flex: product(id).selection.n_validation }}>{product(id).selection.n_validation} validación</div><div className={`testing ${test ? "highlight" : ""}`} style={{ flex: 6 }}>6 finales</div>
      </div><p>{month(product(id).selection.holdout_start)} a {month(product(id).selection.holdout_end)}</p>
    </div>)}</div>
    <Note key={String(test)} warning={test}>{test ? "Seis meses reservados para la prueba final, respetando el orden del tiempo." : "Entrenamiento progresivo mes a mes para calibrar y seleccionar modelos."}</Note>
  </Slide>
}

function Selection() {
  return <Slide>
    <p className="selection-rule">Si un modelo más simple queda a menos del <strong>5%</strong> de diferencia en MAE, se prefiere su uso.</p>
    <table className="comparison-table portfolio-table selection-table"><thead><tr><th>Producto</th><th>Método fijado</th><th>MAE de validación</th><th>MAE final</th></tr></thead><tbody>{productIds.map((id) => {
      const selection = product(id).selection
      return <tr key={id}><th><ProductLabel id={id} /></th><td>{MODEL_NAMES[selection.model]}</td><td>{number(selection.selected_validation_mae, 2)}</td><td>{number(score(id, selection.model).mae, 2)}</td></tr>
    })}</tbody></table>
  </Slide>
}

function Results() {
  return <Slide>
    <div className="split baseline-layout"><table className="comparison-table portfolio-table result-table"><caption>MAE final, unidades por mes</caption><thead><tr><th>Producto</th><th>Modelo fijado</th><th>Último mes</th></tr></thead><tbody>{productIds.map((id) => <tr key={id}><th><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel></th><td>{number(score(id, product(id).selection.model).mae, 2)}</td><td>{number(score(id, "naive").mae, 2)}</td></tr>)}</tbody></table><BaselineComparison /></div>
    <p className="small-explanation">El modelo fijado mejora el MAE en A, C y E, no en B ni D. Menor error no garantiza disponibilidad.</p>
  </Slide>
}

function Intermittency() {
  const selected = score("E", product("E").selection.model)
  return <Slide>
    <div className="split result-layout"><div><ProductLabel id="E">Selección · Referencia cero</ProductLabel><Metric value={selected.mae} animate decimalPlaces={2} label="MAE, unidades por mes" /><p className="result-delta">WAPE {percent(selected.wape)}<br />{selected.positive_actual_months} de 6 meses con ventas.</p></div>
      <ModelBars id="E" models={["zero", "croston_sba", "tsb", "moving_average_3"]} /></div>
    <Note warning>Predecir cero omite las 13 unidades vendidas en la prueba final. El MAE no mide el nivel de servicio.</Note>
  </Slide>
}

function Errors() {
  const [compare] = useCueState("comparar", false)
  if (compare) return <Slide>
    <table className="comparison-table portfolio-table"><thead><tr><th>Producto</th><th>MAE fijado</th><th>MAE último mes</th><th>WAPE fijado</th><th>Meses positivos finales</th></tr></thead><tbody>{productIds.map((id) => {
      const selected = score(id, product(id).selection.model)
      return <tr key={id}><th><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel></th><td>{number(selected.mae, 2)}</td><td>{number(score(id, "naive").mae, 2)}</td><td>{percent(selected.wape)}</td><td>{selected.positive_actual_months} de 6</td></tr>
    })}</tbody></table>
    <Note warning>El WAPE final de 100% en E no respalda producir cero ni demuestra demanda inexistente.</Note>
  </Slide>
  return <Slide className="error-slide">
    <div className="chart-legend"><span><i className="actual-key" />Venta registrada</span><span><i className="selected-key" />Modelo fijado</span><span><i className="naive-key" />Último mes</span><span>u./mes · Escala propia</span></div>
    <div className="product-chart-grid forecast-grid">{productIds.map((id) => {
      const selected = score(id, product(id).selection.model)
      return <figure className="chart-panel" key={id} data-product={id}><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel><ForecastChart id={id} finalOnly />
        <figcaption className="forecast-metrics"><strong>WAPE {percent(selected.wape)}</strong><span>Sesgo {selected.bias > 0 ? "+" : ""}{number(selected.bias, 2)} u.</span></figcaption>
      </figure>
    })}</div>
  </Slide>
}

function Failure() {
  const [contrast] = useCueState("contraste", false)
  const forecast = product("A").forecast
  return <Slide>
    <div className="zero-cases"><article><ProductLabel id="A">Extrapolación de Ridge</ProductLabel><strong>{number(forecast.raw_forecast_units, 2)} → 0</strong><p>Una salida negativa se recorta.</p></article><article><ProductLabel id="E">Selección por MAE</ProductLabel><strong>0</strong><p>Los ceros frecuentes favorecen esta referencia.</p></article></div>
    <Note key={String(contrast)} warning>{contrast ? `${number(forecast.units_already_in_unconfirmed_boundary)} u. en el registro parcial siguiente de A; 13 u. en la prueba final de E. Son períodos distintos, ambos con ventas.` : "Ni el recorte de A ni la selección de E demuestran demanda nula."}</Note>
  </Slide>
}

function Safeguards() {
  return <Slide>
    <Flow items={[
      { title: "Validación", text: "Detecta negativos, recortes a cero y fallos numéricos." },
      { title: "Comparación", text: "Contraste con el promedio de ventas de los últimos 3 meses." },
      { title: "Respaldo", text: "Uso del promedio móvil si la predicción principal no es válida." },
      { title: "Alerta", text: "Bloqueo del cálculo si el modelo de respaldo también presenta fallas." },
    ]} />
    <div className="guard-readings">{productIds.map((id) => <div key={id}><ProductLabel id={id}>{product(id).guard.fallback_used ? "Respaldo" : "Fijado"}</ProductLabel><strong>{number(product(id).guard.effective_forecast_units, 2)}<small> u./mes</small></strong></div>)}</div>
    <p className="small-explanation">Estimaciones provisionales para escenarios. Una tasa positiva tras meses en cero puede ser válida.</p>
  </Slide>
}

function Planning() {
  return <Slide>
    <div className="planning-inputs"><div><h3>Predicción de ventas</h3><p>Volumen estimado, incertidumbre y controles de validez.</p></div><div><h3>Inventario disponible</h3><p>Saldo alineado, reservas y pedidos pendientes.</p></div><div><h3>Ritmo y restricciones</h3><p>Plazo, lotes y días asignados. Ritmo reportado como supuesto.</p></div></div>
  </Slide>
}

function Scenarios() {
  const { guided } = usePresentation()
  const [safety, setSafety] = useCueState("seguridad", 0)
  const [days, setDays] = useCueState("dias", 1)
  const c = productionVariant(product("C"), safety, days)
  return <Slide className="scenario-slide">
    <p className="scenario-context">{days} {days === 1 ? "día" : "días"} por producto · Ritmo inferior · Horizonte de 37 días</p>
    <table className="comparison-table portfolio-table portfolio-scenarios"><caption className="sr-only">Producción en unidades con cero o un mes de seguridad. La columna resaltada corresponde al paso seleccionado.</caption>
      <thead><tr><th>Producto y corte</th><th>Saldo, u.</th><th>Previsión, u./mes</th><th className={safety === 0 ? "is-current" : ""}>Sin seguridad, u.</th><th className={safety === 1 ? "is-current" : ""}>1 mes, u.</th><th>Días teóricos</th></tr></thead>
      <tbody>{productIds.map((id) => {
        const variants = [0, 1].map((stock) => productionVariant(product(id), stock, days))
        const selected = variants[safety]
        return <tr key={id} data-product={id}>
          <th><ProductLabel id={id}>{month(selected.balance_cutoff)}</ProductLabel></th>
          <td>{number(selected.recorded_on_hand_units)}</td><td>{number(selected.expected_monthly_outgoing_units, 2)}</td>{variants.map((row, index) => <td key={index} className={index === safety ? "is-current" : ""} aria-current={index === safety ? "step" : undefined}><strong data-testid={index === safety ? `scenario-units-${id}` : undefined}>{number(row.suggested_production_units)}</strong>{row.constraints_prevent_target && <sup>*</sup>}</td>)}<td><span className="scenario-value" key={`${safety}:${days}`}>{number(selected.estimated_production_days_required, 2)}</span></td>
        </tr>
      })}</tbody>
    </table>
    <p className="small-explanation" key={`${safety}:${days}`}>{c.constraints_prevent_target ? `*C necesita ${number(c.unconstrained_production_units)} u.; el límite supuesto es ${number(c.scenario_capacity_units)}. ` : "Cortes históricos distintos. "}No autoriza órdenes ni programación conjunta.</p>
    <div className="scenario-toolbar" hidden={guided}><label>Seguridad<select aria-label="Stock de seguridad supuesto" disabled={guided} value={safety} onChange={(event) => setSafety(Number(event.target.value))}><option value={0}>Sin seguridad</option><option value={1}>1 mes</option></select></label>
      <label>Días asignados<select aria-label="Días de producción asignados" disabled={guided} value={days} onChange={(event) => setDays(Number(event.target.value))}><option value={1}>1 día</option><option value={5}>5 días</option></select></label><p>Consulta de resultados archivados.</p></div>
  </Slide>
}

function ProductionReplay() {
  const [compare] = useCueState("comparar", false)
  const [simulate] = useCueState("simular", false)
  if (compare) return <Slide>
    <p className="chart-intro">Venta no servida, u. Seis meses simulados; un día/mes, ritmo inferior.</p>
    <table className="comparison-table portfolio-table replay-table"><thead><tr><th>Producto</th><th>Sin seguridad, u.</th><th>1 mes, u.</th><th>Ventana de prueba</th></tr></thead><tbody>{productIds.map((id) => {
      const p = product(id)
      return <tr key={id} data-product={id}><th><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel></th><td>{number(replayTotal(p, 0))}</td><td>{number(replayTotal(p, 1))}</td><td>{monthRange(p.selection.holdout_start, p.selection.holdout_end)}</td></tr>
    })}</tbody></table>
    <Note key={String(simulate)}>{simulate ? "C/D mejoran; E no cambia. No mide faltantes reales ni ahorro." : "Recepción a siete días; saldos arrastrados. No representa la reposición real."}</Note>
  </Slide>
  return <Slide>
    <Flow items={[
      { title: "Decidir cada mes", text: "Previsión disponible y saldo simulado al origen." },
      { title: "Recibir a plazo", text: "Ingreso después de siete días, antes del retiro diario." },
      { title: "Evaluar retiros", text: "Ventas posteriores solo para evaluar, no para decidir." },
      { title: "Arrastrar saldos", text: "El inventario pasa al siguiente día y mes." },
    ]} />
    <div className="replay-products">{productIds.map((id) => <ProductLabel id={id} key={id}>{BUSINESS[id].shortName}</ProductLabel>)}</div>
    <p className="small-explanation">Misma política, seis meses finales por producto. Sin ingresos históricos añadidos como suministro.</p>
  </Slide>
}

function Status() {
  return <Slide>
    <div className="status-columns"><div><h3>Lo implementado</h3><ul><li>Cinco productos y {number(portfolio.movementCount)} movimientos.</li><li>Hasta {portfolio.modelCount} métodos por serie.</li><li>{portfolio.scenarioCount} escenarios y replay diario.</li><li>Pruebas y resultados originales conservados.</li></ul></div><div><h3>Límites y condiciones</h3><ul><li>Stock físico actual pendiente.</li><li>Restricciones compartidas sin verificar.</li><li>Costos completos pendientes.</li><li>Sin órdenes vigentes ni ahorro demostrado.</li></ul></div></div>
  </Slide>
}

function Conclusions() {
  return <Slide className="conclusions-slide">
    <div className="product-findings">{[
      ["A", `${number(product("A").inventory.bookkeeping_units_over_trailing12_monthly_sales, 2)} meses equivalentes de venta pasada; saldo alto.`],
      ["B", "Repetir el último mes supera al modelo fijado."],
      ["C", `Ventas frecuentes; WAPE de ${percent(score("C", product("C").selection.model).wape)}.`],
      ["D", "Alta variación; Ridge no supera al último mes."],
      ["E", "Ventas intermitentes; predecir cero no asegura disponibilidad."],
    ].map(([id, text], index) => <div key={id} style={{ "--i": index }}><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel><p>{text}</p></div>)}</div>
    <p className="conclusion-record">{number(portfolio.movementCount)} movimientos preservados · Hasta {portfolio.modelCount} métodos · {portfolio.scenarioCount} escenarios calculados</p>
  </Slide>
}

function ModelAppendix() {
  return <Slide>
    <table className="comparison-table appendix-models portfolio-table"><thead><tr><th>Producto y método fijado</th><th>MAE</th><th>RMSE</th><th>WAPE</th><th>Sesgo medio</th><th>Meses</th></tr></thead><tbody>{productIds.map((id) => {
      const model = product(id).selection.model
      const s = score(id, model)
      return <tr key={`${id}-${model}`}><th>{id} · {MODEL_NAMES[model]}</th><td>{number(s.mae, 2)}</td><td>{number(s.rmse, 2)}</td><td>{percent(s.wape)}</td><td>{s.bias > 0 ? "+" : ""}{number(s.bias, 2)}</td><td>{s.origins}</td></tr>
    })}</tbody></table>
    <Note>MAE y RMSE en unidades. WAPE mide el error porcentual sobre el volumen real. Sesgo positivo indica sobreestimación.</Note>
  </Slide>
}

function AssumptionsAppendix() {
  return <Slide>
    <table className="comparison-table assumptions-table"><thead><tr><th>Parámetro del escenario</th><th>Valor utilizado</th></tr></thead><tbody>
      <tr><th>Conversión mensual</th><td>30 días calendario por mes</td></tr><tr><th>Plazo de entrega y revisión</th><td>7 días de reposición y revisión cada 30 días</td></tr>
      <tr><th>Días de producción asignados</th><td>1 o 5 días por producto</td></tr><tr><th>Stock de seguridad</th><td>Cero o un mes de demanda estimada</td></tr>
      <tr><th>Pedidos y reservas</th><td>Sin órdenes abiertas ni atrasos</td></tr><tr><th>Lote y capacidad</th><td>Lotes de 1 unidad, sin límites de almacén</td></tr>
      <tr><th>Ritmo reportado, no máximo verificado</th><td>A ≈ 800; B ≈ 210; C ≈ 300; D ≈ 480; E ≈ 30 a 35</td></tr>
    </tbody></table>
  </Slide>
}

export const SLIDES = [
  { id: "portada", C: Cover, ch: "01 · La decisión de negocio" },
  { id: "negocio", C: Business, ch: "01 · La decisión de negocio" },
  { id: "decision", C: Decision, ch: "01 · La decisión de negocio" },
  { id: "productos", C: Products, ch: "01 · La decisión de negocio" },
  { id: "propuesta", C: Scope, ch: "01 · La decisión de negocio" },
  { id: "origen", C: Origin, ch: "02 · Construir una base confiable" },
  { id: "trazabilidad", C: Traceability, ch: "02 · Construir una base confiable" },
  { id: "calidad", C: Quality, ch: "02 · Construir una base confiable" },
  { id: "muestra", C: Sample, ch: "02 · Construir una base confiable" },
  { id: "tendencia", C: Trend, ch: "03 · Lo que cambió en las ventas" },
  { id: "canales", C: Channels, ch: "03 · Lo que cambió en las ventas" },
  { id: "variabilidad", C: Variability, ch: "03 · Lo que cambió en las ventas" },
  { id: "estacionalidad", C: Seasonality, ch: "03 · Lo que cambió en las ventas" },
  { id: "inventario", C: Inventory, ch: "03 · Lo que cambió en las ventas" },
  { id: "demanda", C: Demand, ch: "03 · Lo que cambió en las ventas" },
  { id: "variables", C: Features, ch: "04 · Poner a prueba los pronósticos" },
  { id: "modelos-referencias", C: BaselineLesson, ch: "04 · Entender los modelos" },
  { id: "regresion", C: RegressionLesson, ch: "04 · Entender los modelos" },
  { id: "modelos-arboles", C: TreesLesson, ch: "04 · Entender los modelos" },
  { id: "validacion", C: Validation, ch: "04 · Poner a prueba los pronósticos" },
  { id: "seleccion", C: Selection, ch: "04 · Poner a prueba los pronósticos" },
  { id: "resultado-a", C: Results, ch: "04 · Poner a prueba los pronósticos" },
  { id: "resultado-b", C: Intermittency, ch: "04 · Poner a prueba los pronósticos" },
  { id: "errores", C: Errors, ch: "04 · Poner a prueba los pronósticos" },
  { id: "fallo", C: Failure, ch: "04 · Poner a prueba los pronósticos" },
  { id: "controles", C: Safeguards, ch: "04 · Poner a prueba los pronósticos" },
  { id: "planificacion", C: Planning, ch: "05 · Llevar la evidencia a producción" },
  { id: "escenario-b", C: Scenarios, ch: "05 · Llevar la evidencia a producción" },
  { id: "escenario-a", C: ProductionReplay, ch: "05 · Llevar la evidencia a producción" },
  { id: "estado", C: Status, ch: "05 · Llevar la evidencia a producción" },
  { id: "respaldo-modelos", C: ModelAppendix, ch: "06 · Evidencia de pronóstico" },
  { id: "respaldo-supuestos", C: AssumptionsAppendix, ch: "07 · Supuestos operativos" },
  { id: "conclusiones", C: Conclusions, ch: "08 · Resultados y conclusiones" },
]
