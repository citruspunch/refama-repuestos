// Introducción selectiva a candidatos con resultados en five_products_v1.
// Las simulaciones de este módulo son didácticas, no ajustes del proyecto.
const cue = (label, values) => ({ label, values })

export const MODEL_LESSONS = [
  {
    id: "modelos-referencias", title: "Dos formas sencillas de pronosticar", seconds: 180,
    models: ["naive", "moving_average_3"],
    cues: [
      cue("Repetir las ventas del último mes", { method: "naive", monthsBack: 1 }),
      cue("El promedio móvil toma los últimos tres meses", { method: "moving_average_3", monthsBack: 1 }),
      cue("Al llegar un mes, sale el más antiguo de la ventana", { method: "moving_average_3", monthsBack: 0 }),
    ],
  },
  {
    id: "regresion", title: "Regresión lineal y Ridge", seconds: 240,
    models: ["linear_regression", "ridge"],
    cues: [
      cue("La regresión aprende pesos para combinar las variables", { method: "linear_regression" }),
      cue("Ridge añade un freno a los pesos grandes", { method: "ridge" }),
    ],
  },
]

export const LESSON_STORY = MODEL_LESSONS.map(({ id, title, seconds, cues }) => ({ id, title, seconds, cues }))

export const BASELINE_LABELS = {
  naive: { tab: "Último mes", title: "Repetir el último mes", text: "Suponer que el mes siguiente venderá lo mismo." },
  moving_average_3: { tab: "Promedio de 3 meses", title: "Promediar tres meses", text: "Se actualiza con cada venta mensual." },
  moving_average_6: { tab: "Media de 6", title: "Promediar 6", text: "Más historia: menos reacción a un solo salto." },
}

export const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length

export function baselineLesson(monthly, method, monthsBack = 0) {
  if (!Number.isSafeInteger(monthsBack) || monthsBack < 0) throw new Error("El corte histórico debe ser un entero no negativo")
  const complete = monthly.filter((row) => row.complete_for_modeling)
  const history = monthsBack ? complete.slice(0, -monthsBack) : complete
  if (history.length < 12) throw new Error("La ilustración necesita al menos 12 meses confirmados")
  const shown = history.slice(-12)
  let source
  if (method === "naive") source = history.slice(-1)
  else if (method === "moving_average_3") source = history.slice(-3)
  else if (method === "moving_average_6") source = history.slice(-6)
  else throw new Error(`Referencia no explicada: ${method}`)
  return {
    history, shown, used: source.length,
    selected: shown.map((row) => source.includes(row)),
    prediction: mean(source.map((row) => row.sales_units)),
  }
}

export const REGRESSION_EXAMPLE = [22, 39, 34, 58, 52, 68, 72, 99, 94].map((y, x) => ({ x, y }))

// Un único predictor estandarizado permite dibujar el efecto del freno de Ridge.
// El modelo real usa siete predictores; esta recta no es su ajuste ni sus pesos.
export function regressionLesson(ridge = false) {
  const xs = REGRESSION_EXAMPLE.map((row) => row.x)
  const ys = REGRESSION_EXAMPLE.map((row) => row.y)
  const center = mean(xs), intercept = mean(ys)
  const scale = Math.sqrt(mean(xs.map((x) => (x - center) ** 2)))
  const standardized = xs.map((x) => (x - center) / scale)
  const weight = standardized.reduce((sum, x, i) => sum + x * (ys[i] - intercept), 0) / (xs.length + (ridge ? 10 : 0))
  return { weight, predict: (x) => intercept + weight * (x - center) / scale }
}

export const FOREST_EXAMPLE = [60, 90, 75]
