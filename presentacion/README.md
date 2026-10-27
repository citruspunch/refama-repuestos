# Presentación de RUJAF

Presentación completa en español sobre el proyecto universitario de pronóstico de ventas, inventario de producto terminado y escenarios preliminares de producción.

## Abrir la entrega

- **[Presentación lista para proyectar](dist/index.html)**. Abrir el archivo en un navegador. No necesita servidor ni internet después de compilarse.
- **[Guion completo](GUION.md)**. Cada diapositiva incluye contenido, visual, notas del presentador y tiempo. Se puede trasladar a PowerPoint o Canva sin redactar de nuevo el relato.
- [Fuentes y límites de la evidencia](EVIDENCIA.md).
- [Comprobaciones y limitaciones de entrega](VALIDACION.md).

Son 30 diapositivas principales, con cierre de resultados y conclusiones, más 3 anexos. La duración estimada es de 50 minutos, o 54:30 si se exponen todos los anexos. No es un tiempo medido en ensayo.

El contenido parte de los resultados existentes del repositorio. No reentrena modelos ni modifica datos, resultados históricos o código Python. La confirmación del encargo identifica Q2.50 y Q12.00 como precios netos de venta después de descuentos. No los transforma en costos.

## Presentar

| Control | Acción |
| --- | --- |
| Flechas, Espacio, Av Pág y Re Pág | Avanzar o retroceder un paso |
| Mayús + flecha | Saltar una diapositiva |
| Inicio y Fin | Ir al inicio o al cierre principal |
| F | Pantalla completa |
| A | Consultar anexos y volver al paso guardado |
| G | Cambiar entre Presentar y Explorar |
| R y P | Repetir o pausar las entradas visuales |
| ? o H | Abrir ayuda |

No hay avance automático. La posición queda en `#diapositiva/paso`, con índices desde cero. `?mode=explore` conserva el modo Explorar y no elimina otros parámetros de la URL.

En la diapositiva 27, Presentar recorre dos escenarios ya calculados. Explorar permite consultar sus variantes archivadas de seguridad y días asignados. No calcula un plan nuevo, no entrena modelos y no se conecta con la empresa. El cero de producción de A usa una estimación de venta positiva, distinta del fallo de extrapolación de Ridge.

Las notas están separadas del HTML de audiencia. Tener `GUION.md` en otro dispositivo o una copia impresa si se necesitan durante la exposición. No se añadió un control remoto ni un servidor de notas.

## Edición y reproducción

Desde `presentacion/`, con Node 22 o posterior y pnpm:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

La carpeta es un proyecto independiente y no cambia las dependencias de Python. No necesita `--ignore-workspace` en este repositorio.

```sh
pnpm test
pnpm lint
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

`pnpm test:e2e` recompila antes de probar. El resultado de producción es exclusivamente `dist/index.html`; `dist/` es generado y está ignorado por Git. Conservar `pnpm-lock.yaml` junto a las fuentes. Si el archivo no existe en otro checkout, compilarlo con los comandos anteriores.

### Archivos para editar

| Archivo | Función |
| --- | --- |
| `GUION.md` | Referencia de contenido de los 33 cuadros |
| `src/presentation.js` | Títulos, tiempos, pasos y navegación pura |
| `src/slides.jsx` | Composición de diapositivas y registro ordenado |
| `src/Charts.jsx` | Gráficos en español |
| `src/business.js` | Nombres, precios netos confirmados, ritmos y formatos |
| `src/chart-colors.js` | Colores del calendario con contraste comprobado |
| `src/App.jsx`, `src/App.css` | Controles, escenario fijo y estilo |
| `evidence-loader.js` | Lectura de tablas públicas en compilación y huellas de procedencia |

Los gráficos y lecturas numéricas importan las tablas del proyecto durante la compilación. No hay solicitudes a datos durante la exposición. Si cambian los resultados, revisar también los números narrados en `GUION.md`, las conclusiones y los tiempos. Las pruebas comparan títulos y duraciones entre el guion y la aplicación, y recalculan métricas y escenarios clave.

## Diseño y portabilidad

Escenario fijo de 1600×900 que mantiene proporciones en pantallas 16:9 y proyectores 4:3. TikTok Sans y Montserrat se incluyen dentro del HTML, con sus licencias SIL OFL 1.1 en metadatos legibles. Montserrat se usa exclusivamente en peso Thin (100) y mayúsculas. No hay enlaces a fuentes remotas. Los íconos SVG están empaquetados.

Se conserva la paleta de `src/App.css`, con papel frío, tinta ciruela, A azul y B amarillo. Las fichas y tablas toman las líneas y columnas del Kardex como referencia. La barra de navegación recupera su forma redondeada. La diapositiva 27 compara los dos escenarios de seguridad en una tabla; los selectores aparecen solo en Explorar. No hay índice ni encabezados superiores de capítulo.

Las entradas escalonadas, los conectores y el revelado de trazos y barras son animaciones CSS finitas, sin dependencias nuevas ni avance automático. Se pueden pausar y repetir; se desactivan con movimiento reducido sin ocultar información. Repetir en Explorar conserva los controles seleccionados. No se incluyeron el ejemplo analítico, las fórmulas ni el servidor opcional de la base.

La identidad visual es editorial para este borrador, no una marca oficial de RUJAF. No se inventaron logotipos, autores, carreras o autoridades institucionales.

## Antes de compartir

El HTML contiene datos agregados de ventas e inventario, aunque no nombres de clientes ni documentos privados. Revisar autorización comercial antes de publicarlo. No distribuir `kardex_csv/` o `data/private/` con la presentación.

El prototipo no ha demostrado ahorros, servicio alcanzado ni una programación óptima de la fábrica. Los escenarios históricos no autorizan decisiones reales de producción.
