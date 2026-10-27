# Evidencia y decisiones editoriales

Las rutas son relativas a la raíz. Fecha de análisis del 26 de octubre de 2026. `presentacion/evidence-loader.js` lee las tablas sin nombres del experimento `five_products_v1`, conserva sus rutas y calcula SHA-256 al construir el HTML. La presentación no consulta archivos privados ni ejecuta el pipeline analítico. La ampliación Python se ejecutó por separado y conservó los resultados anteriores.

## Jerarquía de fuentes

1. La confirmación comercial del encargo define los nombres de producto, la relación RUJAF con Refama, los precios netos de venta y los ritmos reportados.
2. Las tablas numéricas actuales y la implementación definen los resultados y las capacidades del proyecto.
3. Los reportes y el registro de conversión aportan interpretación y procedencia. No sustituyen evidencia operativa faltante.

### Confirmación posterior a los reportes

El informe histórico mantiene Q2.50 y Q12.00 como valores de referencia. El catálogo del experimento nuevo conserva la confirmación comercial de precios netos tras descuentos para los cinco productos (A Q2.50, B Q12.00, C Q15.00, D Q2.50, E Q100.00; clasificación precio_venta_neto_tras_descuento). La diapositiva 04 muestra esa clasificación uniforme.

Se conservan `business.py`, `financial.py`, el JSON antiguo y los reportes históricos. El catálogo y `scenarios/five_products.json` son entradas separadas de la ampliación. `business.js` usa `netSellingPrice` para los cinco productos. No hay un campo de fabricación verificada ni cálculo de margen. Ningún módulo financiero usa los precios netos como costos de producción; `unclassified_value_scenarios.csv` es solo un escenario de ingresos estimados, no ingreso histórico real ni ahorro.

800, 210, 300, 480 y 30 a 35 son ritmos aproximados por día productivo reportado. Usarlos como tasas de unidades buenas sigue siendo un supuesto del escenario. No prueban capacidad máxima, producción constante ni un calendario conjunto factible. El rango de E se conserva y se evalúan ambos extremos.

## Correspondencia por diapositiva

La tabla siguiente documenta una versión anterior de 33 diapositivas. El escenario de la presentación actual se detalla en «Escenarios de inventario y producción ejecutados».

| Diapositivas | Evidencia principal | Qué respalda y qué no |
| --- | --- | --- |
| 01 a 05 | `README.md`, `product_catalog.csv`, confirmación del encargo | Cinco SKU, montos clasificados y ritmos reportados. No acredita ahorros ni capacidad máxima. |
| 06 | `kardex_csv/LEEME.txt`, LEEME del paquete nuevo, `docs/data_dictionary.md` | Procedencia documentada inicial y tres CSV adicionales. No se afirma una nueva extracción de PDF ausentes. |
| 07 | `source_reconciliation.csv`, `monthly_reconciliation.csv`, manifiesto del experimento | 2,108 movimientos y 258 combinaciones producto/mes. Consolidado único, sin concatenar sus copias. |
| 08 | `quality_checks.csv`, `quality_by_product.csv`, `movement_totals.csv` | 2,103 transiciones, 3 negativos, 80 ajustes, 30 eventos cero, cuatro traslados y una venta en cero. No certifica stock físico. |
| 09 | `coverage.csv`, `monthly_demand.csv` | 50, 51, 47, 51 y 49 meses interiores para A/B/C/D/E; cobertura provisional y fronteras excluidas. |
| 10 | `monthly_demand.csv`, `comparable_ytd.csv` | Cinco series con eje temporal común y escalas verticales propias. Cambios anuales sobre meses equivalentes, con período visible por producto. No identifica causas. |
| 11 | `rujaf_demand_streams.csv`, `sales_summary.csv` | Cambios por canal de los cinco. Ventanas de primeros y últimos doce meses; no consumo final. |
| 12 | `sales_summary.csv`, `demand_profiles.csv` | Frecuencia, CV y rachas de ceros. E tiene 21/49 meses en cero y racha máxima de cuatro. |
| 13 | `seasonality.csv` | Correlación anual y q armónico de los cinco. A tiene señal armónica tras FDR, insuficiente para afirmar estacionalidad operativa fiable. No se reemplazan q históricos. |
| 14 | `inventory_pressure.csv` | Cocientes de los cinco, con cortes propios. A 14.98, B 0.34, C 0.20, D 0.23 y E 0.80. No cobertura garantizada. |
| 15 | `reports/data_quality.md`, `docs/demand_forecasting.md` | Ventas atendidas frente a demanda no observada. El diagrama es conceptual, no una estimación de ventas perdidas. |
| 16 | `src/inventory_demand/features.py`, `monthly_demand.csv` | Los tres rezagos y su promedio para los cinco, con objetivo propio. Son parte de siete variables; el promedio no se atribuye automáticamente al modelo fijado. |
| 17 | `monthly_demand.csv`, `forecasting.py`, `presentacion/src/model-lessons.js` | Naive y promedios de 3 y 6 meses recalculados con ventas de B a agosto y septiembre de 2026. La ventana avanza con una observación ya archivada, no una venta inventada. |
| 18 | `features.py`, `forecasting.py`, `presentacion/src/model-lessons.js` | Siete entradas reales y rectas didácticas de un solo predictor. El efecto de Ridge se calcula con predictor estandarizado y penalización 10; no son los pesos ni el ajuste del proyecto. |
| 19 | `forecasting.py`, `presentacion/src/model-lessons.js` | Árbol y promedio de tres estimaciones didácticas. El candidato ejecutado es Random forest con 80 árboles; no se evaluó un árbol aislado. |
| 20 y 21 | `evaluation.py`, `candidate_eligibility.csv`, `validation_splits.csv`, `selected_models.csv` | 24 meses iniciales, orígenes crecientes, selección con banda de 5% y prueba de 6 meses. La elegibilidad usa la historia inicial, no la prueba final. No es pronóstico de seis pasos desde un origen único. |
| 22 a 24 | `model_comparison.csv`, `backtest_predictions.csv`, `paired_baseline_comparison.csv` | MAE absoluto y relativo al último mes en los cinco, caso intermitente E y cinco curvas finales. E elige cero, con WAPE 100% y dos meses positivos finales. |
| 25 | `next_history_month_forecasts.csv`, `backtest_predictions.csv` | Recorte negativo de A y selección cero de E. Las 325 ventas de frontera de A y las 13 de prueba de E tienen períodos distintos y no se suman ni se usan para decidir antes del origen. |
| 26 | `forecast_validity.py`, `forecast_validity.csv`, `forecast_safeguard_comparison.csv` | Controles, respaldo fijo MA3 y diagnóstico posterior. No es evidencia independiente de mejora de precisión. |
| 27 a 29 | `inventory.py`, `portfolio_planning.py`, `production_scenarios.csv`, `production_replay.csv` | 48 escenarios y replay diario con retiros registrados. No faltantes reales, factibilidad conjunta ni ahorro. |
| 30 | `tests/`, cuaderno preservado, `reports/expansion_tests.xml` | Pruebas originales y adicionales; procesamiento genérico, conservación histórica y estado de implementación. |
| 31 y 32 | Las fuentes anteriores y tablas de consulta | Respaldo técnico para preguntas, no resultados adicionales del proyecto. |
| 33 | `sales_summary.csv`, `model_comparison.csv`, `production_scenarios.csv` | Conclusiones del historial, los pronósticos y los escenarios. Sin validación operativa ni ahorros demostrados. |

Salvo las referencias históricas indicadas, los CSV corresponden a `reports/experiments/five_products_v1/tables/`; `monthly_demand.csv` está en `data/experiments/five_products_v1/`. Las rutas abreviadas de módulos están bajo `src/inventory_demand/`. El manifiesto del experimento está en `artifacts/experiments/five_products_v1/`.

## Resultados que se mantienen separados

### Historial observado

El total VENTA observado es 66,423 unidades en A y 6,437 en B. Incluye meses fronterizos no confirmados. Las estadísticas y los modelos principales usan respectivamente 50 y 51 meses interiores. No se mezclan esos dos alcances.

C añade 16,802 unidades, D 5,578 y E 166. Sus estadísticas usan 47, 51 y 49 meses interiores. Los 2,108 movimientos se procesan una sola vez. C conserva REFAMA como procedencia documental y se incluye en RUJAF por instrucción de la empresa.

Los saldos alineados de 5,892 y 24 son cortes históricos previos a los objetivos de pronóstico. Los últimos saldos observados de los archivos, 5,567 y 44, pertenecen a otros cortes y no los sustituyen.

### Evaluación de pronóstico ejecutada

El experimento nuevo ejecutó quince series con catorce a dieciséis candidatos según su ventana inicial. La selección antecede a los seis orígenes finales. Los rangos de prueba difieren entre productos. Los mismos candidatos originales de A/B reproducen sus métricas archivadas, pero reejecutar esos meses no crea una nueva prueba independiente.

La distribución de la diapositiva 15 usa los 50 meses completos provisionales de A: la primera predicción de validación parte de 24 meses de entrenamiento, seguida por 20 objetivos de validación y 6 de prueba. `backtest_predictions.csv` y `selected_models.csv` documentan esas cantidades. El entrenamiento se amplía con cada mes observado.

Las bandas de incertidumbre son heurísticas, dependientes de selección y de una muestra con cambio de nivel. No son garantías de 80% o 95% de servicio. El proyecto no demostró ventaja robusta general de aprendizaje automático.

### Introducción visual de modelos

La revisión del 27 de octubre introduce solo naive, promedio móvil de 3 y 6 meses, regresión lineal, Ridge y Random forest. Cada uno tiene métricas finitas sobre seis orígenes de prueba en `model_comparison.csv`. Esta comprobación documenta que se ejecutaron; no cambia la elegibilidad ni selecciona modelos con la prueba final. SARIMA, ETS, boosting y los métodos intermitentes quedan fuera de la explicación introductoria, pero sus resultados permanecen en la consulta completa.

Las referencias de B usan meses marcados `complete_for_modeling`. Al corte de agosto, naive da 114 y el promedio de junio a agosto da 79 unidades. Al incorporar septiembre, el promedio de julio a septiembre da 96.3333; el de abril a septiembre da 61.8333. Son cálculos históricos para enseñar la ventana, no previsiones vigentes.

Los nueve puntos de regresión están declarados como ejemplo didáctico. La recta y el indicador de influencia salen del mismo cálculo. La reducción del peso corresponde a ese ejemplo de un predictor estandarizado; no demuestra mayor precisión ni impide resultados negativos. El bosque ilustrado promedia 60, 90 y 75 para dar 75 unidades. Ninguno de esos valores es un resultado de Random forest en el proyecto. Los modelos fijados siguen siendo Ridge para A y D, promedio móvil de 3 meses para B y C, y cero para E.

### Diagnóstico posterior de controles

La regla de respaldo se incorporó después de observar el experimento. Se repitió sobre los mismos orígenes con información anterior a cada objetivo. Ese cuidado temporal no convierte una regla diseñada después en un experimento independiente. Menor MAE retrospectivo puede coexistir con mayor sesgo, y algunos canales empeoran.

### Escenarios de inventario y producción ejecutados

Se preservan seis ejemplos antiguos de reposición por compras con plazos supuestos en meses. No se presentan como planes de fabricación de RUJAF. La versión anterior de la presentación usaba ocho alternativas de producción con supuestos en días.

Las filas originales permanecen en sus rutas. La presentación muestra un solo escenario histórico por producto; `productionVariant` en `presentacion/src/analysis.js` identifica las filas usadas de `production_scenarios.csv`.

En B, 96.3333/30 × 37 = 118.8111 unidades objetivo. Restar 24 y redondear hacia arriba da una sugerencia de 95 unidades. Dividir por el ritmo supuesto de 210 produce 0.4524 días productivos teóricos.

En A, 205/30 × 37 = 252.8333. El saldo 5,892 lo supera y la sugerencia es cero. Esa diferencia es un sobrante respecto a un objetivo supuesto, no una clasificación de desperdicio ni una valoración económica.

El replay usa decisiones mensuales y recepciones a siete días con retiros diarios VENTA. No incorpora como suministro los ingresos reales, ajustes o traslados: simula otra política. En el escenario mostrado se obtienen retiros no servidos de 115 en C, 129 en D y 1 en E; A y B tienen cero. Son resultados de simulación, no faltantes reales. No hay restricciones reales completas, comparación contra decisiones actuales ni medición de ahorro. `actual_savings` permanece sin valor calculado.

En el escenario puntual mostrado, C tiene una sugerencia de 229 unidades y el día asignado permite 300. La selección de filas fija factor de previsión 1 y el extremo inferior del ritmo; no mezcla alternativas de estrés ni suma ambos extremos de E.

## Visualizaciones seleccionadas

Las visualizaciones se construyen desde las tablas, no desde capturas de los reportes. Ventas y errores usan una cuadrícula con A y B arriba, C, D y E abajo; inventario, cinco lecturas paralelas. La estacionalidad muestra los mismos diagnósticos para cada repuesto.

No se insertan todas las imágenes disponibles. STL, residuos, autocorrelaciones completas, ejemplos de compras y bandas se discuten solo donde aportan contexto o en notas. Esto evita letras pequeñas, etiquetas en inglés y protagonismo excesivo de resultados secundarios.

Los gráficos mensuales tienen ejes en unidades y escalas propias. Las barras de error parten de cero. La comparación relativa divide el MAE del modelo fijado entre el MAE del último mes del mismo producto y multiplica por cien. Se declara la referencia 100; no se comparan MAE absolutos entre volúmenes distintos. Las curvas finales contienen solo los seis objetivos propios de cada producto. Las líneas no usan suavizado ni completan meses fuera de cobertura.

La paleta indicada para A a E es `#ffd22b`, `#feb204`, `#ff8503`, `#d53600` y `#700e01`. Los colores identifican productos, no éxito o fallo. Rellenos y etiquetas conservan esa paleta; las líneas de A, B y C usan tonos más profundos con contraste mínimo de 3 frente al fondo, sin contornos superpuestos. La venta usa línea continua con puntos, el modelo fijado usa guiones y la referencia del último mes, una línea punteada. Los valores y las letras siguen disponibles sin color. Las animaciones revelan los datos ya calculados, sin interpolar cifras ni simular observaciones nuevas.

## Datos todavía necesarios

Confirmación de cobertura, stock físico actual y disponible, pedidos no atendidos, órdenes abiertas y fechas vinculadas de inicio y recepción. También calendario de trabajo, capacidad sostenible y compartida, materiales, rendimientos, preparación, lotes y límites reales.

Para evaluar economía se necesitan costos fechados, componentes evitables, costo de mantener y preparar, criterio de faltantes y base terminal del inventario, junto con la política o las decisiones actuales. Los despachos deben conciliarse con documentos únicos, sin duplicación y con revisión contable competente cuando corresponda. Esta presentación no supone ningún tratamiento fiscal correcto de documentos no verificados.

El pronóstico mensual vigente sigue bloqueado por meses recientes no confirmados.
