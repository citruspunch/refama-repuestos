const cue = (label, values = {}) => ({ label, values })

export const STORY = [
  { id: "portada", title: "Ventas e inventario RUJAF", seconds: 60, cues: [cue("Presentación del proyecto universitario y alcance del trabajo")] },
  { id: "negocio", title: "Cómo funciona la operación de RUJAF", seconds: 90, cues: [cue("Estructura de la operación de RUJAF y canales de distribución")] },
  { id: "decision", title: "La decisión de cuánto producir e inventariar", seconds: 90, cues: [cue("Riesgos de exceso de inventario y pedidos desatendidos")] },
  { id: "productos", title: "Los dos productos analizados", seconds: 90, cues: [cue("Características, precios netos y ritmo de producción")] },
  { id: "propuesta", title: "Qué nos propusimos desarrollar", seconds: 90, cues: [cue("Etapas del proyecto: datos, modelos, inventario y planificación")] },
  { id: "origen", title: "Cómo obtuvimos los datos del Kardex", seconds: 105, cues: [cue("Extracción directa de datos desde los documentos del Kardex")] },
  { id: "trazabilidad", title: "Trazabilidad y conciliación de movimientos", seconds: 105, cues: [cue("Control de integridad y conciliación de movimientos")] },
  { id: "calidad", title: "Revisión de consistencia del Kardex", seconds: 90, cues: [cue("Verificación contable de saldos y alertas operativas")] },
  { id: "muestra", title: "Definición del objetivo y meses analizados", seconds: 105, cues: [cue("Definición de ventas y período de datos utilizable")] },
  { id: "tendencia", title: "Evolución de las ventas históricas", seconds: 120, cues: [cue("Tendencia histórica y comparación entre períodos anuales")] },
  { id: "canales", title: "Cambios en las ventas por canal", seconds: 90, cues: [cue("Comportamiento de ventas en Refama y clientes mayoristas")] },
  { id: "variabilidad", title: "Variación de ventas y tamaño de pedidos", seconds: 105, cues: [cue("Variabilidad mensual y concentración en pedidos grandes")] },
  { id: "estacionalidad", title: "Búsqueda de patrones estacionales", seconds: 105, cues: [cue("Comprobación de estacionalidad en las series de ventas")] },
  { id: "inventario", title: "Inventario en bodega frente a ventas recientes", seconds: 120, cues: [cue("Comparación del inventario en bodega frente al ritmo de ventas")] },
  { id: "demanda", title: "Ventas registradas frente a la demanda real", seconds: 75, cues: [cue("Diferencia entre ventas registradas y demanda económica real")] },
  { id: "variables", title: "Variables utilizadas para predecir", seconds: 105, cues: [cue("Construcción de variables predictivas con datos previos")] },
  { id: "regresion", title: "Regresión lineal y regularización Ridge", seconds: 90, cues: [cue("Funcionamiento de la regresión lineal y penalización Ridge")] },
  { id: "metodos", title: "Los 13 modelos evaluados", seconds: 90, cues: [cue("Familias de modelos: referencias simples, regresiones, series y árboles")] },
  { id: "validacion", title: "Cómo probamos los modelos", seconds: 135, cues: [
    cue("Entrenamiento progresivo mes a mes", { prueba: false }),
    cue("Comprobación final en los últimos seis meses", { prueba: true }),
  ] },
  { id: "seleccion", title: "Criterio de selección con margen del 5%", seconds: 90, cues: [cue("Regla de selección favoreciendo modelos simples dentro del 5%")] },
  { id: "resultado-a", title: "Resultados de prueba en el producto A", seconds: 120, cues: [cue("Desempeño de Ridge frente a las referencias en el producto A")] },
  { id: "resultado-b", title: "Resultados de prueba en el producto B", seconds: 105, cues: [cue("Desempeño de los modelos y regla simple en el producto B")] },
  { id: "errores", title: "Diferencia entre lo previsto y lo vendido", seconds: 105, cues: [cue("Comparación de errores relativos y sesgo en la prueba final")] },
  { id: "fallo", title: "Un problema en la predicción del producto A", seconds: 105, cues: [
    cue("Predicción menor a cero del modelo y ajuste a cero", { contraste: false }),
    cue("Contraste con ventas reales registradas en el mes", { contraste: true }),
  ] },
  { id: "controles", title: "Reglas de control y modelo de respaldo", seconds: 105, cues: [cue("Reglas de validez y uso del promedio móvil como respaldo")] },
  { id: "planificacion", title: "Entradas para planificar la producción", seconds: 90, cues: [cue("Variables necesarias para calcular las necesidades de producción")] },
  { id: "escenario-b", title: "Escenarios de producción para el producto B", seconds: 150, cues: [
    cue("Cálculo de producción sin stock de seguridad", { seguridad: 0, dias: 1 }),
    cue("Cálculo de producción con un mes de stock de seguridad", { seguridad: 1, dias: 1 }),
  ] },
  { id: "escenario-a", title: "Escenario de producción para el producto A", seconds: 105, cues: [cue("Interpretación de producción cero con inventario alto en A")] },
  { id: "estado", title: "Qué logramos implementar y sus limitaciones", seconds: 90, cues: [cue("Entregables desarrollados y condiciones para su uso")] },
  { id: "conclusiones", title: "Resultados y conclusiones", seconds: 75, cues: [cue("Conclusiones principales sobre ventas, modelos y producción")] },
  { id: "respaldo-modelos", title: "Métricas detalladas de los modelos", seconds: 90, appendix: true, cues: [cue("Consulta de métricas completas de todos los modelos evaluados")] },
  { id: "respaldo-supuestos", title: "Supuestos utilizados en los escenarios", seconds: 90, appendix: true, cues: [cue("Consulta de parámetros y supuestos de los escenarios")] },
  { id: "respaldo-fuentes", title: "Fuentes de información y trazabilidad", seconds: 90, appendix: true, cues: [cue("Mapa de archivos del proyecto y respuestas a preguntas clave")] },
]

const nonempty = (value) => typeof value === "string" && value.trim().length > 0
const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value)
const scalar = (value) => typeof value === "string" || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))
const check = (condition, message) => { if (!condition) throw new Error(`Guion inválido: ${message}`) }

export function validateStory(story = STORY) {
  check(Array.isArray(story) && story.length > 0, "Se requiere al menos una diapositiva")
  const ids = new Set()
  let inAppendix = false
  for (const scene of story) {
    check(record(scene) && nonempty(scene.id) && !ids.has(scene.id), "Los identificadores deben ser únicos")
    ids.add(scene.id)
    check(nonempty(scene.title), `${scene.id}: falta el título`)
    check(Number.isFinite(scene.seconds) && scene.seconds > 0, `${scene.id}: falta la duración`)
    check(scene.appendix === undefined || typeof scene.appendix === "boolean", "El anexo debe ser booleano")
    check(!inAppendix || scene.appendix === true, "Los anexos deben quedar al final")
    inAppendix ||= scene.appendix === true
    check(Array.isArray(scene.cues) && scene.cues.length > 0, `${scene.id}: falta una entrada`)
    let schema
    for (const entry of scene.cues) {
      check(record(entry) && nonempty(entry.label) && record(entry.values), `${scene.id}: entrada incompleta`)
      check(Object.values(entry.values).every(scalar), "Los valores deben ser escalares finitos")
      const fields = JSON.stringify(Object.keys(entry.values).sort().map((key) => [key, typeof entry.values[key]]))
      schema ??= fields
      check(fields === schema, `${scene.id}: cada entrada debe declarar todos los campos y tipos`)
    }
  }
  check(!story[0].appendix, "Se requiere una diapositiva principal")
  return story
}

export function assembleSlides(definitions, story = STORY) {
  validateStory(story)
  check(Array.isArray(definitions) && definitions.length === story.length, "El registro y el guion deben coincidir")
  return definitions.map((definition, index) => {
    check(definition?.id === story[index].id, `El orden no coincide en ${index}`)
    check(typeof definition.C === "function" && nonempty(definition.ch), `${definition.id}: falta componente o capítulo`)
    return { ...definition, ...story[index] }
  })
}

const boundedInteger = (value, max) => Math.max(0, Math.min(max, Number.isSafeInteger(value) ? value : 0))
export function lastMainSlide(slides = STORY) {
  const firstAppendix = slides.findIndex((slide) => slide.appendix)
  return firstAppendix < 0 ? slides.length - 1 : firstAppendix - 1
}
export function normalizePosition(position = {}, slides = STORY) {
  const slide = boundedInteger(position?.slide, slides.length - 1)
  return { slide, step: boundedInteger(position?.step, slides[slide].cues.length - 1), mode: position?.mode === "explore" ? "explore" : "present" }
}
export function positionFromLocation(location, slides = STORY) {
  const match = (location.hash || "").match(/^#(\d+)(?:\/(\d+))?$/)
  return normalizePosition({ slide: match ? Number(match[1]) : 0, step: match?.[2] ? Number(match[2]) : 0, mode: new URLSearchParams(location.search).get("mode") }, slides)
}
export const positionHash = ({ slide, step }) => `#${slide}/${step}`
export function movePosition(position, delta, { bySlide = false, slides = STORY } = {}) {
  const current = normalizePosition(position, slides)
  if (delta !== 1 && delta !== -1) return current
  const end = current.mode === "present" && current.slide <= lastMainSlide(slides) ? lastMainSlide(slides) : slides.length - 1
  if (current.mode === "present" && !bySlide) {
    const step = current.step + delta
    if (step >= 0 && step < slides[current.slide].cues.length) return { ...current, step }
    if (delta < 0 && current.slide > 0) return { ...current, slide: current.slide - 1, step: slides[current.slide - 1].cues.length - 1 }
    if (delta > 0 && current.slide < end) return { ...current, slide: current.slide + 1, step: 0 }
    return current
  }
  const slide = Math.max(0, Math.min(end, current.slide + delta))
  return slide === current.slide ? current : { ...current, slide, step: 0 }
}
export function presentationProgress(position, slides = STORY) {
  const current = normalizePosition(position, slides)
  const end = lastMainSlide(slides)
  if (current.slide > end) return 1
  if (current.mode === "explore") return (current.slide + 1) / (end + 1)
  const main = slides.slice(0, end + 1)
  const total = main.reduce((sum, scene) => sum + scene.cues.length, 0)
  const before = main.slice(0, current.slide).reduce((sum, scene) => sum + scene.cues.length, 0)
  return (before + current.step + 1) / total
}
