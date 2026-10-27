## 01. Ventas e inventario

Tiempo: 1:00. Acumulado principal: 1:00.

### En pantalla

RUJAF / Refama

Ventas e inventario

Pronóstico de ventas y planificación de inventarios para cinco repuestos.

2,108 movimientos. Hasta 16 métodos según la historia disponible. 48 escenarios puntuales.

Cinco productos en perspectiva: A, uretano de hoja de resorte; B, hule de barra estabilizadora; C, juego de palanca; D, hule corto; E, manguera de aire.

Ventas mensuales en unidades, con escala vertical propia por producto y un eje temporal común. Octubre de 2026.

### Visual

Título en dos líneas, de menor peso, sin repetir RUJAF debajo. Las cifras del alcance aparecen abiertas, sin cápsulas. A la derecha, cinco filas del mismo tamaño identifican los repuestos y muestran sus series mensuales en los colores del resto de la presentación. Cada minigráfica indica cero y su máximo; las alturas no comparan volúmenes entre productos. El eje temporal común conserva los períodos distintos, sin rellenar meses fuera de la muestra.

### Notas del presentador

Buenos días a todos. Hoy queremos compartir con ustedes los resultados del proyecto que desarrollamos sobre predicción de demanda y planificación de inventarios a partir de datos reales de RUJAF.

El trabajo inicial reconstruyó las ventas mensuales de dos repuestos. La ampliación incorpora otros tres para comprobar el mismo procesamiento, la selección temporal de modelos y la planificación ante patrones distintos. A y B siguen siendo los ejemplos principales. C, D y E amplían las comparaciones sin repetir cinco exposiciones individuales.

La portada presenta los cinco repuestos con el mismo espacio. Las curvas describen ventas registradas y tienen escalas verticales distintas, indicadas en unidades. No deben compararse sus alturas como si fueran volúmenes equivalentes. El análisis estudia cada historia por separado y la vincula con el inventario y escenarios de producción. Para interpretar los resultados, primero debemos entender cómo funciona la operación de RUJAF y cómo se distribuyen sus productos.

## 02. Cómo funciona la operación de RUJAF

Tiempo: 1:30. Acumulado principal: 2:30.

### En pantalla

Diagrama operativo:
- RUJAF: Fabricación y mayoreo. Inventario central de producto terminado y Kardex de origen.
- Despachos hacia dos canales:
  - Refama: Tiendas de venta al detalle. Los despachos no son consumo final.
  - Otros clientes: Ventas mayoristas registradas en Kardex.

### Visual

Diagrama de flujo horizontal. A la izquierda se sitúa RUJAF con su bodega central; del centro salen dos líneas de despacho: una superior hacia las tiendas Refama y una inferior hacia otros clientes mayoristas. Un único inventario central abastece ambos canales.

### Notas del presentador

Para entender los datos con los que trabajamos, primero debemos distinguir los dos niveles de la operación comercial.

RUJAF es una empresa guatemalteca que fabrica y distribuye repuestos automotrices al mayoreo. Toda su producción ingresa a una bodega central de producto terminado y queda asentada en su Kardex contable. Desde esa bodega central se despachan piezas hacia dos destinos principales.

Por un lado, están los despachos hacia Refama, que es una cadena de tiendas que vende repuestos al detalle, directamente al consumidor final. Es fundamental notar que un despacho de RUJAF hacia Refama no significa que la pieza se haya vendido inmediatamente al público: significa que salió de la bodega de fábrica y pasó al inventario de una tienda.

Por otro lado, RUJAF despacha piezas directamente a otros clientes mayoristas independientes. Ambos canales consumen del mismo inventario central de fábrica. Por lo tanto, nuestro análisis se enfoca con precisión en las salidas de producto desde RUJAF, que es donde se toman las decisiones de producción en planta.

## 03. Decisiones de producción e inventario

Tiempo: 1:30. Acumulado principal: 4:00.

### En pantalla

Ventas recientes + inventario disponible

- Exceso de producción: Acumula producto en bodega y compromete capital de trabajo.
- Producción insuficiente: Genera desabastecimiento y pedidos sin atender.

### Visual

Composición dividida en dos bloques. A la izquierda, la fórmula conceptual de decisión: ventas recientes más inventario disponible. A la derecha, dos tarjetas limpias que contraponen los riesgos de sobreproducción y falta de inventario.

### Notas del presentador

En cualquier fábrica de manufactura de repuestos, la pregunta recurrente de cada mes es: ¿cuánto debemos mandar a producir?

Esta decisión siempre se mueve entre dos riesgos contrarios. Si la planta produce por encima de lo que realmente se va a vender, el producto se acumula en la bodega, inmovilizando capital de trabajo, ocupando espacio físico y exponiéndose a deterioro u obsolescencia. Por el contrario, si la planta se queda corta en su producción, se producen faltantes: los clientes hacen pedidos que no se pueden surtir a tiempo, lo que deteriora el servicio y puede hacer que esos clientes busquen otros proveedores.

Para tomar esta decisión de forma informada se necesitan dos piezas clave de información: saber con certeza cuánto inventario hay disponible en bodega hoy y tener una estimación confiable de cuántas unidades se van a vender en las próximas semanas. Desarrollar esa estimación a partir de los datos históricos es exactamente el objetivo de nuestro proyecto.

## 04. Productos y datos reportados

Tiempo: 1:30. Acumulado principal: 5:30.

### En pantalla

Producto A:
- Código: UAH-90385-18025
- Nombre: Uretano de hoja de resorte Toyota Hilux RN
- Precio neto por unidad: Q2.50
- Producción aproximada por día: ≈ 800 unidades por día de trabajo

Producto B:
- Código: 48815-14050
- Nombre: Hule de barra estabilizadora Toyota Hilux 4x4
- Precio neto por unidad: Q12.00
- Producción aproximada por día: ≈ 210 unidades por día de trabajo

Segundo paso, productos incorporados:

| Producto | Código | Monto por unidad | Clasificación reportada | Ritmo aproximado, u./día |
| --- | --- | ---: | --- | ---: |
| C, juego de palanca | UAH-33505-35020 | Q15.00 | Precio neto | 300 |
| D, hule corto | 90385-18046 | Q2.50 | Precio neto | 480 |
| E, manguera de aire | 17881-54820 | Q100.00 | Precio neto | 30 a 35 |

### Visual

Primer paso con las fichas abiertas originales de A y B. El segundo las sustituye por una tabla de C, D y E que separa monto, clasificación y ritmo. No se amontonan cinco fichas en pantalla.

### Notas del presentador

El desarrollo comenzó con A y B. La palanca C, el hule corto D y la manguera E se incorporan ahora al mismo sistema. Las letras son nombres de exposición; el código de producto es la clave del procesamiento.

El producto A es un buje de uretano para hoja de resorte. Es una pieza más económica, con un precio neto de Q2.50 por unidad después de descuentos, y de alto volumen de fabricación, con un ritmo reportado de aproximadamente 800 unidades por día de trabajo.

El producto B es un hule de barra estabilizadora para versión 4x4, con precio neto reportado de Q12.00 y ritmo aproximado de 210 unidades por día de trabajo. La diferencia de ritmo no prueba una técnica de fabricación específica.

En el segundo paso, confirmar que C, D y E son precios netos tras descuentos, no costos ni márgenes. Conservar el rango de E, sin convertir 32.5 en una capacidad implícita. Ningún ritmo es producción continua ni máximo verificado. Un ingreso estimado (unidades x precio neto) no equivale a ingreso histórico real.

## 05. Qué nos propusimos desarrollar

Tiempo: 1:30. Acumulado principal: 7:00.

### En pantalla

1. Kardex: 2,108 movimientos de cinco productos.
2. Modelos: Selección temporal por producto y canal.
3. Inventario: Saldos en bodega frente a ventas recientes.
4. Planificación: 48 escenarios y simulación diaria retrospectiva.

### Visual

Flujo de cuatro etapas con numeración destacada y textos concisos que describen el alcance real ejecutado, sin añadir promesas comerciales.

### Notas del presentador

Para abordar el problema planteado, definimos un plan de trabajo estructurado en cuatro etapas concretas.

El procesamiento valida los 2,108 movimientos del consolidado. Los archivos individuales y consolidados menores se usan como controles, nunca como filas adicionales.

La comparación conserva los 13 métodos originales, añade una referencia cero y permite Croston-SBA y TSB cuando la historia inicial lo justifica. Cada producto y canal selecciona su método con validación temporal.

En tercer lugar, el análisis de inventario: contrastamos las existencias en bodega con el ritmo de ventas recientes para dimensionar la cobertura actual de cada producto.

La planificación calcula 48 alternativas puntuales y un replay con recepción a plazo y retiros diarios. Los resultados históricos siguen en sus rutas originales; la ampliación tiene tablas, modelos y metadatos propios.

Veamos a continuación cómo obtuvimos y preparamos los datos del Kardex.

## 06. Cómo obtuvimos los datos del Kardex

Tiempo: 1:45. Acumulado principal: 8:45.

### En pantalla

- Producto A: Kardex de 13 páginas.
- Producto B: Kardex de 10 páginas.
- Base inicial: Extracción documentada de dos PDF, sin OCR.
- Ampliación: Tres Kardex transcritos; C conserva REFAMA como procedencia.
- Trazabilidad por fila: Registro de fecha original, página y orden de cada movimiento.
- Tipos de movimiento: Separación de ventas, producción, compras, ajustes, traslados y devoluciones.

### Visual

Esquema gráfico de las dos pilas de documentos PDF con el número de páginas correspondiente y tres puntos clave sobre la metodología de extracción estructurada.

### Notas del presentador

Los dos documentos iniciales tienen 13 y 10 páginas. Los tres Kardex adicionales se entregaron transcritos en CSV, con página, orden y nombre de PDF de origen. Esta ampliación verifica esos CSV; no afirma una nueva reextracción de PDF que no están en el repositorio.

Un aspecto metodológico fundamental fue cómo procesamos estos documentos. En lugar de utilizar reconocimiento óptico de caracteres (OCR) —que suele cometer errores al confundir dígitos como el 8 con el 0 o el 1 con la l—, desarrollamos una rutina de extracción que leyó directamente las tablas y el texto vectorial del PDF.

Cada fila conserva fecha, página y orden. La palanca tiene encabezado REFAMA y se integra al conjunto de RUJAF por instrucción de la empresa, sin borrar ese metadato. La suma objetivo toma únicamente salidas VENTA; no certifica la naturaleza económica final de cada despacho.

## 07. Trazabilidad y conciliación de movimientos

Tiempo: 1:45. Acumulado principal: 10:30.

### En pantalla

2,108 movimientos preservados
1,062 anteriores + 1,046 incorporados. Un consolidado, sin duplicación.

1. Archivos fuente: Control de integridad con huellas SHA-256.
2. Validación: Comprobación de fechas, cantidades y saldos.
3. Series mensuales: 258 de 258 meses conciliados sin diferencias.

### Visual

Métrica principal de movimientos en tamaño grande y un flujo de verificación de tres pasos con las cantidades exactas y el estado de conciliación.

### Notas del presentador

Los conteos son A 583, B 479, C 815, D 157 y E 74. Su suma es 2,108. Los 1,062 anteriores coinciden exactamente, con multiplicidades, con sus filas en el nuevo consolidado.

Para garantizar que nadie pudiera cuestionar si los datos fueron alterados o manipulados durante el análisis, aplicamos controles de integridad criptográfica SHA-256 a cada archivo original. Esto permite demostrar en cualquier momento que los datos procesados son idénticos a los entregados por la empresa.

Se comprueban fechas, cantidades no negativas y continuidad del saldo. Una venta de D tiene cantidad cero y se conserva marcada. Las 258 combinaciones producto/mes concilian con el archivo preliminar. El JSON de verificación también se recalcula. Son controles entre extractos derivados, no auditorías independientes del negocio.

## 08. Revisión de consistencia del Kardex

Tiempo: 1:30. Acumulado principal: 12:00.

### En pantalla

2,103 transiciones verificadas
Sin diferencias aritméticas en saldos.

Alertas detectadas en el Kardex:
- 3 saldos negativos.
- 80 ajustes de inventario.
- 30 eventos con saldo cero.

Cuatro traslados y una venta en cero conservados.

Movimientos conciliados contablemente que requieren revisión operativa.

### Visual

Panel con 2,103 transiciones verificables y las alertas agregadas. El primer saldo de cada uno de los cinco productos no tiene antecesor observado independiente.

### Notas del presentador

El saldo anterior más entradas menos salidas coincide con el siguiente saldo en las 2,103 transiciones observables. Los cinco saldos iniciales se mantienen como inferencias sin antecesor independiente.

Sin embargo, que la contabilidad cuadre no significa que la operación física haya sido perfecta. Identificamos tres tipos de situaciones que merecen atención:

Aporta un saldo negativo C, además de los dos históricos de A. Hay 80 ajustes y 30 eventos con saldo cero. El Kardex no identifica por sí solo la causa del saldo negativo o del ajuste. No atribuirlos automáticamente a desfases de producción ni convertir los días arrastrados en pérdidas reales de venta.

En lugar de borrar estas filas o alterar los datos para que el análisis pareciera perfecto, decidimos conservarlas y documentarlas con transparencia, porque reflejan la realidad cotidiana de la operación.

## 09. Definición del objetivo y meses analizados

Tiempo: 1:45. Acumulado principal: 13:45.

### En pantalla

Definición del objetivo:
- Salidas registradas como VENTA por RUJAF.
- Canales: Despachos a Refama y ventas a otros clientes.
- Exclusiones: Ajustes, producción, compras, traslados y devoluciones.

Período para modelos:
- Producto A: 50 meses (julio de 2022 a agosto de 2026).
- Producto B: 51 meses (julio de 2022 a septiembre de 2026).
- Producto C: 47 meses, noviembre de 2022 a septiembre de 2026.
- Producto D: 51 meses, julio de 2022 a septiembre de 2026.
- Producto E: 49 meses, julio de 2022 a julio de 2026.

Primer y último mes excluidos por cobertura no confirmada.

### Visual

Panel dividido. A la izquierda, la definición del objetivo y sus exclusiones. A la derecha, las tarjetas de cobertura temporal de los productos A y B, con una nota que explica la exclusión de los meses extremos incompletos.

### Notas del presentador

Con los datos limpios, definimos con mucha claridad qué variable íbamos a predecir: la cantidad total de unidades despachadas bajo el concepto de VENTA por mes, sumando los despachos a Refama y las ventas a otros clientes, sin duplicar registros. Cualquier otro tipo de movimiento contable, como ajustes o ingresos de producción, quedó fuera del objetivo.

El día del último movimiento no demuestra hasta dónde cubre la extracción. Por eso se excluyen el primer y último mes de cada producto por cobertura no confirmada. Los meses interiores son provisionalmente utilizables; no se consideran auditados como completos.

Quedan 50, 51, 47, 51 y 49 meses interiores para A, B, C, D y E. Los meses sin ventas se mantienen en el calendario. Las fechas propias de cada Kardex se conservan en los modelos y en la planificación; no se combina un saldo posterior con un pronóstico anterior.

## 10. Evolución de las ventas históricas

Tiempo: 2:00. Acumulado principal: 15:45.

### En pantalla

Ventas mensuales registradas, en unidades.

Comparación del período equivalente de 2026 frente a 2025:
- Producto A (enero a agosto): 8,100 u. en 2025 vs. 3,596 u. en 2026 (−55.6%).
- Producto B (enero a septiembre): 1,211 u. en 2025 vs. 593 u. en 2026 (−51.0%).

### Visual

Dos paneles con gráficas de líneas independientes para los productos A y B, mostrando la trayectoria completa mes a mes y destacando el porcentaje de cambio en 2026 respecto al mismo período del año anterior.

### Notas del presentador

Al observar la evolución histórica de las ventas mensuales en estas dos gráficas, el primer resultado evidente es que ambos repuestos han experimentado una caída muy fuerte en el último año.

Para medir esta disminución con rigor, comparamos exactamente los mismos meses entre 2025 y 2026 para no distorsionar las cifras por estacionalidad. En el producto A, comparando de enero a agosto, las ventas pasaron de 8,100 unidades en 2025 a 3,596 unidades en 2026, lo que representa una caída del 55.6%. En el producto B, comparando de enero a septiembre, las ventas pasaron de 1,211 a 593 unidades, una caída prácticamente idéntica del 51.0%.

Noten que las escalas verticales son distintas: el producto A se mueve en miles de unidades, mientras que el producto B se mueve en cientos. El Kardex nos permite constatar con certeza esta reducción en el volumen despachado, aunque no nos permite afirmar si la causa se debió a mayor competencia en el mercado, cambios en los precios o decisiones de compra de los clientes. Lo importante para nuestro trabajo es que los modelos predictivos deben ser capaces de capturar esta tendencia bajista.

## 11. Cambios en las ventas por canal

Tiempo: 1:30. Acumulado principal: 17:15.

### En pantalla

Promedio mensual de los últimos 12 meses frente a los primeros 12 meses analizados:
- Producto A: Despachos a Refama −15.3% · Otros clientes −86.0% · Total RUJAF −83.9%
- Producto B: Despachos a Refama −18.0% · Otros clientes −68.9% · Total RUJAF −51.3%
- Producto C: Movimientos a Refama +7.3% · Otros clientes -71.9% · VENTA total -69.4%.
- Producto D: Movimientos a Refama +131.9% · Otros clientes -63.8% · VENTA total -45.4%.
- Producto E: Movimientos a Refama -46.2% · Otros clientes -97.4% · VENTA total -76.6%.

Participación histórica de Refama en las ventas:
- Producto A: 5.6%
- Producto B: 37.2%

### Visual

Tabla comparativa de los cambios porcentuales por canal para cada producto, complementada con dos barras proporcionales que ilustran la participación de Refama en el volumen total.

### Notas del presentador

Quisimos profundizar en la caída de ventas para entender en qué canal se originó el cambio: ¿fueron las tiendas Refama o fueron los clientes mayoristas independientes?

Comparamos el promedio mensual de los últimos doce meses analizados contra los primeros doce meses del historial. El resultado es muy revelador. En las tiendas Refama, la reducción de volumen fue moderada: cayó un 15.3% en el producto A y un 18.0% en el producto B. En cambio, en los demás clientes mayoristas la caída fue dramática: se redujo en un 86% en el producto A y en casi un 69% en el producto B.

A esto se suma que la importancia de Refama es muy diferente para cada repuesto. En el producto A, Refama representa apenas el 5.6% del volumen total histórico; la inmensa mayoría de las ventas dependía de otros clientes mayoristas que dejaron de comprar al ritmo de antes. En el producto B, en cambio, Refama representa más de un tercio de las ventas (37.2%), actuando como un canal más estable para la fábrica.

La comparación ampliada muestra que la caída total puede coexistir con crecimiento en los movimientos a Refama, como ocurre en C y D. Son ventanas de primeros y últimos doce meses, no acumulados YTD. En E, los porcentajes parten de volúmenes pequeños. Ningún canal se interpreta como consumo final observado.

## 12. Frecuencia y variabilidad en cinco productos

Tiempo: 1:45. Acumulado principal: 19:00.

### En pantalla

| Producto | Media, u./mes | CV mensual | Meses en cero | Mayor racha en cero |
| --- | ---: | ---: | ---: | ---: |
| A | 1,278.76 | 0.93 | 0/50 | 0 |
| B | 121.33 | 0.48 | 0/51 | 0 |
| C | 353.98 | 0.57 | 0/47 | 0 |
| D | 107.24 | 1.07 | 7/51 | 1 |
| E | 3.16 | 1.21 | 21/49 | 4 |

Un mes en cero no prueba ausencia de demanda real.

### Visual

Una tabla compartida de frecuencia y variabilidad. Los nuevos productos amplían la comparación, sin repetir cinco gráficos de la misma forma.

### Notas del presentador

Comparar la frecuencia antes de escoger un modelo. C registra ventas en los 47 meses interiores. D tiene siete meses en cero y variabilidad alta. E tiene 21 meses en cero, con una racha de cuatro meses y hasta 141 días entre fechas con ventas positivas observadas.

El producto A vende mucho más volumen, pero es sustancialmente más inestable. Su coeficiente de variación relativa (CV) es de 0.93, prácticamente el doble que el del producto B, que es de 0.48. Esto significa que la variabilidad mensual del producto A es casi del mismo tamaño que su propio promedio: ha tenido meses de solo 71 unidades y meses de más de 5,500 unidades.

Las tablas conservan la concentración original de pedidos, 51.7% en el decil mayor de A frente a 25.1% de B. La nueva diapositiva prioriza frecuencia y ceros porque explican por qué E necesita candidatos intermitentes. La clasificación ADI/CV² mensual es errática en A y D, suave en B y C e intermitente en E. La clasificación diaria es otra y se entrega por separado.

## 13. Búsqueda de patrones estacionales

Tiempo: 1:45. Acumulado principal: 20:45.

### En pantalla

Mapas de calor de ventas mensuales por producto y año.
Intensidad proporcional por producto.
Las ventas mensuales por año no muestran patrones estacionales estables.

### Visual

Dos mapas de calor tipo calendario (años en filas, meses en columnas de enero a diciembre) con números legibles en cada celda y escalas de color independientes para A y B.

### Notas del presentador

Una hipótesis muy común en la industria de repuestos es la estacionalidad: la creencia de que ciertos meses del año, como el inicio de clases o fin de año, siempre tienen ventas más altas. Para comprobar si esto ocurría en RUJAF, construimos estos dos calendarios térmicos.

Si existiera un patrón estacional claro, veríamos columnas enteras con colores oscuros e intensos año tras año. Sin embargo, lo que observamos es muy distinto. En el producto A, los meses de mayor venta aparecen de forma dispersa en diferentes momentos del año, asociados a pedidos puntuales y no a una época fija. En el producto B, las ventas se distribuyen de manera bastante homogénea a lo largo del año.

Realizamos además pruebas estadísticas de autocorrelación a 12 meses: para ambos productos, la correlación anual es prácticamente cero (0.05 en A y −0.09 en B). Esto nos demuestra que no sería confiable asumir multiplicadores estacionales o planificar la producción pensando que un mes subirá automáticamente solo por ser julio o diciembre.

La ampliación recalcula el control FDR para hasta quince series, en lugar de seis. El q armónico de A pasa de aproximadamente 0.014 histórico a 0.024 en esta familia ampliada, sin cambiar el p individual ni la evidencia archivada. C, D y E no presentan evidencia armónica después de ese ajuste. La combinación de pocos años, ACF y resultados de pronóstico no establece una estacionalidad operativa fiable.

## 14. Inventario en bodega frente a ventas recientes

Tiempo: 2:00. Acumulado principal: 22:45.

### En pantalla

Inventario registrado y relación con ventas recientes:

Producto A:
- 14.98 meses equivalentes de venta según los últimos 12 meses.
- Saldo en bodega: 5,892 unidades.
- Venta mensual reciente: 393.25 u./mes.
- Fecha de corte: 31 de agosto de 2026.

Producto B:
- 0.34 meses equivalentes de venta según los últimos 12 meses.
- Saldo en bodega: 24 unidades.
- Venta mensual reciente: 69.83 u./mes.
- Fecha de corte: 30 de septiembre de 2026.

Segundo paso, tabla de los cinco productos. C tiene saldo alineado 31 y cociente 0.20 meses; D, saldo 15 y cociente 0.23; E, saldo 1 y cociente 0.80. C y D usan septiembre; E usa julio de 2026. Los cocientes usan medias históricas de doce meses.

### Visual

Primero los paneles originales A y B. Un segundo paso los sustituye por una comparación compacta de los cinco productos, con corte visible por fila.

### Notas del presentador

Al cruzar el inventario registrado en el Kardex con el ritmo de ventas de los últimos doce meses, encontramos dos realidades operativas completamente opuestas.

En A, 5,892 unidades contables al cierre de agosto divididas entre la media reciente de 393.25 dan 14.98 meses equivalentes de venta pasada. El cociente no confirma stock físico actual, futuras ventas ni una decisión de detener fabricación.

En B, 24 unidades de septiembre frente a 69.83 de venta media dan 0.34 meses equivalentes. C y D tienen cocientes menores, mientras E tiene 0.80 sobre una media de solo 1.25 unidades mensuales. Una venta grande o un intervalo largo sin ventas pueden hacer que estos cocientes sean poco representativos.

Los cortes no son iguales y no son noviembre de 2026. La comparación informa situaciones históricas distintas, sin medir pedidos perdidos ni disponibilidad física.

## 15. Ventas registradas frente a la demanda real

Tiempo: 1:15. Acumulado principal: 24:00.

### En pantalla

Flujo conceptual:
- Demanda no observada: Pedidos de clientes (incluye pedidos no atendidos por falta de inventario).
- Disponibilidad: Limita las ventas reales que se logran despachar.
- Objetivo del modelo: Ventas en Kardex (salidas registradas efectivamente por RUJAF).

### Visual

Diagrama de tres bloques en secuencia que ilustra cómo la disponibilidad física actúa como un filtro entre los pedidos deseados por los clientes y las ventas que finalmente se registran en el Kardex.

### Notas del presentador

Antes de pasar a los modelos de predicción, debemos hacer una aclaración conceptual muy importante para cualquier profesional de operaciones.

Los registros reflejan las salidas VENTA del conjunto de RUJAF, pero no los pedidos que podrían haberse recibido con otra disponibilidad. Un saldo bajo en B, C o D es una señal para investigar, no evidencia suficiente de ventas perdidas.

No se dispone de una bitácora verificada de pedidos desatendidos. Tampoco se dispone del consumo final de las tiendas. No corresponde inventar esas cantidades ni sumarlas al historial de despachos.

Por lo tanto, nuestros modelos tienen como objetivo predecir las ventas registradas de RUJAF. Esto es una base sólida y honesta para la planificación, pero la empresa debe tener siempre en cuenta que, en repuestos con inventario muy bajo, la demanda real del mercado puede ser superior a lo que muestran los libros contables.

## 16. Variables utilizadas para predecir

Tiempo: 1:45. Acumulado principal: 25:45.

### En pantalla

Ejemplo del producto A para predecir septiembre de 2026, con datos hasta agosto:
- Junio: 360 u. · Julio: 71 u. · Agosto: 184 u.
- Promedio de 3 meses: 205 u. (variable explicativa, no predicción).

Siete variables para los modelos:
Tres meses anteriores de ventas · Promedio de 3 meses · Tendencia temporal · Dos señales de calendario.

### Visual

Secuencia de tarjetas con las ventas reales de los tres meses anteriores conocidos y el promedio móvil resultante, seguida de la lista de las siete variables predictivas utilizadas para el entrenamiento.

### Notas del presentador

Para predecir las ventas del mes siguiente sin utilizar información del futuro, construimos siete variables predictivas utilizando exclusivamente datos conocidos antes de iniciar el mes objetivo.

En esta diapositiva vemos un ejemplo concreto para el producto A al intentar predecir septiembre de 2026. Al cierre de agosto, conocemos las ventas de agosto (184 unidades), julio (71 unidades) y junio (360 unidades), y calculamos su promedio móvil, que es de 205 unidades. Estas cuatro variables le aportan al modelo memoria de corto plazo sobre el ritmo de ventas reciente.

A estas sumamos una variable continua de tiempo, que permite capturar si las ventas van hacia arriba o hacia abajo a largo plazo, y dos variables trigonométricas basadas en seno y coseno que representan la posición del mes en el calendario de forma continua, evitando saltos artificiales entre diciembre y enero.

Con estas siete señales, los modelos aprenden a combinar la información histórica para estimar las ventas del mes siguiente.

## 17. Regresión lineal y regularización Ridge

Tiempo: 1:30. Acumulado principal: 27:15.

### En pantalla

Variables previas → Entrenamiento → Predicción

- Regresión lineal: Pondera las variables predictivas según su relación histórica con las ventas.
- Regresión Ridge: Aplica una penalización a los coeficientes para evitar ajustes extremos.

Estandarización de variables dentro de cada período de entrenamiento.

### Visual

Diagrama de tres fases (entradas, proceso de entrenamiento y predicción resultante) con dos paneles explicativos que detallan el funcionamiento de la regresión clásica y la regularización con Ridge.

### Notas del presentador

El primer método formal de aprendizaje que probamos fue la regresión lineal. La regresión asigna un peso o coeficiente numérico a cada una de las siete variables para combinarlas y producir una estimación de ventas.

Sin embargo, cuando varias variables están relacionadas entre sí —como las ventas de meses consecutivos y sus propios promedios móviles—, la regresión lineal básica puede volverse inestable y asignar pesos exageradamente grandes, sobreajustando los datos del pasado y fallando al predecir el futuro.

Para prevenir ese sobreajuste, incorporamos la regresión Ridge. Ridge introduce una penalización matemática que restringe los coeficientes extremos, obligando al modelo a encontrar combinaciones más equilibradas y prudentes. Además, todas las variables se estandarizan dentro de cada período de entrenamiento por separado, asegurando que ninguna variable domine indebidamente por su tamaño en unidades.

## 18. Métodos según la historia disponible

Tiempo: 1:30. Acumulado principal: 28:45.

### En pantalla

Familias de modelos:
- 5 Referencias simples: Mes anterior, mismo mes del año previo, promedio histórico, promedio de 3 meses y promedio de 6 meses.
- 2 Regresiones: Lineal clásica y regularizada con Ridge.
- 4 Series de tiempo: Suavizamiento de nivel, tendencia amortiguada, estacional y SARIMA.
- 2 Árboles de decisión: Bosque aleatorio y árboles con aumento gradual.

Se añade referencia cero. Croston-SBA y TSB compiten si los primeros 24 meses contienen al menos dos meses positivos y 20% de ceros.

### Visual

Las cuatro familias originales se conservan. Una línea explica los tres candidatos adicionales y su criterio de elegibilidad, sin añadir una diapositiva por método.

### Notas del presentador

En proyectos de ciencia de datos es común que se asuma de antemano que el algoritmo más complejo será el ganador. Para evitar ese sesgo, decidimos evaluar 13 métodos divididos en cuatro familias.

La primera familia la forman cinco referencias simples: reglas directas como repetir el mes anterior, repetir el mismo mes del año pasado o calcular promedios móviles de tres o seis meses. Estas referencias son indispensables: si un modelo complejo de inteligencia artificial no logra ganarle a una regla tan sencilla como repetir el mes anterior, entonces su complejidad no aporta valor real al negocio.

La segunda familia incluye la regresión lineal y Ridge. La tercera familia comprende cuatro métodos clásicos de series de tiempo, como el suavizamiento exponencial en tres variantes y el modelo SARIMA. Y la cuarta familia abarca dos algoritmos basados en árboles de decisión: bosques aleatorios y modelos de aumento gradual.

Los candidatos de una serie compiten en sus mismos orígenes. La elegibilidad de los intermitentes se fija solo con los primeros 24 meses, no con los ceros del holdout ni con la clasificación calculada sobre toda la historia. Las quince series tienen entre 14 y 16 candidatos. No se exige que todos los productos elijan la misma familia. SBA usa suavizado fijo 0.1 y TSB usa 0.2 para tamaño y ocurrencia, sin búsqueda posterior de parámetros.

## 19. Cómo probamos los modelos

Tiempo: 2:15. Acumulado principal: 31:00.

### En pantalla

Línea de tiempo de pruebas:
- Producto A: 24 meses iniciales · 20 meses de validación · 6 meses de prueba final (marzo a agosto de 2026).
- Producto B: 24 meses iniciales · 21 meses de validación · 6 meses de prueba final (abril a septiembre de 2026).

Entrenamiento progresivo mes a mes para calibrar y seleccionar modelos.
Seis meses reservados para la prueba final, respetando el orden del tiempo.

### Visual

Dos líneas de tiempo divididas proporcionalmente en tres etapas de color: historial inicial de 24 meses, bloque de validación progresiva y los seis meses de prueba final resaltados al final de la serie.

### Notas del presentador

La forma en que se prueban los modelos en series de tiempo es crítica. Si uno mezcla los datos al azar —como se hace comúnmente en otros problemas de aprendizaje automático—, se comete el grave error de entrenar con datos del futuro para predecir el pasado.

Nosotros aplicamos un esquema estricto de validación temporal progresiva: comenzamos con los primeros 24 meses de historial, pronosticamos el mes 25, esperamos a observar la venta real de ese mes, medimos el error y luego incorporamos ese mes al historial para pronosticar el mes 26. Este proceso se repitió mes a mes a lo largo de 20 períodos de validación en el producto A y 21 en el producto B.

La selección se cierra antes de evaluar los seis meses finales. C tiene 17 orígenes de validación, D 21 y E 19; sus seis meses finales son abril a septiembre para C y D, y febrero a julio para E. Se actualiza el entrenamiento con cada mes observado. No es un pronóstico de seis pasos desde un único origen. Reejecutar A y B sobre sus ventanas archivadas no convierte esos datos en evidencia independiente nueva.

## 20. Criterio de selección con margen del 5%

Tiempo: 1:30. Acumulado principal: 32:30.

### En pantalla

Si un modelo más simple queda a menos del 5% de diferencia en MAE, se prefiere su uso.

Tabla de selección en validación:
- Producto A: Menor MAE = Regresión lineal (371.27) → Modelo seleccionado: Regresión Ridge (MAE de validación 380.65).
- Producto B: Menor MAE = Tendencia amortiguada (34.02) → Modelo seleccionado: Promedio de 3 meses (MAE de validación 34.95).
- C selecciona promedio de 3 meses, MAE de validación 89.82 y final 44.33.
- D selecciona Ridge, MAE de validación 79.52 y final 78.39.
- E selecciona referencia cero, MAE de validación 2.47 y final 2.17.

### Visual

Regla de decisión y tabla de cinco filas con método fijado, MAE de validación y MAE final. La prueba final se muestra para evaluar, nunca para reseleccionar.

### Notas del presentador

Para medir el desempeño de los modelos utilizamos el error absoluto medio (MAE), que indica en cuántas unidades se desvía la predicción respecto a lo vendido en promedio cada mes. Cuanto menor sea el MAE, más precisa es la estimación.

Sin embargo, aplicamos un principio de ingeniería muy claro: ante resultados prácticamente idénticos, siempre es preferible el modelo más simple y fácil de explicar. Establecimos una regla formal: si un modelo más sencillo queda a menos de un 5% de diferencia en MAE respecto al modelo de menor error en la validación, seleccionamos el modelo más simple.

En el producto A, la regresión lineal obtuvo el menor error con 371 unidades, pero la regresión Ridge quedó a solo 380 unidades (una diferencia de apenas 2.5%); dado que Ridge penaliza coeficientes extremos y es más estable, seleccionamos Ridge. En el producto B, el modelo de tendencia amortiguada obtuvo 34.02 unidades, pero el promedio móvil de tres meses quedó a solo 34.95 unidades (una diferencia menor al 3%); por su transparencia y facilidad de cálculo, seleccionamos el promedio de tres meses.

Las elecciones combinadas originales se mantienen. C elige una regla de promedio; D una regresión. E elige cero bajo el MAE, que penaliza cada error en unidades sin imponer una meta de servicio. Este resultado requiere interpretación y no autoriza producción cero.

## 21. Resultados de prueba en el producto A

Tiempo: 2:00. Acumulado principal: 34:30.

### En pantalla

Producto A · Modelo seleccionado: Ridge

MAE de prueba final: 290.19 unidades por mes
7.1% menor error que el mes anterior.

Comparación de modelos en la prueba final:
- Regresión lineal: 211.13 u.
- Promedio de 3 meses: 222.78 u.
- Ridge (seleccionado): 290.19 u.
- Repetir el mes anterior: 312.33 u.

El promedio de 3 meses y la regresión lineal tuvieron menor error final, pero se conservó la selección de validación.

### Visual

Métrica del modelo seleccionado y gráfico de barras horizontales comparando el MAE de los cuatro modelos principales durante los seis meses de prueba final (marzo a agosto de 2026).

### Notas del presentador

Veamos ahora los resultados concretos obtenidos durante los seis meses de prueba final para el producto A.

La regresión Ridge, que habíamos seleccionado en la etapa previa, obtuvo un error absoluto medio de 290.19 unidades por mes. Esto representa una mejora del 7.1% frente a la referencia básica de repetir el mes anterior, que tuvo un error de 312.33 unidades.

Sin embargo, al observar las demás barras del gráfico vemos algo muy interesante: la regresión lineal simple y el promedio móvil de tres meses obtuvieron errores menores en esta prueba final, con 211 y 222 unidades respectivamente.

Como equipo universitario responsable, mantuvimos nuestra selección de Ridge sin cambiarla retrospectivamente después de ver los resultados, porque hacer eso invalidaría la honestidad del experimento. Además, al calcular un intervalo estadístico sobre la diferencia entre Ridge y el mes anterior, el rango incluye el valor cero. Esto nos indica que, si bien Ridge funcionó de forma aceptable, su ventaja práctica sobre reglas más simples es modesta y debe interpretarse con cautela.

## 22. Resultados de prueba en el producto B

Tiempo: 1:45. Acumulado principal: 36:15.

### En pantalla

Producto B · Modelo seleccionado: Promedio 3 meses

MAE de prueba final: 37.33 unidades por mes
Repetir el mes anterior: 34.17 u./mes.

Comparación de modelos en la prueba final:
- Repetir el mes anterior: 34.17 u.
- Promedio de 3 meses (seleccionado): 37.33 u.
- Bosque aleatorio: 46.90 u.
- Ridge: 63.58 u.

En este producto, una regla simple como repetir el mes anterior superó al modelo seleccionado.

### Visual

Gráfica de barras horizontales con el MAE de prueba final para el producto B, mostrando que la regla básica de repetir el mes anterior obtuvo el menor error de todos los métodos evaluados.

### Notas del presentador

En el producto B, los resultados nos dejaron un aprendizaje todavía más contundente sobre la importancia de probar métodos simples.

El promedio de tres meses que habíamos seleccionado obtuvo un error de 37.33 unidades mensuales en los seis meses de prueba. Pero la regla más elemental de todas —simplemente asumir que este mes se venderá lo mismo que el mes anterior— fue la que mejor se desempeñó, con un error de 34.17 unidades (un 9.3% menor que nuestro modelo seleccionado).

Por su parte, los modelos más complejos tuvieron un rendimiento francamente desfavorable: el bosque aleatorio tuvo un error de casi 47 unidades y la regresión Ridge se disparó a más de 63 unidades de error medio.

Este resultado confirma una lección fundamental de la investigación de operaciones: en series con cambios de nivel y volúmenes moderados, la sofisticación matemática no garantiza mejores pronósticos. A veces, la regla operativa más sencilla es la más efectiva para el negocio.

## 23. Diferencia entre lo previsto y lo vendido

Tiempo: 1:45. Acumulado principal: 38:00.

### En pantalla

Gráficas de ventas registradas y predicciones mensuales en A y B. Sombreado de la prueba final.

Métricas en la prueba final:
- Producto A (Ridge): WAPE 93.2% · Sesgo medio +228.85 unidades/mes.
- Producto B (Promedio 3 meses): WAPE 60.4% · Sesgo medio −7.44 unidades/mes.

Leyenda: Venta real registrada · Modelo seleccionado · Mes anterior.

Segundo paso, resultados incorporados:

| Producto | MAE fijado | MAE último mes | WAPE fijado | Meses positivos finales |
| --- | ---: | ---: | ---: | ---: |
| C | 44.33 | 59.33 | 23.1% | 6/6 |
| D | 78.39 | 74.50 | 97.6% | 6/6 |
| E | 2.17 | 2.83 | 100.0% | 2/6 |

### Visual

Primero las curvas originales A y B. El segundo paso cambia a una tabla comparativa C, D y E con una advertencia sobre la referencia cero de E. No se repiten tres curvas individuales adicionales.

### Notas del presentador

Para comprender el comportamiento real de los modelos mes a mes, necesitamos ver las curvas completas y analizar dos métricas complementarias: el error relativo ponderado (WAPE) y el sesgo medio.

El WAPE mide el error acumulado como porcentaje del volumen real vendido. En el producto A, el WAPE alcanzó un 93.2%, y el sesgo medio fue de +228 unidades por mes. Esto significa que Ridge sobreestimó sistemáticamente la demanda en la prueba final: venía calibrado con años de volúmenes altos y tardó en adaptarse a la fuerte caída de 2026, prediciendo más unidades de las que realmente se vendieron.

En el producto B la situación fue más equilibrada: el WAPE fue del 60.4% y el sesgo medio fue de apenas −7.44 unidades por mes, prácticamente centrado alrededor de la realidad.

Estas curvas demuestran por qué sería peligroso automatizar órdenes de compra o producción basándose exclusivamente en un modelo: cuando el mercado cambia bruscamente, los modelos pueden tardar meses en corregir su rumbo.

En C, el promedio fijado tiene menor MAE que el último mes. En D, Ridge no supera a esa referencia en la prueba final. E solo tiene dos meses positivos entre los seis finales. Cero suma 13 unidades de subestimación y WAPE 100%, aunque su MAE sea menor. En E también se ejecutaron Croston-SBA y TSB: sus MAE finales son 3.05 y 2.81, frente a 2.17 de cero. Ninguno demuestra aquí una política de servicio adecuada. No comparar MAE absolutos entre productos como si sus unidades y ventanas fuesen iguales.

## 24. Un problema en la predicción del producto A

Tiempo: 1:45. Acumulado principal: 39:45.

### En pantalla

Producto A · Ridge para septiembre de 2026, con datos hasta agosto:
- Ridge sin recorte: −102.29 unidades (predicción menor a cero).
- Salida ajustada: 0 unidades (no refleja demanda real).

Contraste en el segundo paso:
325 unidades ya vendidas en el registro parcial de septiembre. El modelo predijo cero por error.
El ajuste automático a cero oculta que el modelo produjo un valor negativo.

### Visual

Esquema de dos bloques con flecha que ilustra la conversión de −102.29 a 0 unidades, acompañado de la nota de advertencia que revela las 325 unidades reales ya registradas en ese mes parcial.

### Notas del presentador

Durante el desarrollo nos encontramos con un problema concreto que ilustra perfectamente por qué no se debe confiar ciegamente en algoritmos matemáticos sin supervisión humana.

Al calibrar la regresión Ridge con todo el historial disponible del producto A hasta agosto de 2026 para predecir el mes de septiembre, la ecuación matemática arrojó un resultado de −102.29 unidades. Como las ventas no pueden ser negativas, el sistema aplicaba una regla estándar de recortar el valor a cero.

Pero recortar a cero generaba un error conceptual gravísimo: le decía a la empresa que en septiembre no se iba a vender ni una sola unidad. Cuando revisamos los movimientos parciales que ya existían registrados en ese mes de septiembre, encontramos que ya se habían vendido 325 unidades.

El modelo no estaba descubriendo que la demanda había desaparecido; simplemente, la combinación lineal de las ventas bajas de los meses previos empujó el cálculo por debajo de cero. Si hubiéramos dejado ese cero sin supervisión, la fábrica habría detenido por completo la atención de ese producto.

## 25. Reglas de control y modelo de respaldo

Tiempo: 1:45. Acumulado principal: 41:30.

### En pantalla

Mecanismo de salvaguardas:
1. Validación: Detección de valores negativos, recortes a cero o fallos de cálculo.
2. Comparación: Contraste con el promedio de ventas de los últimos 3 meses.
3. Respaldo: Uso del promedio móvil si la predicción principal no es válida.
4. Alerta: Bloqueo del cálculo si el modelo de respaldo también presenta fallas.

Ejemplo en el producto A: Respaldo provisional = 205 unidades (promedio de 3 meses).

La ampliación permite tasas positivas tras meses en cero. El respaldo sigue siendo provisional.

### Visual

Flujo de decisión en cuatro pasos consecutivos, destacando la comprobación de coherencia, el cambio a modelo de respaldo y la tarjeta con el valor concreto de 205 unidades para el producto A.

### Notas del presentador

Para resolver esta vulnerabilidad, diseñamos un mecanismo de reglas de control y salvaguardas antes de que cualquier predicción pueda ser utilizada para planificar.

El protocolo funciona en cuatro pasos. Primero, comprueba que la salida no sea negativa, no haya sido recortada a cero y no contenga fallos numéricos. Segundo, compara la predicción con el promedio de ventas de los últimos tres meses conocidos: si la estimación se desvía drásticamente sin justificación, se activa una alerta de revisión.

Tercero, si el modelo principal no supera estas comprobaciones, el sistema activa automáticamente un modelo de respaldo predefinido: el promedio móvil de los últimos tres meses. En el caso del producto A, este respaldo asignó 205 unidades en lugar de cero, una cifra mucho más coherente con la realidad observada.

Y cuarto, si incluso el modelo de respaldo presentara anomalías, el sistema bloquea el cálculo y solicita intervención humana, evitando generar decisiones erróneas en planta.

La regla histórica rechazaba cualquier previsión positiva después de tres ceros. En series intermitentes eso descartaría tasas positivas por definición; el experimento nuevo permite esa situación. Los otros límites siguen vigentes. Las reglas y su replay son diagnósticos posteriores, no pruebas independientes de mejora. En E, el siguiente origen retrospectivo usa respaldo de 3 unidades, distinto del cero seleccionado. Ninguna venta parcial futura se usa para decidir el respaldo.

## 26. Entradas para planificar la producción

Tiempo: 1:30. Acumulado principal: 43:00.

### En pantalla

Entradas para la planificación:
- Predicción de ventas: Volumen estimado, margen de incertidumbre y validez del dato.
- Inventario disponible: Existencias en bodega, reservas y pedidos pendientes.
- Ritmo y restricciones: Plazo, lotes y días asignados. Ritmo reportado como supuesto.

### Visual

Tres columnas amplias y equilibradas que muestran cómo la predicción se combina con el estado del inventario y las restricciones de fabricación para alimentar los escenarios de producción.

### Notas del presentador

Una estimación que pasa controles provisionales puede usarse para escenarios, sin convertirse por ello en un pronóstico operativo validado.

Para calcular cuántas unidades se deben producir no basta con mirar las ventas estimadas. Se requiere integrar tres grupos de datos:

Primero, la predicción de ventas con su rango de incertidumbre. Segundo, el estado del inventario: cuánto producto libre tenemos en bodega hoy, qué pedidos ya están comprometidos para entrega inmediata y qué órdenes están pendientes de recibir. Y tercero, las restricciones de la fábrica: cuánto tarda un lote en fabricarse, cuál es el tamaño mínimo de lote y cuántos días productivos tiene asignada la máquina.

Con estas tres entradas implementamos un modelo de revisión periódica de inventarios para simular diferentes escenarios de producción para cada producto.

## 27. Escenarios de producción para el producto B

Tiempo: 2:30. Acumulado principal: 45:30.

### En pantalla

Producto B · Octubre de 2026 · Saldo al 30/09/2026 (1 día asignado):
- Saldo histórico: 24 u.
- Pronóstico provisional: 96.33 u./mes.
- Ritmo supuesto: 210 u./día productivo.

Comparación de dos supuestos de seguridad:
- Sin seguridad (0 u.): Objetivo 118.81 u. → Producción sugerida: 95 u. (0.45 días teóricos).
- 1 mes de seguridad (96.33 u.): Objetivo 215.14 u. → Producción sugerida: 192 u. (0.91 días teóricos).

### Visual

Ficha con datos base en la parte superior y tabla comparativa de dos filas. En el primer paso se resalta la variante sin seguridad; en el segundo paso se resalta la variante con un mes de seguridad.

### Notas del presentador

Veamos ahora la aplicación práctica de estos cálculos en el producto B para planificar el mes de octubre de 2026.

El escenario conserva saldo contable 24 al cierre de septiembre, previsión 96.33 mensual y ritmo supuesto 210 por día productivo. Con plazo total supuesto de 7 días y revisión de 30, el horizonte de cálculo es 37 días. No es una capacidad auditada ni un escenario vigente.

En el primer paso evaluamos el escenario sin stock de seguridad. Para cubrir la demanda estimada durante esos 37 días se necesitan 118.81 unidades. Al restar las 24 unidades que ya están en bodega, el modelo sugiere producir 95 unidades, lo que equivale a 0.45 días de trabajo en planta (aproximadamente media jornada).

En el segundo paso evaluamos qué ocurre si la empresa decide mantener un mes de ventas como colchón de seguridad. El inventario objetivo sube a 215.14 unidades y la producción sugerida aumenta a 192 unidades, requiriendo 0.91 días de trabajo (prácticamente una jornada completa de planta).

El cambio de seguridad eleva el lote supuesto de 95 a 192. No se llama costo ni ahorro a esa diferencia de cantidades. Las recepciones, materiales y restricciones compartidas siguen pendientes de verificación.

## 28. Producción e inventario en cinco productos

Tiempo: 1:45. Acumulado principal: 47:15.

### En pantalla

Producto A · Corte histórico al 31 de agosto de 2026:
- Saldo histórico en bodega: 5,892 unidades registradas.
- Ventas estimadas: 205 u./mes.
- Inventario objetivo: 252.83 u.

Resultado del escenario:
0 unidades bajo estos supuestos. El saldo histórico supera el objetivo; no es orden vigente ni óptimo económico.

Segundo paso, un día asignado, seguridad cero y ritmo inferior reportado:

| Producto | Saldo, u. | Previsión, u./mes | Producción, u. | Días teóricos |
| --- | ---: | ---: | ---: | ---: |
| C | 31 | 210.33 | 229 | 0.76 |
| D | 15 | 26.72 | 18 | 0.04 |
| E | 1 | 3.00 | 3 | 0.10 |

E usa respaldo de 3 u./mes, no el cero seleccionado. Son pronósticos de frontera con cortes distintos.

Tercer paso, retiros VENTA no servidos en la simulación de seis meses:

| Producto | Seguridad cero, u. | Un mes de seguridad, u. |
| --- | ---: | ---: |
| C | 115 | 2 |
| D | 129 | 0 |
| E | 1 | 1 |

Recepciones a siete días y saldos arrastrados. Diagnóstico de otra política sobre ventas registradas, no faltantes reales ni ahorro.

### Visual

El caso A abre el primer paso. El segundo muestra la misma aritmética aplicada a C, D y E en una tabla. El tercero muestra el replay diario agregado. Cada paso sustituye al anterior, sin añadir diapositivas.

### Notas del presentador

El producto A nos presenta el escenario exactamente opuesto y demuestra la utilidad práctica de no producir a ciegas.

Para este producto utilizamos el pronóstico de respaldo de 205 unidades mensuales. Bajo las mismas condiciones de 7 días de reposición y revisión mensual, el inventario objetivo para cubrir el período es de 252.83 unidades.

El saldo registrado de 5,892 supera ese objetivo y produce cero unidades sugeridas bajo el escenario. No es una recomendación inmediata para el inventario actual de la empresa.

El cero de A proviene de saldo alto frente a una previsión positiva; no es el fallo de regresión ni la selección cero de E. La tabla siguiente usa el mismo contrato de planificación para C, D y E. E conserva ambos extremos de ritmo en las tablas completas. En C, agregar un mes de seguridad con un día asignado limita la cantidad a 300 unidades; no demuestra factibilidad conjunta.

El replay comienza en el saldo anterior al primer origen final de cada producto. Se toman decisiones mes a mes con el pronóstico disponible, se programan recepciones a siete días y se evalúan retiros diarios VENTA posteriores. El saldo simulado se arrastra; no se agregan como suministro los ingresos, ajustes o traslados históricos, porque se estudia otra política.

En los seis meses propios de cada producto, pasar de cero a un mes de seguridad reduce los retiros registrados no servidos de 115 a 2 en C y de 129 a 0 en D. E queda en 1 con ambos supuestos. Son unidades de una simulación con pronósticos y controles provisionales, no ventas perdidas observadas, demanda final ni servicio garantizado. No se suman las alternativas entre sí ni se atribuye ahorro económico.

## 29. Qué logramos implementar y sus limitaciones

Tiempo: 1:30. Acumulado principal: 48:45.

### En pantalla

Lo implementado:
- Cinco productos y 2,108 movimientos.
- Hasta 16 métodos por serie.
- 48 escenarios y replay diario.
- Pruebas y resultados originales conservados.

Límites y condiciones:
- Inventario físico en bodega pendiente de auditoría.
- Restricciones de planta basadas en supuestos.
- Costos completos pendientes; los cinco precios netos no son costos, márgenes ni ahorros.
- Requiere validación previa antes de operar en planta.

### Visual

Dos columnas equilibradas con viñetas claras que contraponen los entregables técnicos efectivamente desarrollados frente a las condiciones necesarias para su eventual aplicación práctica.

### Notas del presentador

Para mantener una postura profesional y honesta, queremos resumir con claridad qué logramos construir y cuáles son las limitaciones reales del proyecto.

La biblioteca modular ahora descubre los productos en el archivo. El mismo procesamiento y validación sirve a los cinco. Se probaron además un sexto código sintético y series cortas para comprobar inclusión sin listas rígidas y bloqueo explícito cuando no hay historia suficiente. Los 13 candidatos originales se conservan como referencia, con hasta tres adicionales según la serie. Los resultados previos y su cuaderno no fueron sobrescritos.

Sin embargo, para que esta herramienta pudiera utilizarse en la operación diaria de RUJAF, se deben tener presentes cuatro condiciones clave: primero, las existencias registradas en el Kardex deben auditarse físicamente en bodega para confirmar que las piezas coincidan con el papel; segundo, las restricciones de planta como tiempos de montaje y disponibilidad de moldes deben calibrarse con los operarios; tercero, se deben incorporar costos reales de fabricación para traducir las unidades a dinero; y cuarto, el sistema debe correr en paralelo durante unos meses para validar su desempeño antes de basar decisiones de producción en sus recomendaciones.

## 30. Métricas detalladas de los modelos

Tiempo: 1:30. Anexo opcional. Acumulado si se muestran todos los anexos: 51:30.

### En pantalla

Métricas completas en la prueba final:

| Producto y método | MAE | RMSE | WAPE | Sesgo medio | Meses |
| --- | ---: | ---: | ---: | ---: | ---: |
| A, Ridge | 290.19 | 371.86 | 93.2% | +228.85 | 6 |
| B, Promedio de 3 meses | 37.33 | 45.13 | 60.4% | −7.44 | 6 |
| C, Promedio de 3 meses | 44.33 | 53.60 | 23.1% | -15.67 | 6 |
| D, Ridge | 78.39 | 93.51 | 97.6% | +22.81 | 6 |
| E, Referencia cero | 2.17 | 4.02 | 100.0% | -2.17 | 6 |

MAE y RMSE en unidades. WAPE mide el error porcentual sobre el volumen real. Sesgo positivo indica sobreestimación.

Tabla de consulta de los 13 modelos:

Referencia A y B conservada. Las tablas completas de cinco productos y candidatos elegibles están en `reports/experiments/five_products_v1/tables/`.

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

### Visual

Tabla de cuatro métricas para el método fijado de cada uno de los cinco productos. La tabla original de 13 métodos de A y B permanece en estas notas para consulta, no se amontona en la diapositiva.

### Notas del presentador

Esta diapositiva de respaldo nos permite atender preguntas técnicas sobre las diferentes métricas de evaluación del proyecto.

El MAE mide el error absoluto promedio en unidades directas de producto. El RMSE eleva los errores al cuadrado antes de promediarlos, lo que hace que penalice con mayor severidad las equivocaciones grandes. El WAPE expresa el error total acumulado como un porcentaje del volumen real vendido, y el sesgo medio nos indica si el modelo tiende a sobreestimar o subestimar en promedio.

En la tabla completa de 13 métodos podemos observar el comportamiento de todas las alternativas tanto en validación como en prueba final. Por ejemplo, se aprecia con claridad que modelos como SARIMA o el promedio histórico obtuvieron errores sumamente altos en ambos productos, lo que justifica por qué fueron descartados durante la selección inicial.

## 31. Supuestos utilizados en los escenarios

Tiempo: 1:30. Anexo opcional. Acumulado si se muestran todos los anexos: 53:00.

### En pantalla

Parámetros del escenario de producción:
- Conversión mensual: 30 días calendario por mes.
- Plazo de entrega y revisión: 7 días de reposición y revisión cada 30 días.
- Días de producción asignados: 1 o 5 días por producto.
- Stock de seguridad: Cero o un mes de demanda estimada.
- Pedidos y reservas: Sin órdenes abiertas ni atrasos en el escenario base.
- Tamaño de lote y capacidad: Lotes de 1 unidad, sin límites máximos de almacén.
- Ritmo aproximado, no máximo verificado: A ≈ 800; B ≈ 210; C ≈ 300; D ≈ 480; E ≈ 30 a 35 u./día productivo.

Las tablas incluyen además factor de previsión 1.5 y ambos extremos del rango de E. En pantalla se usan las variantes base de factor 1.

### Visual

Tabla clara de dos columnas que enumera cada parámetro operativo y el valor supuesto adoptado para la ejecución de los escenarios.

### Notas del presentador

Este anexo sirve para responder preguntas sobre la procedencia de los parámetros utilizados en los escenarios de producción.

Es importante destacar que parámetros como los 7 días de plazo de reposición, la revisión mensual de 30 días o los niveles de stock de seguridad fueron adoptados como supuestos de ingeniería para formular escenarios comparables. No constituyen una norma fija impuesta por RUJAF.

Los cinco ritmos son reportados, no auditados. Los días asignados son por SKU, no un calendario conjunto. El JSON permite otros plazos, lotes y restricciones explícitos, con revisión de resultados. La presentación consulta resultados archivados y no recalcula un plan desde sus selectores.
## 32. Resultados y conclusiones

Tiempo: 1:15. Acumulado principal: 50:00.

### En pantalla

Resultados y conclusiones

- Demanda distinta: A y B mantienen su análisis original. C amplía las ventas frecuentes; E añade una serie intermitente.
- Selección por producto: Regresión y reglas simples dan resultados distintos. Un buen MAE no garantiza una política de inventario adecuada.
- Sistema reutilizable: El mismo flujo integra datos, validación temporal y escenarios para cinco productos, con límites operativos explícitos.

2,108 movimientos preservados · Hasta 16 métodos · 48 escenarios calculados

### Visual

Tres paneles horizontales con los hallazgos principales bien estructurados y una línea final con las tres métricas consolidadas del proyecto.

### Notas del presentador

Para cerrar nuestra presentación, queremos destacar tres conclusiones principales:

Los ejemplos A y B conservan sus hallazgos. La ampliación incorpora frecuencia alta en C, variación y meses aislados sin ventas en D e intermitencia en E. El sistema puede comparar esos patrones sin redefinir manualmente cada producto.

Segunda, sobre la metodología: comprobamos que la complejidad matemática no siempre se traduce en mejores resultados. Reglas simples como el promedio móvil o repetir el mes anterior compitieron de igual a igual con modelos de aprendizaje automático, mientras que modelos como Ridge evidenciaron riesgos al producir predicciones negativas que requirieron salvaguardas explícitas.

La planificación relaciona previsión, saldo, plazo y límites supuestos. El replay muestra que los tiempos de recepción y la seguridad cambian los retiros registrados que la política puede servir. No acredita ahorro, demanda final ni óptimo económico. El entregable es un sistema reutilizable de apoyo al análisis, con trazabilidad y limitaciones verificables.

Agradecemos mucho su atención y quedamos a su completa disposición para cualquier pregunta o comentario.

