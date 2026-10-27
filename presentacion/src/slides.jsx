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
  const [headline, emphasis] = title.split(" con datos")
  return <section className="slide cover">
    <div className="cover-kicker"><span>RUJAF / Refama</span></div>
    <div className="cover-main">
      <div className="cover-copy"><h1>{headline}{" "}<span>con datos{emphasis}</span></h1>
        <p className="cover-summary">Evaluación de pronósticos y escenarios históricos para dos componentes automotrices.</p>
      </div>
      <div className="cover-visual">
        <figure className="cover-chart"><figcaption>
          <div className="cover-register"><ProductLabel id="A">{BUSINESS.A.code}</ProductLabel><span className="label">Kardex / RUJAF</span></div>
          <p>Historial mensual del producto A</p>
        </figcaption><SalesChart id="A" compact /><p>Ventas mensuales registradas · unidades</p></figure>
      </div>
    </div>
    <div className="cover-footer"><p className="cover-context">RUJAF · Fabricación y mayoreo en Guatemala.<br />Análisis al 26 de octubre de 2026.</p><p className="cover-scope">Análisis histórico.<br />Sin órdenes automáticas.</p></div>
  </section>
}

function Business() {
  return <Slide takeaway="Los despachos a Refama no son ventas al consumidor final.">
    <div className="business-diagram">
      <div className="business-source"><span className="label">Fabricación y mayoreo</span><strong>RUJAF</strong><p>Inventario de producto terminado.<br />Kardex de origen.</p></div>
      <div className="business-branches" aria-hidden="true"><span>Despachos</span><div /></div>
      <div className="business-destinations"><div><strong>Refama</strong><p>Tiendas de venta al detalle</p></div><div><strong>Otros clientes</strong><p>Ventas mayoristas registradas</p></div></div>
    </div>
  </Slide>
}

function Decision() {
  return <Slide caveat="Estos riesgos no se cuantificaron como costos del negocio.">
    <div className="split decision-layout"><p className="statement">Ventas recientes<br />+ inventario disponible</p>
      <Rows items={[
        ["Exceso de producción", "Más inventario acumulado."],
        ["Producción insuficiente", "Riesgo de pedidos sin atender."],
      ]} />
    </div>
  </Slide>
}

function Products() {
  return <Slide caveat="Precios después de descuentos, no costos. Ritmos reportados, no capacidades verificadas.">
    <div className="product-pair">{["A", "B"].map((id) => <article className={`product-sheet product-${id.toLowerCase()}`} key={id}>
      <ProductLabel id={id}>{BUSINESS[id].code}</ProductLabel><h3>{BUSINESS[id].name}</h3>
      <dl className="product-specs">
        <div><dt>Precio neto por unidad</dt><dd>{price(BUSINESS[id].netSellingPrice)}</dd></div>
        <div><dt>Ritmo reportado<small>unidades por día de producción</small></dt><dd>≈ {number(BUSINESS[id].reportedUnitsPerProductionDay)}</dd></div>
      </dl>
    </article>)}</div>
  </Slide>
}

function Scope() {
  return <Slide caveat="Análisis histórico, sin órdenes automáticas.">
    <Flow items={[
      { title: "Kardex", text: "1,062 movimientos validados." },
      { title: "Pronósticos", text: "13 métodos con evaluación temporal." },
      { title: "Inventario", text: "Saldos frente a ventas recientes." },
      { title: "Producción", text: "8 escenarios con supuestos explícitos." },
    ]} />
  </Slide>
}

function Origin() {
  return <Slide caveat="CSV y procedencia conservados. Los PDF y el extractor original no están en el repositorio.">
    <div className="split"><div className="pdf-stack"><div className="pdf-sheet"><span>KARDEX · PRODUCTO A</span><b>13 páginas</b><div className="pdf-lines" /></div><div className="pdf-sheet"><span>KARDEX · PRODUCTO B</span><b>10 páginas</b><div className="pdf-lines" /></div></div>
      <Rows items={[
        ["Sin OCR", "Lectura de texto y tablas del PDF."],
        ["Procedencia por fila", "Fecha original, página y orden."],
        ["Movimientos separados", "Venta, producción, compra, ajuste y devolución."],
      ]} />
    </div>
  </Slide>
}

function Traceability() {
  return <Slide caveat="Registros y alertas preservados, sin eliminar pedidos grandes.">
    <div className="trace-summary"><Metric value="1,062" label="movimientos preservados" /><p>583 de A · 479 de B<br />Consolidado sin duplicación.</p></div>
    <Flow items={[
      { title: "CSV originales", text: "Huellas SHA-256." },
      { title: "Validación", text: "Fechas, cantidades y saldos." },
      { title: "Series mensuales", text: "105 de 105 totales conciliados." },
    ]} />
  </Slide>
}

function Quality() {
  return <Slide caveat="Consistencia contable, no confirmación del stock físico ni de ventas perdidas.">
    <div className="split"><div><Metric value="1,060" label="transiciones verificables" /><p className="large-caption">Sin diferencias aritméticas.</p></div>
      <div className="quality-list"><div><strong>2</strong><span>Saldos negativos</span></div><div><strong>23</strong><span>Ajustes</span></div><div><strong>10</strong><span>Eventos con saldo cero</span></div><p>Primera fila de cada producto sin saldo previo observable.</p></div>
    </div>
  </Slide>
}

function Sample() {
  return <Slide caveat="Meses interiores provisionalmente completos. Extremos desconocidos, no rellenados con ceros.">
    <div className="split"><Rows items={[
      ["Objetivo", "Salidas VENTA de RUJAF."],
      ["Canales", "Refama + otros clientes, sin duplicación."],
      ["Fuera del objetivo", "Ajustes, producción, compras y devoluciones."],
    ]} /><div className="sample-periods">{["A", "B"].map((id) => <div key={id}>
      <ProductLabel id={id}>Muestra para los modelos</ProductLabel><strong>{product(id).summary.complete_months} meses</strong><p>Julio de 2022 a {id === "A" ? "agosto" : "septiembre"} de 2026</p>
    </div>)}<p className="boundary-note">Primer y último mes excluidos por cobertura no confirmada.</p></div></div>
  </Slide>
}

function Trend() {
  return <Slide caveat="Ventanas comparables dentro de cada producto. El historial no identifica causas.">
    <div className="two-charts"><TrendPanel id="A" /><TrendPanel id="B" /></div>
  </Slide>
}

function Channels() {
  return <Slide caveat="Despachos de RUJAF, no consumo final de Refama.">
    <p className="chart-intro">Promedio mensual de los últimos 12 meses frente a los primeros 12 utilizables.</p>
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
  return <Slide takeaway="A presenta mayor variación y concentración por pedidos.">
    <table className="comparison-table variability-table"><thead><tr><th>Lectura del historial</th><th>Producto A</th><th>Producto B</th></tr></thead><tbody>
      <tr><th>Promedio mensual, u.</th>{["A", "B"].map((id) => <td key={id}>{number(product(id).summary.monthly_mean, 2)}</td>)}</tr>
      <tr><th>Variación relativa, CV</th>{["A", "B"].map((id) => <td key={id}>{number(product(id).summary.monthly_cv, 2)}</td>)}</tr>
      <tr><th>Volumen en el 10% de pedidos mayores</th>{["A", "B"].map((id) => <td key={id}>{percent(product(id).summary.top_10pct_orders_share)}</td>)}</tr>
      <tr><th>Rango mensual, u.</th>{["A", "B"].map((id) => <td key={id}>{number(product(id).summary.monthly_min)} a {number(product(id).summary.monthly_max)}</td>)}</tr>
    </tbody></table>
    <p className="small-explanation">Meses interiores; concentración con todos los pedidos observados.</p>
  </Slide>
}

function Seasonality() {
  return <Slide className="seasonality-slide" caveat="Señal armónica exploratoria · A q = 0.014; B q = 0.926. Sin estabilidad operativa confirmada.">
    <div className="heatmaps"><CalendarHeatmap id="A" /><CalendarHeatmap id="B" /></div>
    <p className="calendar-legend">Intensidad por producto; escalas independientes. s/d = fuera de muestra.</p>
  </Slide>
}

function Inventory() {
  return <Slide caveat="Cocientes históricos, no meses garantizados de cobertura ni stock físico actual.">
    <div className="inventory-pair">{["A", "B"].map((id) => {
      const inventory = product(id).inventory
      return <article key={id} className={`inventory-reading product-${id.toLowerCase()}`}><ProductLabel id={id}>Inventario contable</ProductLabel>
        <strong className="inventory-ratio">{number(inventory.bookkeeping_units_over_trailing12_monthly_sales, 2)}</strong>
        <p>Saldo / promedio mensual<br />de los últimos 12 meses</p>
        <dl><div><dt>Saldo alineado</dt><dd>{number(inventory.aligned_closing_balance)} unidades</dd></div><div><dt>Promedio reciente</dt><dd>{number(inventory.trailing_12_mean_sales, 2)} u./mes</dd></div><div><dt>Corte histórico</dt><dd>{id === "A" ? "31 de agosto de 2026" : "30 de septiembre de 2026"}</dd></div></dl>
      </article>
    })}</div>
  </Slide>
}

function Demand() {
  return <Slide caveat="Sin registros de pedidos no atendidos, las ventas perdidas no son cuantificables.">
    <div className="demand-flow"><div><span className="label">Observación incompleta</span><h3>Pedidos de clientes</h3><p>Incluye pedidos no atendidos.</p></div><div className="demand-filter"><h3>Disponibilidad</h3><p>Limita las ventas atendidas.</p></div><div><span className="label">Objetivo del modelo</span><h3>VENTA en el Kardex</h3><p>Salidas registradas por RUJAF.</p></div></div>
  </Slide>
}

function Features() {
  const recent = product("A").monthly.filter((row) => row.complete_for_modeling).slice(-3)
  return <Slide caveat="Sin ventas del mes objetivo. Inventario excluido del entrenamiento por incertidumbre del Kardex.">
    <p className="chart-intro">Ejemplo de A para septiembre de 2026, al cierre de agosto.</p>
    <div className="feature-history">{recent.map((row) => <div key={row.month}><span>{month(row.month, false)}</span><strong>{number(row.sales_units)}</strong><small>unidades</small></div>)}<div className="feature-mean"><span>Promedio de 3 meses</span><strong>{number(recent.reduce((sum, row) => sum + row.sales_units, 0) / 3)}</strong><small>variable, no pronóstico Ridge</small></div></div>
    <div className="feature-fields"><h3>Siete variables para regresión y árboles</h3><p>Tres ventas rezagadas · Un promedio rezagado · Tiempo · Dos señales de calendario</p></div>
  </Slide>
}

function Regression() {
  return <Slide caveat="Las relaciones aprendidas no identifican causas ni garantizan extrapolaciones válidas.">
    <Flow items={[
      { title: "Variables previas" },
      { title: "Ajuste" },
      { title: "Pronóstico" },
    ]} />
    <div className="regression-details"><div><h3>Regresión lineal</h3><p>Pesos para combinar las siete variables.</p></div><div><h3>Ridge</h3><p>Penalización de coeficientes extremos.</p></div></div>
    <p className="small-explanation">Estandarización dentro de cada entrenamiento.</p>
  </Slide>
}

function Methods() {
  return <Slide caveat="50 y 51 meses por serie. Configuraciones fijas, sin búsqueda masiva de parámetros.">
    <div className="method-families">
      <div><strong>5</strong><h3>Referencias simples</h3><p>Último mes, año anterior y promedios de 3, 6 meses e histórico.</p></div>
      <div><strong>2</strong><h3>Regresiones</h3><p>Lineal y Ridge.</p></div>
      <div><strong>4</strong><h3>Series temporales</h3><p>Nivel, tendencia amortiguada, estacional y SARIMA.</p></div>
      <div><strong>2</strong><h3>Árboles</h3><p>Bosque aleatorio y refuerzo gradual.</p></div>
    </div>
  </Slide>
}

function Validation() {
  const [test] = useCueState("prueba", false)
  return <Slide caveat="Entrenamiento creciente. Un mes por pronóstico; sin mezcla aleatoria.">
    <div className="validation-timeline">{["A", "B"].map((id) => <div className="timeline-product" key={id}>
      <ProductLabel id={id}>{product(id).summary.complete_months} meses utilizables</ProductLabel>
      <div className="timeline-track" aria-label={`Producto ${id}: 24 meses iniciales, ${product(id).selection.n_validation} orígenes de validación y 6 de prueba final`}>
        <div className="training" style={{ flex: 24 }}>24 iniciales</div><div className="validation" style={{ flex: product(id).selection.n_validation }}>{product(id).selection.n_validation} de validación</div><div className={`testing ${test ? "highlight" : ""}`} style={{ flex: 6 }}>6 finales</div>
      </div><p>Prueba final · {id === "A" ? "marzo a agosto" : "abril a septiembre"} de 2026.</p>
    </div>)}</div>
    <Note key={String(test)} warning={test}>{test ? "Seis meses finales para evaluar. Sin cambiar la selección." : "La validación permite seleccionar el método."}</Note>
  </Slide>
}

function Selection() {
  return <Slide caveat="MAE = error absoluto medio, unidades/mes. Selección anterior a la prueba final.">
    <p className="selection-rule">Hasta un <strong>5%</strong> más de MAE de validación para elegir un método más simple.</p>
    <table className="comparison-table selection-table"><thead><tr><th>Producto</th><th>Menor MAE</th><th>Método fijado</th><th>MAE fijado</th></tr></thead><tbody>{["A", "B"].map((id) => {
      const selection = product(id).selection
      return <tr key={id}><th>{id}</th><td><span>{MODEL_NAMES[selection.best_raw_mae_model]}</span><b>{number(selection.best_validation_mae, 2)}</b></td><td>{MODEL_NAMES[selection.model]}</td><td>{number(selection.selected_validation_mae, 2)}</td></tr>
    })}</tbody></table>
  </Slide>
}

function ResultA() {
  const selected = score("A", "ridge")
  return <Slide caveat="Marzo a agosto de 2026 · 6 orígenes. La diferencia no establece una ventaja robusta.">
    <div className="split result-layout"><div><ProductLabel id="A">Método fijado · Ridge</ProductLabel><Metric value={number(selected.mae, 2)} label="MAE, unidades/mes" tone="a" /><p className="result-delta">{percent(selected.mae_skill_vs_naive)} menos que el último mes.</p></div>
      <ModelBars id="A" models={RESULT_MODELS.A} /></div>
    <p className="small-explanation">Promedio de 3 meses y regresión lineal con menor MAE final. Sin reselección.</p>
  </Slide>
}

function ResultB() {
  return <Slide caveat="Abril a septiembre de 2026 · 6 orígenes. Selección conservada tras la prueba final.">
    <div className="split result-layout"><div><ProductLabel id="B">Método fijado · Promedio de 3 meses</ProductLabel><Metric value={number(score("B", "moving_average_3").mae, 2)} label="MAE, unidades/mes" tone="b" /><p className="result-delta">Último mes · {number(score("B", "naive").mae, 2)} u./mes.</p></div>
      <ModelBars id="B" models={RESULT_MODELS.B} /></div>
    <p className="small-explanation">El método fijado tuvo 9.3% más MAE que el último mes.</p>
  </Slide>
}

function Errors() {
  return <Slide className="error-slide" caveat="Sombreado = prueba final. WAPE no es porcentaje de acierto.">
    <div className="chart-legend"><span><i className="actual-key" />Venta registrada</span><span><i className="selected-key" />Método fijado</span><span><i className="naive-key" />Último mes</span></div>
    <div className="two-charts">{["A", "B"].map((id) => {
      const selected = score(id, product(id).selection.model)
      return <figure className="chart-panel" key={id}><ProductLabel id={id}>Unidades/mes</ProductLabel><ForecastChart id={id} />
        <figcaption className="error-caption"><strong>WAPE {percent(selected.wape)}</strong><span>Sesgo medio {selected.bias > 0 ? "+" : ""}{number(selected.bias, 2)} unidades</span></figcaption>
      </figure>
    })}</div>
  </Slide>
}

function Failure() {
  const [contrast] = useCueState("contraste", false)
  const forecast = product("A").forecast
  return <Slide caveat="Septiembre de 2026, con historial hasta agosto. Cobertura de septiembre no confirmada.">
    <div className="failure-chain"><div><span>Ridge sin recorte, unidades</span><strong>{number(forecast.raw_forecast_units, 2)}</strong><p>Extrapolación negativa</p></div><span className="chain-arrow" aria-hidden="true">→</span><div><span>Salida publicada, unidades</span><strong>0</strong><p>No es demanda cero</p></div></div>
    <Note key={String(contrast)} warning>{contrast ? `${number(forecast.units_already_in_unconfirmed_boundary)} unidades registradas en el septiembre parcial. Salida no válida para uso operativo.` : "El recorte no corrige la extrapolación."}</Note>
  </Slide>
}

function Safeguards() {
  return <Slide caveat="Diagnóstico posterior al experimento; sin evidencia independiente de mayor precisión.">
    <Flow items={[
      { title: "Validez", text: "Negativos, recortes, fallos y valores no finitos." },
      { title: "Contraste", text: "Comparación con los 3 meses previos." },
      { title: "Respaldo", text: "Promedio de 3 meses si falla el original." },
      { title: "Bloqueo", text: "Sin salida si el respaldo también falla." },
    ]} />
    <div className="guard-example"><ProductLabel id="A">Respaldo provisional</ProductLabel><strong>{number(product("A").guard.effective_forecast_units)} unidades</strong><p>Solo para escenarios, no órdenes.</p></div>
  </Slide>
}

function Planning() {
  return <Slide caveat="Cálculo por producto; no calendario conjunto de fábrica. Datos inválidos bloquean el cálculo.">
    <div className="planning-inputs"><div><h3>Pronóstico</h3><p>Origen, validez e incertidumbre.</p></div><div><h3>Inventario</h3><p>Stock libre, reservas y pedidos.</p></div><div><h3>Producción</h3><p>Plazo, lotes, ritmo y días disponibles.</p></div></div>
  </Slide>
}

function ScenarioB() {
  const { guided } = usePresentation()
  const [safety, setSafety] = useCueState("seguridad", 0)
  const [days, setDays] = useCueState("dias", 1)
  const variants = [0, 1].map((stock) => product("B").production.find((entry) => entry.assumed_safety_stock_months === stock && entry.assumed_available_production_days === days))
  const baseline = variants[0]
  return <Slide className="scenario-slide" caveat="Supuestos: 30 días/mes · plazo 7 días · revisión 30 días · lote 1 u. Sin reservas, órdenes ni atrasos. Escenarios históricos, no órdenes.">
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
  return <Slide caveat="31/08/2026 · 30 días/mes · plazo 7 días · revisión 30 días · sin seguridad. Resultado histórico, no orden.">
    <div className="split"><div className="scenario-a-stock"><ProductLabel id="A">Saldo histórico</ProductLabel><Metric value={number(row.recorded_on_hand_units)} label="unidades registradas" tone="a" /><p>Pronóstico provisional · {number(row.expected_monthly_outgoing_units)} u./mes.<br />Objetivo supuesto · {number(row.production_trigger_units, 2)} u.</p></div>
      <div className="scenario-a-result"><strong>{row.suggested_production_units}</strong><h3>unidades adicionales en el escenario</h3><p>Producción adicional cero, con ventas estimadas positivas.</p></div></div>
  </Slide>
}

function Status() {
  return <Slide caveat="132 pruebas de Python aprobadas en el borrador inicial. Validan lógica, no resultados comerciales.">
    <div className="status-columns"><div><h3>Ejecutado</h3><ul><li>1,062 movimientos validados.</li><li>13 métodos evaluados.</li><li>8 escenarios de producción.</li><li>CLI y cuaderno ejecutado.</li></ul></div><div><h3>Límites</h3><ul><li>Stock físico no confirmado.</li><li>Restricciones operativas supuestas.</li><li>Costos incompletos; servicio no medido.</li><li>Ahorros no demostrados.</li></ul><p className="status-stop">Uso en vivo bloqueado.</p></div></div>
  </Slide>
}

function Conclusions() {
  return <Slide className="conclusions-slide" caveat="Resultados históricos. Sin validación operativa ni ahorros demostrados.">
    <div className="conclusion-findings">
      <div><h3>Ventas registradas</h3><p>Descenso en ambos productos, con mayor variación y concentración de pedidos en A.</p></div>
      <div><h3>Pronósticos</h3><p>Sin ventaja robusta general del aprendizaje automático frente a referencias simples.</p></div>
      <div><h3>Producción</h3><p>Los escenarios distinguen el saldo alto de A y la sensibilidad de B al stock de seguridad.</p></div>
    </div>
    <p className="conclusion-record">1,062 movimientos preservados · 13 métodos evaluados · 8 escenarios calculados</p>
  </Slide>
}

function ModelAppendix() {
  return <Slide caveat="Prueba final. Intervalos exploratorios de mejora frente al último mes compatibles con cero.">
    <table className="comparison-table appendix-models"><thead><tr><th>Producto y método</th><th>MAE</th><th>RMSE</th><th>WAPE</th><th>Sesgo medio</th><th>Meses</th></tr></thead><tbody>{["A", "B"].flatMap((id) => [product(id).selection.model, "naive"].map((model) => {
      const s = score(id, model)
      return <tr key={`${id}-${model}`}><th>{id} · {MODEL_NAMES[model]}</th><td>{number(s.mae, 2)}</td><td>{number(s.rmse, 2)}</td><td>{percent(s.wape)}</td><td>{s.bias > 0 ? "+" : ""}{number(s.bias, 2)}</td><td>{s.origins}</td></tr>
    }))}</tbody></table>
    <Note>MAE y RMSE en unidades. WAPE relativo al volumen real. Sesgo positivo = sobrepronóstico.</Note>
  </Slide>
}

function AssumptionsAppendix() {
  return <Slide caveat="Supuestos por producto, no evidencia de factibilidad conjunta ni de servicio alcanzado.">
    <table className="comparison-table assumptions-table"><thead><tr><th>Entrada del escenario</th><th>Supuesto ejecutado</th></tr></thead><tbody>
      <tr><th>Conversión mensual</th><td>30 días calendario por mes</td></tr><tr><th>Plazo y revisión</th><td>7 días hasta recibir unidades buenas; revisión de 30 días</td></tr>
      <tr><th>Días productivos asignados</th><td>1 o 5 por producto</td></tr><tr><th>Stock de seguridad</th><td>Cero o un mes del pronóstico efectivo</td></tr>
      <tr><th>Pedidos, reservas y atrasos</th><td>Sin órdenes abiertas; reservas, restricciones y atrasos en cero</td></tr><tr><th>Lotes y límites adicionales</th><td>Lotes de 1 unidad; sin mínimo, tope adicional ni límite de almacén</td></tr>
      <tr><th>Ritmos reportados</th><td>A ≈ 800; B ≈ 210 unidades por día de producción</td></tr>
    </tbody></table>
  </Slide>
}

function SourcesAppendix() {
  return <Slide caveat="Detalle y tablas de consulta en GUION.md y EVIDENCIA.md.">
    <div className="source-list">
      <div><h3>Extracción y calidad</h3><p>kardex_csv/LEEME.txt<br />reports/data_quality.md</p></div>
      <div><h3>Resultados y evaluación</h3><p>reports/final_report.md<br />reports/tables/model_comparison.csv</p></div>
      <div><h3>Producción y controles</h3><p>reports/tables/production_scenarios.csv<br />docs/production_planning.md</p></div>
      <div><h3>Implementación y verificación</h3><p>src/inventory_demand/ · tests/<br />notebooks/01_exploratory_analysis.ipynb</p></div>
      <div><h3>Confirmación comercial</h3><p>Precios netos y ritmos reportados<br />confirmados en el encargo.</p></div>
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
