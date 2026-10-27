# Evidencia y decisiones editoriales

Las rutas de esta página se expresan respecto a la raíz del repositorio. Los datos históricos tienen fecha de análisis del 26 de octubre de 2026. `presentacion/evidence-loader.js` solo lee tablas públicas, conserva sus rutas y calcula SHA-256 al construir el HTML. La presentación no consulta archivos privados ni ejecuta el pipeline analítico.

## Jerarquía de fuentes

1. La confirmación comercial del encargo define los nombres de producto, la relación RUJAF con Refama, los precios netos de venta y los ritmos reportados.
2. Las tablas numéricas actuales y la implementación definen los resultados y las capacidades del proyecto.
3. Los reportes y el registro de conversión aportan interpretación y procedencia. No sustituyen evidencia operativa faltante.

### Confirmación posterior a los reportes

Los documentos actuales del proyecto todavía clasifican Q2.50 y Q12.00 como valores no confirmados. El encargo aclara que son precios netos de venta después de descuentos, respectivamente para A y B. La diapositiva 04 incorpora esa confirmación.

No se cambió `business.py`, `financial.py`, el JSON de escenarios ni los reportes anteriores. El módulo `presentacion/src/business.js` mantiene los precios como `netSellingPrice`, sin campo de costo. No se inventaron precios de lista, descuentos porcentuales, margen ni rentabilidad. Tampoco se usaron las multiplicaciones de `unclassified_value_scenarios.csv` como valoración o ahorro.

800 y 210 unidades son ritmos aproximados por día de producción reportado. Usarlos como unidades buenas sostenibles en una fila de planificación sigue siendo un supuesto del escenario. No prueban capacidad máxima, producción diaria constante ni un calendario conjunto factible.

## Correspondencia por diapositiva

| Diapositivas | Evidencia principal | Qué respalda y qué no |
| --- | --- | --- |
| 01 a 05 | `README.md`, `docs/business_assumptions.md`, confirmación del encargo | Contexto comercial, dos SKU y propuesta. No acredita ahorros ni práctica actual de producción. |
| 06 | `kardex_csv/LEEME.txt`, `docs/data_dictionary.md` | Dos PDF de 13 y 10 páginas, extracción sin OCR y procedencia por fila. Los PDF y el extractor no están incluidos. |
| 07 | `reports/data_quality.md`, `source_reconciliation.csv`, `monthly_reconciliation.csv`, `artifacts/source_manifest.json` | 1,062 movimientos, 583 y 479 por producto, 105 coincidencias mensuales. Conciliación entre archivos derivados, no auditoría independiente del negocio. |
| 08 | `reports/tables/quality_checks.csv`, `reports/data_quality.md` | 1,060 transiciones comprobables, 0 diferencias, 2 negativos, 23 ajustes y 10 eventos cero. No certifica stock físico. |
| 09 | `reports/tables/coverage.csv`, `data/processed/monthly_demand.csv`, `docs/methodology.md` | Meses interiores de julio de 2022 a agosto o septiembre de 2026. La cobertura interior es provisional. |
| 10 | `monthly_demand.csv`, `reports/tables/comparable_ytd.csv` | Series y ventanas anuales comparables. A: 3,596/8,100 menos uno; B: 593/1,211 menos uno. No identifica causas. |
| 11 | `reports/tables/rujaf_demand_streams.csv`, `sales_summary.csv` | Cambios de promedios y participación de Refama. Las ventanas son primeros y últimos 12 meses, no acumulados anuales. |
| 12 | `reports/tables/sales_summary.csv` | Promedios, CV, rangos y concentración por pedidos. La concentración incluye los extremos observados; los momentos mensuales no. |
| 13 | `monthly_demand.csv`, `reports/tables/seasonality.csv` | Calendarios, q armónico y ACF detrendida. Un resultado significativo aislado no establece una temporada operativa estable. |
| 14 | `reports/tables/inventory_pressure.csv` | 5,892/393.25 = 14.9828 y 24/69.8333 = 0.3437. Son cocientes históricos, no pronósticos de cobertura. |
| 15 | `reports/data_quality.md`, `docs/demand_forecasting.md` | Ventas atendidas frente a demanda no observada. El diagrama es conceptual, no una estimación de ventas perdidas. |
| 16 | `src/inventory_demand/features.py`, `monthly_demand.csv` | Siete variables de entrenamiento y ejemplo 360, 71 y 184. Promedio 205. El ejemplo no atribuye a Ridge esa predicción. |
| 17 y 18 | `src/inventory_demand/forecasting.py` | Regresión, Ridge, escalado local y los 13 candidatos fijos. No afirma éxito en todos los ajustes. |
| 19 y 20 | `src/inventory_demand/evaluation.py`, `validation_splits.csv`, `selected_models.csv` | 24 meses iniciales, orígenes crecientes, selección con banda de 5% y prueba de 6 meses. No es pronóstico de seis pasos desde un origen único. |
| 21 a 23 | `model_comparison.csv`, `backtest_predictions.csv`, `paired_baseline_comparison.csv` | MAE, RMSE, WAPE, sesgo y límites de la comparación. Se conserva la selección anterior a la prueba. |
| 24 | `next_history_month_forecasts.csv` | A sin recorte −102.294; recortado cero; 325 ventas de frontera. El mes parcial no es una venta mensual completa ni una variable futura de entrenamiento. |
| 25 | `src/inventory_demand/forecast_validity.py`, `forecast_validity.csv`, `forecast_safeguard_comparison.csv` | Controles, respaldo fijo MA3 y diagnóstico posterior. No es evidencia independiente de mejora de precisión. |
| 26 a 28 | `src/inventory_demand/inventory.py`, `production_scenarios.csv`, `scenarios/rujaf_planning.json` | Aritmética de escenarios históricos por SKU con supuestos explícitos. No acredita factibilidad conjunta, servicio ni órdenes reales. |
| 29 | `tests/`, `notebooks/01_exploratory_analysis.ipynb`, ejecución de pytest en esta revisión | 132 pruebas de Python aprobadas, cuaderno ejecutado y estado de implementación. No valida beneficios comerciales. |
| 30 | `sales_summary.csv`, `model_comparison.csv`, `production_scenarios.csv` | Conclusiones del historial, los pronósticos y los escenarios. Sin validación operativa ni ahorros demostrados. |
| 31 a 33 | Las fuentes anteriores y tablas de consulta | Respaldo técnico para preguntas, no resultados adicionales del proyecto. |

Los nombres de CSV sin prefijo adicional en la tabla corresponden a `reports/tables/`, salvo `monthly_demand.csv`, ubicado en `data/processed/`.

## Resultados que se mantienen separados

### Historial observado

El total VENTA observado es 66,423 unidades en A y 6,437 en B. Incluye meses fronterizos no confirmados. Las estadísticas y los modelos principales usan respectivamente 50 y 51 meses interiores. No se mezclan esos dos alcances.

Los saldos alineados de 5,892 y 24 son cortes históricos previos a los objetivos de pronóstico. Los últimos saldos observados de los archivos, 5,567 y 44, pertenecen a otros cortes y no los sustituyen.

### Evaluación de pronóstico ejecutada

Se ejecutaron orígenes mensuales crecientes para seis series, dos productos y tres canales por producto, con 13 candidatos. Se seleccionó usando validación antes de evaluar los seis meses finales. Las métricas originales siguen intactas. Los rangos de prueba son distintos entre productos.

Las bandas de incertidumbre son heurísticas, dependientes de selección y de una muestra con cambio de nivel. No son garantías de 80% o 95% de servicio. El proyecto no demostró ventaja robusta general de aprendizaje automático.

### Diagnóstico posterior de controles

La regla de respaldo se incorporó después de observar el experimento. Se repitió sobre los mismos orígenes con información anterior a cada objetivo. Ese cuidado temporal no convierte una regla diseñada después en un experimento independiente. Menor MAE retrospectivo puede coexistir con mayor sesgo, y algunos canales empeoran.

### Escenarios de inventario y producción ejecutados

Se preservan seis ejemplos antiguos de reposición por compras con plazos supuestos en meses. No se presentan como planes de fabricación de RUJAF. La presentación usa la extensión de producción, con ocho filas puntuales y supuestos en días.

En B sin seguridad, 96.3333/30 × 37 = 118.8111 unidades objetivo. Restar 24 y redondear hacia arriba da 95. Agregar 96.3333 de seguridad al objetivo da 215.1444 y una sugerencia de 192. Dividir por el ritmo supuesto 210 produce 0.4524 y 0.9143 días productivos teóricos.

En A con seguridad cero, 205/30 × 37 = 252.8333. El saldo 5,892 lo supera y la sugerencia es cero. Esa diferencia es un sobrante respecto a un objetivo supuesto, no una clasificación de desperdicio ni una valoración económica.

No se demostró una simulación continua de producción e inventario con todas las restricciones reales, comparación contra decisiones actuales y medición de ahorro. Las interfaces de costos y comparación de programas tienen pruebas sintéticas. `actual_savings` permanece sin valor calculado.

## Visualizaciones seleccionadas

Se recrean las ideas útiles de `monthly_sales_scenarios.png`, `calendar_growth.png`, `customer_segment_contributions.png`, `order_concentration.png`, `calendar_heatmap.png`, `inventory_and_supply.png`, `model_comparison.png` y `actual_vs_predicted.png` desde sus tablas numéricas.

No se insertan todas las imágenes disponibles. STL, residuos, autocorrelaciones completas, ejemplos de compras y bandas se discuten solo donde aportan contexto o en notas. Esto evita letras pequeñas, etiquetas en inglés y protagonismo excesivo de resultados secundarios.

Los gráficos mensuales tienen ejes en unidades y escalas propias. Las barras de error parten de cero. Las líneas no usan suavizado que invente trayectorias entre meses. Los calendarios usan cifras visibles y escalas separadas, con contraste mínimo de texto de 4.5. Las figuras de documentos son esquemas, no los PDF originales.

## Datos todavía necesarios

Confirmación de cobertura, stock físico actual, pedidos no atendidos, stock reservado y restringido, órdenes abiertas y fechas vinculadas de inicio y recepción. También calendario de trabajo, capacidad sostenible y compartida, materiales, rendimientos, preparación, lotes y límites reales.

Para evaluar economía se necesitan costos fechados, componentes evitables, costo de mantener y preparar, criterio de faltantes y base terminal del inventario, junto con la política o las decisiones actuales. Los despachos deben conciliarse con documentos únicos, sin duplicación y con revisión contable competente cuando corresponda. Esta presentación no supone ningún tratamiento fiscal correcto de documentos no verificados.

El pronóstico mensual vigente sigue bloqueado por meses recientes no confirmados.
