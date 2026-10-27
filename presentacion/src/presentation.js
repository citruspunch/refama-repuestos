const cue = (label, values = {}) => ({ label, values })

export const STORY = [
  { id: "portada", title: "Ventas e inventario con datos de RUJAF", seconds: 60, cues: [cue("Presentar el análisis y su alcance universitario")] },
  { id: "negocio", title: "RUJAF fabrica. Refama vende al detalle.", seconds: 90, cues: [cue("Distinguir los niveles de la cadena comercial")] },
  { id: "decision", title: "Ventas recientes e inventario", seconds: 90, cues: [cue("Explicar los riesgos de exceso e insuficiencia de producción")] },
  { id: "productos", title: "Los dos productos analizados", seconds: 90, cues: [cue("Presentar los productos, precios netos y ritmos reportados")] },
  { id: "propuesta", title: "Alcance del análisis", seconds: 90, cues: [cue("Resumir los datos, métodos y escenarios ejecutados")] },
  { id: "origen", title: "Origen de los registros", seconds: 105, cues: [cue("Explicar la extracción documentada y sus límites de reproducción")] },
  { id: "trazabilidad", title: "Trazabilidad de los movimientos", seconds: 105, cues: [cue("Mostrar el recorrido de los registros y las conciliaciones")] },
  { id: "calidad", title: "Conciliación y alertas del Kardex", seconds: 90, cues: [cue("Separar consistencia aritmética y calidad operativa")] },
  { id: "muestra", title: "Ventas registradas y meses utilizables", seconds: 105, cues: [cue("Definir ventas, canales y meses interiores provisionales")] },
  { id: "tendencia", title: "Caída de las ventas registradas", seconds: 120, cues: [cue("Leer cada serie y comparar las mismas ventanas anuales")] },
  { id: "canales", title: "Cambios por canal de venta", seconds: 90, cues: [cue("Comparar los canales sin atribuir causas no observadas")] },
  { id: "variabilidad", title: "Concentración y variación de las ventas", seconds: 105, cues: [cue("Relacionar variabilidad y concentración con la dificultad de pronosticar")] },
  { id: "estacionalidad", title: "Estacionalidad no confirmada", seconds: 105, cues: [cue("Contrastar los patrones del calendario con la evidencia estadística")] },
  { id: "inventario", title: "Saldo histórico frente a ventas recientes", seconds: 120, cues: [cue("Comparar saldos históricos alineados con ventas recientes")] },
  { id: "demanda", title: "Ventas registradas y demanda no observada", seconds: 75, cues: [cue("Explicar disponibilidad, pedidos no atendidos y límites del objetivo")] },
  { id: "variables", title: "Variables anteriores al mes objetivo", seconds: 105, cues: [cue("Mostrar siete variables conocidas antes del mes objetivo")] },
  { id: "regresion", title: "Regresión lineal y Ridge", seconds: 90, cues: [cue("Explicar regresión, regularización y extrapolación con el caso real")] },
  { id: "metodos", title: "13 métodos comparados", seconds: 90, cues: [cue("Describir las referencias simples, regresiones, series y árboles")] },
  { id: "validacion", title: "Validación en orden temporal", seconds: 135, cues: [
    cue("Explicar el entrenamiento y la validación creciente", { prueba: false }),
    cue("Abrir los seis meses finales después de fijar el método", { prueba: true }),
  ] },
  { id: "seleccion", title: "Selección con una banda de error del 5%", seconds: 90, cues: [cue("Explicar MAE y la banda de empate práctico del 5%")] },
  { id: "resultado-a", title: "A: MAE de Ridge frente al último mes", seconds: 120, cues: [cue("Comparar Ridge con referencias y distinguir el ranking retrospectivo")] },
  { id: "resultado-b", title: "B: menor MAE al repetir el último mes", seconds: 105, cues: [cue("Mostrar por qué el promedio seleccionado no fue el mejor en la prueba final")] },
  { id: "errores", title: "Error relativo y sesgo en la prueba final", seconds: 105, cues: [cue("Leer pronósticos frente a ventas reales, WAPE y sesgo")] },
  { id: "fallo", title: "A: extrapolación negativa de Ridge", seconds: 105, cues: [
    cue("Seguir la extrapolación negativa hasta el recorte a cero", { contraste: false }),
    cue("Contrastar con ventas parciales ya registradas", { contraste: true }),
  ] },
  { id: "controles", title: "Controles de validez y respaldo provisional", seconds: 105, cues: [cue("Explicar el respaldo provisional y la evaluación posterior al experimento")] },
  { id: "planificacion", title: "Entradas de los escenarios de producción", seconds: 90, cues: [cue("Separar una estimación de ventas de una orden de producción")] },
  { id: "escenario-b", title: "B: dos supuestos de stock de seguridad", seconds: 150, cues: [
    cue("Recorrer el escenario ejecutado sin stock de seguridad", { seguridad: 0, dias: 1 }),
    cue("Comparar con un mes supuesto de stock de seguridad", { seguridad: 1, dias: 1 }),
  ] },
  { id: "escenario-a", title: "A: saldo superior al objetivo del escenario", seconds: 105, cues: [cue("Interpretar la sugerencia cero con un pronóstico positivo y stock histórico alto")] },
  { id: "estado", title: "Implementación y límites", seconds: 90, cues: [cue("Distinguir resultados implementados y límites de validación")] },
  { id: "conclusiones", title: "Resultados y conclusiones", seconds: 75, cues: [cue("Cerrar con los resultados del historial, los pronósticos y los escenarios")] },
  { id: "respaldo-modelos", title: "Respaldo de modelos y evaluación", seconds: 90, appendix: true, cues: [cue("Consultar las métricas completas de los métodos fijados")] },
  { id: "respaldo-supuestos", title: "Supuestos de los escenarios de producción", seconds: 90, appendix: true, cues: [cue("Consultar los parámetros que no son hechos operativos")] },
  { id: "respaldo-fuentes", title: "Fuentes y respuestas para la discusión", seconds: 90, appendix: true, cues: [cue("Ubicar la evidencia y responder sobre el alcance del proyecto")] },
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
