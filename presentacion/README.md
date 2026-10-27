# Presentación de RUJAF

Presentación completa en español sobre el proyecto universitario de pronóstico de ventas, inventario de producto terminado y escenarios preliminares de producción.

## Abrir la entrega

- **[Presentación lista para proyectar](dist/index.html)**. Abrir el archivo en un navegador. No necesita servidor ni internet después de compilarse.
- [Guion y notas del presentador](GUION.md). Incluye las 26 diapositivas, con títulos y tiempos sincronizados.
- [Apoyo para explicar los modelos](MODELOS.md). Cinco pasos en las diapositivas 13 y 14.
- [Fuentes y límites de la evidencia](EVIDENCIA.md).
- [Comprobaciones y limitaciones de entrega](VALIDACION.md).

Son 26 diapositivas y 30 pasos. La duración orientativa suma 57:30 y puede acortarse hacia 45 minutos al abreviar los ejemplos. No es un tiempo medido en ensayo.

La narrativa sigue el problema de la empresa, la preparación de los datos, los modelos, sus resultados y la simulación de inventarios. Conserva las comparaciones de los cinco productos y utiliza A y B para explicar las variables y los métodos con ejemplos concretos.

El contenido usa los resultados ejecutados de `five_products_v1`, sin reentrenar modelos ni cambiar las métricas. Los detalles de procedencia, controles y métodos secundarios permanecen en la documentación técnica, fuera de las diapositivas y las notas de exposición.

## Presentar

| Control | Acción |
| --- | --- |
| Flechas, Espacio, Av Pág y Re Pág | Avanzar o retroceder un paso |
| Mayús + flecha | Saltar una diapositiva |
| Inicio y Fin | Ir al inicio o al cierre principal |
| F | Pantalla completa |
| R | Repetir las entradas visuales |
| ? o H | Abrir ayuda |

No hay avance automático. La posición queda en `#diapositiva/paso`, con índices desde cero. El visor sigue el guion y conserva otros parámetros de la URL.

Las diapositivas 13 y 14 explican repetir el último mes, promediar tres meses, regresión lineal y Ridge. Las referencias usan ventas reales de B. La recta es un ejemplo didáctico identificado como tal. Después se explican entrenamiento, validación temporal y MAE antes de mostrar la selección y la prueba final.

La diapositiva 15 ilustra los 50 meses de A: 24 de entrenamiento inicial, 20 de validación y 6 de prueba. La ventana de entrenamiento se amplía mes a mes.

La diapositiva 23 muestra la producción sugerida en un escenario histórico para cada producto. El cero de producción de A usa una previsión positiva, distinta del fallo de Ridge explicado antes.

Los resultados presentan el MAE frente a repetir el último mes, las curvas de prueba final y el caso de E, donde predecir cero deja sin anticipar ventas. La simulación muestra unidades que el inventario supuesto no pudo atender. No se presentan como ventas perdidas ni ahorros reales.

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
| `GUION.md` | Notas y tiempos de las 26 diapositivas |
| `MODELOS.md` | Apoyo breve para explicar los métodos principales |
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

Los gráficos y lecturas numéricas importan las tablas del proyecto durante la compilación. No hay solicitudes a datos durante la exposición. Las pruebas validan el registro, la navegación, la coincidencia de las notas, los datos y los escenarios.

## Diseño y portabilidad

Escenario fijo de 1600×900 que mantiene proporciones en pantallas 16:9 y proyectores 4:3. TikTok Sans y Montserrat se incluyen dentro del HTML, con sus licencias SIL OFL 1.1 en metadatos legibles. Montserrat se usa exclusivamente en peso Thin (100) y mayúsculas. No hay enlaces a fuentes remotas. Los íconos SVG están empaquetados.

Se conserva papel frío y tinta ciruela. La paleta indicada para A a E es `#ffd22b`, `#feb204`, `#ff8503`, `#d53600` y `#700e01`. Los distintivos de A, B y C usan letras oscuras; D y E, blancas. Rellenos y etiquetas mantienen esos colores. Las líneas de A, B y C usan tonos más profundos para tener contraste sin contorno oscuro. Los trazos tienen remates redondeados. La barra de navegación sigue redondeada.

La portada identifica los productos por nombre y color. La tabla de productos conserva sus fotos, sin precios ni especificaciones secundarias. Las gráficas de ventas y prueba final mantienen dos filas, con A y B arriba y C, D y E abajo. Las ventas históricas comparten eje temporal y conservan escalas verticales propias. La prueba final mantiene las fechas de cada producto.

Las entradas visuales son finitas y se pueden repetir. Movimiento reducido muestra toda la información sin animación. No se añadieron dependencias ni controles interactivos nuevos.

La identidad visual es editorial para este borrador, no una marca oficial de RUJAF. No se inventaron logotipos, autores, carreras o autoridades institucionales.

## Antes de compartir

El HTML contiene datos agregados de ventas e inventario, aunque no nombres de clientes ni documentos privados. Revisar autorización comercial antes de publicarlo. No distribuir `kardex_csv/` o `data/private/` con la presentación.

El prototipo no ha demostrado ahorros, servicio alcanzado ni una programación óptima de la fábrica. Los escenarios históricos no autorizan decisiones reales de producción.
