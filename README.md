Documentación del Analizador de Afirmaciones Lógicas

Descripción General

Esta aplicación web permite trabajar con lógica proposicional de dos formas:
1. Calculadora de Tablas de Verdad: Evalúa expresiones lógicas ingresadas manualmente y genera su tabla de verdad.

2. Analizador de Afirmaciones: Convierte afirmaciones en lenguaje natural a expresiones lógicas formales, las analiza, y determina si son tautologías, contradicciones o contingencias.

Estructura de Archivos

- index.html: Contiene la estructura HTML de la calculadora y el analizador.
- main.css: Define los estilos visuales 
- main.js: Implementa toda la lógica de la aplicación mediante la clase TruthTableCalculator.


Componentes Principales

 1. Calculadora de Tablas de Verdad
  - Interfaz:
  - Botones para variables (`p`, `q`, `r`, `s`) y operadores lógicos (`~`, `∧`, `∨`, `→`, `↔`, `⊕`).
  - Botones `AC` (limpiar), `DEL` (borrar último carácter) y `=` (generar tabla).
  - Pantalla que muestra la expresión ingresada.

- Funcionamiento:
  - Al presionar `=`, se generan todas las combinaciones posibles de valores booleanos para las variables presentes.
  - Evalúa la expresión para cada combinación y muestra los resultados en una tabla.
  - Resalta valores verdaderos (`V`) en verde y falsos (`F`) en rojo.

 2. Analizador de Afirmaciones
   - Interfaz:
  - Área de texto para ingresar afirmaciones (ej: "Si soy ecológico y comprendo       Matemáticas entonces soy un gigante").
  - Botón  "Analizar Afirmaciones" para procesar el texto.

- Funcionamiento:
  1. Extracción de Proposiciones:
     - Identifica proposiciones simples usando patrones (ej: frases después de "si", "tengo", "es").
     - Asigna variables (`p`, `q`, `r`, etc.) a cada proposición.

  2. Conversión a Lógica Formal:
     - Reemplaza conectores naturales por operadores lógicos (ej: "y" → `∧`, "si...entonces"* → `→`).
  3. Análisis Lógico:
     - Para cada afirmación, determina si es una tautología (siempre verdadera), contradicción (siempre falsa) o contingencia (depende de los valores).
     - Permite generar tablas de verdad individuales para cada afirmación.

---

Tecnologías y Métodos Clave

HTML/CSS
- Diseño responsive usando `grid` y `flexbox`.
- Efectos visuales como sombras (`box-shadow`), transiciones suaves (`transition`), y escalado en hover (`transform: scale`).

JavaScript
- Clase `TruthTableCalculator`:
  - **Manejo de Eventos**: Inicializa listeners para botones y el área de texto.
  - **Evaluación de Expresiones**:
    - Sustituye variables por valores booleanos.
    - Procesa operadores lógicos y paréntesis recursivamente.
  - **Generación de Tablas de Verdad**:
    - Calcula todas las combinaciones de variables usando desplazamiento de bits (`1 << n`).
  - **Procesamiento de Lenguaje Natural**:
    - Usa expresiones regulares para detectar proposiciones y conectores.
    - Limita las variables a `p, q, r, s, t, u, v, w`.


 Ejemplo de Uso
1. Calculadora:
   - Ingresar `~(p ∧ q) → s` y presionar `=`.
   - La tabla mostrará 8 combinaciones (para `p`, `q`, `s`) y el resultado de la expresión.

2. Analizador:
   - Ingresar:
     —---------------------------------------------------
     Si soy rápido entonces gano la carrera
     No soy rápido y gano la carrera
     —-------------------------------------------
   - El sistema asignará:
     - `p: soy rápido`
     - `q: gano la carrera`
   - Convertirá las afirmaciones a:
     - `p → q`
     - `~p ∧ q`
