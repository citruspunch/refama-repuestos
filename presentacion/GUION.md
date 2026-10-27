# RUJAF: presentación y notas del equipo expositor

Borrador completo en español. Público previsto: representantes de RUJAF y evaluación universitaria, sin asumir formación previa en aprendizaje automático.

La exposición principal tiene 30 diapositivas y una duración estimada de 50 minutos. Con 5 minutos de preguntas ocupa 55 minutos. Los 3 anexos tienen 1:30 cada uno y se consultan dentro de la discusión. Si se exponen las 33 diapositivas, el total estimado es 54:30 sin preguntas adicionales.

| Tramo | Diapositivas | Tiempo | Acumulado |
| --- | --- | ---: | ---: |
| La decisión de negocio | 01 a 05 | 7:00 | 7:00 |
| Construir una base confiable | 06 a 09 | 6:45 | 13:45 |
| Lo que cambió en las ventas | 10 a 15 | 10:15 | 24:00 |
| Poner a prueba los pronósticos | 16 a 25 | 17:30 | 41:30 |
| Escenarios de producción | 26 a 29 | 7:15 | 48:45 |
| Resultados y conclusiones | 30 | 1:15 | 50:00 |

Los tiempos incluyen lectura de gráficos, pausas de explicación y el recorrido de escenarios de la diapositiva 27. No son una promesa de duración obtenida por ensayo con el equipo. Conviene ensayar con cronómetro y distribuir las intervenciones antes de presentar.

## Criterios de uso

- Los números históricos corresponden al análisis del 26 de octubre de 2026. Los modelos no tienen un pronóstico vigente de noviembre de 2026.
- El encargo confirma que Q2.50 y Q12.00 son precios netos de venta después de descuentos. Esa confirmación sustituye, para esta presentación, la clasificación anterior de "valor sin clasificar". No modifica modelos, escenarios ni interfaces de costos del repositorio.
- Los ritmos reportados de aproximadamente 800 y 210 unidades se refieren a días de producción. No son producción diaria constante ni capacidad máxima verificada.
- Los gráficos se recrearon en español desde las tablas del proyecto. Las imágenes originales citadas en cada visual sirven de referencia, no deben insertarse con etiquetas en inglés sin adaptarlas.
- No se muestran identidades de clientes, números de documento ni capturas de código. Los datos agregados siguen siendo comercialmente sensibles. Revisar el permiso de divulgación.
- La versión HTML no incluye estas notas. El visor de escenarios de la presentación solo consulta resultados archivados; no es una aplicación operativa conectada con RUJAF.

## 01. Ventas e inventario con datos de RUJAF

Tiempo: 1:00. Acumulado principal: 1:00.

### En pantalla

Proyecto universitario · Aprendizaje automático

Ventas e inventario con datos de RUJAF

Evaluación de pronósticos y escenarios históricos para dos componentes automotrices.

RUJAF. Fabricación y mayoreo en Guatemala. Análisis al 26 de octubre de 2026.

Análisis histórico. Sin órdenes automáticas.

### Visual

Portada tipográfica. A la derecha, una ficha de Kardex identifica el código de A y muestra sus ventas mensuales registradas, con eje en unidades y datos de `data/processed/monthly_demand.csv`. La caída visible introduce el problema sin adelantar una explicación causal.

### Notas del presentador

El proyecto universitario reconstruyó movimientos del Kardex, describió las ventas y comparó métodos de pronóstico. Sus resultados alimentaron escenarios históricos de inventario y producción para dos componentes.

El análisis no midió ahorros ni emitió órdenes. La serie de A muestra cambios de nivel, pero no identifica sus causas comerciales.

La siguiente diapositiva distingue la fabricación de RUJAF y la venta al detalle de Refama.

## 02. RUJAF fabrica. Refama vende al detalle.

Tiempo: 1:30. Acumulado principal: 2:30.

### En pantalla

- RUJAF fabrica y distribuye al por mayor componentes automotrices.
- Refama opera tiendas de venta al detalle.
- Otros clientes también reciben productos de RUJAF.
- El Kardex corresponde a RUJAF.

Los despachos a Refama no son ventas al consumidor final.

### Visual

Diagrama comercial con RUJAF a la izquierda y dos destinos a la derecha, Refama y otros clientes. Un solo inventario de producto terminado alimenta ambos canales. No dibujar una relación societaria o de propiedad no documentada.

### Notas del presentador

Describir a RUJAF como fabricante y distribuidor mayorista guatemalteco. Refama está en el siguiente nivel comercial, con tiendas que venden al detalle. El historial disponible no es la caja de esas tiendas, sino el Kardex de RUJAF.

Un despacho a Refama reduce el inventario de RUJAF. La fecha de venta al consumidor no está disponible. Los otros clientes consumen el mismo inventario. El análisis conserva Refama, otros clientes y el total de ambas, sin sumar ese total otra vez.

El Kardex describe ventas mayoristas registradas, no el consumo final de las tiendas. Sumar ventas de caja a los despachos de las mismas piezas duplicaría unidades.

Transición: con ese alcance, la pregunta de producción resulta más precisa.

## 03. Ventas recientes e inventario

Tiempo: 1:30. Acumulado principal: 4:00.

### En pantalla

Ventas recientes + inventario disponible

- Exceso de producción. Más inventario acumulado.
- Producción insuficiente. Riesgo de pedidos sin atender.

Estos riesgos no se cuantificaron como costos del negocio.

### Visual

Dos entradas del análisis a la izquierda y dos riesgos generales a la derecha. Sin cifras de pérdidas ni costos supuestos.

### Notas del presentador

Un promedio de varios años puede diferir del nivel reciente de ventas. La cantidad adicional de producción también depende del inventario libre, las reservas y los pedidos abiertos.

Acumulación y faltantes son riesgos generales, no pérdidas medidas en RUJAF. El proyecto no dispone de costos completos ni de una descripción verificada de la regla actual de producción.

## 04. Los dos productos analizados

Tiempo: 1:30. Acumulado principal: 5:30.

### En pantalla

| | Producto A | Producto B |
| --- | --- | --- |
| Componente | Uretano de hoja de resorte Toyota Hilux RN | Hule de barra estabilizadora Toyota Hilux 4x4 |
| Código | UAH-90385-18025 | 48815-14050 |
| Precio neto de venta | Q2.50 por unidad | Q12.00 por unidad |
| Ritmo reportado | Aproximadamente 800 unidades por día de producción | Aproximadamente 210 unidades por día de producción |

Precios después de descuentos. No son costos ni márgenes. Los ritmos no son capacidades máximas verificadas.

### Visual

Dos fichas abiertas con nombre, código y datos confirmados. A en azul y B en amarillo. No usar fotografías de piezas sin identificación verificada.

### Notas del presentador

Presentar los nombres completos una vez. A partir de aquí, A y B permiten seguir la comparación sin repetir códigos largos. A es el uretano de hoja de resorte; B, el hule de barra estabilizadora.

Q2.50 y Q12.00 son precios netos después de descuentos. No se dispone del precio de lista ni del porcentaje descontado. Estos valores no son costos de fabricación ni márgenes.

800 y 210 unidades son ritmos reportados por día de producción, no por día calendario. Su sostenibilidad, el uso de líneas compartidas y los tiempos de preparación no están verificados. En los escenarios solo convierten unidades en días teóricos.

## 05. Alcance del análisis

Tiempo: 1:30. Acumulado principal: 7:00.

### En pantalla

1. Kardex. 1,062 movimientos validados.
2. Pronósticos. 13 métodos con evaluación temporal.
3. Inventario. Saldos frente a ventas recientes.
4. Producción. 8 escenarios con supuestos explícitos.

Análisis histórico, sin órdenes automáticas.

### Visual

Cuatro etapas ejecutadas, sin una ruta de implementación futura.

### Notas del presentador

La implementación valida el Kardex, reconstruye ventas mensuales, compara pronósticos y calcula escenarios por producto. Cada escenario conserva sus entradas y supuestos. Las salidas inválidas o los datos requeridos faltantes bloquean el cálculo.

El repositorio permite rastrear archivos de origen, selección de métodos y errores. No contiene una medición de cambios en decisiones reales ni de beneficio comercial.

## 06. Origen de los registros

Tiempo: 1:45. Acumulado principal: 8:45.

### En pantalla

- Producto A: Kardex de 13 páginas.
- Producto B: Kardex de 10 páginas.
- Sin OCR. Lectura de texto y tablas.
- Procedencia por fila. Fecha original, página y orden.
- Movimientos separados. Venta, producción, compra, ajuste y devolución.

El repositorio conserva los CSV y su procedencia. No incluye los PDF originales ni un extractor ejecutable.

### Visual

Dos documentos esquemáticos con sus cantidades de páginas. No son capturas de los PDF originales. Fuente de la descripción del proceso: `kardex_csv/LEEME.txt` y campos de procedencia descritos en `docs/data_dictionary.md`.

### Notas del presentador

La procedencia documenta dos Kardex, de 13 páginas para A y 10 para B. La conversión usó texto y tablas, sin OCR. Cada movimiento conserva fecha original, página y secuencia; los códigos permanecen como texto.

Los nombres largos que cruzaban columnas requirieron reconstrucción y dejaron alertas. El repositorio permite reproducir el análisis desde los CSV, pero no la extracción original, porque no incluye los PDF ni el extractor. Una entrada de producción o un ajuste no se trata como venta.

## 07. Trazabilidad de los movimientos

Tiempo: 1:45. Acumulado principal: 10:30.

### En pantalla

**1,062 movimientos preservados**

583 de A y 479 de B. Consolidado sin duplicación.

CSV originales → Registros validados → Series mensuales

- Huellas SHA-256.
- Fechas, cantidades y saldos comprobados.
- 105 de 105 totales mensuales conciliados.

Las alertas no se eliminan para mejorar el modelo.

### Visual

Flujo trazable con las cantidades reales. Fuentes: `reports/data_quality.md`, `reports/tables/source_reconciliation.csv`, `reports/tables/monthly_reconciliation.csv` y `artifacts/source_manifest.json`.

### Notas del presentador

Explicar que había tres vistas de los movimientos: un archivo por producto y un consolidado. No son tres muestras independientes. El sistema usa el consolidado una vez y contrasta sus filas con los archivos individuales. Esto evita duplicar todas las operaciones por un error de integración.

La validación preservó 1,062 movimientos. Cada uno mantiene una ruta de investigación hacia la página y el orden del PDF. Las huellas SHA-256 permiten identificar cambios en los archivos fuente. No significan que el archivo sea correcto en términos comerciales, sino que sabemos qué versión usamos.

Las ventas mensuales se reconstruyeron desde movimientos VENTA. Los 105 totales producto-mes coinciden con la referencia preliminar. Es consistencia entre archivos, no una auditoría independiente de páginas ni prueba de cobertura completa.

Los pedidos grandes y las repeticiones candidatas se preservaron. Las alertas permanecen junto a los registros. Las tablas de análisis excluyen nombres de clientes.

Transición: conciliar números era necesario, pero algunos saldos seguían exigiendo revisión.

## 08. Conciliación y alertas del Kardex

Tiempo: 1:30. Acumulado principal: 12:00.

### En pantalla

**1,060 transiciones de saldo verificables, sin diferencias aritméticas.**

- 2 saldos negativos.
- 23 ajustes que requieren contexto.
- 10 eventos con saldo cero.

Las primeras dos filas no tienen un saldo previo observado.

Consistencia contable, no confirmación del stock físico ni de ventas perdidas.

### Visual

Una cifra principal para la conciliación y una lista de alertas a su lado. No presentar un porcentaje de calidad total. Fuentes: `reports/data_quality.md` y `reports/tables/quality_checks.csv`.

### Notas del presentador

El saldo previo más entradas menos salidas debe dar el saldo siguiente. Las 1,060 transiciones comprobables no tienen diferencias aritméticas. La primera fila de cada producto carece de saldo previo independiente.

Eso no certifica existencias físicas. Un Kardex puede cuadrar y tener un saldo negativo por fechas de registro, omisiones o convenciones contables. También puede tener pares de movimientos faltantes que no rompan la conciliación. Por eso conservamos dos saldos negativos y 23 ajustes como asuntos de revisión.

Los 10 eventos con saldo cero son eventos de movimientos, no necesariamente diez días completos sin producto. Puede haber una reposición posterior en la misma fecha. Los saldos diarios se reconstruyeron tomando el último movimiento ordenado y manteniendo el último saldo dentro del rango observado. Esa continuidad depende de que no falten movimientos.

Transición: estas limitaciones influyen en qué variable queremos pronosticar y qué meses aceptamos para entrenar.

## 09. Ventas registradas y meses utilizables

Tiempo: 1:45. Acumulado principal: 13:45.

### En pantalla

Objetivo: unidades de salida en movimientos VENTA de RUJAF.

Canales: Refama, otros clientes y total sin duplicación.

| Producto | Meses para los modelos | Periodo |
| --- | ---: | --- |
| A | 50 | Julio de 2022 a agosto de 2026 |
| B | 51 | Julio de 2022 a septiembre de 2026 |

Primer y último mes excluidos por cobertura no confirmada. Los meses interiores son provisionalmente completos.

### Visual

Definición del objetivo junto a dos franjas de cobertura. Distinguir los extremos no confirmados sin rellenarlos con ceros. Fuentes: `reports/tables/coverage.csv`, `data/processed/monthly_demand.csv` y `docs/methodology.md`.

### Notas del presentador

El objetivo suma salidas solo en movimientos VENTA. Devoluciones, ajustes, compras y producción quedan separados. El total combina Refama y otros clientes sin duplicación.

El último movimiento no confirma la cobertura de un mes. Por eso se excluyeron el primer y el último mes de cada producto. Quedan 50 meses para A y 51 para B; su cobertura interior es provisional. Un mes interior sin VENTA significa ausencia de ventas registradas, no demanda económica cero. Los meses terminales desconocidos no se rellenaron con ceros.

## 10. Caída de las ventas registradas

Tiempo: 2:00. Acumulado principal: 15:45.

### En pantalla

Dos series de ventas mensuales registradas, en unidades.

| Comparación de 2026 frente a 2025 | Ventas 2025 | Ventas 2026 | Cambio |
| --- | ---: | ---: | ---: |
| A, enero a agosto | 8,100 | 3,596 | −55.6% |
| B, enero a septiembre | 1,211 | 593 | −51.0% |

Las ventanas difieren entre productos. El gráfico no identifica la causa del cambio.

### Visual

Dos líneas con escalas propias, origen vertical en cero y meses interiores. El cambio comparable se coloca debajo de cada serie. Referencias originales: `reports/figures/monthly_sales_scenarios.png` y `reports/figures/calendar_growth.png`. Datos: `monthly_demand.csv` y `reports/tables/comparable_ytd.csv`.

### Notas del presentador

Dedicar los primeros segundos a enseñar a leer los ejes. Cada punto representa un mes de ventas registradas y cada producto tiene su propia escala en unidades. No comparar la altura visual de A con B como si fueran el mismo volumen.

A presenta volúmenes iniciales altos y mayor variación que B. Ambas trayectorias descienden. La asociación con el tiempo no identifica una causa comercial.

Mostrar la comparación anual más cercana con ventanas iguales dentro de cada producto. A pasa de 8,100 a 3,596 unidades entre enero y agosto, una caída de 55.6%. B pasa de 1,211 a 593 entre enero y septiembre, una caída de 51.0%. No comparar ocho meses de un año con nueve de otro.

Pausar para que la audiencia identifique la caída en ambos gráficos. No afirmar que se debe a competencia, descuentos, calidad o decisiones de Refama. El Kardex no permite aislar esas causas.

Transición: separar los canales muestra dónde es mayor el cambio observado.

## 11. Cambios por canal de venta

Tiempo: 1:30. Acumulado principal: 17:15.

### En pantalla

Cambio del promedio mensual de los últimos 12 meses frente a los primeros 12 meses utilizables.

| Producto | Refama | Otros clientes | Total RUJAF |
| --- | ---: | ---: | ---: |
| A | −15.3% | −86.0% | −83.9% |
| B | −18.0% | −68.9% | −51.3% |

Refama representa el 5.6% del volumen observado de A y el 37.2% de B.

Despachos de RUJAF, no consumo final de Refama.

### Visual

Comparación tabular de los canales y dos barras pequeñas de participación de Refama sobre el volumen total. Fuentes: `reports/tables/rujaf_demand_streams.csv` y `reports/tables/sales_summary.csv`. Referencia original: `reports/figures/customer_segment_contributions.png`.

### Notas del presentador

Esta comparación usa los promedios de los primeros y últimos doce meses utilizables, no los acumulados anuales de la lámina anterior.

En A, los despachos a Refama bajan 15.3% y las ventas a otros clientes 86.0%. En B bajan 18.0% y 68.9%, respectivamente. La participación histórica de Refama es 5.6% en A y 37.2% en B.

Estas diferencias no demuestran pérdida de clientes ni caída del consumo final. El Kardex no distingue cambios de mezcla, cadencia de pedidos, abastecimiento o registro como causas.

Transición: además de bajar, A y B tienen distinta dificultad de pronóstico.

## 12. Concentración y variación de las ventas

Tiempo: 1:45. Acumulado principal: 19:00.

### En pantalla

| Lectura del historial | A | B |
| --- | ---: | ---: |
| Promedio mensual, unidades | 1,278.76 | 121.33 |
| Variación relativa mensual, CV | 0.93 | 0.48 |
| Volumen en el 10% de pedidos más grandes | 51.7% | 25.1% |
| Rango mensual, unidades | 71 a 5,530 | 23 a 285 |

A presenta mayor variación y concentración por pedidos.

### Visual

Tabla comparativa con números alineados, sin medidores decorativos. Promedio, CV y rango usan meses interiores; concentración usa todos los pedidos observados. Referencias: `reports/figures/order_concentration.png`, `reports/figures/sales_distributions.png` y `reports/tables/sales_summary.csv`.

### Notas del presentador

Separar tamaño de variabilidad. A vende muchas más unidades, pero esa diferencia no basta para decir que es difícil de predecir. El coeficiente de variación divide la desviación mensual por el promedio y permite comparar la dispersión relativa. A tiene 0.93 y B 0.48. En A la variación mensual casi alcanza el tamaño de su media histórica.

El 10% de pedidos más grandes reúne 51.7% del volumen de A y 25.1% de B. Esos pedidos se conservaron. El promedio histórico describe la muestra, no una cantidad actual a producir.

Si surge una pregunta técnica, ambos totales tienen ventas positivas en todos los meses interiores. La existencia de muchos días sin venta no significa que la serie mensual sea intermitente. La agregación cambia la clasificación y la elección del horizonte.

El calendario permite examinar si los meses altos se repiten entre años.

## 13. Estacionalidad no confirmada

Tiempo: 1:45. Acumulado principal: 20:45.

### En pantalla

Calendarios de ventas mensuales por producto y año.

Señal armónica exploratoria. A q = 0.014; B q = 0.926. Sin estabilidad operativa confirmada.

Intensidad por producto; escalas independientes. s/d = fuera de muestra.

### Visual

Dos mapas de calor recreados en español con años en filas y meses en columnas. Mostrar cantidades en las celdas para no depender solo del color. Referencias originales: `reports/figures/calendar_heatmap.png`, `reports/figures/seasonal_profiles.png` y `reports/figures/autocorrelation.png`. Tablas: `monthly_demand.csv` y `reports/tables/seasonality.csv`.

### Notas del presentador

Invitar a buscar columnas que repitan meses altos a través de los años. Luego explicar la precaución: una celda muy intensa puede deberse a un pedido excepcional y los años recientes tienen niveles distintos. No basta con encontrar un mes alto para recomendar producir más cada vez que llegue ese mes.

El proyecto probó una forma anual con seno y coseno, incluyendo tendencia y errores robustos. Ajustó las pruebas por las seis series. A conserva una señal exploratoria con q aproximado de 0.014. B no, con q aproximado de 0.926. Esa diferencia se reporta, no se oculta.

Pero en A la autocorrelación del rezago de doce meses es solo 0.052, con un intervalo que incluye cero. B tiene −0.096, también compatible con cero. Hay alrededor de cuatro ciclos anuales y el método que repite el mismo mes del año anterior obtiene errores altos fuera de muestra. Las descomposiciones descriptivas tampoco garantizan repetición futura.

La evidencia no respalda multiplicadores estacionales ni una temporada estable de producción.

Transición: aunque el calendario no dé una regla confiable, los saldos sí revelan prioridades distintas de revisión.

## 14. Saldo histórico frente a ventas recientes

Tiempo: 2:00. Acumulado principal: 22:45.

### En pantalla

| | A | B |
| --- | ---: | ---: |
| Saldo histórico alineado | 5,892 unidades | 24 unidades |
| Corte | 31 de agosto de 2026 | 30 de septiembre de 2026 |
| Venta mensual promedio de los últimos 12 meses | 393.25 unidades | 69.83 unidades |
| Saldo dividido por ese promedio | 14.98 | 0.34 |

Cocientes retrospectivos. No son meses garantizados de cobertura ni stock físico actual.

### Visual

Dos lecturas abiertas con el cociente en grande y el numerador, denominador y fecha debajo. No usar un único eje para ambos inventarios. Referencia original: `reports/figures/inventory_and_supply.png`. Datos: `reports/tables/inventory_pressure.csv`.

### Notas del presentador

Los saldos corresponden al cierre del último mes interior utilizable, agosto para A y septiembre para B. No representan existencias físicas actuales.

A registra 5,892 unidades frente a un promedio reciente de 393.25 al mes, un cociente de 14.98. B registra 24 frente a 69.83, un cociente de 0.34. Son relaciones retrospectivas, no garantías de cobertura ni fechas de agotamiento.

En los últimos doce meses interiores de A no aparecen cierres no positivos. La caída reciente no se explica por falta observada de stock en esos cierres, aunque el Kardex no descarta restricciones no registradas. El saldo de B tampoco cuantifica ventas perdidas.

No usar los saldos finales de los meses fronterizos, 5,567 y 44, para sustituir estos cortes históricos. Corresponden a momentos posteriores y otra cobertura.

Transición: esta diferencia entre ventas y disponibilidad pone un límite importante a los modelos.

## 15. Ventas registradas y demanda no observada

Tiempo: 1:15. Acumulado principal: 24:00.

### En pantalla

Pedidos de clientes → Disponibilidad → VENTA en el Kardex

Sin registros de pedidos no atendidos, las ventas perdidas no son cuantificables.

### Visual

Diagrama conceptual, rotulado como explicación y sin cantidades inventadas. El bloque intermedio muestra que disponibilidad y registro pueden limitar lo observado. No representa una estimación de cuántas ventas se perdieron.

### Notas del presentador

Usar un ejemplo verbal condicionado: si un cliente quiere comprar y no hay producto, esa intención puede no aparecer como VENTA. El modelo aprende lo atendido y registrado, no todas las intenciones de compra.

La consecuencia no es descartar el Kardex. Es nombrar bien el objetivo y mantener una revisión de disponibilidad. Las ventas registradas son una base provisional para planificar salidas de RUJAF, pero no corrigen por sí mismas la demanda limitada por inventario.

No hay horarios de movimientos, periodos verificados de agotamiento ni pedidos no atendidos para calcular ventas perdidas. Un saldo cero o negativo no autoriza a añadir unidades estimadas al historial.

## 16. Variables anteriores al mes objetivo

Tiempo: 1:45. Acumulado principal: 25:45.

### En pantalla

Ejemplo real de A para estimar septiembre de 2026, con información disponible al cierre de agosto.

| Junio | Julio | Agosto | Promedio de los tres |
| ---: | ---: | ---: | ---: |
| 360 u. | 71 u. | 184 u. | 205 u. |

Siete variables para regresión y árboles: tres ventas rezagadas, un promedio rezagado, tiempo y dos señales de calendario.

Ninguna variable usa ventas del mes objetivo. El promedio 205 es una señal, no el pronóstico Ridge.

### Visual

Secuencia de tres meses observados y su promedio. Debajo, identificar las familias de las siete variables sin fórmulas. Fuentes: `src/inventory_demand/features.py`, `data/processed/monthly_demand.csv` y `data/processed/monthly_features.csv`.

### Notas del presentador

Al cierre de agosto están disponibles las ventas de agosto, julio y junio de A, de 184, 71 y 360 unidades. Su promedio es 205. Es información anterior al objetivo de septiembre, no la predicción de Ridge.

El modelo también conoce el paso del tiempo y el mes del calendario. El calendario se representa con dos señales cíclicas para que diciembre y enero no queden artificialmente alejados. Esto no obliga a que haya estacionalidad; solo permite que el modelo evalúe esa información.

La implementación desplaza primero la serie hacia el pasado y después calcula los promedios móviles. Invertir ese orden puede introducir ventas del mes objetivo. Las pruebas comprueban esa separación temporal.

Se exportaron más variables, incluidos rezagos de inventario, pero el entrenamiento predeterminado usa solo siete. El inventario es incierto y la muestra pequeña. Al inicio, 24 meses de historial dejan 21 filas supervisadas después de crear los tres rezagos. No conviene confundir una tabla de muchas columnas con información suficiente para un modelo complejo.

Transición: con esas señales, la regresión intenta aprender una combinación útil.

## 17. Regresión lineal y Ridge

Tiempo: 1:30. Acumulado principal: 27:15.

### En pantalla

Variables previas → Ajuste → Pronóstico

- Regresión lineal. Pesos para combinar las siete variables.
- Ridge. Penalización de coeficientes extremos.
- Estandarización dentro de cada entrenamiento.

Las relaciones aprendidas no identifican causas ni garantizan extrapolaciones válidas.

### Visual

Diagrama de entrada, ajuste y salida. Evitar ecuaciones, coeficientes no publicados y capturas de código. La explicación corresponde a la implementación de `src/inventory_demand/forecasting.py`.

### Notas del presentador

Describir la regresión como una forma de aprender cuánto aporta cada señal a la estimación del siguiente mes. No es una regla redactada a mano ni una interpretación causal de la empresa. Los pesos se ajustan para reducir errores con ejemplos del pasado.

La comparación incluye regresión lineal y Ridge. Ridge penaliza coeficientes grandes cuando las variables comparten información, como ventas rezagadas y sus promedios. El parámetro alpha es 10, fijado en el conjunto de candidatos.

La estandarización se ajusta dentro de cada entrenamiento, sin usar toda la serie. Regularizar no impide una extrapolación negativa; el caso de A conserva ese resultado.

## 18. 13 métodos comparados

Tiempo: 1:30. Acumulado principal: 28:45.

### En pantalla

| Familia | Cantidad | Métodos |
| --- | ---: | --- |
| Referencias simples | 5 | Último mes, mismo mes del año anterior, promedio histórico, promedio de 3 meses y promedio de 6 meses |
| Regresiones | 2 | Lineal y Ridge |
| Modelos de series | 4 | Suavizamiento de nivel, tendencia amortiguada, estacional y SARIMA |
| Árboles | 2 | Bosque aleatorio y árboles con refuerzo gradual de poca profundidad |

50 y 51 meses por serie. Configuraciones fijas, sin búsqueda masiva de parámetros.

### Visual

Cuatro grupos abiertos, sin una jerarquía visual que declare ganador al aprendizaje automático. Fuente: conjunto fijo `CANDIDATES` en `src/inventory_demand/forecasting.py`.

### Notas del presentador

Explicar por qué hacen falta referencias simples. Repetir el último mes es una regla que cualquier equipo puede entender. Si un modelo complejo no la supera de forma estable, su complejidad no está justificada por la evidencia disponible. Repetir el mismo mes del año anterior prueba si una regla estacional ayuda.

Los promedios usan distintas ventanas de memoria. Suavizamientos y SARIMA aprovechan la estructura temporal; regresiones y árboles usan las siete variables del historial. La selección es independiente por producto y canal.

La muestra de unas cincuenta observaciones por serie limitó las configuraciones. El bosque tiene profundidad máxima 3 y el refuerzo usa árboles de profundidad 1. No hubo redes neuronales ni búsqueda masiva de parámetros.

No todos los ajustes fueron exitosos en todos los canales. Por ejemplo, el suavizamiento de nivel de A hacia Refama falló en un origen de validación. El sistema registra fallos y un candidato incompleto no puede ser seleccionado. Un error parcial bajo no lo convierte en ganador.

La evaluación respeta el orden de los meses y la información disponible en cada origen.

## 19. Validación en orden temporal

Tiempo: 2:15. Acumulado principal: 31:00.

### En pantalla

| Producto | Historia inicial | Orígenes de validación | Prueba final |
| --- | ---: | ---: | --- |
| A | 24 meses | 20 | 6 meses, marzo a agosto de 2026 |
| B | 24 meses | 21 | 6 meses, abril a septiembre de 2026 |

Pronosticar un mes. Observar el resultado. Ampliar el historial.

Selección anterior a la prueba final. Sin mezcla aleatoria de meses.

### Visual

Dos líneas de tiempo proporcionales con bloques de historia inicial, validación y prueba. Primer paso del control: explicar la validación creciente. Segundo paso: destacar los seis meses finales. Fuente: `reports/tables/validation_splits.csv` y `src/inventory_demand/evaluation.py`.

### Notas del presentador

El entrenamiento inicia con 24 meses y pronostica el siguiente. Tras observar su venta real, el sistema mide el error y amplía el historial. La ventana crece; el horizonte sigue siendo de un mes.

La validación comprende 20 orígenes en A y 21 en B. Sus errores fijan el método antes de evaluar los seis meses finales. La segunda pulsación destaca ese bloque reservado.

Esto es distinto de mezclar filas al azar. Una división aleatoria puede entrenar con meses posteriores al que supuestamente pronostica. También es distinto de emitir hoy un pronóstico de seis meses: aquí actualizamos con el resultado real cada mes antes del siguiente pronóstico. No presentar estos resultados como desempeño multimes de origen único.

Durante la prueba, los meses anteriores pueden incorporarse al entrenamiento una vez observados, sin cambiar la selección. No hay fechas de contabilización ni versiones del reporte; se asumió que los movimientos estaban disponibles al cierre de su mes. Correcciones posteriores podrían romper ese supuesto.

Transición: faltaba una regla de selección que no premiara complejidad por diferencias mínimas.

## 20. Selección con una banda de error del 5%

Tiempo: 1:30. Acumulado principal: 32:30.

### En pantalla

Hasta un 5% más de MAE de validación para elegir un método más simple.

| Producto | Menor MAE de validación | Método fijado | MAE fijado |
| --- | --- | --- | ---: |
| A | Regresión lineal, 371.27 | Regresión Ridge | 380.65 |
| B | Tendencia amortiguada, 34.02 | Promedio de 3 meses | 34.95 |

MAE significa error absoluto medio en unidades por mes. La prueba final no interviene en la selección.

### Visual

Regla en una frase y tabla de decisiones. No usar un trofeo ni colorear al método de menor error final como ganador de validación. Fuente: `reports/tables/selected_models.csv`.

### Notas del presentador

MAE promedia los errores absolutos en unidades, sin cancelar errores positivos con negativos. La selección admite hasta un 5% más que el menor MAE de validación y favorece el método más simple según un orden prefijado. La banda no es un nivel de confianza ni una mejora garantizada.

En A la regresión lineal obtuvo 371.27 y Ridge 380.65. Ridge está dentro de la banda y aparece antes en el orden de simplicidad. En B la tendencia amortiguada obtuvo 34.02, pero el promedio de tres meses, con 34.95, también está dentro de la banda y es más simple.

RMSE, WAPE, sesgo y errores escalados complementan el diagnóstico, sin sustituir la regla de selección. La prueba final conserva esa selección aunque otro método presente menor error.

## 21. A: MAE de Ridge frente al último mes

Tiempo: 2:00. Acumulado principal: 34:30.

### En pantalla

Producto A. Método fijado: regresión Ridge.

**290.19 unidades de error absoluto medio.**

| Método | MAE de prueba final |
| --- | ---: |
| Ridge, fijado en validación | 290.19 |
| Repetir el último mes | 312.33 |
| Promedio de 3 meses | 222.78 |
| Regresión lineal | 211.13 |

Ridge tuvo 7.1% menos MAE que el último mes. La ventaja no está establecida como robusta.

### Visual

Barras horizontales desde cero, con MAE menor como mejor resultado. Destacar Ridge por ser la selección fijada, no por ser el menor error del gráfico. Prueba de marzo a agosto de 2026. Datos: `reports/tables/model_comparison.csv`. Referencia original: `reports/figures/model_comparison.png`.

### Notas del presentador

Ridge, fijado en validación, obtiene MAE de 290.19 unidades frente a 312.33 del último mes. La reducción relativa es 7.1% en seis orígenes, no una garantía de desempeño futuro.

El promedio de tres meses y la regresión lineal presentan menores MAE finales. Es un ranking retrospectivo del conjunto fijo de candidatos; no sustituye la selección anterior a la prueba.

El intervalo exploratorio de la mejora media de Ridge frente al último mes va aproximadamente de −109.35 a 153.64 unidades. Incluye cero y proviene de solo seis errores. No basta para declarar una ventaja robusta. La regresión lineal, aunque aparece mejor en MAE, también tuvo salidas recortadas a cero en la prueba. Menor error agregado no significa que una alternativa ya sea segura para operar.

El volumen vendido también cambió entre validación y prueba. WAPE y sesgo describen aspectos que el MAE por sí solo no muestra.

Transición: en B, incluso la referencia más simple superó al método fijado.

## 22. B: menor MAE al repetir el último mes

Tiempo: 1:45. Acumulado principal: 36:15.

### En pantalla

Producto B. Método fijado: promedio de 3 meses.

| Método | MAE de prueba final |
| --- | ---: |
| Promedio de 3 meses, fijado en validación | 37.33 |
| Repetir el último mes | 34.17 |
| Bosque aleatorio | 46.90 |
| Ridge | 63.58 |

El método fijado tuvo 9.3% más MAE que repetir el último mes. No hay una ventaja general demostrada del aprendizaje automático.

### Visual

Barras horizontales con la misma convención de la diapositiva anterior, pero escala propia para B. Prueba de abril a septiembre de 2026. Fuente: `reports/tables/model_comparison.csv`.

### Notas del presentador

La regla de validación seleccionó el promedio de tres meses. En los seis orígenes finales obtuvo MAE de 37.33 unidades frente a 34.17 del último mes, un error 9.3% mayor.

Los métodos de aprendizaje automático tampoco dominaron. El bosque aleatorio tiene 46.90 y Ridge 63.58 en esa prueba. En validación, el bosque había tenido 34.31, cercano a los mejores valores. Su resultado final muestra por qué una diferencia favorable en una etapa no basta para prometer utilidad futura.

El intervalo exploratorio de mejora del método fijado frente al último mes incluye cero, aproximadamente de −18.56 a 12.22 unidades. La selección original permanece sin cambios. Elegir otra vez a partir de la prueba eliminaría su independencia.

Transición: para entender la utilidad de ambos modelos debemos mirar los errores en el tiempo, no solo una barra promedio.

## 23. Error relativo y sesgo en la prueba final

Tiempo: 1:45. Acumulado principal: 38:00.

### En pantalla

Ventas reales registradas y pronósticos mensuales. La zona sombreada marca la prueba final.

| Método fijado | WAPE final | Sesgo medio |
| --- | ---: | ---: |
| A, Ridge | 93.2% | +228.85 u./mes |
| B, promedio de 3 meses | 60.4% | −7.44 u./mes |

WAPE no es porcentaje de acierto. Un sesgo positivo indica sobrepronóstico.

### Visual

Dos gráficos de líneas con venta real, método fijado y último mes. Escalas separadas, ejes desde cero y prueba final sombreada. Referencia original: `reports/figures/actual_vs_predicted.png`. Datos: `reports/tables/backtest_predictions.csv` y `reports/tables/model_comparison.csv`.

### Notas del presentador

Señalar la venta real, el método fijado y la referencia del último mes. Leer primero un pico y luego una caída para mostrar que el error cambia de signo y magnitud. La zona sombreada no son seis pronósticos emitidos juntos, sino los seis ejercicios mensuales de prueba que ya explicamos.

WAPE divide la suma de errores absolutos por el volumen real agregado. En A es 93.2% y en B 60.4%. No es exactitud ni implica el mismo porcentaje de error en cada mes.

Ridge sobrepronostica A en promedio 228.85 unidades al mes en la prueba. El promedio de tres meses subpronostica B en 7.44 unidades. El proyecto no monetizó las consecuencias de esos sesgos.

Estos resultados, con pocos meses y cambios del nivel de venta, desaconsejan automatizar. Los intervalos de error del proyecto son heurísticos y dependen de errores de validación ya usados para seleccionar. No son una garantía calibrada de cobertura o nivel de servicio.

El resultado sin recorte de A permite examinar la validez de una salida individual.

## 24. A: extrapolación negativa de Ridge

Tiempo: 1:45. Acumulado principal: 39:45.

### En pantalla

Producto A. Ridge para septiembre de 2026, desde el cierre de agosto.

Salida sin recorte: **−102.29 unidades** → Salida recortada: **0 unidades**

El recorte evita cantidades negativas, pero no corrige la extrapolación.

En el segundo paso: **325 unidades ya registradas en el septiembre parcial.**

No representa demanda cero. Debe bloquear el uso operativo.

### Visual

Secuencia numérica con dos pasos controlados por el expositor. Primero, negativo y recorte. Después, contraste con el mes parcial. Fuente: `reports/tables/next_history_month_forecasts.csv` y código de preservación de salidas crudas en `src/inventory_demand/forecasting.py`.

### Notas del presentador

Explicar el problema antes de revelar el contraste. Al ajustar Ridge con toda la historia utilizable de A, la extrapolación al siguiente mes produce −102.29 unidades. El sistema original imponía no negatividad a todos los candidatos y publicaba cero, pero conservó también el resultado sin recorte y su bandera de alerta.

Revelar la segunda parte con una pulsación. En el septiembre de cobertura no confirmada ya existen 325 unidades vendidas. Ese dato parcial impide interpretar el cero como evidencia de ausencia de demanda. No lo usamos para entrenar el pronóstico de agosto ni para inventar la venta del mes completo.

El criterio principal de invalidez es la extrapolación negativa y su recorte, no haber visto ventas futuras mayores que un punto pronosticado. Un pronóstico incierto puede quedar debajo de un resultado parcial sin que eso autorice elegir otro modelo mirando el futuro.

La salida original y sus métricas se conservaron. Ese cero recortado no es el cero de producción adicional del escenario A. Una cantidad adicional puede ser cero con ventas esperadas positivas si el saldo supera el objetivo supuesto.

## 25. Controles de validez y respaldo provisional

Tiempo: 1:45. Acumulado principal: 41:30.

### En pantalla

1. Rechazar negativos, recortes, fallos y valores no finitos.
2. Contrastar con los tres meses anteriores.
3. Probar un respaldo fijo solo si falla la salida original.
4. Revisar el respaldo o bloquear el cálculo.

En A, el respaldo provisional es el promedio de 3 meses: **205 unidades**.

Controles añadidos después del experimento. No prueban una mejora nueva de precisión ni autorizan producción.

### Visual

Flujo de decisión con bloqueo explícito y un ejemplo de A. Fuentes: `src/inventory_demand/forecast_validity.py`, `reports/tables/forecast_validity.csv` y `reports/tables/forecast_safeguard_comparison.csv`.

### Notas del presentador

Describir qué cambió en el código. La revisión rechaza una salida cruda negativa, el recorte a cero, valores no finitos y fallos de ajuste. También compara con el promedio previo de tres meses. Los límites predeterminados, 10% y 300% de esa referencia, son reglas configurables de revisión, no umbrales operativos confirmados por RUJAF.

Si la salida original falla, el respaldo fijo es el promedio de tres meses, no el método de menor error en la prueba. El respaldo pasa los mismos controles. Si también falla, el cálculo queda bloqueado. Una salida original válida se conserva aunque otro método tenga menor error retrospectivo.

La regla se diseñó después de inspeccionar los resultados. Su repetición en los mismos orígenes es un diagnóstico posterior, no evidencia independiente. En el total de A, el MAE de esa repetición baja de 290.19 a 270.58, pero el sesgo sube de +228.85 a +270.58. En B hacia Refama incluso empeora el MAE, de 16.01 a 24.00. El control no es un optimizador de exactitud.

Transición: una estimación que pasa controles todavía necesita inventario y condiciones reales para apoyar producción.

## 26. Entradas de los escenarios de producción

Tiempo: 1:30. Acumulado principal: 43:00.

### En pantalla

| Pronóstico | Inventario | Producción |
| --- | --- | --- |
| Origen, validez e incertidumbre | Stock libre, reservas y pedidos | Plazo, lotes, ritmo y días disponibles |

Si fallan los datos requeridos, el cálculo se bloquea. No es un calendario óptimo de toda la fábrica.

### Visual

Tres grupos de entradas que alimentan una revisión de producción. Cada grupo reúne información realmente necesaria, no métricas decorativas. Fuentes: `src/inventory_demand/inventory.py` y `docs/production_planning.md`.

### Notas del presentador

La estimación de ventas no equivale a producción adicional. El cálculo también usa stock libre, reservas, restricciones, órdenes dentro del horizonte y pedidos atrasados. Una recepción posterior no resuelve un faltante anterior.

La extensión implementada calcula por producto una revisión periódica. El objetivo cubre las ventas esperadas durante el plazo más el periodo hasta la siguiente revisión, más un stock de seguridad explícito. Después aplica lotes y límites de producción o almacenamiento cuando se suministran.

La interfaz exige entradas y supuestos identificados. Una previsión inválida, información requerida faltante u órdenes vencidas sin conciliar pueden bloquear el cálculo. Incluso una fila que sí calcula sigue siendo un escenario, porque el uso en vivo permanece bloqueado.

La implementación no resuelve un programa óptimo de fábrica con materiales, cambios de molde, rendimientos y máquinas compartidas. Los ritmos reportados convierten unidades en días teóricos, sin garantizar fechas factibles.

Transición: recorreremos dos resultados ya ejecutados para B y veremos cuánto cambia la salida al cambiar un supuesto.

## 27. B: dos supuestos de stock de seguridad

Tiempo: 2:30. Acumulado principal: 45:30.

### En pantalla

Escenario histórico de B. Saldo al 30 de septiembre de 2026. Mes objetivo: octubre de 2026.

- Saldo disponible supuesto: 24 unidades.
- Venta mensual estimada: 96.33 unidades.
- Ritmo del escenario: 210 unidades por día de producción.

| Variante ejecutada | Seguridad | Objetivo de inventario | Producción sugerida | Días teóricos |
| --- | ---: | ---: | ---: | ---: |
| Sin seguridad | 0 u. | 118.81 u. | 95 u. | 0.45 |
| Un mes de seguridad | 96.33 u. | 215.14 u. | 192 u. | 0.91 |

Supuestos: 30 días por mes, plazo total de 7 días y revisión cada 30 días. Sin órdenes abiertas, reservas, restricciones ni atrasos. Lotes de 1 unidad y sin topes adicionales. Un día productivo asignado a B.

### Visual

Tabla de dos filas de `reports/tables/production_scenarios.csv`, visibles al mismo tiempo. Arriba figuran saldo, pronóstico y ritmo supuesto. En Presentar, cada paso resalta una fila y oculta los selectores. En Explorar aparecen los controles de seguridad y días asignados. El visor solo consulta resultados archivados.

### Notas del presentador

El corte es histórico, al 30 de septiembre de 2026, para un objetivo de octubre. No representa stock actual ni una orden. El promedio de tres meses de B aporta 96.33 unidades mensuales y pasa los controles del escenario, sin validación operativa.

Recorrer la primera variante durante unos 50 segundos. Se suponen 30 días por mes. El plazo de siete días y los treinta hasta revisar de nuevo forman un horizonte de 37 días. A ritmo medio constante, la salida esperada de ese horizonte es 118.81 unidades. Con 24 disponibles, faltan 94.81 para ese objetivo y el redondeo a unidades completas da 95. A 210 por día productivo, son 0.45 días teóricos.

El segundo paso resalta la fila con un mes de seguridad, 96.33 unidades. El objetivo pasa a 215.14, la producción calculada a 192 y el tiempo teórico a 0.91 días. La diferencia describe sensibilidad al supuesto, no una reserva óptima ni un servicio demostrado.

Las variantes de cinco días disponibles no cambian estas cantidades porque ese límite no restringe los casos archivados. No demuestran cinco días independientes por producto en una línea compartida. El plazo de siete días ya incluye procesamiento; no se suma otra vez el tiempo teórico de fabricación.

Si el visor falla durante la exposición, usar esta tabla estática. No ejecutar el pipeline completo ni modificar resultados históricos en vivo.

Transición: A muestra la situación opuesta, un stock histórico grande frente a la salida del escenario.

## 28. A: saldo superior al objetivo del escenario

Tiempo: 1:45. Acumulado principal: 47:15.

### En pantalla

Producto A. Corte histórico al 31 de agosto de 2026.

- Saldo registrado: **5,892 unidades**.
- Pronóstico efectivo provisional: **205 unidades por mes**.
- Objetivo supuesto: **252.83 unidades**.
- Producción adicional sugerida: **0 unidades**.

El cero corresponde a producción adicional, no a demanda cero.

Resultado histórico, no orden de producción.

### Visual

Stock a la izquierda y cantidad adicional a la derecha. Mostrar el pronóstico positivo junto al cero de producción para evitar confundirlo con el fallo de Ridge. Fuente: fila de A con un día disponible y seguridad cero en `reports/tables/production_scenarios.csv`.

### Notas del presentador

El escenario usa el respaldo provisional de 205 unidades, no el cero recortado de Ridge. Con treinta días por mes, siete de plazo, treinta de revisión y sin seguridad, el objetivo es 252.83 unidades.

El saldo de 5,892 supera ese objetivo y la cantidad adicional calculada es cero. La fila registra 5,639.17 unidades sobre el objetivo supuesto; no las clasifica como obsoletas ni como desperdicio. Multiplicarlas por un precio de venta no demuestra ahorro.

El stock físico y las restricciones no están confirmados. Extender 205 unidades constantes a varios años sería un supuesto adicional, no un resultado del modelo.

## 29. Implementación y límites

Tiempo: 1:30. Acumulado principal: 48:45.

### En pantalla

| Ejecutado | Límites |
| --- | --- |
| 1,062 movimientos validados | Stock físico no confirmado |
| 13 métodos evaluados | Restricciones operativas supuestas |
| 8 escenarios de producción | Costos incompletos; servicio no medido |
| CLI y cuaderno ejecutado | Ahorros no demostrados |

132 pruebas de Python aprobadas en el borrador inicial. Validan lógica, no resultados comerciales.

### Visual

Dos columnas con estados explícitos. No usar una lista de hitos que mezcle planes futuros con funcionalidades terminadas. Fuentes: `src/inventory_demand/`, `tests/`, cuaderno ejecutado y resultados de `pytest` en esta revisión.

### Notas del presentador

Resumir el trabajo implementado con productos verificables. El proyecto tiene lectura y validación de datos, exportaciones, análisis exploratorio, entrenamiento, evaluación y artefactos de los métodos seleccionados. El cuaderno fue ejecutado y la interfaz de línea de comandos permite reproducir el análisis desde los CSV.

La extensión añade controles de validez, repetición diagnóstica de esos controles y ocho escenarios de producción. Son dos productos, dos opciones de días asignados y dos niveles de seguridad. No son ocho decisiones reales de RUJAF ni una simulación continua de toda su operación.

Las 132 pruebas de Python corresponden a la verificación del borrador inicial. Incluyen fechas, fuga de información, métricas, salvaguardas, inventario, producción, interfaces económicas y preservación de resultados. La edición de la presentación no reentrenó modelos ni regeneró evidencia congelada.

El sistema mantiene bloqueado el uso en vivo y no acredita servicio ni ahorros. La presentación web es un medio de comunicación de esos resultados, no evidencia de que RUJAF ya cuente con una aplicación de operación instalada.

El cierre resume los resultados del historial, los pronósticos y los escenarios.

## 30. Resultados y conclusiones

Tiempo: 1:15. Acumulado principal: 50:00.

### En pantalla

Ventas registradas. Descenso en ambos productos, con mayor variación y concentración de pedidos en A.

Pronósticos. Sin ventaja robusta general del aprendizaje automático frente a referencias simples.

Producción. Los escenarios distinguen el saldo alto de A y la sensibilidad de B al stock de seguridad.

1,062 movimientos preservados · 13 métodos evaluados · 8 escenarios calculados

Resultados históricos. Sin validación operativa ni ahorros demostrados.

### Visual

Tres filas abiertas con conclusiones del historial, la comparación de métodos y los escenarios. Sin solicitud de autorización ni plan de trabajo futuro. Fuentes: `sales_summary.csv`, `model_comparison.csv` y `production_scenarios.csv`.

### Notas del presentador

Las ventas registradas bajan en ambos productos. A concentra más volumen en pedidos grandes y tiene mayor variación relativa. El Kardex permite describir esas diferencias, no atribuirlas a una causa comercial.

La comparación de trece métodos no demuestra una ventaja robusta general del aprendizaje automático. Ridge reduce 7.1% el MAE frente al último mes en A, pero el intervalo exploratorio incluye cero. En B, el último mes presenta menor MAE que el promedio seleccionado. Las métricas y la selección originales se conservaron.

Los ocho escenarios exponen cantidades y supuestos. Con seguridad cero, A calcula cero unidades adicionales pese a un pronóstico positivo. En B, los dos niveles de seguridad producen 95 y 192 unidades. No son órdenes ni un calendario de fábrica.

El proyecto dejó datos trazables, errores medidos y escenarios reproducibles. No midió rentabilidad ni ahorros. Q2.50 y Q12.00 son precios netos de venta, no costos de fabricación. Las interfaces económicas tienen pruebas de aritmética con datos sintéticos, no beneficios comerciales observados.

El recorrido principal termina aquí. Los anexos quedan disponibles para preguntas con la tecla A y devuelven al punto guardado.

## 31. Respaldo de modelos y evaluación

Tiempo: 1:30. Anexo opcional. Acumulado si se muestran todos los anexos: 51:30.

### En pantalla

| Producto y método | MAE | RMSE | WAPE | Sesgo medio | Meses |
| --- | ---: | ---: | ---: | ---: | ---: |
| A, Ridge fijado | 290.19 | 371.86 | 93.2% | +228.85 | 6 |
| A, último mes | 312.33 | 465.85 | 100.3% | +212.33 | 6 |
| B, promedio de 3 meses fijado | 37.33 | 45.13 | 60.4% | −7.44 | 6 |
| B, último mes | 34.17 | 42.57 | 55.3% | +0.83 | 6 |

MAE y RMSE en unidades. Sesgo positivo indica sobrepronóstico. Los intervalos exploratorios de mejora frente al último mes incluyen cero para los dos métodos fijados.

### Visual

Tabla de consulta, sin volver a exponer toda la metodología. Fuente: `reports/tables/model_comparison.csv` y `reports/tables/paired_baseline_comparison.csv`. Los números de validación y de todos los candidatos permanecen abajo para discusión, no deben comprimirse todos en la diapositiva.

### Notas del presentador

Este anexo responde preguntas sobre métricas y límites de comparación. RMSE penaliza más los errores grandes; WAPE expresa error agregado respecto al volumen observado; sesgo informa dirección. El MASE no estacional usa una escala calculada dentro de cada historial de entrenamiento. Ninguno acredita por sí solo utilidad operativa.

La mejora media de A frente al último mes es 22.15 unidades, con intervalo exploratorio de 95% de −109.35 a 153.64. En B es −3.17, con intervalo de −18.56 a 12.22. Se obtuvieron con remuestreo por bloques y solo seis errores finales. No son una prueba concluyente de superioridad o igualdad.

Si preguntan por todos los métodos, consultar esta tabla. Son los totales combinados, con ventanas de prueba distintas por producto y los parámetros fijos del proyecto. No es una nueva búsqueda de ganadores.

| Método | A, MAE validación | A, MAE prueba | B, MAE validación | B, MAE prueba |
| --- | ---: | ---: | ---: | ---: |
| Último mes | 547.65 | 312.33 | 37.81 | 34.17 |
| Promedio de 3 meses | 505.12 | 222.78 | 34.95 | 37.33 |
| Promedio de 6 meses | 492.46 | 226.44 | 38.19 | 42.22 |
| Promedio histórico | 883.66 | 1,045.92 | 39.79 | 62.98 |
| Mismo mes del año anterior | 636.90 | 540.33 | 52.81 | 87.33 |
| Suavizamiento de nivel | 531.74 | 270.78 | 39.79 | 47.36 |
| Tendencia amortiguada | 488.65 | 236.68 | 34.02 | 42.65 |
| Suavizamiento estacional | 651.08 | 444.78 | 47.55 | 62.96 |
| Ridge | 380.65 | 290.19 | 37.09 | 63.58 |
| Regresión lineal | 371.27 | 211.13 | 38.16 | 71.60 |
| SARIMA | 740.01 | 789.51 | 39.40 | 59.14 |
| Bosque aleatorio | 540.26 | 348.05 | 34.31 | 46.90 |
| Árboles con refuerzo gradual | 556.27 | 628.29 | 37.69 | 51.31 |

La regla de respaldo posterior no cambia esta tabla ni las selecciones. Su aparente mejora en una repetición del mismo historial no es una evaluación independiente. Volver al punto guardado de la exposición con A.

## 32. Supuestos de los escenarios de producción

Tiempo: 1:30. Anexo opcional. Acumulado si se muestran todos los anexos: 53:00.

### En pantalla

| Entrada | Supuesto ejecutado |
| --- | --- |
| Conversión mensual | 30 días calendario por mes |
| Plazo y revisión | 7 días hasta recibir unidades buenas y revisión de 30 días |
| Días productivos asignados | 1 o 5 por producto |
| Stock de seguridad | Cero o un mes del pronóstico efectivo |
| Pedidos, reservas y atrasos | Sin órdenes abiertas; reservas, restricciones y atrasos en cero |
| Lotes y límites adicionales | Lotes de 1; sin mínimo ni topes adicionales de producción o almacén |
| Ritmos reportados | A ≈ 800 y B ≈ 210 unidades por día de producción |

No prueba un calendario conjunto factible ni servicio alcanzado.

### Visual

Registro de supuestos, no pantalla de parámetros aprobados por RUJAF. Fuentes: `scenarios/rujaf_planning.json`, `artifacts/rujaf_planning_readiness.json` y el detalle JSON de cada fila en `production_scenarios.csv`.

### Notas del presentador

Usar el anexo para responder qué datos son de la empresa y cuáles se pusieron para ensayar. Los ritmos fueron reportados, pero tratarlos como unidades buenas sostenibles sigue siendo una suposición del escenario. El stock viene del Kardex histórico y tampoco está confirmado físicamente.

Treinta días por mes, siete de plazo, una revisión mensual y los niveles de seguridad no se estimaron como parámetros reales. La ausencia de órdenes abiertas o reservas se declaró para el ejemplo; no significa que RUJAF carezca de ellas. No indicar un tope adicional no demuestra capacidad o almacén ilimitados.

El cálculo expresa una necesidad por SKU bajo demanda media constante. Convierte el promedio mensual en una tasa semanal por siete días, pero eso no constituye un modelo semanal entrenado. Los días requeridos son fracciones de días productivos, no una fecha de finalización verificada. El plazo ya incluye procesamiento y no se suma otra vez.

Faltan materiales, rendimiento, preparación y recursos compartidos. Aunque la aritmética proyecte cero faltantes en una fila, no acredita servicio real ni ausencia de un faltante dentro del horizonte. No se ejecutó una comparación continua de políticas con todas las restricciones de RUJAF.

Volver a la lámina o pregunta guardada sin convertir el anexo en una propuesta de orden.

## 33. Fuentes y respuestas para la discusión

Tiempo: 1:30. Anexo opcional. Acumulado si se muestran todos los anexos: 54:30.

### En pantalla

| Evidencia | Ubicación en el repositorio |
| --- | --- |
| Extracción documentada y calidad | `kardex_csv/LEEME.txt`, `reports/data_quality.md` |
| Resultados y evaluación | `reports/final_report.md`, `reports/tables/model_comparison.csv` |
| Producción y controles | `reports/tables/production_scenarios.csv`, `docs/production_planning.md` |
| Implementación y pruebas | `src/inventory_demand/`, `tests/`, `notebooks/01_exploratory_analysis.ipynb` |
| Precios netos y ritmos reportados | Confirmación comercial del encargo de esta presentación |

Las notas contienen el detalle por diapositiva y los resultados de consulta.

### Visual

Mapa de fuentes con descripciones en español. No abrir archivos privados ante la audiencia. `EVIDENCIA.md` especifica las correspondencias y el tratamiento de las confirmaciones posteriores al reporte.

### Notas del presentador

Usar estas respuestas según la pregunta, no leerlas todas.

¿Ya hay ahorros? No. El proyecto contiene análisis histórico, pronósticos evaluados y escenarios puntuales. No hay costos completos ni comparación contra decisiones reales. La interfaz económica mantiene los ahorros reales sin valor calculado.

¿Por qué comparar aprendizaje automático con métodos simples? La comparación mide si las variables aportan frente a referencias simples. Los resultados se reportan por producto; la complejidad no fue un objetivo.

¿Por qué no usar el pronóstico como orden? La cobertura reciente, el stock físico y las restricciones no están confirmados. A produjo una extrapolación negativa y el respaldo se agregó después del experimento. El uso en vivo permanece bloqueado.

¿Se puede reproducir la conversión original? Está documentada y sus registros conservan página y secuencia. El análisis posterior se ejecuta desde los CSV. El extractor y los PDF no están en el repositorio; esa primera etapa no es reproducible aquí.

¿Se pueden sumar ventas de caja de Refama a estos datos? No para las mismas unidades. Corresponden a otro nivel y requieren conciliación con inventario, transferencias y devoluciones.
