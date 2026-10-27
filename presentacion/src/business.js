// Confirmación del encargo. Los cinco montos son precios de venta netos tras descuentos; no modifican modelos ni costos.
export const BUSINESS = {
  A: {
    name: "Uretano de hoja de resorte Toyota Hilux RN",
    shortName: "Uretano de hoja de resorte",
    code: "UAH-90385-18025",
    netSellingPrice: 2.5,
    reportedUnitsPerProductionDay: 800,
    color: "#ffd22b",
  },
  B: {
    name: "Hule de barra estabilizadora Toyota Hilux 4x4",
    shortName: "Hule de barra estabilizadora",
    code: "48815-14050",
    netSellingPrice: 12,
    reportedUnitsPerProductionDay: 210,
    color: "#feb204",
  },
  C: {
    name: "Jgo. rep. palanca velocidades Toyota Hilux 4x4",
    shortName: "Juego de palanca",
    code: "UAH-33505-35020",
    netSellingPrice: 15,
    reportedUnitsPerProductionDay: 300,
    color: "#ff8503",
  },
  D: {
    name: "Hule de hoja de resorte Toyota / Nissan corto",
    shortName: "Hule corto",
    code: "90385-18046",
    netSellingPrice: 2.5,
    reportedUnitsPerProductionDay: 480,
    color: "#d53600",
  },
  E: {
    name: "Manguera de flujo de aire Toyota 22R 4x4",
    shortName: "Manguera de aire",
    code: "17881-54820",
    netSellingPrice: 100,
    reportedUnitsPerProductionDayMin: 30,
    reportedUnitsPerProductionDayMax: 35,
    color: "#700e01",
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
export const monthRange = (start, end) => `${start.slice(0, 4) === end.slice(0, 4) ? month(start).replace(/\s\d{2}$/, "") : month(start)} a ${month(end)}`

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
  zero: "Referencia cero",
  croston_sba: "Croston-SBA",
  tsb: "TSB",
}
