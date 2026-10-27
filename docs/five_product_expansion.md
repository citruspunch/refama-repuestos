# Ampliación a cinco productos

## Alcance y entregables

El experimento `five_products_v1` reutiliza `data.py`, `cleaning.py`, `eda.py`, `features.py`,
`forecasting.py`, `evaluation.py`, `forecast_validity.py` e `inventory.py`. `expansion.py` coordina
la ejecución separada; `portfolio_planning.py` usa el contrato de producción existente para
sensibilidades y simulación temporal. No se reemplazó la arquitectura ni se reescribieron las pruebas originales.

| Entregable | Ruta respecto a la raíz |
| --- | --- |
| Resumen de resultados | `reports/experiments/five_products_v1/summary.md` |
| Informe generado | `reports/experiments/five_products_v1/final_report.md` |
| Tablas y figuras | `reports/experiments/five_products_v1/{tables,figures}/` |
| Datos sin nombres y variables | `data/experiments/five_products_v1/` |
| Modelos y metadatos | `artifacts/experiments/five_products_v1/` |
| Escenarios configurables | `scenarios/five_products.json` |
| Pruebas adicionales | `tests/test_expansion.py` |
| Presentación y notas | `presentacion/dist/index.html`, `presentacion/GUION.md` |

El cuaderno original sigue ejecutado e intacto. El análisis ampliado se reproduce con el programa;
no se sobrescribe ese cuaderno para cambiar su muestra histórica. Los registros con identidades quedan
en `data/private/five_products_v1/`, ignorado por Git.

## Entradas y procedencia

El paquete está en `kardex_csv/kardex_5_productos_RUJAF_csv/`. El consolidado autoritativo tiene
2,108 movimientos. Los individuales, los 1,046 movimientos del consolidado de tres y los 1,062
anteriores se comparan como multiconjuntos, con multiplicidades y metadatos cuando existen. No se
concatenan ni se eliminan filas repetidas. Las afirmaciones numéricas de `verificacion_kardex.json`
se recalculan; no se acepta su texto de validación como prueba suficiente.

`empresa_para_el_analisis` es RUJAF. `empresa_documento` conserva RUJAF o REFAMA, con `pdf_origen`
y `empresa_kardex` originales. El encabezado REFAMA de C no lo excluye ni demuestra propiedad o
consumo final. RUJAF fabrica y distribuye; Refama opera tiendas. La bandera de destino solo segmenta
los movimientos VENTA y no es demanda del consumidor.

Los códigos son claves descubiertas. Las letras A, B, C, D y E son alias de presentación. Un sexto
producto puede procesarse sin añadirlo a una lista del limpiador, modelos o planificador. Tipos de
movimiento nuevos sí requieren definir su semántica explícitamente, no se aceptan como ventas por defecto.

Se conservan los cuatro traslados, una venta de D en cero, devoluciones y ajustes. Las ventas en
cero cuentan como documentos VENTA pero no como ocurrencias positivas. Las tablas separan esas
cantidades. No se netean devoluciones en el objetivo bruto.

## Qué cambia y qué se conserva

| Aspecto | Referencia histórica | Experimento ampliado |
| --- | --- | --- |
| Productos y series | 2 y 6 | 5 y 15 |
| Entrenamiento inicial | 24 meses | Igual |
| Validación | Orígenes crecientes de un mes | Igual, con 17 a 21 orígenes por serie |
| Prueba final | Últimos seis meses interiores | Igual, con cortes propios de cada producto |
| Selección | Menor MAE y banda práctica de 5% | Igual; candidatos adicionales separados |
| Candidatos | 13 fijos | 13 originales, cero y, si son elegibles, SBA y TSB |
| FDR de diagnósticos | Familia de seis series | Familia de hasta quince series |
| Producción | Ocho alternativas puntuales A/B | 48 alternativas y replay diario de otra política |
| Control tras tres ceros | Rechaza previsión positiva | La permite para no descartar tasas intermitentes por definición |

Los originales quedan en `reports/tables/`, `data/processed/` y `artifacts/`. Sus modelos, figuras,
cuaderno y pruebas protegidas conservan sus bytes. `historical_reference_manifest.json` incorpora
también el informe y las salidas del anterior ajuste de negocio. Se comprueba antes y después de
cada ejecución ampliada. `historical_model_comparison.csv` compara las métricas comunes reejecutadas
con las archivadas, sin sustituirlas.

Los candidatos y ventanas originales de A y B reproducen sus métricas. Sus mismos holdouts ya fueron
observados anteriormente: reentrenar y añadir métodos no genera evidencia independiente nueva.
Los valores q cambian al ampliar la familia de pruebas, aunque los p individuales no cambien.

## Modelos y demanda intermitente

La elegibilidad usa solo los primeros 24 meses. Todos comparan los 13 candidatos originales y
referencia cero. Si hay al menos dos meses positivos y 20% de ceros en esa ventana inicial,
también compiten `statsforecast.models.CrostonSBA` y `TSB`. La lista queda fijada antes de validación.
No se usa la clasificación EDA de toda la historia ni el holdout para abrir o cerrar candidatos.

Croston-SBA usa el suavizado fijo 0.1 de StatsForecast. TSB usa `alpha_d=0.2` y `alpha_p=0.2`.
No se ajustan hiperparámetros sobre la prueba final. Ambos reciben el calendario con ceros,
no una serie comprimida de ventas positivas. TSB reduce su tasa con períodos sin ocurrencia;
SBA conserva una tasa entre ocurrencias. Se usa StatsForecast 2.1.1, sin cambiar las dependencias
numéricas que produjeron la referencia anterior.

Cada ajuste ve únicamente meses anteriores al objetivo. Los siete predictores y el escalado local
de las regresiones se mantienen. MAE decide en validación; RMSE, WAPE, sesgo, MASE, meses positivos
y fallos acompañan el resultado. Un denominador cero produce métrica ausente, no error perfecto.
Series con menos de 36 meses interiores no se fuerzan a entrenar: `model_readiness.csv` registra
el bloqueo. Los diagnósticos anuales requieren al menos 25 meses.

E selecciona cero por MAE, con solo dos meses positivos de prueba final y WAPE 100%. Croston-SBA
y TSB se evaluaron y no lo superaron en MAE. Esto ilustra la diferencia entre acertar ceros frecuentes
y mantener disponibilidad. No prueba demanda nula ni optimalidad de inventario. Las salvaguardas
retienen la previsión bloqueada, la causa y el respaldo MA3 como campos distintos.

## Montos, inventario y producción

`datos_reportados_productos.csv` mantiene monto, clasificación y extremos del ritmo por separado.
Los cinco montos son precios de venta netos tras descuentos confirmados (`precio_venta_neto_tras_descuento`):
A Q2.50, B Q12.00, C Q15.00, D Q2.50 y E Q100.00. Ninguno alimenta
automáticamente `ManufacturingCostInputs`, una valoración de inventario, un margen o un cálculo de ahorro.
Multiplicar unidades vendidas o pronosticadas por el precio neto es solo un escenario de ingresos estimados;
como se desconocen las variaciones de precios de todo el período, no equivale a ingresos históricos reales.

Las tasas reportadas solo se usan como supuestos de unidades buenas por día productivo. En E
se evalúan 30 y 35, no un promedio implícito. El escenario base asume plazo total de siete días,
revisión de treinta, conversión de treinta días por mes, uno o cinco días asignados, cero o un mes
de seguridad y factores de previsión 1 o 1.5. Son 48 alternativas, no cantidades sumables.

`products` permite un ritmo explícito alternativo por código. Si falta el ritmo, el cálculo queda
bloqueado; un precio o costo no lo sustituye. Lotes, reservas, restricciones, atrasos, órdenes abiertas
y límites son entradas explícitas. Las asignaciones son por SKU, no una programación conjunta de planta.
No se conocen materiales, rendimientos, preparaciones ni capacidad sostenible compartida.

El stock usado en cada escenario pertenece al mismo corte que su previsión. Las fechas distintas
no se sustituyen por el último saldo del archivo. Los pronósticos siguientes son retrospectivos de
frontera; E apunta a agosto, A a septiembre y B/C/D a octubre de 2026. Ninguno autoriza un plan vigente.

### Simulación temporal

`production_replay.csv` contiene decisiones mensuales de cada variante base durante los seis
orígenes finales. `production_replay_daily.csv` contiene recepciones, retiros y saldos simulados
por día. El saldo de un día pasa al siguiente y al mes posterior. Las decisiones usan la previsión
guardada y el stock simulado al origen. Las ventas posteriores se usan solo como retiros de evaluación.

Se asume recepción antes de los retiros del día, plazo explícito y retiros no servidos sin arrastre
como atrasos. No se incorporan ingresos reales, compras, ajustes o traslados como suministro:
la política simulada reemplaza la reposición, no reconstruye decisiones reales. El factor de estrés
1.5 pertenece al escenario puntual; no se fabrica una observación de ventas para el replay.

El resultado se llama "venta registrada no servida en la simulación". No es pérdida real medida,
demanda no observada ni consumo final. Los controles son posteriores y provisionales, así que no
se afirma mejora independiente de servicio. `actual_savings` permanece ausente y
`economic_optimality_established` es falso.

## Reproducción

Desde la raíz, usando el entorno existente:

```sh
uv pip install --python .venv/bin/python -r requirements-expansion-lock.txt
.venv/bin/python scripts/run_pipeline.py --expand-products
.venv/bin/python -m pytest -q --junitxml=reports/expansion_tests.xml
```

Otro conjunto compatible, sin codificar los productos en Python:

```sh
.venv/bin/python scripts/run_pipeline.py --expand-products \
  --source-bundle kardex_csv/otro_paquete \
  --ledger kardex_consolidado.csv \
  --experiment otro_experimento \
  --planning-scenarios scenarios/five_products.json
```

El paquete requiere un consolidado con el esquema del diccionario y un CSV
`ventas_mensuales_*.csv` para conciliación. Los demás Kardex son controles y pueden contener
uno o varios productos. Se recomienda indicar `--ledger`; si se omite, se elige el consolidado
de más filas y se exige que concilie con los demás. El catálogo reportado y el JSON de verificación
se validan cuando están presentes. Los identificadores desconocidos no se excluyen por ser nuevos.

`--eda-only` no entrena modelos; no debe publicarse como ejecución completa. El cuaderno histórico
y `--business-update-only` no se combinan con la ampliación. Los metadatos incluyen versiones,
configuración y huellas del código y las fuentes. Las pruebas originales siguen sin cambios;
las adicionales incluyen seis SKU, series cortas, cero ventas, temporalidad, clasificación de precios netos verificada,
artefactos y conservación de unidades en la simulación.

Para compilar y comprobar la presentación, desde `presentacion/`:

```sh
pnpm test
pnpm lint
pnpm test:e2e
```

La salida es un HTML autónomo, sin nombres ni documentos de clientes. Los datos agregados siguen
siendo sensibles y requieren autorización antes de divulgarse.
