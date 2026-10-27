import React from "react"
import { BUSINESS, MODEL_NAMES, month, number, price } from "./business.js"
import { useCueState, usePresentation } from "./PresentationContext.jsx"
import { ForecastChart, PortfolioSales, portfolio, product, productIds, score } from "./Charts.jsx"
import { forecastSeries, interiorMonths, productionVariant, replayTotal } from "./analysis.js"
import { Flow, ProductLabel, Rows, Slide } from "./ui.jsx"
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
    <table className="comparison-table portfolio-table product-inputs"><thead><tr><th>Repuesto</th><th>Producto analizado</th><th>Precio</th><th>Producción diaria</th></tr></thead><tbody>{productIds.map((id) => {
      const item = BUSINESS[id]
      const dailyRate = item.reportedUnitsPerProductionDay
        ? `${number(item.reportedUnitsPerProductionDay)} u./día`
        : `${item.reportedUnitsPerProductionDayMin} a ${item.reportedUnitsPerProductionDayMax} u./día`
      return <tr key={id}><td className="product-image-cell"><div className="product-image-wrapper"><img src={PRODUCT_IMAGES[id]} alt={item.shortName} className="product-thumb" /></div></td><th scope="row"><ProductLabel id={id}>{item.shortName}</ProductLabel></th><td>{price(item.netSellingPrice)}</td><td>{dailyRate}</td></tr>
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
    ]} /><div className="sample-periods"><div><strong>Aproximadamente 4 años</strong></div><p>de historial analizado por producto.</p></div></div>
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

function Demand() {
  return <Slide>
    <Flow items={[
      { title: "Pedidos de clientes", text: "Cuánto compran y cuándo lo hacen." },
      { title: "Disponibilidad", text: "Lo que la bodega puede entregar." },
      { title: "Ventas en Kardex", text: "Lo que observamos y buscamos predecir." },
    ]} />
  </Slide>
}

function Features() {
  const recent = interiorMonths(product("A")).slice(-3)
  return <Slide>
    <ProductLabel id="A">Ejemplo para predecir {month(product("A").forecast.target_month, false)}</ProductLabel>
    <div className="feature-history">{recent.map((row) => <div key={row.month}><span>{month(row.month)}</span><strong>{number(row.sales_units)}</strong><small>unidades vendidas</small></div>)}<div className="feature-mean"><span>Promedio reciente</span><strong>{number(recent.reduce((sum, row) => sum + row.sales_units, 0) / 3)}</strong><small>unidades por mes</small></div></div>
    <ul className="feature-points">
      <li>Ventas de los tres meses previos</li>
      <li>Su promedio</li>
      <li>Índice temporal</li>
      <li>Mes del año</li>
    </ul>
  </Slide>
}

function Validation() {
  const [test] = useCueState("prueba", false)
  return <Slide>
    <Flow items={[
      { title: "Entrenar", text: "Comenzar con los primeros 24 meses de cada producto." },
      { title: "Validar", text: "Predecir el mes siguiente, medir el error y ampliar el historial." },
      { title: "Probar", text: "Evaluar el método elegido en los seis meses finales." },
    ]} />
    <p className="large-caption" key={String(test)}>{test ? "El método se elige antes de mirar la prueba final." : "Siempre usamos el pasado para predecir un mes posterior."}</p>
  </Slide>
}

function Accuracy() {
  const example = forecastSeries(product("B"), true).slice(0, 3)
  const averageError = example.reduce((sum, row) => sum + Math.abs(row.selected - row.actual), 0) / example.length
  return <Slide>
    <p className="chart-intro">MAE = error absoluto medio. Indica cuántas unidades se desvía la predicción, en promedio.</p>
    <table className="comparison-table portfolio-table mae-example"><caption>Ejemplo con tres meses de prueba de B</caption><thead><tr><th>Mes</th><th>Venta real, u.</th><th>Predicción, u.</th><th>Error absoluto, u.</th></tr></thead><tbody>{example.map((row) => <tr key={row.month}><th>{month(row.month)}</th><td>{number(row.actual)}</td><td>{number(row.selected, 2)}</td><td>{number(Math.abs(row.selected - row.actual), 2)}</td></tr>)}</tbody></table>
    <p className="large-caption">En estos tres meses, el error medio fue de {number(averageError, 2)} unidades. Menor MAE significa menor error.</p>
  </Slide>
}

function Selection() {
  return <Slide>
    <p className="chart-intro">Elegimos con el MAE de validación. Cuando los errores eran cercanos, preferimos métodos sencillos o regularizados.</p>
    <table className="comparison-table portfolio-table selection-table"><thead><tr><th>Producto</th><th>Método elegido</th></tr></thead><tbody>{productIds.map((id) => {
      const selection = product(id).selection
      return <tr key={id}><th><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel></th><td>{MODEL_NAMES[selection.model]}</td></tr>
    })}</tbody></table>
  </Slide>
}

function Results() {
  return <Slide>
    <table className="comparison-table portfolio-table result-table"><caption>MAE en los seis meses finales, unidades por mes</caption><thead><tr><th>Producto</th><th>Método elegido</th><th>Repetir el último mes</th></tr></thead><tbody>{productIds.map((id) => <tr key={id}><th><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel></th><td>{number(score(id, product(id).selection.model).mae, 2)}</td><td>{number(score(id, "naive").mae, 2)}</td></tr>)}</tbody></table>
    <p className="large-caption">El método elegido tuvo menor error en A, C y E. Repetir el último mes funcionó mejor en B y D.</p>
  </Slide>
}

function Intermittency() {
  const data = forecastSeries(product("E"), true)
  return <Slide>
    <ProductLabel id="E">Manguera de aire · Prueba final</ProductLabel>
    <table className="comparison-table portfolio-table zero-example"><thead><tr><th>Unidades</th>{data.map((row) => <th key={row.month}>{month(row.month)}</th>)}</tr></thead><tbody><tr><th>Ventas registradas</th>{data.map((row) => <td key={row.month}>{number(row.actual)}</td>)}</tr><tr><th>Predicción elegida</th>{data.map((row) => <td key={row.month}>{number(row.selected)}</td>)}</tr></tbody></table>
    <p className="large-caption">Predecir cero tuvo el menor MAE, pero dejó sin anticipar {number(data.reduce((sum, row) => sum + row.actual, 0))} unidades vendidas.</p>
    <p className="small-explanation">Un error bajo no basta para decidir cuánto inventario mantener.</p>
  </Slide>
}

function Errors() {
  return <Slide className="error-slide">
    <div className="chart-legend"><span><i className="actual-key" />Venta registrada</span><span><i className="selected-key" />Método elegido</span><span><i className="naive-key" />Último mes</span><span>Unidades por mes · Escala propia</span></div>
    <div className="product-chart-grid forecast-grid">{productIds.map((id) => {
      return <figure className="chart-panel" key={id} data-product={id}><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel><ForecastChart id={id} finalOnly />
      </figure>
    })}</div>
  </Slide>
}

function Failure() {
  const forecast = product("A").forecast
  return <Slide>
    <ProductLabel id="A">Predicción para {month(forecast.target_month, false)}</ProductLabel>
    <Rows items={[
      ["Qué ocurrió", `Ridge estimó ${number(forecast.raw_forecast_units, 2)} unidades. Las ventas no pueden ser negativas.`],
      ["Cómo lo tratamos", `Para estudiar el inventario usamos el promedio reciente de ${number(product("A").guard.effective_forecast_units)} unidades al mes.`],
      ["Qué aprendimos", "Revisar las predicciones antes de convertirlas en cantidades de producción."],
    ]} />
  </Slide>
}

function Planning() {
  return <Slide>
    <div className="planning-inputs"><div><h3>Ventas previstas</h3><p>Cuántas unidades podrían venderse durante la reposición.</p></div><div><h3>Inventario</h3><p>Cuántas unidades hay para atender esas ventas.</p></div><div><h3>Producción</h3><p>Cuánto tarda la reposición y cuánto se puede fabricar.</p></div></div>
  </Slide>
}

function Scenarios() {
  const [safety] = useCueState("seguridad", 0)
  const [days] = useCueState("dias", 1)
  const c = productionVariant(product("C"), 1, days)
  return <Slide className="scenario-slide">
    <p className="scenario-context">30 días de ventas y 7 de reposición. Se supone un día productivo por producto.</p>
    <table className="comparison-table portfolio-table portfolio-scenarios"><caption className="sr-only">Producción en unidades con cero o un mes de seguridad. La columna resaltada corresponde al paso seleccionado.</caption>
      <thead><tr><th>Producto y fecha</th><th>Saldo, u.</th><th className={safety === 0 ? "is-current" : ""}>Sin reserva, u.</th><th className={safety === 1 ? "is-current" : ""}>Con un mes de reserva, u.</th></tr></thead>
      <tbody>{productIds.map((id) => {
        const variants = [0, 1].map((stock) => productionVariant(product(id), stock, days))
        const selected = variants[safety]
        return <tr key={id} data-product={id}>
          <th><ProductLabel id={id}>{month(selected.balance_cutoff)}</ProductLabel></th>
          <td>{number(selected.recorded_on_hand_units)}</td>{variants.map((row, index) => <td key={index} className={index === safety ? "is-current" : ""} aria-current={index === safety ? "step" : undefined}><strong data-testid={index === safety ? `scenario-units-${id}` : undefined}>{number(row.suggested_production_units)}</strong>{row.constraints_prevent_target && <sup>*</sup>}</td>)}
        </tr>
      })}</tbody>
    </table>
    <p className="small-explanation">*Con reserva, C necesitaría {number(c.unconstrained_production_units)} unidades, pero el día productivo supuesto permite {number(c.scenario_capacity_units)}.</p>
  </Slide>
}

function ProductionReplay() {
  const [compare] = useCueState("comparar", false)
  if (compare) return <Slide>
    <p className="chart-intro">Unidades de venta que el inventario simulado no pudo atender en los seis meses de prueba.</p>
    <table className="comparison-table portfolio-table replay-table"><thead><tr><th>Producto</th><th>Sin reserva, u.</th><th>Con un mes de reserva, u.</th></tr></thead><tbody>{productIds.map((id) => {
      const p = product(id)
      return <tr key={id} data-product={id}><th><ProductLabel id={id}>{BUSINESS[id].shortName}</ProductLabel></th><td>{number(replayTotal(p, 0))}</td><td>{number(replayTotal(p, 1))}</td></tr>
    })}</tbody></table>
    <p className="small-explanation">La reserva reduce los faltantes simulados en C y D. Estos resultados no representan pérdidas ni ahorros reales comprobados.</p>
  </Slide>
  return <Slide>
    <Flow items={[
      { title: "Planificar", text: "Estimar la producción cada mes con la predicción y el saldo disponible." },
      { title: "Reponer", text: "Recibir lo producido después de siete días." },
      { title: "Comparar con las ventas", text: "Usar las ventas posteriores para observar faltantes y saldo restante." },
    ]} />
    <p className="large-caption">El inventario restante pasa al mes siguiente. Comparamos la misma regla con y sin reserva.</p>
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
          <li>Simulación para comparar alternativas de reposición.</li>
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
      ["La predicción ayuda a estudiar el inventario", "Las simulaciones muestran el efecto de mantener una reserva y de esperar la reposición."],
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
