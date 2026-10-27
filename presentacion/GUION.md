# Guion de la presentación de RUJAF

26 diapositivas y 32 pasos. Duración orientativa de 56:30, sin ensayo cronometrado. Las notas son apoyos para explicar y señalar los gráficos, no un texto para leer. Con explicaciones más breves de los ejemplos, el recorrido puede acercarse a 45 minutos.

La secuencia sigue el problema, los datos, el desarrollo de los modelos, sus resultados y la aplicación al inventario. Las flechas avanzan los pasos. R repite la entrada visual. Las notas no aparecen en el HTML del público.

## 01. Ventas e inventario

Tiempo: 1:00. Acumulado principal: 1:00.

### Notas del presentador

- Abrir con la pregunta del proyecto: ¿cómo usar las ventas históricas para estimar lo que se venderá y estudiar cuánto inventario mantener?
- Presentar al equipo y ubicar el trabajo como un proyecto universitario de Machine Learning aplicado a cinco repuestos de RUJAF.
- Anticipar el recorrido sin enumerar herramientas de programación. Primero conocer el problema, luego explicar las predicciones y terminar con la simulación de inventarios.

## 02. Cómo trabaja RUJAF

Tiempo: 1:30. Acumulado principal: 2:30.

### Notas del presentador

- Señalar RUJAF y después las dos ramas del diagrama. La empresa fabrica y distribuye repuestos. Las salidas abastecen tiendas Refama y otros compradores mayoristas.
- Explicar Kardex con una frase: es el registro de entradas, salidas y saldos de un producto en bodega.
- El historial describe despachos desde RUJAF. No conocemos cuándo cada tienda vendió esas mismas piezas al consumidor final.

## 03. Cuánto producir y cuánto mantener en bodega

Tiempo: 2:00. Acumulado principal: 4:30.

### Notas del presentador

- Plantear los dos riesgos del inventario. Producir de más deja unidades acumuladas. Producir de menos puede dejar pedidos sin atender.
- Usar un ejemplo verbal sin cifras inventadas: si se toma una venta extraordinaria como el ritmo habitual, el siguiente lote puede ser demasiado grande.
- Relacionar las dos partes de la pantalla. Conocer las ventas recientes ayuda, pero hace falta estimar el siguiente período y considerar lo que ya hay en bodega.
- No presentar esos riesgos como pérdidas ya cuantificadas en RUJAF. Son el motivo de la pregunta de investigación.

## 04. Los cinco productos analizados

Tiempo: 1:00. Acumulado principal: 5:30.

### Notas del presentador

- Recorrer las fotos brevemente. A es el uretano de hoja de resorte, B el hule de barra estabilizadora, C el juego de palanca, D el hule corto y E la manguera de aire.
- Las letras y los colores se mantienen durante toda la exposición para facilitar las comparaciones.
- No hace falta memorizar códigos, precios o especificaciones mecánicas. Lo relevante será cómo se vende cada producto.

## 05. Qué desarrollamos

Tiempo: 1:30. Acumulado principal: 7:00.

### Notas del presentador

- Explicar el trabajo como una secuencia. Organizar el historial, estimar las ventas del mes siguiente, comparar modelos con ventas posteriores y usar las predicciones en una simulación de inventarios.
- El resultado es una herramienta de análisis. Permite comparar comportamientos y alternativas con datos, sin afirmar que ya se hayan reducido costos o cambiado la operación.
- Pasar de la pregunta empresarial a los datos que hicieron posible construir los modelos.

## 06. Preparación de los datos

Tiempo: 2:00. Acumulado principal: 9:00.

### Notas del presentador

- Recorrer los cuatro pasos. Los Kardex de A y B provinieron de PDF convertidos a tablas CSV. Para C, D y E se recibieron tablas CSV ya transcritas.
- Revisar las fechas, las cantidades y el tipo de movimiento permite distinguir una venta de una entrada de producción o de un ajuste.
- Explicar por qué agrupar por mes. Un mes puede tener varios despachos y el modelo necesita una observación mensual comparable con las demás.
- Mantener en el calendario los meses sin ventas registradas. Eliminarlos haría parecer que la historia fue más continua de lo que realmente fue.

## 07. Qué datos usamos y qué queremos predecir

Tiempo: 2:00. Acumulado principal: 11:00.

### Notas del presentador

- Definir la salida del modelo como unidades vendidas por producto durante el mes siguiente. Es una cantidad numérica, no una clasificación de productos.
- Sumar las ventas a ambos destinos. Excluir producción, compras, ajustes, traslados y devoluciones del objetivo de ventas.
- Disponemos de alrededor de cuatro años de observaciones mensuales por producto, no de un historial extenso.
- Se excluyeron el primer y último mes de cada historia porque no se pudo confirmar su cobertura completa. No se trataron esos meses parciales como meses con ventas bajas.

## 08. Cómo cambiaron las ventas

Tiempo: 3:00. Acumulado principal: 14:00.

### Notas del presentador

- Dar tiempo para leer los ejes. El eje horizontal es el tiempo y el vertical muestra unidades por mes. Cada producto tiene su propia escala vertical, por lo que la altura de una curva no compara volúmenes entre productos.
- Comenzar por A y B. Ambos presentan ventas recientes menores que en años anteriores. En períodos equivalentes de 2026 frente a 2025, la caída ronda la mitad de las ventas en ambos casos.
- Recorrer C, D y E sin describir cada punto. C conserva ventas todos los meses, D alterna aumentos y caídas, y E tiene varios meses sin ventas.
- Preguntar qué pasaría si se usara el promedio de toda la historia cuando el ritmo reciente ha bajado. La idea es mostrar por qué importa adaptar y evaluar el pronóstico, no atribuir la caída a una causa que no conocemos.

## 09. Los productos no se venden de la misma forma

Tiempo: 2:00. Acumulado principal: 16:00.

### Notas del presentador

- Usar la tabla para resumir diferencias observadas en las curvas, sin introducir coeficientes estadísticos.
- A y D tienen cambios mensuales grandes. B y C son relativamente más regulares. Regular no significa constante ni fácil de predecir siempre.
- D tiene siete meses sin ventas registradas. E tiene 21 de 49, de modo que casi la mitad de su historia mensual está en cero.
- Relacionar esta diferencia con los modelos. Un método que funciona con ventas frecuentes puede comportarse mal cuando las ventas aparecen de manera esporádica.

## 10. Lo que las ventas permiten conocer

Tiempo: 1:30. Acumulado principal: 17:30.

### Notas del presentador

- Seguir el diagrama desde el pedido hasta la venta. Un cliente puede querer comprar algo que la bodega no tenga disponible.
- El Kardex muestra lo que salió como venta, pero no permite recuperar los pedidos que no se atendieron. Tampoco muestra el consumo final de las tiendas.
- Por eso la predicción corresponde a ventas registradas, no a toda la demanda potencial. Esta limitación afecta tanto la interpretación de un cero como la simulación posterior.

## 11. Qué información le damos al modelo

Tiempo: 2:30. Acumulado principal: 20:00.

### Notas del presentador

- Tomar el ejemplo de A. Para estimar septiembre se conocen junio, julio y agosto, con 360, 71 y 184 unidades. Su promedio es 205 unidades.
- Explicar qué aporta cada entrada. Las ventas previas muestran el comportamiento reciente y su promedio reduce el efecto de un mes aislado. El índice temporal representa cambios de largo plazo y el calendario permite explorar si el mes del año aporta información.
- En el modelo se usan tres ventas previas, su promedio, una variable de tiempo y dos de calendario, que explicaremos en la siguiente diapositiva.
- Aclarar que 205 es aquí una variable de entrada, no la salida de Ridge. Construimos el mismo tipo de información para cada mes de entrenamiento y para cada producto, usando solo datos anteriores al mes que se quiere predecir.

## 12. Los meses forman un ciclo

Tiempo: 1:00. Acumulado principal: 21:00.

### Notas del presentador

- Señalar que diciembre y enero son meses vecinos, aunque sus números sean 12 y 1.
- Cada mes ocupa un punto del círculo. El seno da su coordenada horizontal y el coseno la vertical; juntos identifican la posición del mes.
- Las dos variables permiten explorar patrones anuales sin afirmar que exista estacionalidad en las ventas.

## 13. Dos formas sencillas de pronosticar

Tiempo: 3:00. Acumulado principal: 24:00.

### Notas del presentador

- Primer paso. Las barras son ventas registradas de B. La barra resaltada del último mes alimenta una regla sencilla: repetir su venta para el mes siguiente. Con agosto, la referencia es 114 unidades.
- Segundo paso. Resaltar los tres meses recientes. Junio, julio y agosto aportan por igual y dan un promedio de 79 unidades. Una venta alta o baja de un solo mes influye menos que al copiar el último mes.
- Tercer paso. Al incorporar septiembre, entra su venta de 75 y sale junio de la ventana. El promedio de julio a septiembre pasa a unas 96.3 unidades.
- Usar el movimiento de la ventana para explicar la actualización mensual. Estos ejemplos muestran cómo calcular referencias, no su precisión.
- Estas reglas son necesarias para comparar. Un modelo aprendido tiene que demostrar si reduce el error frente a una alternativa que ya se puede calcular con facilidad.

## 14. Regresión lineal y Ridge

Tiempo: 4:00. Acumulado principal: 28:00.

### Notas del presentador

- Explicar por qué usamos regresión. Queremos predecir una cantidad de unidades a partir de variables numéricas del historial. La regresión aprende qué peso dar a cada variable.
- Primer paso. Los puntos y la recta son un ejemplo didáctico con una sola variable. Señalar la relación general que aprende la recta y cómo se usa para estimar una venta posterior. No representan observaciones ni el ajuste real de RUJAF.
- Conectar el dibujo con el proyecto. En lugar de una sola entrada, la regresión combina las ventas previas, el promedio, el tiempo y el calendario.
- Segundo paso. Ridge penaliza pesos muy grandes para reducir el sobreajuste. Sobreajustar significa seguir demasiado las particularidades del historial y luego equivocarse con datos nuevos.
- En el dibujo cambia la pendiente. Eso ayuda a explicar la penalización, pero no demuestra que Ridge vaya a acertar más. Hay que comprobarlo con meses posteriores.
- Las variables se ponen en una escala comparable durante el entrenamiento. Basta esa idea, sin describir parámetros ni fórmulas.
- También se probaron otros métodos de pronóstico, incluidos métodos de series de tiempo y árboles. La explicación se concentra en las regresiones y los promedios porque fueron relevantes en las selecciones y los resultados del proyecto.

## 15. Cómo entrenamos y probamos los modelos

Tiempo: 3:00. Acumulado principal: 31:00.

### Notas del presentador

- Primer paso. Comenzar con 24 meses y construir ejemplos de entradas conocidas y venta del mes siguiente. El modelo aprende esas relaciones con el historial disponible.
- Explicar la validación temporal con una secuencia verbal. Predecir un mes posterior, compararlo con la venta observada y luego incorporarlo al historial para volver a entrenar. Nunca mezclar al azar pasado y futuro.
- Segundo paso. Los seis meses finales se reservan para evaluar el método elegido. La selección queda fijada antes de consultar esos resultados.
- En la prueba se sigue avanzando de a un mes y se actualiza el entrenamiento con las ventas ya observadas. No son seis meses pronosticados de una sola vez.
- Distinguir los papeles de validación y prueba. Una elige el método. La otra muestra cómo funcionó después de esa elección.

## 16. Cómo medimos el error

Tiempo: 2:30. Acumulado principal: 33:30.

### Notas del presentador

- Leer una fila de la tabla. Comparar la venta real con la predicción y tomar la distancia entre ambas. Una sobreestimación y una subestimación cuentan como error, sin cancelarse.
- Recorrer las otras dos filas y explicar que el MAE promedia esas distancias. La tabla usa tres meses reales de la prueba de B para enseñar el cálculo.
- El MAE conserva la unidad del problema. Si se expresa en unidades por mes, es una cantidad de piezas, no un porcentaje de acierto.
- Los resultados finales se calculan sobre los seis meses completos de prueba, no solo sobre este ejemplo de tres meses.
- Evitar comparar el MAE de A con el de E como si tuvieran el mismo volumen de venta. La comparación útil es entre métodos para el mismo producto y período.

## 17. Qué método elegimos para cada producto

Tiempo: 2:00. Acumulado principal: 35:30.

### Notas del presentador

- Señalar las elecciones. Ridge para A y D, promedio de tres meses para B y C y referencia cero para E.
- La elección usa el MAE de validación y una preferencia predefinida por alternativas sencillas o regularizadas cuando quedan cerca del menor error. El margen utilizado fue de 5%, sin necesidad de desarrollar la regla en pantalla.
- El resultado no exige el mismo algoritmo para todos. Las diferencias del historial llevan a elecciones distintas.
- La referencia cero de E es una regla de comparación, no un modelo que aprenda una relación. Su selección bajo MAE requiere interpretar las ventas poco frecuentes. Ese caso se mostrará después de los resultados generales.

## 18. Cuánto se equivocaron los modelos

Tiempo: 3:00. Acumulado principal: 38:30.

### Notas del presentador

- Leer la tabla por filas. En cada producto se compara el MAE del método elegido con el de repetir el último mes, sobre los mismos seis meses finales.
- A tiene un MAE de 290.19 frente a 312.33 de la referencia. La mejora observada es moderada. B tiene 37.33 frente a 34.17, de modo que la regla del último mes funcionó mejor.
- En C el promedio de tres meses tiene un MAE de 44.33 frente a 59.33. En D, Ridge tiene 78.39 frente a 74.50 y no supera a la referencia.
- E tiene 2.17 frente a 2.83. Es un error pequeño en unidades, pero su venta también es pequeña y poco frecuente. No interpretarlo como el producto mejor resuelto.
- Resumir el hallazgo sin proclamar un ganador universal. El método elegido mejora frente a la referencia en A, C y E, pero no en B ni D. No se cambió la selección después de ver esta prueba.

## 19. Lo previsto y lo vendido, mes a mes

Tiempo: 3:00. Acumulado principal: 41:30.

### Notas del presentador

- Explicar la leyenda antes de leer las curvas. Línea continua para ventas registradas, línea de color discontinua para el método elegido y punteada para repetir el último mes.
- A tiende a sobreestimar durante la prueba. La reducción reciente de ventas hace difícil trasladar al futuro las relaciones de años anteriores.
- Comparar B y C. El promedio suaviza cambios, pero puede reaccionar tarde a un aumento. En C resulta útil en el conjunto de los seis meses, sin acertar cada punto.
- D conserva diferencias grandes entre meses. E muestra por qué una línea en cero puede parecer cercana durante varios meses y aun así omitir las ventas que sí ocurren.
- Las escalas y fechas pertenecen a cada producto. Usar los gráficos para interpretar el error, no para repetir todas las cifras de la tabla anterior.

## 20. Un error bajo puede ocultar ventas

Tiempo: 2:00. Acumulado principal: 43:30.

### Notas del presentador

- Centrar la atención en E. Solo dos de los seis meses finales tuvieron ventas positivas, que sumaron 13 unidades.
- La regla de predecir cero acierta en los meses vacíos. Al promediar el error de todos los meses obtiene un MAE bajo, pero no anticipa ninguna de las unidades vendidas.
- Esto no significa que no exista demanda. Muestra que la métrica de pronóstico no responde por sí sola la pregunta de cuánto inventario mantener.
- Para productos con ventas poco frecuentes, el costo de quedarse sin una pieza y el tiempo de reposición también importan. El proyecto no dispone de esos costos completos para determinar una reserva óptima.

## 21. Revisión de las predicciones

Tiempo: 2:00. Acumulado principal: 45:30.

### Notas del presentador

- Diferenciar este caso del anterior. Ridge produjo una predicción negativa para A al estimar septiembre con el historial hasta agosto. No es lo mismo que elegir la regla cero en E.
- Una cantidad negativa no tiene sentido para ventas. Convertirla simplemente en cero no resuelve el problema de interpretación.
- Para estudiar el inventario de A se usó el promedio reciente de 205 unidades. Se calcula con meses anteriores, sin incorporar ventas del mes que se está estimando.
- Esta sustitución es una decisión práctica para los escenarios, no una mejora de precisión demostrada en otra prueba independiente. La tabla de MAE anterior sigue mostrando los resultados del método originalmente elegido.

## 22. De la predicción al inventario

Tiempo: 2:00. Acumulado principal: 47:30.

### Notas del presentador

- Explicar las tres entradas de la planificación. Ventas previstas durante la espera, inventario disponible y ritmo de producción con tiempo de reposición.
- Recorrer verbalmente la lógica. Estimar cuánto se necesitará durante el período, restar lo que hay en bodega y observar si la producción disponible alcanza.
- Definir la reserva como inventario adicional para responder a diferencias entre lo previsto y lo vendido. En las comparaciones se usa cero o un mes de ventas estimadas.
- La simulación utiliza los ritmos de producción reportados por la empresa y supuestos de reposición. No se calculó una reserva óptima a partir de costos.

## 23. Cómo cambia la producción con una reserva

Tiempo: 3:00. Acumulado principal: 50:30.

### Notas del presentador

- Explicar el escenario antes de leer la tabla. Una revisión cada 30 días y siete días de reposición requieren cubrir 37 días. Se supone un día productivo por producto y se usan los ritmos inferiores reportados.
- Primer paso. Tomar B como ejemplo. El saldo es 24 unidades y la venta prevista es de unas 96.33 al mes. Sin reserva adicional, el escenario sugiere producir 95 unidades.
- Segundo paso. Al añadir un mes de reserva, B pasa a 192 unidades. La diferencia corresponde al colchón de inventario, no a un ahorro ni a una mejora ya comprobada.
- A no necesita producción adicional bajo estos supuestos porque el saldo supera lo requerido. Esto no significa que su pronóstico de ventas sea cero.
- En C, con reserva se necesitarían 439 unidades, pero el día productivo supuesto permite 300. Señalar el asterisco. La restricción puede impedir alcanzar el inventario buscado.
- Cada fila corresponde a su fecha histórica. Es una comparación por producto, no un calendario conjunto de fabricación.

## 24. Qué mostró la simulación de inventarios

Tiempo: 3:00. Acumulado principal: 53:30.

### Notas del presentador

- Primer paso. Cada mes se decide con la predicción disponible y el saldo simulado. La reposición llega siete días después. Las ventas registradas posteriores sirven para comprobar qué se habría podido atender.
- El saldo restante se conserva de un día al siguiente y pasa al mes siguiente. Se compara la misma regla con cero o un mes de reserva, manteniendo un día de producción mensual por producto.
- Segundo paso. Las cifras son unidades de ventas registradas que el inventario simulado no pudo atender durante la prueba. No son pedidos perdidos observados en la empresa.
- En C pasan de 115 a 2 y en D de 129 a 0. En E queda una unidad sin atender en ambas variantes. Una reserva adicional no tiene el mismo efecto en todos los productos.
- Las predicciones utilizadas aquí incluyen la revisión práctica descrita antes. Esta simulación posterior no es una nueva prueba independiente de precisión del modelo.
- El resultado permite estudiar la relación entre previsión, espera y reserva. No demuestra ahorros económicos ni una mejora real de servicio.

## 25. Qué aporta el proyecto y qué falta conocer

Tiempo: 1:30. Acumulado principal: 55:00.

### Notas del presentador

- Resumir lo que quedó desarrollado. Un historial mensual, una comparación temporal de predicciones y una simulación de reposición para los cinco productos.
- Concentrar aquí los límites generales. Hay pocos años de historia y las ventas cambian. Los saldos son contables y la capacidad reportada necesita confirmación.
- Sin costos completos de producción, almacenamiento y faltantes no corresponde convertir las diferencias de unidades en ahorros ni asegurar un óptimo económico.
- La utilidad demostrada es analítica: permite identificar diferencias entre productos y comparar alternativas bajo supuestos explícitos.

## 26. Resultados y conclusiones

Tiempo: 1:30. Acumulado principal: 56:30.

### Notas del presentador

- Volver a la pregunta inicial. Los datos históricos permitieron construir predicciones y relacionarlas con el inventario, pero los resultados varían por producto.
- Las regresiones no superaron siempre a las reglas simples. Por eso fue necesario comparar con el último mes y con promedios antes de atribuir valor a la complejidad del modelo.
- El caso de E muestra que el error de predicción y la disponibilidad no son lo mismo. La simulación de C y D muestra cómo la reserva cambia los faltantes bajo los supuestos usados.
- Cerrar con el aporte concreto del proyecto: una base para estudiar la planificación de inventarios a partir de ventas, con resultados medidos y límites identificados.
