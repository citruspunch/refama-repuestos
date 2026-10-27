# Validación de la presentación simplificada

Revisión del 27 de octubre de 2026. El HTML tiene 26 diapositivas y 32 pasos. Los títulos, tiempos y notas de `GUION.md` coinciden con el recorrido. Duración orientativa de 57:30, no medida en ensayo.

## Contenido

- Se revisaron todas las diapositivas y las notas. Se combinaron la procedencia y preparación de datos, y el fallo de predicción con su revisión. Se retiraron las secciones de controles internos, canales, pruebas estacionales, árboles y tablas técnicas secundarias.
- Se conservan las fotos, los colores de los productos, las fuentes, el estilo editorial y los controles existentes.
- Se explican las ventas mensuales, las variables de entrada, las referencias simples, regresión lineal, Ridge, entrenamiento, validación temporal y MAE.
- El ejemplo de MAE usa tres meses reales de B. La comparación final conserva los seis meses de cada producto. La recta de regresión sigue identificada como ejemplo didáctico.
- Los resultados distinguen precisión de predicción y disponibilidad de inventario. Los faltantes de la simulación no se presentan como pérdidas ni ahorros reales.
- Las limitaciones generales se concentran al cierre. La diferencia entre ventas y demanda se explica donde se define el objetivo.

## Comprobaciones ejecutadas

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

## Navegación y funcionamiento sin conexión

Se recorrieron los 32 pasos hacia adelante y atrás. Se comprobaron enlaces, recarga, saltos, Inicio, Fin, foco del gráfico, ayuda, pantalla completa, repetición de entradas y movimiento reducido. Las animaciones terminan sin hacer avanzar la exposición.

La prueba de entrega abre el HTML real por `file://` con el navegador sin red y recorre la presentación. No hubo solicitudes HTTP ni errores de ejecución. Código, fuentes, fotos e íconos están incluidos en el archivo. Las notas permanecen fuera del HTML del público.

## Revisión visual

Se comprobaron los 32 estados a 1600×900, 1280×720 y 1024×768, sin desbordamientos ni invasión de los controles. Se verificaron los puntos originales de las curvas, sus escalas propias, las fechas de prueba por producto y la identificación de las cinco series.

Se generaron capturas de cada estado a 1600×900 y cuatro hojas de contacto para revisar la secuencia completa. Se inspeccionaron visualmente las cuatro hojas y las capturas completas de la tabla de resultados, las curvas finales, los escenarios y el ejemplo de MAE. Se retiraron las fechas repetidas debajo de las curvas finales y el divisor inferior de los ejemplos de modelos.

Las capturas quedan en `test-results/`, dentro de la salida de la prueba de encaje y revisión visual. Se regeneran con `pnpm test:e2e`.

## Pendiente

- Ensayar la duración y comprobar legibilidad en el proyector de la sala.
- Safari/WebKit, Firefox y dispositivos físicos no se probaron en esta revisión.
- Confirmar autorización antes de divulgar los datos comerciales agregados.

La revisión visual y las pruebas del visor no validan las existencias físicas, los ritmos de producción ni el desempeño comercial de una política de inventario.
