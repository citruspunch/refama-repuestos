# Presentación de RUJAF

Presentación completa en español sobre el proyecto universitario de pronóstico de ventas, inventario de producto terminado y escenarios preliminares de producción.

## Abrir la entrega

- **[Presentación lista para proyectar](dist/index.html)**. Abrir el archivo en un navegador. No necesita servidor ni internet después de compilarse.
- [Guion archivado](GUION.md). Conserva sus 32 entradas sin cambios en esta revisión; sus títulos y visuales pueden diferir de la presentación actual.
- [Notas de la introducción visual de modelos](MODELOS.md). Ocho pasos para las diapositivas 17 a 19.
- [Fuentes y límites de la evidencia](EVIDENCIA.md).
- [Comprobaciones y limitaciones de entrega](VALIDACION.md).

Son 33 diapositivas integradas y 46 pasos, con las consultas técnicas antes de las conclusiones. La duración prevista suma 54:30. No es un tiempo medido en ensayo.

El contenido usa los resultados ejecutados de `five_products_v1`. Los cinco productos tienen el mismo detalle en catálogo, ventas, canales, estacionalidad, inventario, variables, validación, errores y producción. La compilación no entrena modelos ni modifica las métricas, artefactos, pruebas o el cuaderno históricos.

C conserva su procedencia documental REFAMA dentro del conjunto de análisis RUJAF. Los cinco montos son precios de venta netos tras descuentos (precio_venta_neto_tras_descuento): A Q2.50, B Q12.00, C Q15.00, D Q2.50, E Q100.00; no son costos, márgenes ni ahorros. Los ritmos siguen siendo aproximaciones reportadas y E conserva 30 a 35 unidades por día productivo.

## Presentar

| Control | Acción |
| --- | --- |
| Flechas, Espacio, Av Pág y Re Pág | Avanzar o retroceder un paso |
| Mayús + flecha | Saltar una diapositiva |
| Inicio y Fin | Ir al inicio o al cierre principal |
| F | Pantalla completa |
| G | Cambiar entre Presentar y Explorar |
| R y P | Repetir o pausar las entradas visuales |
| ? o H | Abrir ayuda |

No hay avance automático. La posición queda en `#diapositiva/paso`, con índices desde cero. `?mode=explore` conserva el modo Explorar y no elimina otros parámetros de la URL.

Las diapositivas 17 a 19 introducen naive, promedios móviles de 3 y 6 meses, regresión lineal, Ridge y Random forest. Ocho pasos muestran qué meses aportan, cómo avanza la ventana, el freno de Ridge y el promedio de varios árboles. No incluyen SARIMA ni ETS. Todos los métodos explicados tienen resultados ejecutados; la tabla completa de modelos se conserva. Las referencias usan ventas reales de B; las rectas y los árboles son ejemplos didácticos, identificados como tales.

En la diapositiva 28, Presentar compara cero y un mes de seguridad para los cinco productos. Explorar cambia las variantes archivadas de seguridad y días asignados de todos a la vez. No calcula un plan nuevo ni se conecta con la empresa. C muestra explícitamente cuándo el día asignado limita el lote. El cero de producción de A usa una previsión positiva, distinta del fallo de extrapolación de Ridge.

Los cinco permanecen visibles al comparar productos. Las diapositivas 22 y 23 presentan el MAE frente al último mes en los cinco y el caso intermitente de E. La 24 muestra cinco curvas de prueba final; la 29 compara los retiros registrados no servidos en la simulación.

Las notas están separadas del HTML de audiencia. Tener `GUION.md` y `MODELOS.md` en otro dispositivo o una copia impresa si se necesitan durante la exposición. No se añadió un control remoto ni un servidor de notas.

## Edición y reproducción

Desde `presentacion/`, con Node 22 o posterior y pnpm:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

La carpeta es un proyecto independiente y no cambia las dependencias de Python. No necesita `--ignore-workspace` en este repositorio.

```sh
pnpm test
pnpm lint
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

`pnpm test:e2e` recompila antes de probar. El resultado de producción es exclusivamente `dist/index.html`; `dist/` es generado y está ignorado por Git. Conservar `pnpm-lock.yaml` junto a las fuentes. Si el archivo no existe en otro checkout, compilarlo con los comandos anteriores.

### Archivos para editar

| Archivo | Función |
| --- | --- |
| `GUION.md` | Guion archivado de 32 entradas, conservado sin actualizar |
| `MODELOS.md` | Notas breves de los ocho pasos nuevos |
| `src/presentation.js` | Títulos, tiempos, pasos y navegación pura |
| `src/slides.jsx` | Composición de diapositivas y registro ordenado |
| `src/model-lessons.js` | Selección de modelos, pasos y cálculos de los ejemplos |
| `src/ModelLessons.jsx`, `src/ModelLessons.css` | Diagramas, controles y animaciones de la introducción |
| `src/Charts.jsx` | Gráficos en español |
| `src/analysis.js` | Fechas, series y selección de variantes archivadas compartidas por gráficos y pruebas |
| `src/business.js` | Nombres, precios netos, ritmos y formatos |
| `src/chart-colors.js` | Colores de trazos y calendario con contraste comprobado |
| `src/App.jsx`, `src/App.css` | Controles, escenario fijo y estilo |
| `evidence-loader.js` | Lectura de tablas públicas en compilación y huellas de procedencia |

Los gráficos y lecturas numéricas importan las tablas del proyecto durante la compilación. No hay solicitudes a datos durante la exposición. Las pruebas validan el registro, la navegación, los datos y los escenarios. Por indicación del usuario, `GUION.md` se conserva sin actualizar en esta revisión y puede diferir de los títulos y visuales actuales.

## Diseño y portabilidad

Escenario fijo de 1600×900 que mantiene proporciones en pantallas 16:9 y proyectores 4:3. TikTok Sans y Montserrat se incluyen dentro del HTML, con sus licencias SIL OFL 1.1 en metadatos legibles. Montserrat se usa exclusivamente en peso Thin (100) y mayúsculas. No hay enlaces a fuentes remotas. Los íconos SVG están empaquetados.

Se conserva papel frío y tinta ciruela. La paleta indicada para A a E es `#ffd22b`, `#feb204`, `#ff8503`, `#d53600` y `#700e01`. Los distintivos de A, B y C usan letras oscuras; D y E, blancas. Rellenos y etiquetas mantienen esos colores. Las líneas de A, B y C usan tonos más profundos para tener contraste sin contorno oscuro. Los trazos tienen remates redondeados y las barras no llevan borde. La barra de navegación sigue redondeada y los selectores aparecen solo en Explorar.

La portada identifica los cinco productos por nombre, código y color, sin minigráficas comprimidas. Las gráficas de ventas y de prueba final se distribuyen en dos filas: A y B arriba; C, D y E abajo. Las ventas históricas comparten eje temporal y conservan escalas verticales propias. Los errores finales mantienen las fechas específicas de cada producto.

Las filas entran con un desfase de 45 ms. Los conectores se dibujan una vez; trazos y barras se revelan sin alterar sus datos. Un resaltado breve acompaña el cambio de seguridad. Son animaciones CSS finitas, sin dependencias nuevas ni avance automático. Se pueden pausar y repetir; movimiento reducido muestra toda la información sin animación. Repetir en Explorar conserva los controles seleccionados.

La identidad visual es editorial para este borrador, no una marca oficial de RUJAF. No se inventaron logotipos, autores, carreras o autoridades institucionales.

## Antes de compartir

El HTML contiene datos agregados de ventas e inventario, aunque no nombres de clientes ni documentos privados. Revisar autorización comercial antes de publicarlo. No distribuir `kardex_csv/` o `data/private/` con la presentación.

El prototipo no ha demostrado ahorros, servicio alcanzado ni una programación óptima de la fábrica. Los escenarios históricos no autorizan decisiones reales de producción.
