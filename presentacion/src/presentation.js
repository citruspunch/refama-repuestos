import { LESSON_STORY } from "./model-lessons.js"

const cue = (label, values = {}) => ({ label, values })

export const STORY = [
  { id: "portada", title: "Ventas e inventario", seconds: 60, cues: [cue("Presentar el problema y el propósito del proyecto")] },
  { id: "negocio", title: "Cómo trabaja RUJAF", seconds: 90, cues: [cue("Ubicar la bodega y los destinos de las ventas")] },
  { id: "decision", title: "Cuánto producir y cuánto mantener en bodega", seconds: 120, cues: [cue("Explicar el riesgo de producir de más o de menos")] },
  { id: "productos", title: "Los cinco productos analizados", seconds: 60, cues: [cue("Identificar los repuestos y sus letras")] },
  { id: "propuesta", title: "Qué desarrollamos", seconds: 90, cues: [cue("Relacionar datos, predicciones y simulación de inventarios")] },
  { id: "trazabilidad", title: "Preparación de los datos", seconds: 120, cues: [cue("Explicar el paso de los Kardex a las ventas mensuales")] },
  { id: "muestra", title: "Qué datos usamos y qué queremos predecir", seconds: 120, cues: [cue("Definir las ventas mensuales y los períodos analizados")] },
  { id: "tendencia", title: "Cómo cambiaron las ventas", seconds: 180, cues: [cue("Leer las curvas históricas con sus propias escalas")] },
  { id: "variabilidad", title: "Los productos no se venden de la misma forma", seconds: 120, cues: [cue("Comparar cambios mensuales y períodos sin ventas")] },
  { id: "demanda", title: "Lo que las ventas permiten conocer", seconds: 90, cues: [cue("Distinguir ventas registradas de pedidos no atendidos")] },
  { id: "variables", title: "Qué información le damos al modelo", seconds: 150, cues: [cue("Construir un ejemplo con los meses anteriores de A")] },
  { id: "meses-ciclicos", title: "Los meses forman un ciclo", seconds: 60, cues: [cue("Explicar cómo seno y coseno representan el calendario")] },
  ...LESSON_STORY,
  { id: "validacion", title: "Cómo entrenamos y probamos los modelos", seconds: 180, cues: [cue("Avanzar mes a mes sin usar datos futuros")] },
  { id: "precision", title: "Cómo medimos el error", seconds: 150, cues: [cue("Interpretar el MAE con un ejemplo de ventas reales")] },
  { id: "seleccion", title: "Qué método elegimos para cada producto", seconds: 120, cues: [cue("Explicar la selección a partir de la validación")] },
  { id: "resultado-a", title: "Cuánto se equivocaron los modelos", seconds: 180, cues: [cue("Comparar el MAE con repetir el último mes")] },
  { id: "errores", title: "Lo previsto y lo vendido, mes a mes", seconds: 180, cues: [cue("Interpretar aciertos y errores en las curvas finales")] },
  { id: "resultado-b", title: "Un error bajo puede ocultar ventas", seconds: 120, cues: [cue("Explicar qué ocurre al predecir cero en E")] },
  { id: "fallo", title: "Revisión de las predicciones", seconds: 120, cues: [cue("Mostrar el problema de A y el promedio usado para la simulación")] },
  { id: "planificacion", title: "De la predicción al inventario", seconds: 120, cues: [cue("Combinar ventas previstas, saldo y tiempo de reposición")] },
  { id: "escenario-b", title: "Cómo cambia la producción con una reserva", seconds: 180, cues: [
    cue("Leer las cantidades sin reserva", { seguridad: 0, dias: 1 }),
    cue("Comparar con un mes de reserva", { seguridad: 1, dias: 1 }),
  ] },
  { id: "escenario-a", title: "Qué mostró la simulación de inventarios", seconds: 180, cues: [
    cue("Explicar cómo se actualiza el inventario simulado", { comparar: false }),
    cue("Comparar las ventas que el inventario simulado no pudo atender", { comparar: true }),
  ] },
  { id: "estado", title: "Qué aporta el proyecto y qué falta conocer", seconds: 90, cues: [cue("Resumir la utilidad y los límites que afectan las conclusiones")] },
  { id: "conclusiones", title: "Resultados y conclusiones", seconds: 90, cues: [cue("Cerrar con los aprendizajes del proyecto")] },
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
  return { slide, step: boundedInteger(position?.step, slides[slide].cues.length - 1) }
}
export function positionFromLocation(location, slides = STORY) {
  const match = (location.hash || "").match(/^#(\d+)(?:\/(\d+))?$/)
  return normalizePosition({ slide: match ? Number(match[1]) : 0, step: match?.[2] ? Number(match[2]) : 0 }, slides)
}
export const positionHash = ({ slide, step }) => `#${slide}/${step}`
export function movePosition(position, delta, { bySlide = false, slides = STORY } = {}) {
  const current = normalizePosition(position, slides)
  if (delta !== 1 && delta !== -1) return current
  const end = lastMainSlide(slides)
  if (!bySlide) {
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
  const main = slides.slice(0, end + 1)
  const total = main.reduce((sum, scene) => sum + scene.cues.length, 0)
  const before = main.slice(0, current.slide).reduce((sum, scene) => sum + scene.cues.length, 0)
  return (before + current.step + 1) / total
}
