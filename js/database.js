/**
 * Database.js
 * Módulo responsável pelo armazenamento e gerenciamento de dados usando localStorage
 */

const DB = {
    // Chaves para o localStorage
    KEYS: {
        SERVICOS: 'tech_repair_servicos',
        PECAS: 'tech_repair_pecas',
        VENDAS_PECAS: 'tech_repair_vendas_pecas',
        NEXT_ID: 'tech_repair_next_id'
    },

    /**
     * Inicializa o banco de dados no localStorage se não existir
     */
    init: function() {
        // Verifica se já existe dados no localStorage, senão inicializa com arrays vazios
        if (!localStorage.getItem(this.KEYS.SERVICOS)) {
            localStorage.setItem(this.KEYS.SERVICOS, JSON.stringify([]));
        }
        
        if (!localStorage.getItem(this.KEYS.PECAS)) {
            localStorage.setItem(this.KEYS.PECAS, JSON.stringify([]));
        }
        
        if (!localStorage.getItem(this.KEYS.VENDAS_PECAS)) {
            localStorage.setItem(this.KEYS.VENDAS_PECAS, JSON.stringify([]));
        }
        
        // Inicializa o contador de IDs se não existir
        if (!localStorage.getItem(this.KEYS.NEXT_ID)) {
            localStorage.setItem(this.KEYS.NEXT_ID, JSON.stringify({
                servico: 1,
                venda: 1
            }));
        }
    },

    /**
     * Obtém o próximo ID disponível para uma entidade
     * @param {string} entity - Nome da entidade (servico, venda)
     * @returns {number} Próximo ID
     */
    getNextId: function(entity) {
        const nextIdObj = JSON.parse(localStorage.getItem(this.KEYS.NEXT_ID));
        const currentId = nextIdObj[entity];
        
        // Incrementa o ID para o próximo uso
        nextIdObj[entity] = currentId + 1;
        localStorage.setItem(this.KEYS.NEXT_ID, JSON.stringify(nextIdObj));
        
        return currentId;
    },

    /**
     * SERVIÇOS
     */
    
    /**
     * Obtém todos os serviços
     * @returns {Array} Lista de serviços
     */
    getServicos: function() {
        return JSON.parse(localStorage.getItem(this.KEYS.SERVICOS));
    },
    
    /**
     * Adiciona um novo serviço
     * @param {Object} servico - Dados do serviço
     * @returns {Object} Serviço com ID gerado
     */
    addServico: function(servico) {
        const servicos = this.getServicos();
        
        // Atribui um ID ao novo serviço
        servico.id = this.getNextId('servico');
        
        // Adiciona o serviço à lista
        servicos.push(servico);
        
        // Salva no localStorage
        localStorage.setItem(this.KEYS.SERVICOS, JSON.stringify(servicos));
        
        return servico;
    },
    
    /**
     * Atualiza um serviço existente
     * @param {Object} servico - Dados do serviço com ID
     * @returns {boolean} True se atualizado com sucesso
     */
    updateServico: function(servico) {
        const servicos = this.getServicos();
        const index = servicos.findIndex(s => s.id === servico.id);
        
        if (index !== -1) {
            servicos[index] = servico;
            localStorage.setItem(this.KEYS.SERVICOS, JSON.stringify(servicos));
            return true;
        }
        
        return false;
    },
    
    /**
     * Remove um serviço pelo ID
     * @param {number} id - ID do serviço
     * @returns {boolean} True se removido com sucesso
     */
    deleteServico: function(id) {
        const servicos = this.getServicos();
        const index = servicos.findIndex(s => s.id === id);
        
        if (index !== -1) {
            servicos.splice(index, 1);
            localStorage.setItem(this.KEYS.SERVICOS, JSON.stringify(servicos));
            return true;
        }
        
        return false;
    },
    
    /**
     * Busca um serviço pelo ID
     * @param {number} id - ID do serviço
     * @returns {Object|null} Serviço encontrado ou null
     */
    getServicoById: function(id) {
        const servicos = this.getServicos();
        return servicos.find(s => s.id === id) || null;
    },
    
    /**
     * Obtém serviços filtrados por status
     * @param {string} status - Status do serviço
     * @returns {Array} Lista de serviços filtrados
     */
    getServicosByStatus: function(status) {
        const servicos = this.getServicos();
        
        if (status === 'todos') {
            return servicos;
        }
        
        return servicos.filter(s => s.status === status);
    },

    /**
     * PEÇAS
     */
    
    /**
     * Obtém todas as peças
     * @returns {Array} Lista de peças
     */
    getPecas: function() {
        return JSON.parse(localStorage.getItem(this.KEYS.PECAS));
    },
    
    /**
     * Adiciona uma nova peça
     * @param {Object} peca - Dados da peça
     * @returns {Object} Peça adicionada
     */
    addPeca: function(peca) {
        const pecas = this.getPecas();
        
        // Verifica se o código já existe
        const existingPeca = pecas.find(p => p.codigo === peca.codigo);
        if (existingPeca) {
            return null; // Código já existe
        }
        
        // Adiciona status (disponível por padrão)
        if (!peca.status) {
            peca.status = 'disponivel';
        }
        
        // Adiciona a peça à lista
        pecas.push(peca);
        
        // Salva no localStorage
        localStorage.setItem(this.KEYS.PECAS, JSON.stringify(pecas));
        
        return peca;
    },
    
    /**
     * Atualiza uma peça existente
     * @param {Object} peca - Dados da peça
     * @returns {boolean} True se atualizada com sucesso
     */
    updatePeca: function(peca) {
        const pecas = this.getPecas();
        const index = pecas.findIndex(p => p.codigo === peca.codigo);
        
        if (index !== -1) {
            pecas[index] = peca;
            localStorage.setItem(this.KEYS.PECAS, JSON.stringify(pecas));
            return true;
        }
        
        return false;
    },
    
    /**
     * Remove uma peça pelo código
     * @param {string} codigo - Código da peça
     * @returns {boolean} True se removida com sucesso
     */
    deletePeca: function(codigo) {
        const pecas = this.getPecas();
        const index = pecas.findIndex(p => p.codigo === codigo);
        
        if (index !== -1) {
            pecas.splice(index, 1);
            localStorage.setItem(this.KEYS.PECAS, JSON.stringify(pecas));
            return true;
        }
        
        return false;
    },
    
    /**
     * Busca uma peça pelo código
     * @param {string} codigo - Código da peça
     * @returns {Object|null} Peça encontrada ou null
     */
    getPecaByCodigo: function(codigo) {
        const pecas = this.getPecas();
        return pecas.find(p => p.codigo === codigo) || null;
    },
    
    /**
     * Obtém peças filtradas por categoria
     * @param {string} categoria - Categoria da peça
     * @returns {Array} Lista de peças filtradas
     */
    getPecasByCategoria: function(categoria) {
        const pecas = this.getPecas();
        
        if (categoria === 'todas') {
            return pecas;
        }
        
        return pecas.filter(p => p.categoria === categoria);
    },

    /**
     * Registra uma venda de peça
     * @param {Object} vendaData - Dados da venda
     * @returns {Object|null} Venda registrada ou null em caso de erro
     */
    registrarVendaPeca: function(vendaData) {
        // Verifica se a peça existe e tem quantidade suficiente
        const peca = this.getPecaByCodigo(vendaData.codigoPeca);
        
        if (!peca) {
            return null;
        }
        
        if (parseInt(peca.quantidade) < parseInt(vendaData.quantidade)) {
            return null;
        }
        
        // Obtém próximo ID para a venda
        const nextId = this.getNextId('venda');
        
        // Cria o objeto da venda
        const venda = {
            id: nextId,
            codigoPeca: vendaData.codigoPeca,
            quantidade: parseInt(vendaData.quantidade),
            precoVenda: parseFloat(vendaData.precoVenda),
            data: vendaData.data || Utils.getCurrentDate()
        };
        
        // Atualiza o estoque da peça
        peca.quantidade -= venda.quantidade;
        
        // Se a quantidade chegar a zero, marca como esgotada
        if (peca.quantidade === 0) {
            peca.status = 'esgotada';
        }
        
        // Atualiza a peça no localStorage
        const pecas = this.getPecas();
        const index = pecas.findIndex(p => p.codigo === venda.codigoPeca);
        pecas[index] = peca;
        localStorage.setItem(this.KEYS.PECAS, JSON.stringify(pecas));
        
        // Adiciona a venda à lista de vendas
        const vendas = this.getVendasPecas();
        vendas.push(venda);
        localStorage.setItem(this.KEYS.VENDAS_PECAS, JSON.stringify(vendas));
        
        return venda;
    },
    
    /**
     * Obtém todas as vendas de peças cadastradas
     * @returns {Array} Lista de vendas de peças
     */
    getVendasPecas: function() {
        return JSON.parse(localStorage.getItem(this.KEYS.VENDAS_PECAS) || '[]');
    },
    
    /**
     * Busca uma venda pelo ID
     * @param {number} id - ID da venda
     * @returns {Object|null} Venda encontrada ou null
     */
    getVendaById: function(id) {
        const vendas = this.getVendasPecas();
        return vendas.find(v => v.id === id) || null;
    },
    
    /**
     * Remove uma venda pelo ID
     * @param {number} id - ID da venda
     * @returns {boolean} True se removida com sucesso
     */
    deleteVenda: function(id) {
        const vendas = this.getVendasPecas();
        const index = vendas.findIndex(v => v.id === id);
        
        if (index === -1) {
            return false; // Venda não encontrada
        }
        
        // Remove a venda
        vendas.splice(index, 1);
        localStorage.setItem(this.KEYS.VENDAS_PECAS, JSON.stringify(vendas));
        
        return true;
    },

    /**
     * CONFIGURAÇÕES
     */
    
    /**
     * Exporta todos os dados do banco de dados para um objeto JSON
     * @returns {Object} Dados completos do banco de dados
     */
    exportAllData: function() {
        return {
            servicos: JSON.parse(localStorage.getItem(this.KEYS.SERVICOS) || '[]'),
            pecas: JSON.parse(localStorage.getItem(this.KEYS.PECAS) || '[]'),
            vendas_pecas: JSON.parse(localStorage.getItem(this.KEYS.VENDAS_PECAS) || '[]'),
            next_id: JSON.parse(localStorage.getItem(this.KEYS.NEXT_ID) || '{"servico":1,"venda":1}')
        };
    },
    
    /**
     * Importa dados completos para o banco de dados, substituindo todos os dados existentes
     * @param {Object} data - Dados completos a serem importados
     * @returns {boolean} True se importado com sucesso
     */
    importAllData: function(data) {
        try {
            if (!data.servicos || !data.pecas || !data.vendas_pecas || !data.next_id) {
                return false; // Dados inválidos ou incompletos
            }
            
            // Substitui todos os dados no localStorage
            localStorage.setItem(this.KEYS.SERVICOS, JSON.stringify(data.servicos));
            localStorage.setItem(this.KEYS.PECAS, JSON.stringify(data.pecas));
            localStorage.setItem(this.KEYS.VENDAS_PECAS, JSON.stringify(data.vendas_pecas));
            localStorage.setItem(this.KEYS.NEXT_ID, JSON.stringify(data.next_id));
            
            return true;
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            return false;
        }
    },
    
    /**
     * Limpa todos os dados do banco de dados, resetando para o estado inicial
     * @returns {boolean} True se limpeza for bem-sucedida
     */
    clearAllData: function() {
        try {
            // Remove todos os dados
            localStorage.removeItem(this.KEYS.SERVICOS);
            localStorage.removeItem(this.KEYS.PECAS);
            localStorage.removeItem(this.KEYS.VENDAS_PECAS);
            localStorage.removeItem(this.KEYS.NEXT_ID);
            
            // Reinicializa o banco de dados
            this.init();
            
            return true;
        } catch (error) {
            console.error('Erro ao limpar dados:', error);
            return false;
        }
    }
};

// Inicializa o banco de dados ao carregar o script
DB.init(); 