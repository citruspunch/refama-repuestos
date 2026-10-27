import React from "react"
import { createRoot } from "react-dom/client"
import "@fontsource-variable/tiktok-sans/wght.css"
import "@fontsource-variable/montserrat/wght.css"
import App from "./App.jsx"
import "./App.css"

createRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>)
