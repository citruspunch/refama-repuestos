# Resultados nuevos frente al análisis de dos productos

Se integraron 5 productos, 2,108 movimientos y 258 combinaciones producto/mes. Los resultados históricos, sus particiones y el cuaderno ejecutado permanecen intactos. Los candidatos originales de A y B reproducen las métricas archivadas; esta reejecución no es una nueva prueba independiente.

## Comparación final

| Producto   | Código          | Método fijado    |   MAE final |   MAE último mes |   WAPE |
|:-----------|:----------------|:-----------------|------------:|-----------------:|-------:|
| A          | UAH-90385-18025 | ridge            |     290.187 |          312.333 |  0.932 |
| B          | 48815-14050     | moving_average_3 |      37.333 |           34.167 |  0.604 |
| C          | UAH-33505-35020 | moving_average_3 |      44.333 |           59.333 |  0.231 |
| D          | 90385-18046     | ridge            |      78.388 |           74.500 |  0.976 |
| E          | 17881-54820     | zero             |       2.167 |            2.833 |  1.000 |

WAPE se expresa como fracción. Los MAE están en unidades mensuales, con seis orígenes finales propios de cada serie. La elección proviene exclusivamente de validación.

| product_id   |   all_observed_sales_units |   complete_months |   zero_periods |   longest_zero_run_months | demand_class   |
|:-------------|---------------------------:|------------------:|---------------:|--------------------------:|:---------------|
| A            |                  66423.000 |                50 |              0 |                         0 | erratic        |
| B            |                   6437.000 |                51 |              0 |                         0 | smooth         |
| C            |                  16802.000 |                47 |              0 |                         0 | smooth         |
| D            |                   5578.000 |                51 |              7 |                         1 | erratic        |
| E            |                    166.000 |                49 |             21 |                         4 | intermittent   |

En E se evaluaron Croston-SBA y TSB. La referencia cero ganó por MAE de validación y obtuvo WAPE final 100%, con ventas en 2 meses finales. No prueba demanda nula ni respalda producción cero. Los controles y el respaldo del siguiente escenario son provisionales.

## Planificación

Se ejecutaron 48 escenarios puntuales, incluidos estrés de previsión y extremos del ritmo de E. El replay diario de los seis meses finales produjo las siguientes unidades VENTA no servidas por la política simulada, con un día asignado mensual y ritmo inferior reportado:

| product_id   |   Seguridad cero |   Seguridad un mes |
|:-------------|-----------------:|-------------------:|
| A            |            0.000 |              0.000 |
| B            |            0.000 |              0.000 |
| C            |          115.000 |              2.000 |
| D            |          129.000 |              0.000 |
| E            |            1.000 |              1.000 |

Son retiros registrados no servidos en una simulación, no faltantes reales medidos, consumo final ni ahorro. El saldo inicial y las ventanas difieren entre productos. Las alternativas no se suman.

La palanca C conserva REFAMA como procedencia y RUJAF como conjunto de análisis. Los cinco montos son precios de venta netos tras descuentos (`precio_venta_neto_tras_descuento`): A Q2.50, B Q12.00, C Q15.00, D Q2.50 y E Q100.00; no son costos de fabricación, márgenes ni ahorros. El rango de E sigue siendo 30 a 35 unidades por día productivo aproximado, no capacidad máxima. Un ingreso estimado (unidades × precio neto) es solo un escenario complementario y no equivale a ingresos históricos reales, pues se desconocen las variaciones de precios del período. No hay optimalidad económica ni autorización de uso operativo.

El informe, las tablas y las figuras están en esta carpeta. La presentación conserva 30 diapositivas principales y tres anexos, con 50 minutos estimados, y añade comparaciones en pasos de las diapositivas existentes.
