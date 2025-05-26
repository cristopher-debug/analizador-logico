class TruthTableCalculator {
    constructor() {
        this.expression = '';
        this.screen = document.getElementById('screen');
        this.truthTableContainer = document.getElementById('truthTable');
        this.statementsInput = document.getElementById('statementsInput');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.variableMappingDiv = document.getElementById('variableMapping');
        this.logicalExpressionsDiv = document.getElementById('logicalExpressions');
        this.conclusionsDiv = document.getElementById('conclusions');
        
        this.initializeButtons();
        this.initializeAnalyzer();
    }

    initializeButtons() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('click', () => this.handleButton(button.textContent));
        });
    }

    initializeAnalyzer() {
        this.analyzeBtn.addEventListener('click', () => this.analyzeStatements());
    }

    handleButton(value) {
        switch(value) {
            case 'AC':
                this.clear();
                break;
            case 'DEL':
                this.delete();
                break;
            case '=':
                this.generateTruthTable();
                break;
            default:
                this.addToExpression(value);
        }
    }

    clear() {
        this.expression = '';
        this.updateDisplay();
        this.truthTableContainer.innerHTML = '';
    }

    delete() {
        this.expression = this.expression.slice(0, -1);
        this.updateDisplay();
    }

    addToExpression(value) {
        this.expression += value;
        this.updateDisplay();
    }

    updateDisplay() {
        this.screen.textContent = this.expression || 'Ejemplo: ~(p∧q)→s';
    }

    evaluateExpression(values) {
        const exp = this.expression.replace(/p|q|r|s/g, match => values[match]);
        
        const evaluate = (expr) => {
            expr = expr.trim();
            
            if (expr.startsWith('~')) {
                return !evaluate(expr.slice(1));
            }

            while (expr.includes('(')) {
                expr = expr.replace(/\(([^()]+)\)/g, (_, group) => evaluate(group));
            }

            if (expr.includes('∧')) {
                const [left, right] = expr.split('∧');
                return evaluate(left) && evaluate(right);
            }
            if (expr.includes('∨')) {
                const [left, right] = expr.split('∨');
                return evaluate(left) || evaluate(right);
            }
            if (expr.includes('→')) {
                const [left, right] = expr.split('→');
                return !evaluate(left) || evaluate(right);
            }
            if (expr.includes('↔')) {
                const [left, right] = expr.split('↔');
                return evaluate(left) === evaluate(right);
            }
            if (expr.includes('⊕')) {
                const [left, right] = expr.split('⊕');
                return evaluate(left) !== evaluate(right);
            }

            return expr === 'true';
        };

        try {
            return evaluate(exp);
        } catch (error) {
            return null;
        }
    }

    generateTruthTable() {
        if (!this.expression) return;

        const variables = [...new Set(this.expression.match(/[pqrs]/g) || [])].sort();
        if (variables.length === 0) return;

        const rows = [];
        const combinations = 1 << variables.length;

        for (let i = 0; i < combinations; i++) {
            const values = {};
            variables.forEach((variable, index) => {
                values[variable] = Boolean(i & (1 << (variables.length - 1 - index)));
            });
            
            const result = this.evaluateExpression(values);
            if (result !== null) {
                rows.push({ values, result });
            }
        }

        this.renderTruthTable(variables, rows);
    }

    renderTruthTable(variables, rows) {
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

        rows.forEach(row => {
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
    analyzeStatements() {
        const statements = this.statementsInput.value.trim();
        if (!statements) return;

        const statementsList = statements.split('\n').filter(s => s.trim());
        const { variables, logicalExpressions } = this.parseStatements(statementsList);
        
        this.displayVariableMapping(variables);
        this.displayLogicalExpressions(logicalExpressions);
        this.analyzeLogicalExpressions(logicalExpressions, variables);
    }

    parseStatements(statements) {
        // Primero identificamos todas las proposiciones simples
        const propositionPatterns = [
            /(?:soy|es|tengo|tiene|puedo|puede)\s+([a-zA-ZáéíóúñÑ\s]+)/gi,
            /([a-zA-ZáéíóúñÑ\s]+)\s+(?:es|son)/gi
        ];
        
        const allPropositions = new Set();
        
        statements.forEach(statement => {
            propositionPatterns.forEach(pattern => {
                const matches = statement.matchAll(pattern);
                for (const match of matches) {
                    allPropositions.add(match[1].trim().toLowerCase());
                }
            });
        });
        
        // Asignamos variables (p, q, r, s, etc.) a cada proposición
        const variableLetters = ['p', 'q', 'r', 's', 't', 'u', 'v', 'w'];
        const variables = {};
        let index = 0;
        
        allPropositions.forEach(proposition => {
            if (index < variableLetters.length) {
                variables[variableLetters[index]] = proposition;
                index++;
            }
        });
        
        // Ahora convertimos cada afirmación a lógica
        const logicalExpressions = statements.map(statement => {
            // Convertir a minúsculas para facilitar el procesamiento
            let processed = statement.toLowerCase();
            
            // Reemplazar proposiciones con variables
            Object.entries(variables).forEach(([variable, proposition]) => {
                const regex = new RegExp(proposition.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
                processed = processed.replace(regex, variable);
            });
            
            // Reemplazar conectores naturales con operadores lógicos
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

// Inicializar la calculadora cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    new TruthTableCalculator();
});

