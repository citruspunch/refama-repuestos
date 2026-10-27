# Notas de la introducción visual de modelos

Apoyo para las diapositivas 12 y 13. Las notas completas están en [GUION.md](GUION.md). Tiempo orientativo de 7 minutos entre ambas.

Cada flecha avanza un paso. Las animaciones terminan sin avanzar la exposición. R repite la entrada visual.

## 13. Dos formas sencillas de pronosticar

Las barras son ventas reales registradas de B. El color destaca los meses que aportan al cálculo; la barra separada representa el mes siguiente al corte histórico.

| Paso | Explicación breve |
| --- | --- |
| Último mes | Copia agosto de 2026, 114 unidades. Es una referencia sencilla para comparar los demás métodos. |
| Promedio de 3 meses | Junio, julio y agosto aportan por igual. Su promedio es 79 unidades. |
| Avanzar la ventana | Septiembre entra con 75 y junio sale. Julio, agosto y septiembre dan 96.3 unidades. Es un mes ya archivado, no una venta simulada. |

Estos cálculos enseñan el funcionamiento. La precisión se evalúa después con ventas posteriores.

## 14. Regresión lineal y Ridge

| Paso | Explicación breve |
| --- | --- |
| Regresión lineal | Aprende cómo combinar variables del pasado para estimar la venta siguiente. La recta ilustra una relación con una sola entrada. |
| Ridge | Penaliza los pesos grandes para reducir el sobreajuste. El cambio de pendiente enseña la idea, no demuestra una mejora de precisión. |

Los modelos del proyecto usan las tres ventas previas, su promedio, el índice temporal y el calendario. La recta es didáctica y no representa el ajuste real de RUJAF.

## Transición a la evaluación

Se mencionan brevemente otros métodos de pronóstico, sin dedicarles una explicación individual. La diapositiva siguiente muestra cómo se entrenó con el pasado y se probó con un mes posterior.

Los métodos elegidos son Ridge para A y D, promedio de tres meses para B y C, y referencia cero para E. Su selección y precisión se presentan después. Los dibujos no justifican elegir un modelo.
