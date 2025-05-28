class TruthTableCalculator {
    constructor() {
        this.expression = '';  //Inicializa la propiedad expression como una cadena vacía. Esta almacenará la expresión lógica actual.
        this.screen = document.getElementById('screen'); // Obtiene una referencia al elemento HTML con id 'screen' (la pantalla de la calculadora) y la guarda en this.screen.
        this.truthTableContainer = document.getElementById('truthTable');  //Obtiene referencia al contenedor donde se mostrará la tabla de verdad.
        this.statementsInput = document.getElementById('statementsInput'); //Obtiene referencia al área de texto donde el usuario ingresa las afirmaciones.
        this.analyzeBtn = document.getElementById('analyzeBtn'); // Obtiene referencia al botón "Analizar Afirmaciones".
        this.variableMappingDiv = document.getElementById('variableMapping'); //Obtiene referencia al div donde se mostrará el mapeo de variables.
        this.logicalExpressionsDiv = document.getElementById('logicalExpressions'); //Obtiene referencia al div donde se mostrarán las expresiones lógicas convertidas.
        this.conclusionsDiv = document.getElementById('conclusions'); //Obtiene referencia al div donde se mostrarán las conclusiones del análisis.
        
        this.initializeButtons(); //Llama a los métodos para inicializar los botones de la calculadora y el analizador de afirmaciones.
        this.initializeAnalyzer(); //Llama a los métodos para inicializar el analizador de afirmaciones.
    }
    //Inicialización de Botones
    initializeButtons() {  //Inicializa la propiedad expression como una cadena vacía. Esta almacenará la expresión lógica actual.
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {  //Para cada botón, agrega un event listener que ejecuta handleButton con el texto del botón cuando se hace clic.
            button.addEventListener('click', () => this.handleButton(button.textContent)); 
        });
    }
    //Inicialización del Analizador 
    initializeAnalyzer() { //Agrega un event listener al botón de análisis que ejecuta analyzeStatements() cuando se hace clic.
        this.analyzeBtn.addEventListener('click', () => this.analyzeStatements()); 
    }

    //Manejo de Botones

    handleButton(value) { //Método(funcion) que maneja los clics en botones según su texto:
        switch(value) {
            case 'AC': //'AC': limpia todo
                this.clear();
                break;
            case 'DEL': //'DEL': borra el último carácter
                this.delete();
                break;
            case '=': //'=': genera la tabla de verdad
                this.generateTruthTable();
                break;
            default:
                this.addToExpression(value);
        }
    }
    //Métodos(funciones) de Manipulación de Expresiones 

    clear() {  //Limpia la expresión actual, actualiza la pantalla y borra la tabla de verdad.
        this.expression = '';
        this.updateDisplay();
        this.truthTableContainer.innerHTML = '';
    }

    delete() { // Elimina el último carácter de la expresión usando slice(0, -1).
        this.expression = this.expression.slice(0, -1);
        this.updateDisplay();
    }

    addToExpression(value) { //Añade un valor al final de la expresión actual.
        this.expression += value;
        this.updateDisplay();
    }

    updateDisplay() { //Actualiza el contenido de la pantalla. Si no hay expresión, muestra un ejemplo.
        this.screen.textContent = this.expression || 'Ejemplo: ~(p∧q)→s';
    }

    //Evaluación de Expresiones Lógicas

    evaluateExpression(values) { //Reemplaza las variables (p, q, r, s) con sus valores booleanos correspondientes.
        const exp = this.expression.replace(/p|q|r|s/g, match => values[match]);
        
        const evaluate = (expr) => { //Define una función interna recursiva para evaluar expresiones y elimina espacios.
            expr = expr.trim();
            
            if (expr.startsWith('~')) { //Si la expresión empieza con '~' (negación), retorna la negación de evaluar el resto.
                return !evaluate(expr.slice(1));
            }

            while (expr.includes('(')) { //Evalúa recursivamente el contenido de los paréntesis más internos hasta que no queden paréntesis.
                expr = expr.replace(/\(([^()]+)\)/g, (_, group) => evaluate(group));
            }

            if (expr.includes('∧')) { //Si hay conjunción (∧), divide la expresión y retorna el AND lógico de ambas partes.
                const [left, right] = expr.split('∧');
                return evaluate(left) && evaluate(right);
            }
            if (expr.includes('∨')) { // Si hay disyunción (∨), retorna el OR lógico.
                const [left, right] = expr.split('∨');
                return evaluate(left) || evaluate(right);
            }
            if (expr.includes('→')) { //Si hay implicación (→), usa la fórmula: ¬p ∨ q (equivalente a p → q).
                const [left, right] = expr.split('→');
                return !evaluate(left) || evaluate(right);
            }
            if (expr.includes('↔')) { //Si hay bicondicional (↔), retorna true si ambos lados tienen el mismo valor.
                const [left, right] = expr.split('↔');
                return evaluate(left) === evaluate(right);
            }
            if (expr.includes('⊕')) { // Si hay XOR (⊕), retorna true si los valores son diferentes.
                const [left, right] = expr.split('⊕');
                return evaluate(left) !== evaluate(right);
            }

            return expr === 'true'; // Si no hay operadores, compara si la expresión es literalmente 'true
        };

        try {
            return evaluate(exp);
        } catch (error) {
            return null;
        }
    }

    //Generación de Tablas de Verdad

    generateTruthTable() { 
        if (!this.expression) return; //Extrae variables únicas de la expresión usando regex y las ordena. Si no hay variables, termina.

        const variables = [...new Set(this.expression.match(/[pqrs]/g) || [])].sort();
        if (variables.length === 0) return;

        const rows = []; //Inicializa array para filas y calcula número de combinaciones usando bit shifting (2^n).
        const combinations = 1 << variables.length;

        for (let i = 0; i < combinations; i++) { //Para cada combinación, crea un objeto con valores booleanos usando operaciones bit a bit.
            const values = {};
            variables.forEach((variable, index) => {
                values[variable] = Boolean(i & (1 << (variables.length - 1 - index)));
            });
            
            const result = this.evaluateExpression(values); //Evalúa la expresión con estos valores y añade el resultado si es válido.
            if (result !== null) {
                rows.push({ values, result });
            }
        }

        this.renderTruthTable(variables, rows);
    }

    //Renderizado de Tabla 

    renderTruthTable(variables, rows) { //Construye el HTML de la tabla con headers para variables y la expresión.
        let html = `
            <table>
                <thead>
                    <tr>
                        ${variables.map(v => `<th>${v}</th>`).join('')}
                        <th>${this.expression}</th>
                    </tr>
                </thead>
                <tbody>
        `;

        rows.forEach(row => { //Para cada fila, añade celdas con valores V/F y clases CSS apropiadas.
            html += '<tr>';
            variables.forEach(variable => {
                const value = row.values[variable];
                html += `
                    <td class="${value ? 'true-value' : 'false-value'}">
                        ${value ? 'V' : 'F'}
                    </td>
                `;
            });
            html += `
                <td class="${row.result ? 'true-value' : 'false-value'}">
                    ${row.result ? 'V' : 'F'}
                </td>
            </tr>
            `;
        });

        html += '</tbody></table>';
        this.truthTableContainer.innerHTML = html;
    }

    // Nuevas funciones para el analizador de afirmaciones

    analyzeStatements() { //Obtiene las afirmaciones del textarea, las divide por líneas, las procesa y muestra los resultados.
        const statements = this.statementsInput.value.trim();
        if (!statements) return;

        const statementsList = statements.split('\n').filter(s => s.trim());
        const { variables, logicalExpressions } = this.parseStatements(statementsList);
        
        this.displayVariableMapping(variables);
        this.displayLogicalExpressions(logicalExpressions);
        this.analyzeLogicalExpressions(logicalExpressions, variables);
    }

    //Parseo de Afirmaciones

    parseStatements(statements) { //Define patrones regex para identificar proposiciones simples en español.
        // Primero identificamos todas las proposiciones simples
        const propositionPatterns = [
            /(?:soy|es|tengo|tiene|puedo|puede)\s+([a-zA-ZáéíóúñÑ\s]+)/gi,
            /([a-zA-ZáéíóúñÑ\s]+)\s+(?:es|son)/gi
        ];
        
        const allPropositions = new Set(); // Extrae todas las proposiciones únicas de las afirmaciones usando los patrones regex.
        
        statements.forEach(statement => {
            propositionPatterns.forEach(pattern => {
                const matches = statement.matchAll(pattern);
                for (const match of matches) {
                    allPropositions.add(match[1].trim().toLowerCase());
                }
            });
        });
        
       
        const variableLetters = ['p', 'q', 'r', 's', 't', 'u', 'v', 'w']; // Asignamos variables (p, q, r, s, etc.) a cada proposición
        const variables = {};
        let index = 0;
        
        allPropositions.forEach(proposition => {
            if (index < variableLetters.length) {
                variables[variableLetters[index]] = proposition;
                index++;
            }
        });
        
       
        const logicalExpressions = statements.map(statement => {  //Convierte cada afirmación reemplazando proposiciones con variables lógicas.
            // Convertir a minúsculas para facilitar el procesamiento
            let processed = statement.toLowerCase();
            
            // Reemplazar proposiciones con variables
            Object.entries(variables).forEach(([variable, proposition]) => {
                const regex = new RegExp(proposition.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
                processed = processed.replace(regex, variable);
            });
            
            // Reemplaza conectores lógicos en español con símbolos lógicos.
            processed = processed.replace(/\bsi\s+(.*?)\s+entonces\s+(.*?)/g, '($1) → ($2)');
            processed = processed.replace(/\bno\s+([a-z])/g, '~$1');
            processed = processed.replace(/\by\b/g, '∧');
            processed = processed.replace(/\bo\b/g, '∨');
            processed = processed.replace(/\bpero\b/g, '∧');
            processed = processed.replace(/\bsi y solo si\b/g, '↔');
            
            // Eliminar palabras irrelevantes
            processed = processed.replace(/\b(el|la|los|las|un|una|unos|unas)\b/g, '');
            processed = processed.replace(/\s+/g, ' ').trim();
            
            return {
                original: statement,
                logical: processed
            };
        });
        
        return { variables, logicalExpressions };
    }

    //Métodos de Visualización

    //Los métodos displayVariableMapping, displayLogicalExpressions y analyzeLogicalExpressions construyen HTML dinámicamente para mostrar:
        //El mapeo de variables a proposiciones
        //Las expresiones lógicas convertidas
        //El análisis de cada expresión (tautología, contradicción o contingencia)

    displayVariableMapping(variables) {
        let html = '<h3>Variables Proposicionales</h3>';
        html += '<div class="variables-list">';
        
        Object.entries(variables).forEach(([variable, proposition]) => {
            html += `<div class="variable-item"><strong>${variable}:</strong> ${proposition}</div>`;
        });
        
        html += '</div>';
        this.variableMappingDiv.innerHTML = html;
    }

    displayLogicalExpressions(logicalExpressions) {
        let html = '<h3>Expresiones Lógicas</h3>';
        
        logicalExpressions.forEach((expr, index) => {
            html += `
                <div class="logical-expression">
                    <p><strong>Afirmación ${index + 1}:</strong> ${expr.original}</p>
                    <p><strong>Expresión lógica:</strong> ${expr.logical}</p>
                </div>
            `;
        });
        
        this.logicalExpressionsDiv.innerHTML = html;
    }

    analyzeLogicalExpressions(logicalExpressions, variables) {
        let html = '<h3>Análisis y Conclusiones</h3>';
        
        logicalExpressions.forEach((expr, index) => {
            this.expression = expr.logical;
            const variablesInExpr = [...new Set(expr.logical.match(/[pqrstuvw]/g) || [])].sort();
            
            if (variablesInExpr.length === 0) {
                html += `
                    <div class="conclusion-item">
                        <p><strong>Afirmación ${index + 1}:</strong> No se detectaron variables proposicionales válidas.</p>
                    </div>
                `;
                return;
            }
            
            const rows = [];
            const combinations = 1 << variablesInExpr.length;

            for (let i = 0; i < combinations; i++) {
                const values = {};
                variablesInExpr.forEach((variable, idx) => {
                    values[variable] = Boolean(i & (1 << (variablesInExpr.length - 1 - idx)));
                });
                
                const result = this.evaluateExpression(values);
                if (result !== null) {
                    rows.push({ values, result });
                }
            }
            
            // Determinar si es tautología, contradicción o contingencia
            let conclusion = '';
            const allTrue = rows.every(row => row.result);
            const allFalse = rows.every(row => !row.result);
            
            if (allTrue) {
                conclusion = 'La afirmación es una <strong>tautología</strong> (siempre verdadera).';
            } else if (allFalse) {
                conclusion = 'La afirmación es una <strong>contradicción</strong> (siempre falsa).';
            } else {
                const trueCount = rows.filter(row => row.result).length;
                const falseCount = rows.length - trueCount;
                conclusion = `La afirmación es <strong>contingente</strong> (${trueCount} casos verdaderos y ${falseCount} casos falsos).`;
            }
            
            html += `
                <div class="conclusion-item">
                    <p><strong>Afirmación ${index + 1}:</strong> ${expr.original}</p>
                    <p><strong>Expresión lógica:</strong> ${expr.logical}</p>
                    <p><strong>Conclusión:</strong> ${conclusion}</p>
                    <button class="btn-show-table" data-expr="${expr.logical}">Mostrar tabla de verdad</button>
                </div>
            `;
        });
        
        this.conclusionsDiv.innerHTML = html;
        
        // Agregar event listeners a los botones de mostrar tabla
        document.querySelectorAll('.btn-show-table').forEach(button => {
            button.addEventListener('click', () => {
                this.expression = button.getAttribute('data-expr');
                this.screen.textContent = this.expression;
                this.generateTruthTable();
                
                // Desplazarse a la tabla de verdad
                this.truthTableContainer.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }
}

//  Espera a que el DOM esté completamente cargado antes de crear una instancia de la calculadora.
document.addEventListener('DOMContentLoaded', () => {
    new TruthTableCalculator();
});

