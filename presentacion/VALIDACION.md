# Validación de la entrega

Verificación de la ampliación a cinco productos. Se conservaron los cambios de trabajo existentes en la presentación. El programa Python reentrenó y comparó quince series en `five_products_v1`, con resultados separados. El cuaderno, las métricas y los modelos históricos no se sobrescribieron. Compilar la presentación solo lee los resultados nuevos.

La revisión del 27 de octubre añade tres diapositivas de introducción visual a los modelos, en lugar de las dos anteriores. Las comprobaciones de Python corresponden a la ampliación previa; esta revisión no reentrenó modelos ni modificó resultados analíticos.

## Comprobaciones ejecutadas

| Comprobación | Resultado |
| --- | --- |
| `.venv/bin/python scripts/run_pipeline.py --expand-products`, desde la raíz | 2,108 movimientos, cinco productos y 258 combinaciones producto/mes conciliadas; ejecución completa repetida |
| `.venv/bin/python -m pytest -q --junitxml=reports/expansion_tests.xml` | 157 pruebas de Python aprobadas, incluidas las 132 anteriores |
| Dependencias de la presentación | Se reutilizaron las instaladas; no se cambiaron versiones ni lockfile |
| `pnpm test`, desde `presentacion/` | 27 pruebas aprobadas |
| `pnpm lint` | Aprobado |
| `pnpm build` | Aprobado; solo `dist/index.html`, aproximadamente 1.74 MB |
| Chromium | Se reutilizó el navegador disponible |
| Suite completa de Playwright | 27 pruebas de Chromium aprobadas, sin fallos |

La suite se ejecutó con una configuración temporal en el puerto 4197, sin cambiar la configuración del proyecto. El puerto predeterminado 4186 estaba ocupado en la revisión anterior. Las pruebas resuelven las posiciones desplazadas por ID de diapositiva. Se revisaron las ocho capturas de los modelos, además de las capturas de gráficos de la revisión previa.

Las cuatro vistas de gráficos también se abrieron por `file://` sin red a 1600×900, 1280×720 y 1024×768. Las doce vistas conservaron su geometría y los tooltips por teclado, sin errores de ejecución, solicitudes HTTP ni entradas duplicadas.

Las pruebas de Python verifican preservación por hash, un sexto código sintético, series sin historia suficiente, intermitencia, precios netos verificados, artefactos de las quince series y conservación de unidades en el replay. El entrenamiento sí se ejecutó. Repetir A/B sobre sus ventanas anteriores no constituye nueva evidencia independiente ni validación comercial.

## Contenido y evidencia

Las pruebas de la presentación comprueban:

- Correspondencia ordenada entre los 33 títulos y el registro de componentes.
- Secciones y tiempos del guion archivado, con 32 entradas y 53:00. Por indicación del usuario, `GUION.md` no se actualiza en esta revisión y sus títulos y visuales pueden diferir de la presentación. `MODELOS.md` añade notas separadas para la introducción.
- 33 diapositivas integradas y 46 pasos. Los tiempos previstos suman 54:30; las dos consultas técnicas preceden a las conclusiones.
- Entradas completas y finitas, límites de navegación y normalización de URL.
- Cantidades de los cinco productos, canales disjuntos, fronteras y meses interiores provisionales.
- MAE, WAPE y sesgo recalculados con los seis errores finales de cada método fijado.
- Los 52 MAE de consulta del guion frente a las tablas fuente, a dos decimales.
- Manifiesto de procedencia embebido en el HTML, con las huellas de las tablas actuales; no depende de que el empaquetador conserve propiedades sin uso visual.
- El fallo negativo de A, su recorte y el respaldo provisional calculado solo con meses previos.
- Aritmética, estrés y límites de los 48 escenarios; saldos y retiros de los replays.
- Clasificación uniforme de precios netos tras descuentos; rango de ritmo de E y procedencia REFAMA de C.
- Paleta exacta de cinco colores y contraste mínimo de 4.5 para las letras de producto y las celdas de calendario.
- Introducción limitada a naive, promedios de 3 y 6 meses, regresión lineal, Ridge y Random forest, todos con resultados ejecutados.
- Promedios de B calculados solo con historia anterior al corte, avance mensual de la ventana, recta didáctica con predictor estandarizado, penalización de Ridge y promedio ilustrativo de árboles.

Los montos del catálogo nuevo (precios netos tras descuentos) no reclasifican retroactivamente las salidas históricas ni alimentan automáticamente los costos de fabricación; el ingreso estimado no equivale a ingreso histórico real.

## Navegador y diseño

Se recorrieron todos los pasos hacia adelante y atrás. También se probaron enlaces profundos, recarga, parámetros ajenos al modo, saltos, inicio y cierre.

Se verificaron Presentar y Explorar con las variantes archivadas de los cinco productos. Presentar desactiva controles sin lavarlos visualmente; Explorar conserva la selección al repetir; volver a Presentar restaura los valores del paso. C pasa del límite de 300 unidades con un día a la variante de 439 con cinco días. El visor no calcula planes nuevos.

Las pruebas incluyen foco de gráficos, Espacio sobre botones sin doble avance, repetición de tecla, ayuda modal con restauración de foco, pantalla completa, pausa de entradas visuales y controles que reaparecen por teclado. No hay índice ni encabezados superiores de capítulo. Se probaron movimiento normal y reducido. No hay simulaciones animadas ni avance temporizado.

La revisión visual verifica la paleta canónica y que cada uso de Montserrat tenga peso Thin (100) y transformación a mayúsculas. Las entradas de contenido, conectores, trazos y barras son finitas. La pausa conserva los nodos y el tiempo de los trazos, sin reiniciarlos; reanudar y repetir funcionan sin avanzar la exposición. Con movimiento reducido no quedan animaciones ni trazos ocultos.

Las pruebas verifican la barra redondeada, los códigos y valores de producto, y las dos alternativas de seguridad para los cinco productos. Las comparaciones principales conservan A a E visibles en todos sus pasos. Cada paso tiene hasta 100 palabras de texto fuera de gráficos y calendarios. Los ocho pasos de modelos también se comprueban con un límite de 110 palabras, incluido el texto de sus diagramas. El recorrido termina en conclusiones, sin propuestas futuras.

La portada identifica los cinco productos por nombre, código y color, sin comprimir cinco gráficas. Ventas históricas y prueba final usan dos filas: A y B arriba; C, D y E abajo. Las pruebas comprueban posiciones, ancho por grupo, altura de gráfico de al menos 165 píxeles del escenario, puntos originales y fechas propias. Las curvas históricas mantienen el eje temporal común sin rellenar fronteras. Cada serie usa un solo trazo, sin contornos superpuestos ni valores duplicados en el tooltip. Los tonos de línea tienen contraste mínimo de 3 frente al papel y la zona de prueba; rellenos y etiquetas conservan los cinco colores originales.

Los 46 estados de diapositiva y paso pasan las comprobaciones de encaje a 1600×900, 1280×720 y 1024×768. La diapositiva 28 también se comprueba en Explorar. Se esperan las fuentes antes de medir y se comprueban límites, controles y geometría SVG. Se generaron capturas de las 33 diapositivas en su paso final y de los ocho estados de la introducción.

Se revisaron capturas de portada, catálogo, procedencia, ambas cuadrículas, comparación de errores y escenarios. Las entradas de filas, conectores y resaltados son finitas; se probaron pausa, reanudación y movimiento reducido. Esta revisión no equivale a una prueba de legibilidad en el proyector de la sala.

La revisión de modelos incluyó ambos cortes de la ventana móvil, regresión y Ridge, el árbol y el bosque. Los SVG tienen descripciones accesibles y los ejemplos didácticos están identificados. Se comprobaron cambio de método en Explorar, restauración de Presentar, repetición, pausa, reanudación y movimiento reducido.

No se registraron errores de ejecución de página durante las pruebas. Los gráficos no contienen geometría no finita o rectángulos de dimensiones negativas.

## Entrega sin conexión

La prueba abre el archivo de producción real por `file://`, con el contexto de navegador sin red. Recorre los 46 pasos, incluidas las consultas técnicas y las conclusiones. Una prueba adicional recorre los ocho pasos de modelos. No se producen solicitudes HTTP o HTTPS.

El HTML contiene código, datos agregados, estilos, íconos y fuentes WOFF2 embebidas. No usa Google Fonts ni otro recurso remoto. Incluye los avisos y textos completos de las licencias SIL OFL 1.1 de TikTok Sans y Montserrat como metadatos JSON legibles. `dist/` contiene un único archivo.

Las notas del presentador no se incorporan al HTML. Se entregan en `GUION.md` y `MODELOS.md`. No hay servidor de notas, control remoto ni dependencia de un teléfono.

## Pendiente de verificación humana o de negocio

- La duración prevista de 54:30 no se ha medido en una exposición humana.
- Probar proyector, control de diapositivas físico y legibilidad en la sala real.
- Firefox, Safari/WebKit y dispositivos móviles reales no se probaron. No se ofrece un control remoto móvil.
- No se generó ni verificó un archivo PowerPoint o Canva. El guion entrega texto y notas trasladables; el artefacto listo para proyectar es HTML.
- Confirmar autorización para divulgar cifras comerciales agregadas. La ausencia de nombres de clientes no convierte la información en pública.
- El extractor y los PDF originales no están en el repositorio. Se revisó su procedencia documentada, no una reextracción.
- El proyecto sigue sin stock físico actual confirmado, cobertura reciente completa y restricciones operativas verificadas. Tampoco acredita costos completos, servicio, ahorros reales ni un calendario de fabricación óptimo.

La presentación distingue esos límites de los análisis, modelos y escenarios que sí se ejecutaron.
