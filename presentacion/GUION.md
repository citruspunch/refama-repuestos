# RUJAF: presentación y notas del equipo expositor

Guion completo en español para la presentación del proyecto de predicción de demanda y planificación de inventarios con datos de RUJAF. Público previsto: representantes de la empresa y tribunal de evaluación universitaria.

La exposición principal consta de 30 diapositivas y una duración estimada de 50 minutos. Con 5 minutos de preguntas y respuestas se alcanzan los 55 minutos. Los 3 anexos tienen una duración estimada de 1:30 cada uno para consulta durante la discusión. Si se recorren las 33 diapositivas completas, el tiempo estimado es de 54:30.

| Tramo | Diapositivas | Tiempo | Acumulado |
| --- | --- | ---: | ---: |
| Contexto y operación | 01 a 05 | 7:00 | 7:00 |
| Preparación de datos del Kardex | 06 a 09 | 6:45 | 13:45 |
| Análisis de ventas históricas | 10 a 15 | 10:15 | 24:00 |
| Modelos de predicción y pruebas | 16 a 25 | 17:30 | 41:30 |
| Planificación de la producción | 26 a 29 | 7:15 | 48:45 |
| Resultados y conclusiones | 30 | 1:15 | 50:00 |

Los tiempos estimados contemplan la explicación pausada de las gráficas, la lectura clara de resultados y la interacción guiada con los escenarios. Es recomendable ensayar con cronómetro para coordinar las intervenciones del equipo.

## Criterios del proyecto

- Los datos corresponden al análisis cerrado al 26 de octubre de 2026.
- Los valores de Q2.50 y Q12.00 corresponden a precios netos de venta después de descuentos comerciales, confirmados para este análisis. No representan costos de fabricación ni márgenes brutos.
- Los ritmos reportados de aproximadamente 800 y 210 unidades corresponden a estimaciones de producción por día de trabajo, no a producción diaria continua ni a capacidades máximas certificadas.
- Todas las gráficas fueron generadas directamente a partir de las tablas verificadas del repositorio.
- No se muestran nombres de clientes individuales, documentos tributarios ni código fuente en pantalla. Los datos consolidados preservan la confidencialidad comercial de la empresa.
- El visor de escenarios integrado en la presentación consulta resultados previamente calculados y archivados, sirviendo como herramienta de análisis y no como un sistema de órdenes en tiempo real.

## 01. Ventas e inventario con datos de RUJAF

Tiempo: 1:00. Acumulado principal: 1:00.

### En pantalla

RUJAF / Refama

Ventas e inventario con datos de RUJAF

Análisis de ventas y predicción de demanda para dos productos de RUJAF.

Historial mensual del producto A (UAH-90385-18025): ventas mensuales registradas en unidades.

RUJAF · Fabricación y mayoreo en Guatemala. Análisis al 26 de octubre de 2026.

### Visual

Portada sobria y limpia. A la derecha, una ficha de Kardex identifica el producto A y despliega su gráfica de ventas mensuales en unidades desde julio de 2022. La curva muestra una caída visible a lo largo del tiempo que introduce de forma natural la necesidad de analizar qué está ocurriendo con la demanda.

### Notas del presentador

Buenos días a todos. Hoy queremos compartir con ustedes los resultados del proyecto que desarrollamos sobre predicción de demanda y planificación de inventarios a partir de datos reales de RUJAF.

Nuestro trabajo consistió en tomar los registros del Kardex de la empresa, reconstruir el historial mensual de ventas de dos repuestos automotrices clave, poner a prueba diferentes modelos de predicción y evaluar cómo esa información puede apoyar las decisiones de producción e inventario.

Queremos aclarar desde el inicio que este es un estudio universitario riguroso, basado en datos históricos reales de la planta. No venimos a vender una solución mágica ni a prometer automatizaciones infalibles. En la gráfica de la portada pueden ver el historial del producto A: se aprecia una tendencia decreciente muy marcada en las ventas recientes. Para comprender qué significa esto y cómo podemos ayudar a planificar mejor, primero debemos entender cómo funciona la operación de RUJAF y cómo se distribuyen sus productos.

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

## 03. La decisión de cuánto producir e inventariar

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

## 04. Los dos productos analizados

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

### Visual

Dos fichas técnicas en paralelo con bordes redondeados y colores distintivos: azul para el producto A y ámbar para el producto B. Cada ficha muestra código de parte, nombre del repuesto, precio neto y producción diaria estimada.

### Notas del presentador

Para este estudio nos enfocamos en dos repuestos de alto movimiento para camionetas Toyota Hilux, uno de los vehículos utilitarios más comunes en Guatemala. Para facilitar la exposición a lo largo de la presentación, nos referiremos a ellos simplemente como producto A y producto B.

El producto A es un buje de uretano para hoja de resorte. Es una pieza más económica, con un precio neto de Q2.50 por unidad después de descuentos, y de alto volumen de fabricación, con un ritmo reportado de aproximadamente 800 unidades por día de trabajo.

El producto B es un hule de barra estabilizadora para versión 4x4. Es una pieza de mayor valor unitario, con un precio neto de Q12.00, pero su fabricación es más lenta y artesanal, con un ritmo de aproximadamente 210 unidades por día de trabajo.

Es muy importante notar que estos dos productos tienen características muy distintas: uno es de bajo precio y alto volumen; el otro es de mayor valor y menor ritmo. Esta combinación nos permite evaluar si los modelos de predicción y las políticas de inventario funcionan de la misma manera para piezas con dinámicas diferentes.

## 05. Qué nos propusimos desarrollar

Tiempo: 1:30. Acumulado principal: 7:00.

### En pantalla

1. Kardex: 1,062 movimientos validados y trazables.
2. Modelos: 13 métodos comparados con datos reales.
3. Inventario: Saldos en bodega frente a ventas recientes.
4. Planificación: 8 escenarios con supuestos explícitos.

### Visual

Flujo de cuatro etapas con numeración destacada y textos concisos que describen el alcance real ejecutado, sin añadir promesas comerciales.

### Notas del presentador

Para abordar el problema planteado, definimos un plan de trabajo estructurado en cuatro etapas concretas.

En primer lugar, la preparación de datos: procesamos y verificamos 1,062 movimientos individuales del Kardex de RUJAF para construir un historial de ventas mensuales confiable y sin inconsistencias contables.

En segundo lugar, la predicción de demanda: construimos y pusimos a prueba 13 métodos diferentes, desde reglas elementales hasta modelos estadísticos y de aprendizaje automático, utilizando un esquema de validación temporal estricto.

En tercer lugar, el análisis de inventario: contrastamos las existencias en bodega con el ritmo de ventas recientes para dimensionar la cobertura actual de cada producto.

Y en cuarto lugar, la planificación de producción: integramos las predicciones en 8 escenarios prácticos con supuestos operativos transparentes, simulando cuántas unidades y cuántos días de trabajo se requerirían.

Veamos a continuación cómo obtuvimos y preparamos los datos del Kardex.

## 06. Cómo obtuvimos los datos del Kardex

Tiempo: 1:45. Acumulado principal: 8:45.

### En pantalla

- Producto A: Kardex de 13 páginas.
- Producto B: Kardex de 10 páginas.
- Lectura directa: Extracción de texto y tablas desde los PDF del Kardex, sin OCR.
- Trazabilidad por fila: Registro de fecha original, página y orden de cada movimiento.
- Tipos de movimiento: Separación de ventas, producción, compras, ajustes y devoluciones.

### Visual

Esquema gráfico de las dos pilas de documentos PDF con el número de páginas correspondiente y tres puntos clave sobre la metodología de extracción estructurada.

### Notas del presentador

Los datos de origen nos fueron entregados en documentos PDF generados por el sistema contable de RUJAF: 13 páginas para el producto A y 10 páginas para el producto B.

Un aspecto metodológico fundamental fue cómo procesamos estos documentos. En lugar de utilizar reconocimiento óptico de caracteres (OCR) —que suele cometer errores al confundir dígitos como el 8 con el 0 o el 1 con la l—, desarrollamos una rutina de extracción que leyó directamente las tablas y el texto vectorial del PDF.

Cada transacción extraída conserva su número de página, su posición en la hoja y su fecha original de registro. Además, clasificamos cada fila según su tipo de movimiento contable: separamos rigurosamente las salidas por venta de los ingresos por producción, las compras, las devoluciones y los ajustes de inventario. Esto garantiza que únicamente las ventas comerciales legítimas se utilicen para modelar la demanda.

## 07. Trazabilidad y conciliación de movimientos

Tiempo: 1:45. Acumulado principal: 10:30.

### En pantalla

1,062 movimientos preservados
583 del producto A · 479 del producto B · Consolidado sin duplicación.

1. Archivos fuente: Control de integridad con huellas SHA-256.
2. Validación: Comprobación de fechas, cantidades y saldos.
3. Series mensuales: 105 de 105 meses conciliados sin diferencias.

### Visual

Métrica principal de movimientos en tamaño grande y un flujo de verificación de tres pasos con las cantidades exactas y el estado de conciliación.

### Notas del presentador

En total logramos rescatar y estructurar 1,062 movimientos contables: 583 pertenecientes al producto A y 479 al producto B.

Para garantizar que nadie pudiera cuestionar si los datos fueron alterados o manipulados durante el análisis, aplicamos controles de integridad criptográfica SHA-256 a cada archivo original. Esto permite demostrar en cualquier momento que los datos procesados son idénticos a los entregados por la empresa.

Posteriormente, verificamos cada fila: comprobamos que las fechas fueran cronológicas, que las cantidades fueran positivas y que cada movimiento cuadrara matemáticamente con el saldo anterior. Al consolidar las ventas por mes, comparamos los 105 totales mensuales con las cifras de control preliminares de la empresa y encontramos una coincidencia del 100%: 105 de 105 meses conciliaron con exactitud. Ninguna transacción se perdió ni se duplicó en el proceso.

## 08. Revisión de consistencia del Kardex

Tiempo: 1:30. Acumulado principal: 12:00.

### En pantalla

1,060 transiciones verificadas
Sin diferencias aritméticas en saldos.

Alertas detectadas en el Kardex:
- 2 saldos negativos.
- 23 ajustes de inventario.
- 10 eventos con saldo cero.

Movimientos conciliados contablemente que requieren revisión operativa.

### Visual

Panel comparativo. A la izquierda, la métrica destacada de 1,060 transiciones que cuadran con exactitud matemática. A la derecha, la lista de las tres alertas operativas encontradas en el registro.

### Notas del presentador

Al comprobar la aritmética del Kardex —donde el saldo anterior más las entradas menos las salidas debe ser igual al saldo resultante— encontramos que las 1,060 transiciones verificables cuadran con total exactitud. No hubo un solo error de suma o resta en el sistema de la empresa.

Sin embargo, que la contabilidad cuadre no significa que la operación física haya sido perfecta. Identificamos tres tipos de situaciones que merecen atención:

Primero, encontramos dos momentos donde el saldo registrado cayó por debajo de cero, lo que en una bodega física es imposible. Esto suele deberse a un desfase de tiempo: se despachó el producto hoy pero la orden de producción se registró formalmente un par de días después. Segundo, identificamos 23 ajustes manuales de inventario. Y tercero, registramos 10 momentos donde el saldo llegó a cero exacto.

En lugar de borrar estas filas o alterar los datos para que el análisis pareciera perfecto, decidimos conservarlas y documentarlas con transparencia, porque reflejan la realidad cotidiana de la operación.

## 09. Definición del objetivo y meses analizados

Tiempo: 1:45. Acumulado principal: 13:45.

### En pantalla

Definición del objetivo:
- Salidas registradas como VENTA por RUJAF.
- Canales: Despachos a Refama y ventas a otros clientes.
- Exclusiones: Ajustes, producción interna, compras y devoluciones.

Período para modelos:
- Producto A: 50 meses (julio de 2022 a agosto de 2026).
- Producto B: 51 meses (julio de 2022 a septiembre de 2026).

Primer y último mes excluidos por cobertura incompleta.

### Visual

Panel dividido. A la izquierda, la definición del objetivo y sus exclusiones. A la derecha, las tarjetas de cobertura temporal de los productos A y B, con una nota que explica la exclusión de los meses extremos incompletos.

### Notas del presentador

Con los datos limpios, definimos con mucha claridad qué variable íbamos a predecir: la cantidad total de unidades despachadas bajo el concepto de VENTA por mes, sumando los despachos a Refama y las ventas a otros clientes, sin duplicar registros. Cualquier otro tipo de movimiento contable, como ajustes o ingresos de producción, quedó fuera del objetivo.

En cuanto a la ventana de tiempo para entrenar los modelos, el primer mes del historial y el último mes disponible tenían solo unos pocos días registrados, ya que el reporte se generó a mitad de mes. Incluir un mes incompleto haría pensar erróneamente al modelo que las ventas cayeron a casi nada. Por esa razón, excluimos los meses extremos incompletos.

Esto nos dejó una serie de 50 meses completos y continuos para el producto A (de julio de 2022 a agosto de 2026) y 51 meses para el producto B (de julio de 2022 a septiembre de 2026). Con estas dos series consistentes, iniciamos el análisis del comportamiento de las ventas.

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

Participación histórica de Refama en las ventas:
- Producto A: 5.6%
- Producto B: 37.2%

### Visual

Tabla comparativa de los cambios porcentuales por canal para cada producto, complementada con dos barras proporcionales que ilustran la participación de Refama en el volumen total.

### Notas del presentador

Quisimos profundizar en la caída de ventas para entender en qué canal se originó el cambio: ¿fueron las tiendas Refama o fueron los clientes mayoristas independientes?

Comparamos el promedio mensual de los últimos doce meses analizados contra los primeros doce meses del historial. El resultado es muy revelador. En las tiendas Refama, la reducción de volumen fue moderada: cayó un 15.3% en el producto A y un 18.0% en el producto B. En cambio, en los demás clientes mayoristas la caída fue dramática: se redujo en un 86% en el producto A y en casi un 69% en el producto B.

A esto se suma que la importancia de Refama es muy diferente para cada repuesto. En el producto A, Refama representa apenas el 5.6% del volumen total histórico; la inmensa mayoría de las ventas dependía de otros clientes mayoristas que dejaron de comprar al ritmo de antes. En el producto B, en cambio, Refama representa más de un tercio de las ventas (37.2%), actuando como un canal más estable para la fábrica.

## 12. Variación de ventas y tamaño de pedidos

Tiempo: 1:45. Acumulado principal: 19:00.

### En pantalla

Indicador histórico | Producto A | Producto B
- Promedio mensual: 1,278.76 u. en A vs. 121.33 u. en B.
- Variación relativa (CV): 0.93 en A vs. 0.48 en B.
- Volumen en el 10% de pedidos mayores: 51.7% en A vs. 25.1% en B.
- Rango mensual: 71 a 5,530 u. en A vs. 23 a 285 u. en B.

El producto A presenta mayor variación mensual y pedidos más concentrados.

### Visual

Tabla comparativa con cuatro filas clave que contraponen el volumen promedio, la dispersión relativa, la concentración de ventas por orden y el rango mínimo-máximo mensual.

### Notas del presentador

Más allá del volumen promedio, una pregunta fundamental para predecir la demanda es qué tan variable y regular es el flujo de ventas. En esta tabla comparamos ambos productos y encontramos diferencias muy marcadas.

El producto A vende mucho más volumen, pero es sustancialmente más inestable. Su coeficiente de variación relativa (CV) es de 0.93, prácticamente el doble que el del producto B, que es de 0.48. Esto significa que la variabilidad mensual del producto A es casi del mismo tamaño que su propio promedio: ha tenido meses de solo 71 unidades y meses de más de 5,500 unidades.

Gran parte de esta inestabilidad se explica por el tamaño de los pedidos. En el producto A, el 10% de los pedidos más grandes concentra más de la mitad de todas las unidades vendidas (51.7%). Cuando un cliente mayorista hace un pedido grande, el mes se dispara; cuando no lo hace, el mes cae al piso. En cambio, en el producto B los pedidos son mucho más parejos y el 10% mayoritario representa solo una cuarta parte de las ventas (25.1%), lo que hace que su comportamiento sea más fácil de modelar.

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

### Visual

Dos paneles grandes que destacan la razón entre el saldo en bodega y el promedio de ventas mensual reciente, mostrando el contraste numérico entre ambos productos.

### Notas del presentador

Al cruzar el inventario registrado en el Kardex con el ritmo de ventas de los últimos doce meses, encontramos dos realidades operativas completamente opuestas.

En el producto A, la bodega reportaba un saldo de 5,892 unidades al cierre de agosto de 2026, mientras que las ventas recientes promediaban unas 393 unidades al mes. Esto significa que la empresa tiene en bodega el equivalente a casi 15 meses de ventas. Hay producto de sobra para atender la demanda durante mucho tiempo sin necesidad de encender la maquinaria.

En el producto B ocurre exactamente lo contrario. Al cierre de septiembre de 2026, el saldo en bodega era de apenas 24 unidades, frente a una venta reciente de casi 70 unidades mensuales. Eso representa apenas 0.34 meses de inventario, es decir, unos diez días de cobertura. El producto B opera prácticamente al día, con un riesgo inminente de desabastecimiento si la fábrica se retrasa en un lote.

Este hallazgo es crucial: demuestra con datos reales que RUJAF no puede aplicar una política de producción uniforme; cada producto requiere una atención completamente diferenciada.

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

Los registros del Kardex reflejan las ventas que RUJAF efectivamente despachó. Pero no reflejan la demanda que pudo haber existido si hubiera habido más producto disponible. Por ejemplo, en el producto B, con solo 24 unidades en bodega, es muy probable que algún cliente haya querido comprar piezas adicionales y no se le hayan podido surtir.

Esa venta perdida no queda escrita en el Kardex porque no se facturó. Y como la empresa no lleva una bitácora de pedidos desatendidos, no podemos inventar esa cifra ni sumarle números arbitrarios al historial.

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

## 18. Los 13 modelos evaluados

Tiempo: 1:30. Acumulado principal: 28:45.

### En pantalla

Familias de modelos:
- 5 Referencias simples: Mes anterior, mismo mes del año previo, promedio histórico, promedio de 3 meses y promedio de 6 meses.
- 2 Regresiones: Lineal clásica y regularizada con Ridge.
- 4 Series de tiempo: Suavizamiento de nivel, tendencia amortiguada, estacional y SARIMA.
- 2 Árboles de decisión: Bosque aleatorio y árboles con aumento gradual.

### Visual

Cuatro columnas limpias que agrupan los 13 modelos por familias lógicas, con números grandes y descripciones concisas para cada categoría.

### Notas del presentador

En proyectos de ciencia de datos es común que se asuma de antemano que el algoritmo más complejo será el ganador. Para evitar ese sesgo, decidimos evaluar 13 métodos divididos en cuatro familias.

La primera familia la forman cinco referencias simples: reglas directas como repetir el mes anterior, repetir el mismo mes del año pasado o calcular promedios móviles de tres o seis meses. Estas referencias son indispensables: si un modelo complejo de inteligencia artificial no logra ganarle a una regla tan sencilla como repetir el mes anterior, entonces su complejidad no aporta valor real al negocio.

La segunda familia incluye la regresión lineal y Ridge. La tercera familia comprende cuatro métodos clásicos de series de tiempo, como el suavizamiento exponencial en tres variantes y el modelo SARIMA. Y la cuarta familia abarca dos algoritmos basados en árboles de decisión: bosques aleatorios y modelos de aumento gradual.

Todos los modelos compitieron bajo exactamente las mismas condiciones para cada producto.

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

A partir de los errores promedio obtenidos en esa etapa de validación, seleccionamos el modelo más adecuado para cada producto. Y únicamente después de haber cerrado esa selección, desbloqueamos los últimos seis meses del historial —marzo a agosto de 2026 en A, y abril a septiembre en B— como una prueba final completamente independiente. Esto simula con total realismo cómo se habría comportado el modelo si hubiera operado mes a mes en la empresa.

## 20. Criterio de selección con margen del 5%

Tiempo: 1:30. Acumulado principal: 32:30.

### En pantalla

Si un modelo más simple queda a menos del 5% de diferencia en MAE, se prefiere su uso.

Tabla de selección en validación:
- Producto A: Menor MAE = Regresión lineal (371.27) → Modelo seleccionado: Regresión Ridge (MAE de validación 380.65).
- Producto B: Menor MAE = Tendencia amortiguada (34.02) → Modelo seleccionado: Promedio de 3 meses (MAE de validación 34.95).

### Visual

Regla de decisión destacada en un recuadro superior y tabla comparativa con los modelos de menor error frente a los modelos finalmente seleccionados bajo la regla de simplicidad.

### Notas del presentador

Para medir el desempeño de los modelos utilizamos el error absoluto medio (MAE), que indica en cuántas unidades se desvía la predicción respecto a lo vendido en promedio cada mes. Cuanto menor sea el MAE, más precisa es la estimación.

Sin embargo, aplicamos un principio de ingeniería muy claro: ante resultados prácticamente idénticos, siempre es preferible el modelo más simple y fácil de explicar. Establecimos una regla formal: si un modelo más sencillo queda a menos de un 5% de diferencia en MAE respecto al modelo de menor error en la validación, seleccionamos el modelo más simple.

En el producto A, la regresión lineal obtuvo el menor error con 371 unidades, pero la regresión Ridge quedó a solo 380 unidades (una diferencia de apenas 2.5%); dado que Ridge penaliza coeficientes extremos y es más estable, seleccionamos Ridge. En el producto B, el modelo de tendencia amortiguada obtuvo 34.02 unidades, pero el promedio móvil de tres meses quedó a solo 34.95 unidades (una diferencia menor al 3%); por su transparencia y facilidad de cálculo, seleccionamos el promedio de tres meses.

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

### Visual

Dos paneles con las trayectorias temporales de ventas reales, predicciones del modelo seleccionado y predicciones del mes anterior, con el período de prueba final resaltado en fondo ámbar.

### Notas del presentador

Para comprender el comportamiento real de los modelos mes a mes, necesitamos ver las curvas completas y analizar dos métricas complementarias: el error relativo ponderado (WAPE) y el sesgo medio.

El WAPE mide el error acumulado como porcentaje del volumen real vendido. En el producto A, el WAPE alcanzó un 93.2%, y el sesgo medio fue de +228 unidades por mes. Esto significa que Ridge sobreestimó sistemáticamente la demanda en la prueba final: venía calibrado con años de volúmenes altos y tardó en adaptarse a la fuerte caída de 2026, prediciendo más unidades de las que realmente se vendieron.

En el producto B la situación fue más equilibrada: el WAPE fue del 60.4% y el sesgo medio fue de apenas −7.44 unidades por mes, prácticamente centrado alrededor de la realidad.

Estas curvas demuestran por qué sería peligroso automatizar órdenes de compra o producción basándose exclusivamente en un modelo: cuando el mercado cambia bruscamente, los modelos pueden tardar meses en corregir su rumbo.

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

### Visual

Flujo de decisión en cuatro pasos consecutivos, destacando la comprobación de coherencia, el cambio a modelo de respaldo y la tarjeta con el valor concreto de 205 unidades para el producto A.

### Notas del presentador

Para resolver esta vulnerabilidad, diseñamos un mecanismo de reglas de control y salvaguardas antes de que cualquier predicción pueda ser utilizada para planificar.

El protocolo funciona en cuatro pasos. Primero, comprueba que la salida no sea negativa, no haya sido recortada a cero y no contenga fallos numéricos. Segundo, compara la predicción con el promedio de ventas de los últimos tres meses conocidos: si la estimación se desvía drásticamente sin justificación, se activa una alerta de revisión.

Tercero, si el modelo principal no supera estas comprobaciones, el sistema activa automáticamente un modelo de respaldo predefinido: el promedio móvil de los últimos tres meses. En el caso del producto A, este respaldo asignó 205 unidades en lugar de cero, una cifra mucho más coherente con la realidad observada.

Y cuarto, si incluso el modelo de respaldo presentara anomalías, el sistema bloquea el cálculo y solicita intervención humana, evitando generar decisiones erróneas en planta.

## 26. Entradas para planificar la producción

Tiempo: 1:30. Acumulado principal: 43:00.

### En pantalla

Entradas para la planificación:
- Predicción de ventas: Volumen estimado, margen de incertidumbre y validez del dato.
- Inventario disponible: Existencias en bodega, reservas y pedidos pendientes.
- Capacidad de planta: Tiempos de entrega, lotes y días de trabajo disponibles.

### Visual

Tres columnas amplias y equilibradas que muestran cómo la predicción se combina con el estado del inventario y las restricciones de fabricación para alimentar los escenarios de producción.

### Notas del presentador

Una vez que contamos con una estimación de ventas validada, el siguiente paso es conectar ese pronóstico con la toma de decisiones en la fábrica.

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

Al cierre de septiembre teníamos un saldo de apenas 24 unidades en bodega, un pronóstico de ventas de 96.33 unidades mensuales y una capacidad reportada de 210 unidades por día de trabajo. Suponiendo un tiempo de reposición de 7 días y una revisión cada 30 días, el horizonte de cobertura es de 37 días.

En el primer paso evaluamos el escenario sin stock de seguridad. Para cubrir la demanda estimada durante esos 37 días se necesitan 118.81 unidades. Al restar las 24 unidades que ya están en bodega, el modelo sugiere producir 95 unidades, lo que equivale a 0.45 días de trabajo en planta (aproximadamente media jornada).

En el segundo paso evaluamos qué ocurre si la empresa decide mantener un mes de ventas como colchón de seguridad. El inventario objetivo sube a 215.14 unidades y la producción sugerida aumenta a 192 unidades, requiriendo 0.91 días de trabajo (prácticamente una jornada completa de planta).

Este análisis permite a los administradores de RUJAF visualizar con precisión el costo operativo de cada política: mantener un mes de seguridad duplica el lote de producción de 95 a 192 unidades.

## 28. Escenario de producción para el producto A

Tiempo: 1:45. Acumulado principal: 47:15.

### En pantalla

Producto A · Corte histórico al 31 de agosto de 2026:
- Saldo histórico en bodega: 5,892 unidades registradas.
- Ventas estimadas: 205 u./mes.
- Inventario objetivo: 252.83 u.

Resultado del escenario:
0 unidades adicionales necesarias.
La producción sugerida es cero porque el inventario actual cubre la demanda esperada.

### Visual

Panel dividido en dos bloques. A la izquierda, la métrica destacada de 5,892 unidades en bodega junto a la demanda estimada. A la derecha, el número 0 en gran formato con su explicación operativa correspondiente.

### Notas del presentador

El producto A nos presenta el escenario exactamente opuesto y demuestra la utilidad práctica de no producir a ciegas.

Para este producto utilizamos el pronóstico de respaldo de 205 unidades mensuales. Bajo las mismas condiciones de 7 días de reposición y revisión mensual, el inventario objetivo para cubrir el período es de 252.83 unidades.

Pero en la bodega central había 5,892 unidades registradas. La recomendación del modelo es inmediata: fabricar cero unidades adicionales.

Es fundamental interpretar bien este resultado: la producción sugerida es cero no porque la demanda sea cero —esperamos vender 205 piezas—, sino porque el inventario disponible en bodega es tan grande que cubre con creces el objetivo necesario. Si la fábrica mandara a producir más unidades de este producto, solo estaría inmovilizando más dinero y ocupando espacio innecesariamente. Este cálculo le permite a la planta reasignar sus horas de maquinaria hacia productos críticos como el B.

## 29. Qué logramos implementar y sus limitaciones

Tiempo: 1:30. Acumulado principal: 48:45.

### En pantalla

Lo implementado:
- 1,062 movimientos de Kardex validados.
- 13 modelos de predicción evaluados.
- 8 escenarios de producción calculados.
- Pipeline reproducible con pruebas automatizadas.

Límites y condiciones:
- Inventario físico en bodega pendiente de auditoría.
- Restricciones de planta basadas en supuestos.
- Sin costos de fabricación para medir ahorro financiero.
- Requiere validación previa antes de operar en planta.

### Visual

Dos columnas equilibradas con viñetas claras que contraponen los entregables técnicos efectivamente desarrollados frente a las condiciones necesarias para su eventual aplicación práctica.

### Notas del presentador

Para mantener una postura profesional y honesta, queremos resumir con claridad qué logramos construir y cuáles son las limitaciones reales del proyecto.

Por el lado de la implementación, desarrollamos una biblioteca modular en Python, un pipeline de datos completamente automatizado, 13 modelos comparados de forma reproducible y una suite de pruebas que verifica la integridad matemática de cada paso.

Sin embargo, para que esta herramienta pudiera utilizarse en la operación diaria de RUJAF, se deben tener presentes cuatro condiciones clave: primero, las existencias registradas en el Kardex deben auditarse físicamente en bodega para confirmar que las piezas coincidan con el papel; segundo, las restricciones de planta como tiempos de montaje y disponibilidad de moldes deben calibrarse con los operarios; tercero, se deben incorporar costos reales de fabricación para traducir las unidades a dinero; y cuarto, el sistema debe correr en paralelo durante unos meses para validar su desempeño antes de basar decisiones de producción en sus recomendaciones.

## 30. Resultados y conclusiones

Tiempo: 1:15. Acumulado principal: 50:00.

### En pantalla

Resultados y conclusiones

- Ventas históricas: Descenso continuo en ambos repuestos, con mayor variación y concentración de pedidos en el producto A.
- Modelos predictivos: Los modelos de aprendizaje automático no superaron con claridad a reglas simples como el mes anterior.
- Planificación: Los escenarios muestran cuándo pausar producción por exceso de stock y cómo cuantificar márgenes de seguridad.

1,062 movimientos preservados · 13 métodos evaluados · 8 escenarios calculados

### Visual

Tres paneles horizontales con los hallazgos principales bien estructurados y una línea final con las tres métricas consolidadas del proyecto.

### Notas del presentador

Para cerrar nuestra presentación, queremos destacar tres conclusiones principales:

Primera, sobre el negocio: identificamos que ambos repuestos enfrentan una caída de ventas superior al 50% anual, pero con patrones muy distintos: el producto A tiene pedidos grandes y volátiles que exigen precaución, mientras que el producto B es más regular pero opera con inventarios al límite.

Segunda, sobre la metodología: comprobamos que la complejidad matemática no siempre se traduce en mejores resultados. Reglas simples como el promedio móvil o repetir el mes anterior compitieron de igual a igual con modelos de aprendizaje automático, mientras que modelos como Ridge evidenciaron riesgos al producir predicciones negativas que requirieron salvaguardas explícitas.

Y tercera, sobre la operación: demostramos que vincular la predicción con el inventario disponible permite tomar decisiones más inteligentes, evitando sobreproducir piezas con exceso de bodega como en el producto A y dimensionando con precisión los colchones de seguridad en productos con inventario ajustado como en el producto B.

Agradecemos mucho su atención y quedamos a su completa disposición para cualquier pregunta o comentario.

## 31. Métricas detalladas de los modelos

Tiempo: 1:30. Anexo opcional. Acumulado si se muestran todos los anexos: 51:30.

### En pantalla

Métricas completas en la prueba final:

| Producto y método | MAE | RMSE | WAPE | Sesgo medio | Meses |
| --- | ---: | ---: | ---: | ---: | ---: |
| A, Ridge | 290.19 | 371.86 | 93.2% | +228.85 | 6 |
| A, Último mes | 312.33 | 465.85 | 100.3% | +212.33 | 6 |
| B, Promedio de 3 meses | 37.33 | 45.13 | 60.4% | −7.44 | 6 |
| B, Último mes | 34.17 | 42.57 | 55.3% | +0.83 | 6 |

MAE y RMSE en unidades. WAPE mide el error porcentual sobre el volumen real. Sesgo positivo indica sobreestimación.

Tabla de consulta de los 13 modelos:

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

Tabla comparativa de cuatro métricas clave para los métodos seleccionados y la referencia del mes anterior, complementada con la tabla de consulta de los 13 métodos evaluados.

### Notas del presentador

Esta diapositiva de respaldo nos permite atender preguntas técnicas sobre las diferentes métricas de evaluación del proyecto.

El MAE mide el error absoluto promedio en unidades directas de producto. El RMSE eleva los errores al cuadrado antes de promediarlos, lo que hace que penalice con mayor severidad las equivocaciones grandes. El WAPE expresa el error total acumulado como un porcentaje del volumen real vendido, y el sesgo medio nos indica si el modelo tiende a sobreestimar o subestimar en promedio.

En la tabla completa de 13 métodos podemos observar el comportamiento de todas las alternativas tanto en validación como en prueba final. Por ejemplo, se aprecia con claridad que modelos como SARIMA o el promedio histórico obtuvieron errores sumamente altos en ambos productos, lo que justifica por qué fueron descartados durante la selección inicial.

## 32. Supuestos utilizados en los escenarios

Tiempo: 1:30. Anexo opcional. Acumulado si se muestran todos los anexos: 53:00.

### En pantalla

Parámetros del escenario de producción:
- Conversión mensual: 30 días calendario por mes.
- Plazo de entrega y revisión: 7 días de reposición y revisión cada 30 días.
- Días de producción asignados: 1 o 5 días por producto.
- Stock de seguridad: Cero o un mes de demanda estimada.
- Pedidos y reservas: Sin órdenes abiertas ni atrasos en el escenario base.
- Tamaño de lote y capacidad: Lotes de 1 unidad, sin límites máximos de almacén.
- Producción aproximada por día: A ≈ 800; B ≈ 210 unidades por día de trabajo.

### Visual

Tabla clara de dos columnas que enumera cada parámetro operativo y el valor supuesto adoptado para la ejecución de los escenarios.

### Notas del presentador

Este anexo sirve para responder preguntas sobre la procedencia de los parámetros utilizados en los escenarios de producción.

Es importante destacar que parámetros como los 7 días de plazo de reposición, la revisión mensual de 30 días o los niveles de stock de seguridad fueron adoptados como supuestos de ingeniería para formular escenarios comparables. No constituyen una norma fija impuesta por RUJAF.

Los ritmos de producción de 800 y 210 unidades sí provienen de estimaciones reportadas por la planta para días de trabajo activo, pero no deben considerarse capacidades máximas auditadas. La ventaja del modelo que construimos es que su código es paramétrico: si los ingenieros de planta desean probar plazos de reposición de 15 días o lotes mínimos de 50 piezas, el sistema permite modificar estos valores fácilmente y recalcular las necesidades de producción al instante.

## 33. Fuentes de información y trazabilidad

Tiempo: 1:30. Anexo opcional. Acumulado si se muestran todos los anexos: 54:30.

### En pantalla

Ubicación de la evidencia en el repositorio:
- Extracción y calidad: `kardex_csv/LEEME.txt`, `reports/data_quality.md`.
- Resultados de modelos: `reports/final_report.md`, `reports/tables/model_comparison.csv`.
- Planificación y escenarios: `reports/tables/production_scenarios.csv`, `docs/production_planning.md`.
- Código y pruebas: `src/inventory_demand/`, `tests/`, `notebooks/01_exploratory_analysis.ipynb`.
- Datos comerciales: Precios netos y ritmos de planta confirmados con la empresa.

### Visual

Mapa de fuentes estructurado por áreas temáticas con rutas relativas exactas hacia los archivos de datos, reportes y código en el repositorio del proyecto.

### Notas del presentador

Esta última diapositiva de respaldo documenta la trazabilidad total del proyecto. Todo lo presentado hoy es completamente reproducible y auditable.

Cualquier persona que consulte el repositorio encontrará la bitácora de extracción en la carpeta `kardex_csv/`, el informe detallado de calidad de datos en `reports/data_quality.md`, las tablas con los errores de todos los modelos en `reports/tables/` y el código fuente documentado y probado con `pytest` en la carpeta `src/inventory_demand/`.

Esta estructura garantiza que el trabajo entregado no sea una presentación aislada, sino una base de ingeniería sólida y verificable sobre la cual RUJAF y la universidad pueden seguir construyendo en el futuro.
