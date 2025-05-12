/**
 * Utils.js
 * Funções utilitárias para o sistema
 */

const Utils = {
    /**
     * Verifica se a aplicação expirou
     * @returns {boolean} True se a aplicação expirou
     */
    checkExpiration: function() {
        // Data de expiração: 31/12/2024
        const expirationDate = new Date('2025-05-02'); //ANO - MES - DIA
        const currentDate = new Date();
        
        if (currentDate > expirationDate) {
            // Remove todos os elementos do body
            document.body.innerHTML = '';
            
            // Cria e estiliza a mensagem de expiração
            const message = document.createElement('div');
            message.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                font-family: Arial, sans-serif;
                color: #333;
                background: #fff;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            `;
            
            message.innerHTML = `
                <h1 style="color: #dc3545; margin-bottom: 10px;">Licença Expirada</h1>
                <p style="margin-bottom: 20px;">A licença deste software expirou em 31/12/2024.</p>
                <p>Entre em contato com o desenvolvedor para renovar sua licença.</p>
            `;
            
            document.body.appendChild(message);
            return true;
        }
        return false;
    },
    
    /**
     * Formata data no padrão brasileiro (DD/MM/AAAA)
     * @param {string} dateString - String de data no formato AAAA-MM-DD
     * @returns {string} Data formatada
     */
    formatDate: function(dateString) {
        if (!dateString) return '';
        
        // Cria a data a partir dos componentes para evitar problemas de timezone
        const [year, month, day] = dateString.split('-').map(num => parseInt(num));
        
        // Formata no padrão brasileiro
        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    },
    
    /**
     * Converte data do formato brasileiro (DD/MM/AAAA) para o formato ISO (AAAA-MM-DD)
     * @param {string} dateString - String de data no formato DD/MM/AAAA
     * @returns {string} Data no formato AAAA-MM-DD
     */
    parseDate: function(dateString) {
        if (!dateString) return '';
        
        const parts = dateString.split('/');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    },
    
    /**
     * Formata um valor monetário no padrão brasileiro
     * @param {number} value - Valor numérico
     * @returns {string} Valor formatado (ex: R$ 1.234,56)
     */
    formatCurrency: function(value) {
        if (value === undefined || value === null) return 'R$ 0,00';
        
        // Converte para número e formata com 2 casas decimais
        const number = parseFloat(value);
        const formatted = number.toFixed(2);
        
        // Separa parte inteira e decimal
        const [intPart, decPart] = formatted.split('.');
        
        // Adiciona separador de milhar
        const intPartFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        
        // Retorna no formato brasileiro
        return `R$ ${intPartFormatted},${decPart}`;
    },
    
    /**
     * Retorna a data atual no formato YYYY-MM-DD
     * @returns {string} Data atual formatada
     */
    getCurrentDate: function() {
        const date = new Date();
        
        // Corrigindo o problema de timezone que estava fazendo a data voltar um dia
        // due to local timezone conversion
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    },
    
    /**
     * Formata um status para exibição
     * @param {string} status - Status a ser formatado
     * @returns {string} Status formatado
     */
    formatStatus: function(status) {
        const statusMap = {
            'aberto': 'Aberto',
            'concluido': 'Concluído',
            'cancelado': 'Cancelado'
        };
        
        return statusMap[status] || status;
    },
    
    /**
     * Formata categoria para exibição amigável
     * @param {string} categoria - Categoria da peça
     * @returns {string} Texto formatado
     */
    formatCategoria: function(categoria) {
        const categoriaMap = {
            'maquina_lavar': 'Máquina de Lavar',
            'lava_loucas': 'Lava Louças',
            'geladeira': 'Geladeira',
            'micro_ondas': 'Micro-ondas',
            'outros': 'Outros'
        };
        
        return categoriaMap[categoria] || categoria;
    },
    
    /**
     * Cria um botão HTML
     * @param {string} text - Texto do botão
     * @param {string} classes - Classes CSS
     * @param {Function} onClick - Função de clique
     * @returns {HTMLElement} Elemento do botão
     */
    createButton: function(text, classes, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = classes;
        
        if (onClick) {
            button.addEventListener('click', onClick);
        }
        
        return button;
    },
    
    /**
     * Abre um modal
     * @param {string} modalId - ID do modal
     */
    openModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    },
    
    /**
     * Fecha um modal
     * @param {string} modalId - ID do modal
     */
    closeModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    /**
     * Mostra mensagem de alerta
     * @param {string} message - Mensagem a ser exibida
     * @param {string} type - Tipo de alerta (success, error, warning)
     */
    showAlert: function(message, type = 'info') {
        alert(message);
    },
    
    /**
     * Confirma uma ação com o usuário
     * @param {string} message - Mensagem de confirmação
     * @returns {boolean} True se confirmado
     */
    confirm: function(message) {
        return confirm(message);
    },
    
    /**
     * Limpa os campos de um formulário
     * @param {string} formId - ID do formulário
     */
    clearForm: function(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            
            // Limpa também os campos hidden
            const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
            hiddenInputs.forEach(input => {
                input.value = '';
            });
        }
    },
    
    /**
     * Filtra uma lista com base em um termo de busca
     * @param {Array} list - Lista a ser filtrada
     * @param {string} searchTerm - Termo de busca
     * @param {Array} fields - Campos a serem considerados na busca
     * @returns {Array} Lista filtrada
     */
    filterList: function(list, searchTerm, fields) {
        if (!searchTerm || searchTerm.trim() === '') {
            return list;
        }
        
        searchTerm = searchTerm.toLowerCase();
        
        return list.filter(item => {
            return fields.some(field => {
                const value = item[field];
                if (value === null || value === undefined) {
                    return false;
                }
                return value.toString().toLowerCase().includes(searchTerm);
            });
        });
    },
    
    /**
     * Gera uma cor aleatória em hexadecimal
     * @returns {string} Cor hexadecimal
     */
    getRandomColor: function() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        
        return color;
    },
    
    /**
     * Adiciona dias a uma data no formato YYYY-MM-DD
     * @param {string} dateStr - Data base em formato YYYY-MM-DD
     * @param {number} days - Número de dias a adicionar (pode ser negativo)
     * @returns {string} Nova data em formato YYYY-MM-DD
     */
    addDays: function(dateStr, days) {
        // Certifica que a data é criada corretamente
        const [year, month, day] = dateStr.split('-').map(num => parseInt(num));
        const date = new Date(year, month - 1, day);
        
        date.setDate(date.getDate() + days);
        
        return this.formatDateForInput(date);
    },
    
    /**
     * Calcula a diferença em dias entre duas datas
     * @param {string} date1 - Primeira data (AAAA-MM-DD)
     * @param {string} date2 - Segunda data (AAAA-MM-DD)
     * @returns {number} Diferença em dias
     */
    daysDiff: function(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        
        // Diferença em milissegundos
        const diffTime = Math.abs(d2 - d1);
        
        // Diferença em dias
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    
    /**
     * Formata uma data para o formato de entrada de input (YYYY-MM-DD)
     * @param {Date} date - Objeto Date
     * @returns {string} Data formatada
     */
    formatDateForInput: function(date) {
        // Certifica que estamos usando a data correta
        const localDate = new Date(date.getTime());
        
        const year = localDate.getFullYear();
        const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
        const day = localDate.getDate().toString().padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    },
    
    /**
     * Converte uma string de data para um objeto Date, tratando problemas de timezone
     * @param {string} dateStr - Data no formato YYYY-MM-DD
     * @returns {Date} Objeto Date correspondente
     */
    parseDate: function(dateStr) {
        if (!dateStr) return new Date();
        
        // Cria o objeto Date com a data especificada (sem alterações de fuso)
        const [year, month, day] = dateStr.split('-').map(num => parseInt(num));
        return new Date(year, month - 1, day);
    }
}; 