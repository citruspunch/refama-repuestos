import React from "react"
import { BUSINESS, MODEL_NAMES, month, number, percent, price } from "./business.js"
import { useCueState, usePresentation } from "./PresentationContext.jsx"
import { CalendarHeatmap, ForecastChart, ModelBars, SalesChart, TrendPanel, product, score } from "./Charts.jsx"
import { Flow, Metric, Note, ProductLabel, Rows, Slide } from "./ui.jsx"

const RESULT_MODELS = {
  A: ["ridge", "naive", "moving_average_3", "linear_regression"],
  B: ["moving_average_3", "naive", "random_forest", "ridge"],
}

function Cover() {
  const { title } = usePresentation()
  const [headline, emphasis] = title.split(" RUJAF")
  return <section className="slide cover">
    <div className="cover-kicker">
      <span>RUJAF / Refama</span>
    </div>
    <div className="cover-main">
      <div className="cover-copy">
        <h1>{headline}{" "}<span>RUJAF{emphasis}</span></h1>
        <p className="cover-summary">Análisis de ventas y predicción de demanda para dos productos de RUJAF.</p>
        <div className="cover-pills">
          <span className="pill">1,062 movimientos</span>
          <span className="pill">13 modelos evaluados</span>
          <span className="pill">8 escenarios de planta</span>
        </div>
      </div>
      <div className="cover-visual">
        <figure className="cover-chart">
          <figcaption>
            <div className="cover-register">
              <ProductLabel id="A">{BUSINESS.A.code}</ProductLabel>
              <span className="label">Kardex / RUJAF</span>
            </div>
            <p>Historial mensual del producto A</p>
          </figcaption>
          <SalesChart id="A" compact color="#d4953a" />
          <div className="cover-chart-footer">
            <p>Ventas mensuales registradas · unidades</p>
            <span className="cover-chart-badge">50 meses</span>
          </div>
        </figure>
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
      <div className="business-source"><span className="label">Fabricación y mayoreo</span><strong>RUJAF</strong><p>Inventario central de producto terminado.<br />Kardex de origen.</p></div>
      <div className="business-branches" aria-hidden="true"><span>Despachos</span><div /></div>
      <div className="business-destinations">
        <div><strong>Refama</strong><p>Tiendas de venta al detalle.<br />Los despachos no son consumo final.</p></div>
        <div><strong>Otros clientes</strong><p>Ventas mayoristas registradas en Kardex.</p></div>
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
  return <Slide>
    <div className="product-pair">{["A", "B"].map((id) => <article className={`product-sheet product-${id.toLowerCase()}`} key={id}>
      <ProductLabel id={id}>{BUSINESS[id].code}</ProductLabel><h3>{BUSINESS[id].name}</h3>
      <dl className="product-specs">
        <div><dt>Precio neto por unidad</dt><dd>{price(BUSINESS[id].netSellingPrice)}</dd></div>
        <div><dt>Producción aproximada por día<small>unidades por día de trabajo</small></dt><dd>≈ {number(BUSINESS[id].reportedUnitsPerProductionDay)}</dd></div>
      </dl>
    </article>)}</div>
  </Slide>
}

function Scope() {
  return <Slide>
    <Flow items={[
      { title: "Kardex", text: "1,062 movimientos validados y trazables." },
      { title: "Modelos", text: "13 métodos comparados con datos reales." },
      { title: "Inventario", text: "Saldos en bodega frente a ventas recientes." },
      { title: "Planificación", text: "8 escenarios con supuestos explícitos." },
    ]} />
  </Slide>
}

function Origin() {
  return <Slide>
    <div className="split"><div className="pdf-stack"><div className="pdf-sheet"><span>KARDEX · PRODUCTO A</span><b>13 páginas</b><div className="pdf-lines" /></div><div className="pdf-sheet"><span>KARDEX · PRODUCTO B</span><b>10 páginas</b><div className="pdf-lines" /></div></div>
      <Rows items={[
        ["Lectura directa", "Extracción de texto y tablas desde los PDF del Kardex, sin OCR."],
        ["Trazabilidad por fila", "Registro de fecha original, página y orden de cada movimiento."],
        ["Tipos de movimiento", "Separación de ventas, producción, compras, ajustes y devoluciones."],
      ]} />
    </div>
  </Slide>
}

function Traceability() {
  return <Slide>
    <div className="trace-summary"><Metric value="1,062" label="movimientos preservados" /><p>583 del producto A · 479 del producto B<br />Consolidado sin duplicación.</p></div>
    <Flow items={[
      { title: "Archivos fuente", text: "Control de integridad con huellas SHA-256." },
      { title: "Validación", text: "Comprobación de fechas, cantidades y saldos." },
      { title: "Series mensuales", text: "105 de 105 meses conciliados sin diferencias." },
    ]} />
  </Slide>
}

function Quality() {
  return <Slide>
    <div className="split"><div><Metric value="1,060" label="transiciones verificadas" /><p className="large-caption">Sin diferencias aritméticas en saldos.</p></div>
      <div className="quality-list"><div><strong>2</strong><span>Saldos negativos</span></div><div><strong>23</strong><span>Ajustes</span></div><div><strong>10</strong><span>Eventos con saldo cero</span></div><p>Movimientos conciliados contablemente que requieren revisión operativa.</p></div>
    </div>
  </Slide>
}

function Sample() {
  return <Slide>
    <div className="split"><Rows items={[
      ["Objetivo", "Salidas registradas como VENTA por RUJAF."],
      ["Canales", "Despachos a Refama y ventas a otros clientes."],
      ["Exclusiones", "Ajustes, producción interna, compras y devoluciones."],
    ]} /><div className="sample-periods">{["A", "B"].map((id) => <div key={id}>
      <ProductLabel id={id}>Período para modelos</ProductLabel><strong>{product(id).summary.complete_months} meses</strong><p>Julio de 2022 a {id === "A" ? "agosto" : "septiembre"} de 2026</p>
    </div>)}<p className="boundary-note">Primer y último mes excluidos por cobertura incompleta.</p></div></div>
  </Slide>
}

function Trend() {
  return <Slide>
    <div className="two-charts"><TrendPanel id="A" /><TrendPanel id="B" /></div>
  </Slide>
}

function Channels() {
  return <Slide>
    <p className="chart-intro">Promedio mensual de los últimos 12 meses frente a los primeros 12 meses analizados.</p>
    <table className="comparison-table channels-table"><thead><tr><th>Producto</th><th>Despachos a Refama</th><th>Otros clientes</th><th>Total RUJAF</th></tr></thead><tbody>{["A", "B"].map((id) => {
      const stream = (scenario) => product(id).streams.find((row) => row.scenario === scenario)
      return <tr key={id}><th><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel></th>{["refama", "other", "combined"].map((scenario) => <td key={scenario}>{percent(stream(scenario).last_12_vs_first_12)}</td>)}</tr>
    })}</tbody></table>
    <div className="channel-shares">{["A", "B"].map((id) => {
      const share = product(id).channels.find((row) => row.scenario === "refama").all_observed_sales_units / product(id).summary.all_observed_sales_units
      return <div key={id}><div className="share-caption"><span>Participación de Refama en {id}</span><strong>{percent(share)}</strong></div><div className="share-bar"><span style={{ width: `${share * 100}%`, background: BUSINESS[id].color }} /></div></div>
    })}</div>
  </Slide>
}

function Variability() {
  return <Slide>
    <table className="comparison-table variability-table"><thead><tr><th>Indicador histórico</th><th>Producto A</th><th>Producto B</th></tr></thead><tbody>
      <tr><th>Promedio mensual, unidades</th>{["A", "B"].map((id) => <td key={id}>{number(product(id).summary.monthly_mean, 2)}</td>)}</tr>
      <tr><th>Variación relativa (CV)</th>{["A", "B"].map((id) => <td key={id}>{number(product(id).summary.monthly_cv, 2)}</td>)}</tr>
      <tr><th>Volumen en el 10% de pedidos mayores</th>{["A", "B"].map((id) => <td key={id}>{percent(product(id).summary.top_10pct_orders_share)}</td>)}</tr>
      <tr><th>Rango mensual, unidades</th>{["A", "B"].map((id) => <td key={id}>{number(product(id).summary.monthly_min)} a {number(product(id).summary.monthly_max)}</td>)}</tr>
    </tbody></table>
    <p className="small-explanation">El producto A presenta mayor variación mensual y pedidos más concentrados.</p>
  </Slide>
}

function Seasonality() {
  return <Slide className="seasonality-slide">
    <div className="heatmaps"><CalendarHeatmap id="A" /><CalendarHeatmap id="B" /></div>
    <p className="calendar-legend">Ventas mensuales por año. Las ventas no muestran patrones estacionales estables.</p>
  </Slide>
}

function Inventory() {
  return <Slide>
    <div className="inventory-pair">{["A", "B"].map((id) => {
      const inventory = product(id).inventory
      return <article key={id} className={`inventory-reading product-${id.toLowerCase()}`}><ProductLabel id={id}>Inventario registrado</ProductLabel>
        <strong className="inventory-ratio">{number(inventory.bookkeeping_units_over_trailing12_monthly_sales, 2)}</strong>
        <p>Meses equivalentes de venta<br />según los últimos 12 meses</p>
        <dl><div><dt>Saldo en bodega</dt><dd>{number(inventory.aligned_closing_balance)} unidades</dd></div><div><dt>Venta mensual reciente</dt><dd>{number(inventory.trailing_12_mean_sales, 2)} u./mes</dd></div><div><dt>Fecha de corte</dt><dd>{id === "A" ? "31 de agosto de 2026" : "30 de septiembre de 2026"}</dd></div></dl>
      </article>
    })}</div>
  </Slide>
}

function Demand() {
  return <Slide>
    <div className="demand-flow"><div><span className="label">Demanda no observada</span><h3>Pedidos de clientes</h3><p>Incluye pedidos no atendidos por falta de inventario.</p></div><div className="demand-filter"><h3>Disponibilidad</h3><p>Limita las ventas reales que se logran despachar.</p></div><div><span className="label">Objetivo del modelo</span><h3>Ventas en Kardex</h3><p>Salidas registradas efectivamente por RUJAF.</p></div></div>
  </Slide>
}

function Features() {
  const recent = product("A").monthly.filter((row) => row.complete_for_modeling).slice(-3)
  return <Slide>
    <p className="chart-intro">Ejemplo del producto A para predecir septiembre de 2026, con datos hasta agosto.</p>
    <div className="feature-history">{recent.map((row) => <div key={row.month}><span>{month(row.month, false)}</span><strong>{number(row.sales_units)}</strong><small>unidades</small></div>)}<div className="feature-mean"><span>Promedio de 3 meses</span><strong>{number(recent.reduce((sum, row) => sum + row.sales_units, 0) / 3)}</strong><small>variable explicativa, no predicción</small></div></div>
    <div className="feature-fields"><h3>Siete variables para los modelos</h3><p>Tres meses anteriores de ventas · Promedio de 3 meses · Tendencia temporal · Dos señales de calendario</p></div>
  </Slide>
}

function Regression() {
  return <Slide>
    <Flow items={[
      { title: "Variables previas" },
      { title: "Entrenamiento" },
      { title: "Predicción" },
    ]} />
    <div className="regression-details"><div><h3>Regresión lineal</h3><p>Pondera las variables predictivas según su relación histórica con las ventas.</p></div><div><h3>Regresión Ridge</h3><p>Aplica una penalización a los coeficientes para evitar ajustes extremos.</p></div></div>
    <p className="small-explanation">Estandarización de variables dentro de cada período de entrenamiento.</p>
  </Slide>
}

function Methods() {
  return <Slide>
    <div className="method-families">
      <div><strong>5</strong><h3>Referencias simples</h3><p>Mes anterior, mismo mes del año previo y promedios de 3, 6 meses e histórico.</p></div>
      <div><strong>2</strong><h3>Regresiones</h3><p>Lineal clásica y regularizada con Ridge.</p></div>
      <div><strong>4</strong><h3>Series de tiempo</h3><p>Nivel, tendencia amortiguada, estacional y SARIMA.</p></div>
      <div><strong>2</strong><h3>Árboles de decisión</h3><p>Bosque aleatorio y árboles con aumento gradual.</p></div>
    </div>
  </Slide>
}

function Validation() {
  const [test] = useCueState("prueba", false)
  return <Slide>
    <div className="validation-timeline">{["A", "B"].map((id) => <div className="timeline-product" key={id}>
      <ProductLabel id={id}>{product(id).summary.complete_months} meses analizados</ProductLabel>
      <div className="timeline-track" aria-label={`Producto ${id}: 24 meses iniciales, ${product(id).selection.n_validation} meses de validación y 6 de prueba final`}>
        <div className="training" style={{ flex: 24 }}>24 iniciales</div><div className="validation" style={{ flex: product(id).selection.n_validation }}>{product(id).selection.n_validation} de validación</div><div className={`testing ${test ? "highlight" : ""}`} style={{ flex: 6 }}>6 finales</div>
      </div><p>Prueba final · {id === "A" ? "marzo a agosto" : "abril a septiembre"} de 2026.</p>
    </div>)}</div>
    <Note key={String(test)} warning={test}>{test ? "Seis meses reservados para la prueba final, respetando el orden del tiempo." : "Entrenamiento progresivo mes a mes para calibrar y seleccionar modelos."}</Note>
  </Slide>
}

function Selection() {
  return <Slide>
    <p className="selection-rule">Si un modelo más simple queda a menos del <strong>5%</strong> de diferencia en MAE, se prefiere su uso.</p>
    <table className="comparison-table selection-table"><thead><tr><th>Producto</th><th>Menor MAE</th><th>Modelo seleccionado</th><th>MAE de validación</th></tr></thead><tbody>{["A", "B"].map((id) => {
      const selection = product(id).selection
      return <tr key={id}><th>{id}</th><td><span>{MODEL_NAMES[selection.best_raw_mae_model]}</span><b>{number(selection.best_validation_mae, 2)}</b></td><td>{MODEL_NAMES[selection.model]}</td><td>{number(selection.selected_validation_mae, 2)}</td></tr>
    })}</tbody></table>
  </Slide>
}

function ResultA() {
  const selected = score("A", "ridge")
  return <Slide>
    <div className="split result-layout"><div><ProductLabel id="A">Modelo seleccionado · Ridge</ProductLabel><Metric value={number(selected.mae, 2)} label="MAE, unidades por mes" tone="a" /><p className="result-delta">{percent(selected.mae_skill_vs_naive)} menor error que el mes anterior.</p></div>
      <ModelBars id="A" models={RESULT_MODELS.A} /></div>
    <p className="small-explanation">El promedio de 3 meses y la regresión lineal tuvieron menor error final, pero se conservó la selección de validación.</p>
  </Slide>
}

function ResultB() {
  return <Slide>
    <div className="split result-layout"><div><ProductLabel id="B">Modelo seleccionado · Promedio 3 meses</ProductLabel><Metric value={number(score("B", "moving_average_3").mae, 2)} label="MAE, unidades por mes" tone="b" /><p className="result-delta">Repetir el mes anterior · {number(score("B", "naive").mae, 2)} u./mes.</p></div>
      <ModelBars id="B" models={RESULT_MODELS.B} /></div>
    <p className="small-explanation">En este producto, una regla simple como repetir el mes anterior superó al modelo seleccionado.</p>
  </Slide>
}

function Errors() {
  return <Slide className="error-slide">
    <div className="chart-legend"><span><i className="actual-key" />Venta real registrada</span><span><i className="selected-key" />Modelo seleccionado</span><span><i className="naive-key" />Mes anterior</span></div>
    <div className="two-charts">{["A", "B"].map((id) => {
      const selected = score(id, product(id).selection.model)
      return <figure className="chart-panel" key={id}><ProductLabel id={id}>Unidades por mes</ProductLabel><ForecastChart id={id} />
        <figcaption className="error-caption"><strong>WAPE {percent(selected.wape)}</strong><span>Sesgo medio {selected.bias > 0 ? "+" : ""}{number(selected.bias, 2)} unidades</span></figcaption>
      </figure>
    })}</div>
  </Slide>
}

function Failure() {
  const [contrast] = useCueState("contraste", false)
  const forecast = product("A").forecast
  return <Slide>
    <div className="failure-chain"><div><span>Ridge sin recorte, unidades</span><strong>{number(forecast.raw_forecast_units, 2)}</strong><p>Predicción menor a cero</p></div><span className="chain-arrow" aria-hidden="true">→</span><div><span>Salida ajustada, unidades</span><strong>0</strong><p>No refleja demanda real</p></div></div>
    <Note key={String(contrast)} warning>{contrast ? `${number(forecast.units_already_in_unconfirmed_boundary)} unidades ya vendidas en el registro parcial de septiembre. El modelo predijo cero por error.` : "El ajuste automático a cero oculta que el modelo produjo un valor negativo."}</Note>
  </Slide>
}

function Safeguards() {
  return <Slide>
    <Flow items={[
      { title: "Validación", text: "Detección de valores negativos, recortes a cero o fallos de cálculo." },
      { title: "Comparación", text: "Contraste con el promedio de ventas de los últimos 3 meses." },
      { title: "Respaldo", text: "Uso del promedio móvil si la predicción principal no es válida." },
      { title: "Alerta", text: "Bloqueo del cálculo si el modelo de respaldo también presenta fallas." },
    ]} />
    <div className="guard-example"><ProductLabel id="A">Respaldo provisional</ProductLabel><strong>{number(product("A").guard.effective_forecast_units)} unidades</strong><p>Estimación de contingencia para escenarios.</p></div>
  </Slide>
}

function Planning() {
  return <Slide>
    <div className="planning-inputs"><div><h3>Predicción de ventas</h3><p>Volumen estimado, margen de incertidumbre y validez del dato.</p></div><div><h3>Inventario disponible</h3><p>Existencias en bodega, reservas y pedidos pendientes.</p></div><div><h3>Capacidad de planta</h3><p>Tiempos de entrega, lotes y días de trabajo disponibles.</p></div></div>
  </Slide>
}

function ScenarioB() {
  const { guided } = usePresentation()
  const [safety, setSafety] = useCueState("seguridad", 0)
  const [days, setDays] = useCueState("dias", 1)
  const variants = [0, 1].map((stock) => product("B").production.find((entry) => entry.assumed_safety_stock_months === stock && entry.assumed_available_production_days === days))
  const baseline = variants[0]
  return <Slide className="scenario-slide">
    <div className="scenario-context"><ProductLabel id="B">Octubre de 2026</ProductLabel><span>Saldo al 30/09/2026 · {days} {days === 1 ? "día asignado" : "días asignados"}</span></div>
    <dl className="scenario-baseline">
      <div><dt>Saldo histórico</dt><dd>{number(baseline.recorded_on_hand_units)} <small>u.</small></dd></div>
      <div><dt>Pronóstico provisional</dt><dd>{number(baseline.expected_monthly_outgoing_units, 2)} <small>u./mes</small></dd></div>
      <div><dt>Ritmo supuesto</dt><dd>{number(baseline.assumed_units_per_production_day)} <small>u./día productivo</small></dd></div>
    </dl>
    <table className="comparison-table scenario-table"><caption className="sr-only">Comparación de dos supuestos de seguridad. La fila resaltada corresponde al paso seleccionado.</caption>
      <thead><tr><th>Seguridad supuesta</th><th>Objetivo, u.</th><th>Producción, u.</th><th>Días teóricos</th></tr></thead>
      <tbody>{variants.map((row) => {
        const selected = row.assumed_safety_stock_months === safety
        return <tr key={row.assumed_safety_stock_months} className={selected ? "is-current" : ""} aria-current={selected ? "step" : undefined}>
          <th>{row.assumed_safety_stock_months === 0 ? "Sin seguridad" : "1 mes"}<small>{number(row.safety_stock_units, 2)} u.</small></th>
          <td>{number(row.production_trigger_units, 2)}</td><td><strong data-testid={selected ? "scenario-units" : undefined}>{number(row.suggested_production_units)}</strong></td><td>{number(row.estimated_production_days_required, 2)}</td>
        </tr>
      })}</tbody>
    </table>
    <div className="scenario-toolbar" hidden={guided}><label>Seguridad<select aria-label="Stock de seguridad supuesto" disabled={guided} value={safety} onChange={(event) => setSafety(Number(event.target.value))}><option value={0}>Sin seguridad</option><option value={1}>1 mes</option></select></label>
      <label>Días asignados<select aria-label="Días de producción asignados" disabled={guided} value={days} onChange={(event) => setDays(Number(event.target.value))}><option value={1}>1 día</option><option value={5}>5 días</option></select></label><p>Consulta de resultados archivados.</p></div>
  </Slide>
}

function ScenarioA() {
  const row = product("A").production.find((entry) => entry.assumed_safety_stock_months === 0 && entry.assumed_available_production_days === 1)
  return <Slide>
    <div className="split"><div className="scenario-a-stock"><ProductLabel id="A">Saldo histórico en bodega</ProductLabel><Metric value={number(row.recorded_on_hand_units)} label="unidades registradas" tone="a" /><p>Ventas estimadas · {number(row.expected_monthly_outgoing_units)} u./mes.<br />Inventario objetivo · {number(row.production_trigger_units, 2)} u.</p></div>
      <div className="scenario-a-result"><strong>{row.suggested_production_units}</strong><h3>unidades adicionales necesarias</h3><p>La producción sugerida es cero porque el inventario actual cubre la demanda esperada.</p></div></div>
  </Slide>
}

function Status() {
  return <Slide>
    <div className="status-columns"><div><h3>Lo implementado</h3><ul><li>1,062 movimientos de Kardex validados.</li><li>13 modelos de predicción evaluados.</li><li>8 escenarios de producción calculados.</li><li>Pipeline reproducible con pruebas automatizadas.</li></ul></div><div><h3>Límites y condiciones</h3><ul><li>Inventario físico en bodega pendiente de auditoría.</li><li>Restricciones de planta basadas en supuestos.</li><li>Sin costos de fabricación para medir ahorro financiero.</li><li>Requiere validación previa antes de operar en planta.</li></ul></div></div>
  </Slide>
}

function Conclusions() {
  return <Slide className="conclusions-slide">
    <div className="conclusion-findings">
      <div><h3>Ventas históricas</h3><p>Descenso continuo en ambos repuestos, con mayor variación y concentración de pedidos en el producto A.</p></div>
      <div><h3>Modelos predictivos</h3><p>Los modelos de aprendizaje automático no superaron con claridad a reglas simples como el mes anterior.</p></div>
      <div><h3>Planificación</h3><p>Los escenarios muestran cuándo pausar producción por exceso de stock y cómo cuantificar márgenes de seguridad.</p></div>
    </div>
    <p className="conclusion-record">1,062 movimientos preservados · 13 métodos evaluados · 8 escenarios calculados</p>
  </Slide>
}

function ModelAppendix() {
  return <Slide>
    <table className="comparison-table appendix-models"><thead><tr><th>Producto y método</th><th>MAE</th><th>RMSE</th><th>WAPE</th><th>Sesgo medio</th><th>Meses</th></tr></thead><tbody>{["A", "B"].flatMap((id) => [product(id).selection.model, "naive"].map((model) => {
      const s = score(id, model)
      return <tr key={`${id}-${model}`}><th>{id} · {MODEL_NAMES[model]}</th><td>{number(s.mae, 2)}</td><td>{number(s.rmse, 2)}</td><td>{percent(s.wape)}</td><td>{s.bias > 0 ? "+" : ""}{number(s.bias, 2)}</td><td>{s.origins}</td></tr>
    }))}</tbody></table>
    <Note>MAE y RMSE en unidades. WAPE mide el error porcentual sobre el volumen real. Sesgo positivo indica sobreestimación.</Note>
  </Slide>
}

function AssumptionsAppendix() {
  return <Slide>
    <table className="comparison-table assumptions-table"><thead><tr><th>Parámetro del escenario</th><th>Valor utilizado</th></tr></thead><tbody>
      <tr><th>Conversión mensual</th><td>30 días calendario por mes</td></tr><tr><th>Plazo de entrega y revisión</th><td>7 días de reposición y revisión cada 30 días</td></tr>
      <tr><th>Días de producción asignados</th><td>1 o 5 días por producto</td></tr><tr><th>Stock de seguridad</th><td>Cero o un mes de demanda estimada</td></tr>
      <tr><th>Pedidos y reservas</th><td>Sin órdenes abiertas ni atrasos en el escenario base</td></tr><tr><th>Tamaño de lote y capacidad</th><td>Lotes de 1 unidad, sin límites máximos de almacén</td></tr>
      <tr><th>Producción aproximada por día</th><td>A ≈ 800; B ≈ 210 unidades por día de trabajo</td></tr>
    </tbody></table>
  </Slide>
}

function SourcesAppendix() {
  return <Slide>
    <div className="source-list">
      <div><h3>Extracción y calidad</h3><p>kardex_csv/LEEME.txt<br />reports/data_quality.md</p></div>
      <div><h3>Resultados de modelos</h3><p>reports/final_report.md<br />reports/tables/model_comparison.csv</p></div>
      <div><h3>Planificación y escenarios</h3><p>reports/tables/production_scenarios.csv<br />docs/production_planning.md</p></div>
      <div><h3>Código y pruebas</h3><p>src/inventory_demand/ · tests/<br />notebooks/01_exploratory_analysis.ipynb</p></div>
      <div><h3>Datos comerciales</h3><p>Precios netos y ritmos de planta<br />confirmados con la empresa.</p></div>
    </div>
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
  { id: "regresion", C: Regression, ch: "04 · Poner a prueba los pronósticos" },
  { id: "metodos", C: Methods, ch: "04 · Poner a prueba los pronósticos" },
  { id: "validacion", C: Validation, ch: "04 · Poner a prueba los pronósticos" },
  { id: "seleccion", C: Selection, ch: "04 · Poner a prueba los pronósticos" },
  { id: "resultado-a", C: ResultA, ch: "04 · Poner a prueba los pronósticos" },
  { id: "resultado-b", C: ResultB, ch: "04 · Poner a prueba los pronósticos" },
  { id: "errores", C: Errors, ch: "04 · Poner a prueba los pronósticos" },
  { id: "fallo", C: Failure, ch: "04 · Poner a prueba los pronósticos" },
  { id: "controles", C: Safeguards, ch: "04 · Poner a prueba los pronósticos" },
  { id: "planificacion", C: Planning, ch: "05 · Llevar la evidencia a producción" },
  { id: "escenario-b", C: ScenarioB, ch: "05 · Llevar la evidencia a producción" },
  { id: "escenario-a", C: ScenarioA, ch: "05 · Llevar la evidencia a producción" },
  { id: "estado", C: Status, ch: "05 · Llevar la evidencia a producción" },
  { id: "conclusiones", C: Conclusions, ch: "06 · Resultados y conclusiones" },
  { id: "respaldo-modelos", C: ModelAppendix, ch: "Anexo · Evidencia de pronóstico" },
  { id: "respaldo-supuestos", C: AssumptionsAppendix, ch: "Anexo · Supuestos operativos" },
  { id: "respaldo-fuentes", C: SourcesAppendix, ch: "Anexo · Trazabilidad" },
]
