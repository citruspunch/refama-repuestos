# Validación de la entrega

Verificación realizada sobre el borrador creado en `presentacion/`. Se preservaron los cambios de trabajo que ya existían en el repositorio. No se reentrenaron modelos, no se regeneró el cuaderno y no se modificaron datos ni resultados históricos para preparar la presentación.

## Comprobaciones ejecutadas

| Comprobación | Resultado |
| --- | --- |
| `PYTHONDONTWRITEBYTECODE=1 .venv/bin/python -m pytest -q -p no:cacheprovider`, desde la raíz | 132 pruebas de Python aprobadas |
| `pnpm install` | Dependencias del proyecto independiente instaladas; lockfile conservado |
| `pnpm test`, desde `presentacion/` | 13 pruebas aprobadas |
| `pnpm lint` | Aprobado |
| `pnpm build`, también ejecutado por `pnpm test:e2e` | Aprobado; solo `dist/index.html`, aproximadamente 1.25 MB |
| `pnpm exec playwright install chromium` | Navegador disponible |
| `pnpm test:e2e` | 16 pruebas de Chromium aprobadas |

Las pruebas de Python incluyen preservación de la evidencia histórica. Corresponden al borrador inicial y no se repitieron para la revisión visual. No son una nueva ejecución del entrenamiento ni validación comercial de sus resultados.

## Contenido y evidencia

Las pruebas de la presentación comprueban:

- Correspondencia ordenada entre los 33 títulos y el registro de componentes.
- Presencia de contenido, propuesta visual, notas y tiempo para cada diapositiva en `GUION.md`.
- 30 diapositivas principales y 3 anexos contiguos. El recorrido principal suma 50:00; el conjunto completo, 54:30.
- Entradas completas y finitas, límites de navegación y normalización de URL.
- Cantidades históricas, canales disjuntos y meses interiores utilizables.
- MAE, WAPE y sesgo recalculados con los seis errores finales de cada método fijado.
- Los 52 MAE de consulta del guion frente a las tablas fuente, a dos decimales.
- El fallo negativo de A, su recorte y el respaldo provisional calculado solo con meses previos.
- Aritmética y bloqueos de los ocho escenarios archivados.
- Separación de precio neto de venta y costo de fabricación.
- Contraste mínimo de 4.5 para las cifras de todas las celdas de los calendarios.

Los precios confirmados en el encargo se incorporaron a la presentación sin reclasificar retroactivamente las interfaces económicas del proyecto.

## Navegador y diseño

Se recorrieron todos los pasos principales hacia adelante y atrás. También se probaron enlaces profundos, recarga, parámetros ajenos al modo, saltos, inicio, cierre y retorno exacto desde anexos.

Se verificaron Presentar y Explorar con las variantes archivadas del caso B. Presentar desactiva controles sin lavarlos visualmente; Explorar conserva la selección al repetir; volver a Presentar restaura los valores del paso. El visor no calcula planes nuevos.

Las pruebas incluyen foco de gráficos, Espacio sobre botones sin doble avance, repetición de tecla, ayuda modal con restauración de foco, pantalla completa, pausa de entradas visuales y controles que reaparecen por teclado. No hay índice ni encabezados superiores de capítulo. Se probaron movimiento normal y reducido. No hay simulaciones animadas ni avance temporizado.

La revisión visual verifica la paleta canónica y que cada uso de Montserrat tenga peso Thin (100) y transformación a mayúsculas. Las entradas de contenido, conectores, trazos y barras son finitas. La pausa conserva los nodos y el tiempo de los trazos, sin reiniciarlos; reanudar y repetir funcionan sin avanzar la exposición. Con movimiento reducido no quedan animaciones ni trazos ocultos.

Las pruebas verifican la barra redondeada, los códigos y valores de producto, y ambas filas archivadas del escenario B. Cada paso principal tiene hasta 90 palabras de texto fuera de gráficos y calendarios. El recorrido termina en conclusiones, sin propuestas futuras.

Los 36 estados de diapositiva y paso, incluidos los anexos, pasan las comprobaciones de encaje a 1600×900, 1280×720 y 1024×768. La diapositiva 27 también se comprueba en Explorar. Se esperan las fuentes antes de medir y se comprueban límites, controles y geometría SVG. Se generaron capturas de las 33 diapositivas en su paso final.

Se revisaron capturas del escenario B y el cierre de conclusiones. La tabla sustituye las cifras gigantes y los operadores del diseño anterior. Esta revisión no equivale a una prueba de legibilidad en el proyector de la sala.

No se registraron errores de ejecución de página durante las pruebas. Los gráficos no contienen geometría no finita o rectángulos de dimensiones negativas.

## Entrega sin conexión

La prueba abre el archivo de producción real por `file://`, con el contexto de navegador sin red. Recorre todos los pasos principales y los tres anexos. No se producen solicitudes HTTP o HTTPS.

El HTML contiene código, datos agregados, estilos, íconos y fuentes WOFF2 embebidas. No usa Google Fonts ni otro recurso remoto. Incluye los avisos y textos completos de las licencias SIL OFL 1.1 de TikTok Sans y Montserrat como metadatos JSON legibles. `dist/` contiene un único archivo.

Las notas del presentador no se incorporan al HTML. Se entregan en `GUION.md`. No hay servidor de notas, control remoto ni dependencia de un teléfono.

## Pendiente de verificación humana o de negocio

- La estimación de 50 minutos no se ha medido en una exposición humana.
- Probar proyector, control de diapositivas físico y legibilidad en la sala real.
- Firefox, Safari/WebKit y dispositivos móviles reales no se probaron. No se ofrece un control remoto móvil.
- No se generó ni verificó un archivo PowerPoint o Canva. El guion entrega texto y notas trasladables; el artefacto listo para proyectar es HTML.
- Confirmar autorización para divulgar cifras comerciales agregadas. La ausencia de nombres de clientes no convierte la información en pública.
- El extractor y los PDF originales no están en el repositorio. Se revisó su procedencia documentada, no una reextracción.
- El proyecto sigue sin stock físico actual confirmado, cobertura reciente completa y restricciones operativas verificadas. Tampoco acredita costos completos, servicio, ahorros reales ni un calendario de fabricación óptimo.

La presentación distingue esos límites de los análisis, modelos y escenarios que sí se ejecutaron.
