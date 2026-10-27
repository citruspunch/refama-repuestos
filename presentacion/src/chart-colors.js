import { BUSINESS } from "./business.js"

// Equivalentes SVG de la paleta canónica documentada en App.css.
export const CHART_COLORS = {
  ink: "#1c1028",
  text: "#3d314a",
  grid: "#dbd6e1",
  muted: "#80708f",
  dim: "#bab0ac",
  amberBg: "#fdf3e4",
}

function rgb(hex) {
  return [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16))
}

export function luminance(channels) {
  const linear = channels.map((value) => {
    const s = value / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
}

export function contrast(a, b) {
  const values = [luminance(rgb(a)), luminance(rgb(b))].sort((x, y) => y - x)
  return (values[0] + 0.05) / (values[1] + 0.05)
}

export function heatmapColor(id, value, max) {
  const weight = 0.18 + 0.82 * value / max
  const channels = rgb(BUSINESS[id].color).map((channel) => Math.round(channel * weight + 255 * (1 - weight)))
  const background = `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`
  const color = [CHART_COLORS.ink, "#ffffff"].find((text) => contrast(text, background) >= 4.5)
  return { background, color }
}
