# Notas de la introducción visual de modelos

Complemento del guion archivado, sin modificar `GUION.md`. Corresponde a las diapositivas 17 a 19 del HTML actual. Tiempo previsto de 1:30 por diapositiva, 4:30 en total.

En Presentar, cada flecha avanza un paso. Las animaciones terminan sin avanzar la exposición. G permite comparar métodos en Explorar; R repite la entrada y P pausa o reanuda.

## 17. Copiar o promediar

Las barras son ventas reales registradas de B. El color destaca los meses que aportan al cálculo; la barra separada representa el mes siguiente al corte histórico.

| Paso | Explicación breve |
| --- | --- |
| Naive | Copia agosto de 2026, 114 unidades. Es una referencia sencilla para comparar los demás métodos. |
| Media de 3 | Junio, julio y agosto aportan por igual. Su promedio es 79 unidades. |
| Avanzar la ventana | Septiembre entra con 75 y junio sale. Julio, agosto y septiembre dan 96.3 unidades. Es un mes ya archivado, no una venta simulada. |
| Media de 6 | La ventana se amplía de abril a septiembre. Da 61.8 unidades y reacciona menos a un solo mes. Más historia no garantiza menor error. |

Estos cálculos enseñan el funcionamiento. No son previsiones vigentes ni una nueva evaluación de precisión.

## 18. Regresión y Ridge

| Paso | Explicación breve |
| --- | --- |
| Regresión lineal | Aprende cómo combinar señales del pasado para estimar la venta siguiente. La recta resume la relación de una sola señal en nueve puntos didácticos. |
| Ridge | Añade una penalización a los pesos grandes. En este ejemplo baja la pendiente y se acorta el indicador de influencia. No garantiza acertar ni evita previsiones negativas. |

Los modelos reales usan siete entradas. Son tres ventas previas, su promedio, el paso del tiempo y dos variables de calendario. La recta no representa sus pesos ni su ajuste real.

## 19. Random forest

| Paso | Explicación breve |
| --- | --- |
| Un árbol | Hace preguntas sobre las entradas y sigue una ruta hasta una estimación. Las preguntas dibujadas son ilustrativas, no las del bosque entrenado. No se evaluó un árbol aislado como candidato. |
| El bosque | Combina árboles entrenados con muestras y selección de variables distintas. Las estimaciones didácticas de 60, 90 y 75 dan un promedio de 75 unidades. El proyecto usó 80 árboles, no tres. |

## Transición a la evaluación

Estos seis métodos tienen resultados ejecutados en el proyecto. La introducción omite SARIMA, ETS y los demás métodos técnicos; la tabla completa de resultados se conserva. La diapositiva siguiente explica cómo se probó el mes siguiente sin usar sus ventas para entrenar.

Los modelos fijados son Ridge para A y D, media de 3 meses para B y C, y cero para E. La selección real y la precisión se presentan después; los dibujos no justifican elegir un modelo.
