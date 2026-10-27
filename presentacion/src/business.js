// Confirmación del encargo. Corrige la clasificación antigua sin modificar modelos ni costos.
export const BUSINESS = {
  A: {
    name: "Uretano de hoja de resorte Toyota Hilux RN",
    shortName: "Uretano de hoja de resorte",
    code: "UAH-90385-18025",
    netSellingPrice: 2.5,
    reportedUnitsPerProductionDay: 800,
    color: "#4e79a7",
  },
  B: {
    name: "Hule de barra estabilizadora Toyota Hilux 4x4",
    shortName: "Hule de barra estabilizadora",
    code: "48815-14050",
    netSellingPrice: 12,
    reportedUnitsPerProductionDay: 210,
    color: "#d4953a",
  },
}

export const number = (value, decimals = 0) => value === null || value === undefined || !Number.isFinite(value)
  ? "Sin dato"
  : new Intl.NumberFormat("es-GT", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
export const percent = (value, decimals = 1) => `${number(value * 100, decimals)}%`
export const price = (value) => `Q${number(value, 2)}`
export const month = (value, short = true) => new Intl.DateTimeFormat("es-GT", {
  month: short ? "short" : "long", year: short ? "2-digit" : "numeric", timeZone: "UTC",
}).format(new Date(`${value.slice(0, 10)}T00:00:00Z`)).replace(".", "")

export const MODEL_NAMES = {
  naive: "Último mes",
  moving_average_3: "Promedio de 3 meses",
  moving_average_6: "Promedio de 6 meses",
  historical_average: "Promedio histórico",
  seasonal_naive: "Mismo mes del año anterior",
  linear_regression: "Regresión lineal",
  ridge: "Regresión Ridge",
  ets_level: "Suavizamiento de nivel",
  ets_damped: "Suavizamiento con tendencia amortiguada",
  ets_seasonal_add: "Suavizamiento estacional",
  sarima: "SARIMA",
  random_forest: "Bosque aleatorio",
  gradient_boosting: "Árboles con refuerzo gradual",
}
