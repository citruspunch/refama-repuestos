import React from "react"
import { BUSINESS, MODEL_NAMES, month, number } from "./business.js"
import { useCueState, usePresentation } from "./PresentationContext.jsx"
import { ForecastChart, PortfolioSales, portfolio, product, productIds, score } from "./Charts.jsx"
import { evaluationSplit, forecastSeries, interiorMonths, productionVariant, replayTotal } from "./analysis.js"
import { Flow, InlineProduct, ProductLabel, Rows, Slide } from "./ui.jsx"
import { BaselineLesson, RegressionLesson } from "./ModelLessons.jsx"
import imgA from "../assets/UAH-90385-18025.jpeg"
import imgB from "../assets/48815-14050.jpeg"
import imgC from "../assets/UAH-33505-35020.jpeg"
import imgD from "../assets/90385-18046.jpeg"
import imgE from "../assets/17881-54820.jpeg"

const PRODUCT_IMAGES = {
  A: imgA,
  B: imgB,
  C: imgC,
  D: imgD,
  E: imgE,
}

function Cover() {
  const { title } = usePresentation()
  return <section className="slide cover">
    <div className="cover-kicker">
      <span>RUJAF / Refama</span>
      <span>{month(portfolio.analysisDate, false)}</span>
    </div>
    <div className="cover-main">
      <div className="cover-copy">
        <p className="cover-eyebrow">Investigación de Operaciones</p>
        <h1>{title}</h1>
        <p className="cover-summary">Pronóstico de ventas y planificación de inventarios a partir de datos históricos de RUJAF.</p>
        <p className="cover-scope-note">Cinco productos analizados entre 2022 y 2026.</p>
      </div>
      <div className="cover-visual">
        <div className="cover-products"><ol>{productIds.map((id, index) => <li key={id} style={{ "--i": index }}><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel></li>)}</ol></div>
      </div>
    </div>
    <div className="cover-footer">
      <div className="cover-authors">
        <p>Andrés Tobar · 23001175</p>
        <p>Samuel Marroquín · 23006593</p>
        <p>Jostyne Montenegro · 23003375</p>
      </div>
    </div>
  </section>
}

function Business() {
  return <Slide>
    <div className="business-diagram">
      <div className="business-card source">
        <span className="card-badge">Fabricación y mayoreo</span>
        <h3>RUJAF</h3>
        <p>Fabrica y distribuye repuestos automotrices desde una bodega central.</p>
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
          <p>Tiendas de venta al detalle.</p>
        </div>

        <div className="business-card destination wholesale">
          <h4>Otros clientes</h4>
          <p>Compradores mayoristas.</p>
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
  return <Slide className="products-slide">
    <table className="comparison-table portfolio-table product-inputs"><thead><tr><th>Repuesto</th><th>Producto analizado</th></tr></thead><tbody>{productIds.map((id) => {
      const item = BUSINESS[id]
      return <tr key={id}><td className="product-image-cell"><div className="product-image-wrapper"><img src={PRODUCT_IMAGES[id]} alt={item.shortName} className="product-thumb" /></div></td><th scope="row"><ProductLabel id={id}>{item.shortName}</ProductLabel></th></tr>
    })}</tbody></table>
  </Slide>
}

function Scope() {
  return <Slide>
    <Flow items={[
      { title: "Organizar las ventas", text: "Construir un historial mensual para cada producto." },
      { title: "Predecir", text: "Estimar las unidades que se venderán el mes siguiente." },
      { title: "Comparar", text: "Medir el error de los modelos con ventas posteriores." },
      { title: "Simular inventarios", text: "Estudiar cómo cambian las necesidades de reposición." },
    ]} />
  </Slide>
}

function Traceability() {
  return <Slide>
    <Flow items={[
      { title: "Recibir los Kardex", text: "Registros de entradas, salidas y saldos de cinco productos." },
      { title: "Pasar a tablas", text: "Convertir los PDF a CSV e integrar los CSV recibidos." },
      { title: "Revisar los datos", text: "Comprobar fechas, cantidades y tipos de movimiento." },
      { title: "Agrupar por mes", text: "Sumar las unidades vendidas de cada producto." },
    ]} />
  </Slide>
}

function Sample() {
  return <Slide>
    <div className="split"><Rows items={[
      ["Qué predecimos", "Unidades vendidas por producto en el mes siguiente."],
      ["Qué sumamos", "Despachos a Refama y ventas a otros clientes."],
      ["Qué dejamos fuera", "Entradas a bodega y movimientos que no son ventas."],
    ]} /><div className="sample-periods">{productIds.map((id) => {
      const data = interiorMonths(product(id))
      return <div key={id}><ProductLabel id={id}>{month(data[0].month)} a {month(data.at(-1).month)}</ProductLabel><strong>{data.length}<small> meses</small></strong></div>
    })}</div></div>
  </Slide>
}

function Trend() {
  return <Slide>
    <PortfolioSales />
  </Slide>
}

function Variability() {
  return <Slide>
    <table className="comparison-table portfolio-table"><thead><tr><th>Producto</th><th>Ventas entre meses</th><th>Meses sin ventas</th></tr></thead><tbody>{productIds.map((id) => {
      const p = product(id)
      return <tr key={id}><th><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel></th><td>{({ A: "Cambios grandes", B: "Más regulares", C: "Más regulares", D: "Cambios grandes", E: "Poco frecuentes" })[id]}</td><td>{p.profile.zero_periods} de {p.profile.usable_months}</td></tr>
    })}</tbody></table>
  </Slide>
}

function Inventory() {
  return <Slide>
    <table className="comparison-table portfolio-table"><thead><tr><th>Producto</th><th>Saldo, unidades</th><th>Venta media mensual</th><th>Fecha del saldo</th></tr></thead><tbody>{productIds.map((id) => {
      const inventory = product(id).inventory
      return <tr key={id}><th><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel></th><td>{number(inventory.aligned_closing_balance)}</td><td>{number(inventory.trailing_12_mean_sales, 1)} u.</td><td>{month(inventory.last_interior_month)}</td></tr>
    })}</tbody></table>
    <p className="small-explanation">Promedio de los últimos 12 meses. A acumula más inventario frente a su venta reciente que los demás productos.</p>
  </Slide>
}

function Demand() {
  return <Slide>
    <div className="demand-flow">
      <div className="demand-card latent">
        <h3>Pedidos de clientes</h3>
        <p>Lo que los clientes quieren comprar.</p>
      </div>
      <div className="demand-arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>
      <div className="demand-card filter">
        <h3>Disponibilidad</h3>
        <p>Lo que la bodega puede entregar.</p>
      </div>
      <div className="demand-arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>
      <div className="demand-card target">
        <h3>Ventas en Kardex</h3>
        <p>Lo que observamos y buscamos predecir.</p>
      </div>
    </div>
    <p className="small-explanation">No contamos con un registro de pedidos no atendidos. Las ventas no muestran toda la demanda si hubo faltantes.</p>
  </Slide>
}

function Features() {
  const recent = interiorMonths(product("A")).slice(-3)
  return <Slide>
    <ProductLabel id="A">Ejemplo para predecir {month(product("A").forecast.target_month, false)}</ProductLabel>
    <div className="feature-history">{recent.map((row) => <div key={row.month}><span>{month(row.month)}</span><strong>{number(row.sales_units)}</strong><small>unidades vendidas</small></div>)}<div className="feature-mean"><span>Promedio reciente</span><strong>{number(recent.reduce((sum, row) => sum + row.sales_units, 0) / 3)}</strong><small>unidades por mes</small></div></div>
    <p className="large-caption">Ventas de los tres meses previos, su promedio, paso del tiempo y mes del año.</p>
  </Slide>
}

function Validation() {
  const split = evaluationSplit(product("A"))
  const phases = [
    { id: "phase-training", label: "Entrenamiento inicial", months: split.training },
    { id: "phase-validation", label: "Validación", months: split.validation },
    { id: "phase-test", label: "Prueba final", months: split.test },
  ]
  return <Slide className="validation-slide">
    <figure className="validation-distribution">
      <figcaption>Distribución de los {split.total} meses del producto <InlineProduct id="A" /></figcaption>
      <div className="validation-bar" role="list" aria-label="Distribución temporal de los meses">
        {phases.map((phase) => <div className={`validation-segment ${phase.id}`} role="listitem" aria-label={`${phase.label}: ${phase.months} meses`} key={phase.id} style={{ "--months": phase.months }}><span>{phase.label}</span><strong>{phase.months} meses</strong></div>)}
      </div>
    </figure>
    <Flow items={[
      { title: "Entrenar", text: "Comenzar con los primeros 24 meses de cada producto." },
      { title: "Validar", text: "Predecir el mes siguiente, medir el error y ampliar el historial." },
      { title: "Probar", text: "Evaluar el método elegido en los seis meses finales." },
    ]} />
  </Slide>
}

function Accuracy() {
  const example = forecastSeries(product("B"), true).slice(0, 3)
  const averageError = example.reduce((sum, row) => sum + Math.abs(row.selected - row.actual), 0) / example.length
  return <Slide>
    <p className="chart-intro"><strong>MAE</strong> = error absoluto medio. Indica cuántas unidades se desvía la predicción, en promedio.</p>
    <table className="comparison-table portfolio-table mae-example"><caption><ProductLabel id="B">Ejemplo con tres meses de prueba · {BUSINESS.B.shortName}</ProductLabel></caption><thead><tr><th>Mes</th><th>Venta real, u.</th><th>Predicción, u.</th><th>Error absoluto, u.</th></tr></thead><tbody>{example.map((row) => <tr key={row.month}><th>{month(row.month)}</th><td>{number(row.actual)}</td><td>{number(row.selected, 2)}</td><td>{number(Math.abs(row.selected - row.actual), 2)}</td></tr>)}</tbody></table>
    <p className="large-caption">En estos tres meses, el error medio fue de {number(averageError, 2)} unidades. Menor <strong>MAE</strong> significa menor error.</p>
  </Slide>
}

function Selection() {
  const reasons = {
    A: "Error cercano al mínimo: se prefirió regularizar.",
    B: "Error cercano al mínimo: se prefirió una regla sencilla.",
    C: "Menor error en validación.",
    D: "Menor error en validación.",
    E: "Menor error en validación con ventas poco frecuentes.",
  }
  return <Slide>
    <p className="chart-intro">Comparamos el MAE de validación. Entre métodos a un máximo de 5 % del menor error, preferimos uno más sencillo o regularizado.</p>
    <table className="comparison-table portfolio-table selection-table"><thead><tr><th>Producto</th><th>Método elegido</th><th>Por qué se eligió</th></tr></thead><tbody>{productIds.map((id) => {
      const selection = product(id).selection
      return <tr key={id}><th><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel></th><td>{MODEL_NAMES[selection.model]}</td><td>{reasons[id]}</td></tr>
    })}</tbody></table>
  </Slide>
}

function Results() {
  return <Slide>
    <table className="comparison-table portfolio-table result-table"><caption>MAE en los seis meses finales, unidades por mes</caption><thead><tr><th>Producto</th><th>Método elegido</th><th>Repetir el último mes</th></tr></thead><tbody>{productIds.map((id) => <tr key={id}><th><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel></th><td>{number(score(id, product(id).selection.model).mae, 2)}</td><td>{number(score(id, "naive").mae, 2)}</td></tr>)}</tbody></table>
    <p className="large-caption">El método elegido tuvo menor error en <InlineProduct id="A" />, <InlineProduct id="C" /> y <InlineProduct id="E" />. Repetir el último mes funcionó mejor en <InlineProduct id="B" /> y <InlineProduct id="D" />.</p>
  </Slide>
}

function Intermittency() {
  const data = forecastSeries(product("E"), true)
  return <Slide>
    <ProductLabel id="E">Manguera de aire</ProductLabel>
    <table className="comparison-table portfolio-table zero-example"><thead><tr><th>Unidades</th>{data.map((row) => <th key={row.month}>{month(row.month)}</th>)}</tr></thead><tbody><tr><th>Ventas registradas</th>{data.map((row) => <td key={row.month}>{number(row.actual)}</td>)}</tr><tr><th>Predicción elegida</th>{data.map((row) => <td key={row.month}>{number(row.selected)}</td>)}</tr></tbody></table>
    <p className="large-caption">Un error bajo no basta para decidir cuánto inventario mantener.</p>
  </Slide>
}

function Errors() {
  return <Slide className="error-slide">
    <div className="chart-legend"><span><i className="actual-key" />Venta registrada</span><span><i className="selected-key" />Método elegido</span><span><i className="naive-key" />Último mes</span><span className="chart-legend-unit">Unidades por mes</span></div>
    <div className="product-chart-grid forecast-grid">{productIds.map((id) => {
      return <figure className="chart-panel" key={id} data-product={id}><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel><ForecastChart id={id} finalOnly />
      </figure>
    })}</div>
  </Slide>
}

function Failure() {
  const forecast = product("A").forecast
  return <Slide className="failure-slide">
    <div className="failure-header"><ProductLabel id="A">{BUSINESS.A.shortName}</ProductLabel><span>Predicción para {month(forecast.target_month, false)}</span></div>
    <ol className="failure-steps">
      <li style={{ "--i": 0 }}><h3>Qué ocurrió</h3><p>Ridge estimó <strong>{number(forecast.raw_forecast_units, 2)} unidades</strong>. Las ventas no pueden ser negativas.</p></li>
      <li style={{ "--i": 1 }}><h3>Cómo lo tratamos</h3><p>Para estudiar el inventario usamos el promedio reciente: <strong>{number(product("A").guard.effective_forecast_units)} unidades al mes</strong>.</p></li>
      <li style={{ "--i": 2 }}><h3>Qué aprendimos</h3><p>Revisar las predicciones antes de convertirlas en cantidades de producción.</p></li>
    </ol>
  </Slide>
}

function Planning() {
  return <Slide>
    <div className="planning-inputs"><div><h3>Ventas previstas</h3><p>Cuántas unidades se espera vender durante el período de revisión y reposición.</p></div><div><h3>Inventario</h3><p>Cuántas unidades hay para atender esas ventas.</p></div><div><h3>Producción</h3><p>Cuánto tarda la reposición y cuánto se puede fabricar.</p></div></div>
  </Slide>
}

function Scenarios() {
  const rows = productIds.map((id) => ({ id, scenario: productionVariant(product(id)) }))
  return <Slide className="scenario-slide">
    <p className="scenario-context">Escenario histórico: 30 días de revisión, 7 de reposición y un día productivo por producto.</p>
    <table className="comparison-table portfolio-table portfolio-scenarios"><caption className="sr-only">Ventas previstas, saldo registrado y producción sugerida por producto.</caption>
      <thead><tr><th>Producto y fecha</th><th>Ventas previstas, u./mes</th><th>Saldo, u.</th><th>Producción sugerida, u.</th></tr></thead>
      <tbody>{rows.map(({ id, scenario }) => {
        return <tr key={id} data-product={id}>
          <th><ProductLabel id={id}>{month(scenario.balance_cutoff)}</ProductLabel></th>
          <td>{number(scenario.expected_monthly_outgoing_units, 2)}</td><td>{number(scenario.recorded_on_hand_units)}</td><td><strong data-testid={`scenario-units-${id}`}>{number(scenario.suggested_production_units)}</strong>{scenario.constraints_prevent_target && <sup>*</sup>}</td>
        </tr>
      })}</tbody>
    </table>
    <p className="small-explanation">{rows.some(({ scenario }) => scenario.constraints_prevent_target) && "*La cantidad respeta el límite del día productivo supuesto. "}Es un escenario hipotético con saldos de fechas históricas distintas.</p>
  </Slide>
}

function ProductionReplay() {
  const [showResult] = useCueState("resultado", false)
  if (showResult) return <Slide>
    <p className="chart-intro">Unidades de venta que el inventario simulado no pudo atender en los seis meses de prueba.</p>
    <table className="comparison-table portfolio-table replay-table"><thead><tr><th>Producto</th><th>Unidades no atendidas</th></tr></thead><tbody>{productIds.map((id) => {
      const p = product(id)
      return <tr key={id} data-product={id}><th><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel></th><td>{number(replayTotal(p))}</td></tr>
    })}</tbody></table>
    <p className="small-explanation">Son faltantes simulados, no pérdidas ni ahorros reales comprobados.</p>
  </Slide>
  return <Slide>
    <Flow items={[
      { title: "Planificar", text: "Estimar la producción cada mes con la predicción y el saldo disponible." },
      { title: "Reponer", text: "Recibir lo producido después de siete días." },
      { title: "Comparar con las ventas", text: "Usar las ventas posteriores para observar faltantes y saldo restante." },
    ]} />
    <p className="large-caption">El inventario restante pasa al mes siguiente.</p>
  </Slide>
}

function Status() {
  return <Slide>
    <div className="status-columns">
      <div>
        <h3>Lo desarrollado</h3>
        <ul>
          <li>Ventas históricas organizadas por mes.</li>
          <li>Predicciones evaluadas con datos posteriores.</li>
          <li>Simulación para estudiar la reposición.</li>
        </ul>
      </div>
      <div>
        <h3>Lo que limita las conclusiones</h3>
        <ul>
          <li>Historial corto y ventas que cambian con el tiempo.</li>
          <li>Saldos contables y capacidad de producción por confirmar.</li>
          <li>Sin costos completos para calcular ahorros económicos.</li>
        </ul>
      </div>
    </div>
  </Slide>
}

function Conclusions() {
  return <Slide className="conclusions-slide">
    <Rows items={[
      ["Cada producto necesita su propia evaluación", "Las ventas regulares, variables y poco frecuentes producen resultados distintos."],
      ["Más complejidad no asegura menor error", "Los promedios y el último mes fueron referencias útiles frente a las regresiones."],
      ["La predicción ayuda a estudiar el inventario", "La simulación relaciona ventas previstas, disponibilidad y tiempo de reposición."],
    ]} />
  </Slide>
}

export const SLIDES = [
  { id: "portada", C: Cover, ch: "01 · La decisión de negocio" },
  { id: "negocio", C: Business, ch: "01 · La decisión de negocio" },
  { id: "decision", C: Decision, ch: "01 · La decisión de negocio" },
  { id: "productos", C: Products, ch: "01 · La decisión de negocio" },
  { id: "propuesta", C: Scope, ch: "01 · La decisión de negocio" },
  { id: "trazabilidad", C: Traceability, ch: "02 · Los datos" },
  { id: "muestra", C: Sample, ch: "02 · Los datos" },
  { id: "tendencia", C: Trend, ch: "03 · Lo que cambió en las ventas" },
  { id: "variabilidad", C: Variability, ch: "03 · Lo que cambió en las ventas" },
  { id: "inventario", C: Inventory, ch: "03 · Lo que cambió en las ventas" },
  { id: "demanda", C: Demand, ch: "03 · Lo que cambió en las ventas" },
  { id: "variables", C: Features, ch: "04 · Poner a prueba los pronósticos" },
  { id: "modelos-referencias", C: BaselineLesson, ch: "04 · Entender los modelos" },
  { id: "regresion", C: RegressionLesson, ch: "04 · Entender los modelos" },
  { id: "validacion", C: Validation, ch: "04 · Poner a prueba los pronósticos" },
  { id: "precision", C: Accuracy, ch: "04 · Poner a prueba los pronósticos" },
  { id: "seleccion", C: Selection, ch: "04 · Poner a prueba los pronósticos" },
  { id: "resultado-a", C: Results, ch: "04 · Poner a prueba los pronósticos" },
  { id: "errores", C: Errors, ch: "04 · Poner a prueba los pronósticos" },
  { id: "resultado-b", C: Intermittency, ch: "04 · Poner a prueba los pronósticos" },
  { id: "fallo", C: Failure, ch: "04 · Poner a prueba los pronósticos" },
  { id: "planificacion", C: Planning, ch: "05 · Llevar la evidencia a producción" },
  { id: "escenario-b", C: Scenarios, ch: "05 · Llevar la evidencia a producción" },
  { id: "escenario-a", C: ProductionReplay, ch: "05 · Llevar la evidencia a producción" },
  { id: "estado", C: Status, ch: "05 · Llevar la evidencia a producción" },
  { id: "conclusiones", C: Conclusions, ch: "06 · Conclusiones" },
]
