# Validación de la presentación simplificada

La presentación tiene 26 diapositivas y 30 pasos. Los títulos, tiempos y notas de `GUION.md` coinciden con el recorrido. Duración orientativa de 57:30, no medida en ensayo.

## Contenido

- Se revisaron todas las diapositivas y las notas. Se combinaron la procedencia y preparación de datos, y el fallo de predicción con su revisión. Se retiraron las secciones de controles internos, canales, pruebas estacionales, árboles y tablas técnicas secundarias.
- Se conservan las fotos, los colores de los productos, las fuentes, el estilo editorial y los controles existentes.
- Se explican las ventas mensuales, las variables de entrada, las referencias simples, regresión lineal, Ridge, entrenamiento, validación temporal y MAE.
- El ejemplo de MAE usa tres meses reales de B. La comparación final conserva los seis meses de cada producto. La recta de regresión sigue identificada como ejemplo didáctico.
- Los resultados distinguen precisión de predicción y disponibilidad de inventario. Los faltantes de la simulación no se presentan como pérdidas ni ahorros reales.
- Las limitaciones generales se concentran al cierre. La diferencia entre ventas y demanda se explica donde se define el objetivo.

## Revisión actual

- La distribución temporal de la diapositiva 15 usa los 24, 20 y 6 meses archivados para A, con anchuras proporcionales y etiquetas accesibles. La ventana de entrenamiento se amplía en cada origen.
- La diapositiva 21 conserva su animación finita y usa el mismo estilo abierto de la diapositiva 22.
- Las diapositivas 23 y 24 muestran un único escenario histórico y sus resultados para los cinco productos. Las cantidades se contrastaron con las tablas fuente; las notas y conclusiones siguen el mismo alcance.
- Se ejecutaron 30 pruebas unitarias, ESLint, la compilación y 23 pruebas de Chromium. Se recorrieron los 30 pasos en tres tamaños de pantalla y se comprobó el HTML sin conexión.
- Se inspeccionaron las diapositivas 15, 21, 22, 23, 24 y 26. El escenario sigue identificado como hipotético y los faltantes como simulados.

## Revisión de las diapositivas 15 a 22

- La diapositiva 15 tiene un solo paso. En esa revisión el recorrido tenía 31 pasos en total.
- Las razones de selección se contrastan con los errores de validación y el margen del 5 %. Las previsiones y métricas no cambiaron.
- Las curvas finales conservan el nombre accesible y el popover, sin el título nativo del navegador. Los cortes de A y E se distinguen de las previsiones retrospectivas de frontera.
- Se revisaron visualmente las diapositivas modificadas. La nueva entrada de la diapositiva 21 termina, admite repetición y respeta movimiento reducido.
- Se ejecutaron 29 pruebas unitarias, ESLint, la compilación y 23 pruebas de Chromium, incluido el recorrido de los 31 pasos a 1600×900, 1280×720 y 1024×768 y la apertura del HTML sin red.
- Las comprobaciones se ejecutaron directamente con Node porque la versión global de pnpm 12 no lee los ajustes `pnpm` del `package.json` de este proyecto. No se cambiaron las dependencias ni el lockfile.

## Revisión anterior

Las siguientes comprobaciones corresponden a la revisión de la versión anterior, con 32 pasos.

### Comprobaciones ejecutadas

Desde `presentacion/`:

| Comprobación | Resultado |
| --- | --- |
| `pnpm test` | 27 pruebas aprobadas |
| `pnpm lint` | Aprobado |
| `pnpm build` | Aprobado. Un único `dist/index.html`, aproximadamente 2 MB |
| `pnpm test:e2e` | 20 pruebas de Chromium aprobadas |
| `git diff --check`, desde la raíz | Sin errores de espacios |

No se reentrenaron los modelos ni se modificaron los resultados de Python. La presentación sigue leyendo las mismas tablas del proyecto. Las comprobaciones recalculan el MAE final, verifican las cifras conservadas en las notas y contrastan las cantidades de los escenarios con sus fuentes.

Las pruebas de contenido recorren todos los pasos y comprueban títulos, extensión, ausencia de detalles internos y conservación de las variables, los métodos y las métricas relevantes. También verifican que las diapositivas no recuperen los contadores numéricos ni los pies inferiores retirados.

### Navegación y funcionamiento sin conexión

Se recorrieron los 32 pasos hacia adelante y atrás. Se comprobaron enlaces, recarga, saltos, Inicio, Fin, foco del gráfico, ayuda, pantalla completa, repetición de entradas y movimiento reducido. Las animaciones terminan sin hacer avanzar la exposición.

La prueba de entrega abre el HTML real por `file://` con el navegador sin red y recorre la presentación. No hubo solicitudes HTTP ni errores de ejecución. Código, fuentes, fotos e íconos están incluidos en el archivo. Las notas permanecen fuera del HTML del público.

### Revisión visual

Se comprobaron los 32 estados a 1600×900, 1280×720 y 1024×768, sin desbordamientos ni invasión de los controles. Se verificaron los puntos originales de las curvas, sus escalas propias, las fechas de prueba por producto y la identificación de las cinco series.

Se generaron capturas de cada estado a 1600×900 y cuatro hojas de contacto para revisar la secuencia completa. Se inspeccionaron visualmente las cuatro hojas y las capturas completas de la tabla de resultados, las curvas finales, los escenarios y el ejemplo de MAE. Se retiraron las fechas repetidas debajo de las curvas finales y el divisor inferior de los ejemplos de modelos.

Las capturas quedan en `test-results/`, dentro de la salida de la prueba de encaje y revisión visual. Se regeneran con `pnpm test:e2e`.

## Pendiente

- Ensayar la duración y comprobar legibilidad en el proyector de la sala.
- Safari/WebKit, Firefox y dispositivos físicos no se probaron en esta revisión.
- Confirmar autorización antes de divulgar los datos comerciales agregados.

La revisión visual y las pruebas del visor no validan las existencias físicas, los ritmos de producción ni el desempeño comercial de una política de inventario.
