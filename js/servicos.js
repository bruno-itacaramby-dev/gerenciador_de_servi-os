/**
 * Servicos.js
 * Módulo responsável pelo gerenciamento de serviços
 */

const ServicosModule = {
    // Referências aos elementos do DOM
    elements: {
        servicosTable: document.getElementById('servicos-table'),
        btnNovoServico: document.getElementById('btn-novo-servico'),
        modalServico: document.getElementById('modal-servico'),
        formServico: document.getElementById('form-servico'),
        modalServicoTitle: document.getElementById('modal-servico-title'),
        servicoId: document.getElementById('servico-id'),
        servicoNomeCliente: document.getElementById('servico-cliente-nome'),
        servicoTelefoneCliente: document.getElementById('servico-cliente-telefone'),
        servicoAparelho: document.getElementById('servico-aparelho'),
        servicoProblema: document.getElementById('servico-problema'),
        servicoStatus: document.getElementById('servico-status'),
        servicoData: document.getElementById('servico-data'),
        servicoValor: document.getElementById('servico-valor'),
        btnCancelarServico: document.getElementById('btn-cancelar-servico'),
        searchService: document.getElementById('search-service'),
        filterStatus: document.getElementById('filter-status'),
        recentServicesTable: document.getElementById('recent-services-table')
    },

    // Estado da paginação
    pagination: {
        currentPage: 1,
        itemsPerPage: 25,
        totalPages: 1
    },

    /**
     * Inicializa o módulo de serviços
     */
    init: function() {
        // Verifica se todos os elementos foram encontrados
        for (const [key, element] of Object.entries(this.elements)) {
            if (!element) {
                console.error(`Elemento não encontrado: ${key}`);
            }
        }
        
        this.setupListeners();
        this.loadServicos();
        this.loadRecentServices();
        
        // Define a data atual no campo de data
        if (this.elements.servicoData) {
            this.elements.servicoData.value = Utils.getCurrentDate();
        }
    },

    /**
     * Configura os listeners de eventos
     */
    setupListeners: function() {
        const self = this;
        
        // Botão para abrir o formulário de novo serviço
        this.elements.btnNovoServico.addEventListener('click', () => {
            self.openServicoForm();
        });
        
        // Cancelar cadastro/edição de serviço
        this.elements.btnCancelarServico.addEventListener('click', () => {
            Utils.closeModal('modal-servico');
        });
        
        // Fechar modal ao clicar no X
        this.elements.modalServico.querySelector('.close-modal').addEventListener('click', () => {
            Utils.closeModal('modal-servico');
        });
        
        // Submissão do formulário de serviço
        this.elements.formServico.addEventListener('submit', function(e) {
            e.preventDefault();
            self.saveServico();
        });
        
        // Busca de serviços
        this.elements.searchService.addEventListener('input', function() {
            self.searchServicos();
        });
        
        // Filtro por status
        this.elements.filterStatus.addEventListener('change', function() {
            self.searchServicos();
        });
        
        // Adiciona formatação automática ao campo de valor
        if (this.elements.servicoValor) {
            let previousValue = '';
            let isTyping = false;

            this.elements.servicoValor.addEventListener('input', (e) => {
                if (!isTyping) return;
                
                // Remove todos os caracteres não numéricos
                let value = e.target.value.replace(/\D/g, '');
                
                // Se não houver valor, mostra 0
                if (!value) {
                    e.target.value = 'R$ 0,00';
                    return;
                }
                
                // Converte para número e formata
                value = (parseInt(value) / 100);
                e.target.value = Utils.formatCurrency(value);
            });

            // Ao focar, guarda o valor atual
            this.elements.servicoValor.addEventListener('focus', (e) => {
                previousValue = e.target.value;
                isTyping = false;
                
                // Adiciona evento para detectar primeira tecla
                const keydownHandler = (event) => {
                    // Se for tecla numérica ou backspace/delete
                    if (event.key.match(/[0-9]/) || event.key === 'Backspace' || event.key === 'Delete') {
                        if (!isTyping) {
                            e.target.value = 'R$ 0,00'; // Começa com zero
                            isTyping = true;
                        }
                    }
                    // Remove o handler após primeira tecla
                    e.target.removeEventListener('keydown', keydownHandler);
                };
                
                e.target.addEventListener('keydown', keydownHandler);
            });

            // Ao perder foco, reaplica formatação ou restaura valor anterior
            this.elements.servicoValor.addEventListener('blur', (e) => {
                if (!isTyping) {
                    e.target.value = previousValue;
                } else if (!e.target.value || e.target.value === 'R$ 0,00') {
                    e.target.value = previousValue;
                } else {
                    let value = e.target.value.replace(/\D/g, '');
                    value = (parseInt(value) / 100);
                    e.target.value = Utils.formatCurrency(value);
                }
                isTyping = false;
            });
        }
    },

    /**
     * Carrega a lista de serviços
     */
    loadServicos: function() {
        // Obtém os serviços do banco de dados
        const servicos = DB.getServicos() || [];
        
        // Renderiza a tabela com os serviços
        this.renderServicosTable(servicos);
        
        // Atualiza os contadores do dashboard
        this.updateDashboardCounters();
        
        // Log para debug
        console.log('Serviços carregados:', servicos);
    },

    /**
     * Carrega os serviços recentes para o dashboard
     */
    loadRecentServices: function() {
        const servicos = DB.getServicos();
        
        // Ordena por data mais recente
        const recentServices = [...servicos].sort((a, b) => {
            return new Date(b.data) - new Date(a.data);
        }).slice(0, 5); // Pega apenas os 5 mais recentes
        
        this.renderRecentServicesTable(recentServices);
    },

    /**
     * Renderiza a tabela de serviços com paginação
     * @param {Array} servicos - Lista de serviços a serem exibidos
     */
    renderServicosTable: function(servicos) {
        const table = document.getElementById('servicos-table');
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        // Limpa a tabela
        tbody.innerHTML = '';

        // Verifica se há serviços
        if (!servicos || servicos.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="8" style="text-align: center;">Nenhum serviço encontrado</td>';
            tbody.appendChild(tr);
            return;
        }

        // Calcula o total de páginas
        this.pagination.totalPages = Math.ceil(servicos.length / this.pagination.itemsPerPage);
        
        // Calcula o índice inicial e final dos itens da página atual
        const startIndex = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
        const endIndex = Math.min(startIndex + this.pagination.itemsPerPage, servicos.length);
        
        // Filtra os serviços para a página atual
        const servicosPaginados = servicos.slice(startIndex, endIndex);
        
        // Renderiza os serviços da página atual
        servicosPaginados.forEach(servico => {
            const tr = document.createElement('tr');
            tr.classList.add('clickable-row');
            
            const statusClass = 
                servico.status === 'concluido' ? 'concluido' : 
                servico.status === 'cancelado' ? 'cancelado' : 'aberto';
            
            tr.innerHTML = `
                <td>${servico.id}</td>
                <td>${servico.nomeCliente || servico.cliente || 'N/A'}</td>
                <td>${servico.telefoneCliente || 'N/A'}</td>
                <td>${servico.aparelho || 'N/A'}</td>
                <td>${Utils.formatDate(servico.data)}</td>
                <td>
                    <select class="status-select status-${statusClass}" data-id="${servico.id}">
                        <option value="aberto" ${servico.status === 'aberto' ? 'selected' : ''}>Aberto</option>
                        <option value="concluido" ${servico.status === 'concluido' ? 'selected' : ''}>Concluído</option>
                        <option value="cancelado" ${servico.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </td>
                <td>${Utils.formatCurrency(parseFloat(servico.valor) || 0)}</td>
                <td class="table-actions">
                    <button class="btn edit-servico" data-id="${servico.id}">Editar</button>
                    <button class="btn danger delete-servico" data-id="${servico.id}">Excluir</button>
                </td>
            `;
            
            tbody.appendChild(tr);
            
            // Adiciona eventos
            const editBtn = tr.querySelector('.edit-servico');
            const deleteBtn = tr.querySelector('.delete-servico');
            const statusSelect = tr.querySelector('.status-select');
            
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editServico(servico.id);
            });
            
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteServico(servico.id);
            });
            
            // Adiciona evento de mudança de status
            statusSelect.addEventListener('change', (e) => {
                e.stopPropagation();
                const novoStatus = e.target.value;
                this.updateServicoStatus(servico.id, novoStatus);
            });
            
            // Adiciona evento de duplo clique para visualizar detalhes
            tr.addEventListener('dblclick', () => {
                this.visualizarServico(servico.id);
            });
        });

        // Renderiza os controles de paginação
        this.renderPaginationControls(servicos.length);
    },

    /**
     * Renderiza a tabela de serviços recentes no dashboard
     * @param {Array} servicos - Lista de serviços recentes
     */
    renderRecentServicesTable: function(servicos) {
        const tbody = this.elements.recentServicesTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        if (servicos.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="5" style="text-align: center;">Nenhum serviço registrado</td>`;
            tbody.appendChild(tr);
            return;
        }
        
        servicos.forEach(servico => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${servico.id}</td>
                <td>${servico.nomeCliente}</td>
                <td>${servico.aparelho}</td>
                <td><span class="status status-${servico.status}">${Utils.formatStatus(servico.status)}</span></td>
                <td>${Utils.formatDate(servico.data)}</td>
            `;
            
            tbody.appendChild(tr);
        });
    },

    /**
     * Abre o formulário para novo serviço
     */
    openServicoForm: function() {
        // Limpa o formulário
        Utils.clearForm('form-servico');
        
        // Define a data atual
        if (this.elements.servicoData) {
            this.elements.servicoData.value = Utils.getCurrentDate();
        }
        
        // Define o valor inicial como R$ 0,00
        if (this.elements.servicoValor) {
            this.elements.servicoValor.value = 'R$ 0,00';
        }
        
        // Atualiza o título do modal
        if (this.elements.modalServicoTitle) {
            this.elements.modalServicoTitle.textContent = 'Novo Serviço';
        }
        
        // Abre o modal
        Utils.openModal('modal-servico');
    },

    /**
     * Abre o formulário para edição de serviço
     * @param {number} id - ID do serviço a ser editado
     */
    editServico: function(id) {
        const servico = DB.getServicoById(id);
        
        if (!servico) {
            Utils.showAlert('Serviço não encontrado!', 'error');
            return;
        }
        
        // Verifica se todos os elementos necessários existem
        if (!this.elements.servicoNomeCliente || !this.elements.servicoTelefoneCliente || 
            !this.elements.servicoAparelho || !this.elements.servicoProblema || 
            !this.elements.servicoStatus || !this.elements.servicoData || 
            !this.elements.servicoValor) {
            console.error('Elementos do formulário não encontrados');
            Utils.showAlert('Erro: Alguns campos do formulário não foram encontrados', 'error');
            return;
        }
        
        // Preenche o formulário com os dados do serviço
        if (this.elements.servicoId) {
            this.elements.servicoId.value = servico.id;
        }
        this.elements.servicoNomeCliente.value = servico.nomeCliente || '';
        this.elements.servicoTelefoneCliente.value = servico.telefoneCliente || '';
        this.elements.servicoAparelho.value = servico.aparelho;
        this.elements.servicoProblema.value = servico.problema;
        this.elements.servicoStatus.value = servico.status;
        this.elements.servicoData.value = servico.data;
        
        // Formata o valor para exibição
        if (servico.valor) {
            const valor = parseFloat(servico.valor);
            if (!isNaN(valor)) {
                const parts = valor.toFixed(2).split('.');
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                this.elements.servicoValor.value = `R$ ${parts.join(',')}`;
            } else {
                this.elements.servicoValor.value = '';
            }
        } else {
            this.elements.servicoValor.value = '';
        }
        
        // Atualiza o título do modal
        if (this.elements.modalServicoTitle) {
            this.elements.modalServicoTitle.textContent = 'Editar Serviço';
        }
        
        // Abre o modal
        Utils.openModal('modal-servico');
    },

    /**
     * Salva um serviço no banco de dados
     */
    saveServico: function() {
        // Obtém os dados do formulário
        const servico = this.getFormData();
        
        if (!servico) {
            return;
        }
        
        try {
            // Se o serviço tem ID, atualiza. Senão, adiciona como novo
            const result = servico.id ? DB.updateServico(servico) : DB.addServico(servico);
            
            if (!result) {
                throw new Error('Falha ao salvar serviço');
            }
            
            // Fecha o modal
            Utils.closeModal('modal-servico');
            
            // Limpa o formulário
            Utils.clearForm('form-servico');
            
            // Recarrega a lista de serviços
            this.loadServicos();
            
            // Log para debug
            console.log('Serviço salvo:', servico);
        } catch (error) {
            console.error('Erro ao salvar serviço:', error);
            Utils.showAlert('error', 'Erro ao salvar serviço. Por favor, tente novamente.');
        }
    },

    /**
     * Exclui um serviço
     * @param {number} id - ID do serviço a ser excluído
     */
    deleteServico: function(id) {
        // Confirma a exclusão
        const confirmed = Utils.confirm('Tem certeza que deseja excluir este serviço?');
        
        if (!confirmed) {
            return;
        }
        
        const deleted = DB.deleteServico(id);
        
        if (deleted) {
            // Recarrega a lista de serviços
            this.loadServicos();
            
            // Atualiza os serviços recentes no dashboard
            this.loadRecentServices();
        } else {
            Utils.showAlert('Erro ao excluir serviço!', 'error');
        }
    },

    /**
     * Busca e filtra serviços pelos critérios selecionados
     */
    searchServicos: function() {
        const searchTerm = this.elements.searchService.value;
        const statusFilter = this.elements.filterStatus.value;
        
        // Obtém serviços filtrados por status, se necessário
        let servicos = statusFilter === 'todos' ? 
            DB.getServicos() : 
            DB.getServicosByStatus(statusFilter);
        
        // Aplica filtro de busca, se houver
        if (searchTerm && searchTerm.trim() !== '') {
            // Campos a serem considerados na busca
            const searchFields = ['nomeCliente', 'telefoneCliente', 'aparelho', 'problema'];
            
            // Filtra a lista de serviços
            servicos = Utils.filterList(servicos, searchTerm, searchFields);
        }
        
        // Atualiza a tabela
        this.renderServicosTable(servicos);
    },

    /**
     * Atualiza os contadores do dashboard
     */
    updateDashboardCounters: function() {
        const servicos = DB.getServicos();
        
        // Serviços pendentes (aberto)
        const servicosPendentes = servicos.filter(s => s.status === 'aberto').length;
        
        // Serviços concluídos
        const servicosConcluidos = servicos.filter(s => s.status === 'concluido').length;
        
        // Total de serviços (excluindo cancelados)
        const servicosTotais = servicos.filter(s => s.status !== 'cancelado').length;
        
        // Atualiza os contadores no dashboard
        const pendentesCount = document.querySelector('#dashboard .card:nth-child(1) .count');
        const concluidosCount = document.querySelector('#dashboard .card:nth-child(2) .count');
        const totaisCount = document.querySelector('#dashboard .card:nth-child(3) .count');
        
        if (pendentesCount) pendentesCount.textContent = servicosPendentes;
        if (concluidosCount) concluidosCount.textContent = servicosConcluidos;
        if (totaisCount) totaisCount.textContent = servicosTotais;
    },

    /**
     * Obtém estatísticas dos serviços em um período
     * @param {string} startDate - Data inicial no formato YYYY-MM-DD
     * @param {string} endDate - Data final no formato YYYY-MM-DD
     * @returns {Object} Estatísticas dos serviços
     */
    getServicosStats: function(startDate, endDate) {
        // Obtém todos os serviços
        const servicos = DB.getServicos();
        
        // Converte datas para objetos Date para comparação correta
        const inicio = Utils.parseDate(startDate);
        const fim = Utils.parseDate(endDate);
        fim.setHours(23, 59, 59); // Inclui todo o último dia
        
        // Filtra serviços no período
        const servicosFiltrados = servicos.filter(servico => {
            const dataServico = Utils.parseDate(servico.data);
            return dataServico >= inicio && dataServico <= fim;
        });
        
        // Contagem por status
        const statusCount = {};
        ['aguardando', 'aprovado', 'em_andamento', 'concluido', 'entregue', 'cancelado'].forEach(status => {
            statusCount[status] = servicosFiltrados.filter(s => s.status === status).length;
        });
        
        // Calcula o valor total dos serviços no período
        const valorTotal = servicosFiltrados.reduce((total, servico) => {
            return total + (parseFloat(servico.valor) || 0);
        }, 0);
        
        return {
            total: servicosFiltrados.length,
            porStatus: statusCount,
            valorTotal: valorTotal,
            servicosFiltrados
        };
    },

    /**
     * Adiciona um novo serviço
     */
    adicionarServico: function() {
        const servico = this.getServicoFromForm();
        
        if (!servico) {
            return false;
        }
        
        // Adiciona a data atual se não for informada
        if (!servico.data) {
            servico.data = Utils.getCurrentDate();
        }
        
        // Adiciona o serviço no banco de dados
        const novoServico = DB.addServico(servico);
        
        // Fecha o modal e atualiza a tabela
        this.closeModal();
        this.carregarServicos();
        
        // Atualiza o dashboard
        if (typeof DashboardModule !== 'undefined' && DashboardModule.updateDashboard) {
            DashboardModule.updateDashboard();
        }
        
        return true;
    },

    /**
     * Atualiza um serviço existente
     */
    atualizarServico: function() {
        const servico = this.getServicoFromForm();
        
        if (!servico) {
            return false;
        }
        
        // Atualiza o serviço no banco de dados
        const success = DB.updateServico(servico);
        
        if (success) {
            // Fecha o modal e atualiza a tabela
            this.closeModal();
            this.carregarServicos();
            
            // Atualiza o dashboard
            if (typeof DashboardModule !== 'undefined' && DashboardModule.updateDashboard) {
                DashboardModule.updateDashboard();
            }
        }
        
        return success;
    },
    
    /**
     * Remove um serviço
     * @param {number} id - ID do serviço
     */
    excluirServico: function(id) {
        const confirmado = Utils.confirm('Tem certeza que deseja excluir este serviço?');
        
        if (!confirmado) {
            return;
        }
        
        const success = DB.deleteServico(id);
        
        if (success) {
            this.carregarServicos();
            
            // Atualiza o dashboard
            if (typeof DashboardModule !== 'undefined' && DashboardModule.updateDashboard) {
                DashboardModule.updateDashboard();
            }
        }
    },

    /**
     * Visualiza detalhes de um serviço
     * @param {number} id - ID do serviço
     */
    visualizarServico: function(id) {
        const servico = DB.getServicoById(id);
        
        if (!servico) {
            Utils.showAlert('Serviço não encontrado!', 'error');
            return;
        }
        
        // Constrói o HTML com as informações detalhadas
        let html = `
            <div class="servico-detalhes">
                <h3>Detalhes do Serviço #${servico.id}</h3>
                
                <div class="detalhes-grid">
                    <div class="detalhe-item">
                        <span class="detalhe-label">Cliente:</span>
                        <span class="detalhe-valor">${servico.nomeCliente || 'N/A'}</span>
                    </div>
                    
                    <div class="detalhe-item">
                        <span class="detalhe-label">Telefone:</span>
                        <span class="detalhe-valor">${servico.telefoneCliente || 'N/A'}</span>
                    </div>
                    
                    <div class="detalhe-item">
                        <span class="detalhe-label">Aparelho:</span>
                        <span class="detalhe-valor">${servico.aparelho || 'N/A'}</span>
                    </div>
                    
                    <div class="detalhe-item">
                        <span class="detalhe-label">Data:</span>
                        <span class="detalhe-valor">${Utils.formatDate(servico.data)}</span>
                    </div>
                    
                    <div class="detalhe-item">
                        <span class="detalhe-label">Status:</span>
                        <span class="detalhe-valor">
                            <span class="status status-${
                                servico.status === 'concluido' ? 'concluido' : 
                                servico.status === 'cancelado' ? 'cancelado' : 'aberto'
                            }">${Utils.formatStatus(servico.status)}</span>
                        </span>
                    </div>
                    
                    <div class="detalhe-item">
                        <span class="detalhe-label">Valor:</span>
                        <span class="detalhe-valor">${Utils.formatCurrency(parseFloat(servico.valor) || 0)}</span>
                    </div>
                </div>
                
                <div class="detalhe-descricao">
                    <span class="detalhe-label">Problema:</span>
                    <div class="detalhe-texto">${servico.problema || 'Nenhuma descrição'}</div>
                </div>
                
                <div class="detalhe-acoes">
                    <button class="btn edit-servico-detalhe" data-id="${servico.id}">Editar</button>
                    <button class="btn fechar-detalhe">Fechar</button>
                </div>
            </div>
        `;
        
        // Cria o modal e o adiciona ao DOM
        const modalServico = document.createElement('div');
        modalServico.className = 'modal';
        modalServico.id = 'modal-visualizar-servico';
        
        const modalConteudo = document.createElement('div');
        modalConteudo.className = 'modal-content';
        modalConteudo.innerHTML = html;
        
        modalServico.appendChild(modalConteudo);
        document.body.appendChild(modalServico);
        
        // Adiciona eventos
        const btnEditar = modalConteudo.querySelector('.edit-servico-detalhe');
        const btnFechar = modalConteudo.querySelector('.fechar-detalhe');
        
        btnEditar.addEventListener('click', () => {
            // Fecha esse modal
            document.body.removeChild(modalServico);
            
            // Abre o modal de edição
            this.editServico(servico.id);
        });
        
        btnFechar.addEventListener('click', () => {
            document.body.removeChild(modalServico);
        });
        
        // Evento para fechar ao clicar fora do modal
        modalServico.addEventListener('click', (e) => {
            if (e.target === modalServico) {
                document.body.removeChild(modalServico);
            }
        });
        
        // Exibe o modal
        setTimeout(() => {
            modalServico.style.display = 'block';
        }, 10);
    },

    /**
     * Atualiza o status de um serviço
     * @param {number} id - ID do serviço
     * @param {string} novoStatus - Novo status do serviço
     */
    updateServicoStatus: function(id, novoStatus) {
        const servico = DB.getServicoById(id);
        
        if (!servico) {
            Utils.showAlert('Serviço não encontrado!', 'error');
            return;
        }
        
        // Atualiza o status
        servico.status = novoStatus;
        
        // Salva no banco de dados
        const success = DB.updateServico(servico);
        
        if (success) {
            // Atualiza a classe do select para refletir o novo status
            const select = document.querySelector(`.status-select[data-id="${id}"]`);
            if (select) {
                select.className = `status-select status-${novoStatus}`;
            }
            
            // Recarrega a lista de serviços
            this.loadServicos();
            
            // Atualiza os serviços recentes no dashboard
            this.loadRecentServices();
        } else {
            Utils.showAlert('Erro ao atualizar status do serviço!', 'error');
        }
    },

    /**
     * Renderiza os controles de paginação
     * @param {number} totalItems - Total de itens
     */
    renderPaginationControls: function(totalItems) {
        // Remove qualquer container de paginação existente
        const existingContainer = document.querySelector('#servicos .pagination-controls');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Cria um novo container de paginação
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-controls';
        paginationContainer.style.cssText = 'margin-top: 20px; text-align: center;';

        // Calcula o total de páginas
        const totalPages = Math.ceil(totalItems / this.pagination.itemsPerPage);
        
        // Gera o HTML dos controles
        let html = '<div style="display: flex; justify-content: center; gap: 10px;">';
        
        // Botão Anterior
        html += `
            <button class="btn" 
                    ${this.pagination.currentPage === 1 ? 'disabled' : ''} 
                    onclick="ServicosModule.changePage(${this.pagination.currentPage - 1})"
                    style="padding: 5px 15px;">
                Anterior
            </button>
        `;

        // Informação da página atual
        html += `
            <span style="line-height: 32px;">
                Página ${this.pagination.currentPage} de ${totalPages}
            </span>
        `;

        // Botão Próximo
        html += `
            <button class="btn" 
                    ${this.pagination.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="ServicosModule.changePage(${this.pagination.currentPage + 1})"
                    style="padding: 5px 15px;">
                Próximo
            </button>
        `;

        html += '</div>';
        
        paginationContainer.innerHTML = html;
        
        // Adiciona o container ao DOM
        const servicosSection = document.getElementById('servicos');
        if (servicosSection) {
            servicosSection.appendChild(paginationContainer);
        }
    },

    /**
     * Muda para a página especificada
     * @param {number} page - Número da página
     */
    changePage: function(page) {
        if (page < 1 || page > this.pagination.totalPages) return;
        
        this.pagination.currentPage = page;
        this.loadServicos(); // Recarrega a lista de serviços com a nova página
    },

    /**
     * Obtém os dados do formulário de serviço
     * @returns {Object|null} Objeto com os dados do serviço ou null se houver erro
     */
    getFormData: function() {
        try {
            // Verifica se todos os elementos necessários existem
            if (!this.elements.servicoNomeCliente || !this.elements.servicoTelefoneCliente || 
                !this.elements.servicoAparelho || !this.elements.servicoProblema || 
                !this.elements.servicoStatus || !this.elements.servicoData || 
                !this.elements.servicoValor) {
                throw new Error('Elementos do formulário não encontrados');
            }
            
            // Obtém os dados do formulário
            const servicoData = {
                nomeCliente: this.elements.servicoNomeCliente.value.trim(),
                telefoneCliente: this.elements.servicoTelefoneCliente.value.trim(),
                aparelho: this.elements.servicoAparelho.value.trim(),
                problema: this.elements.servicoProblema.value.trim(),
                status: this.elements.servicoStatus.value,
                data: this.elements.servicoData.value,
                valor: this.elements.servicoValor.value.replace(/[^\d,]/g, '').replace(',', '.'),
            };
            
            // Validações básicas
            if (!servicoData.nomeCliente || !servicoData.aparelho || !servicoData.problema || !servicoData.data) {
                Utils.showAlert('error', 'Por favor, preencha todos os campos obrigatórios');
                return null;
            }
            
            // Se houver um ID no formulário, adiciona ao objeto
            const servicoId = this.elements.servicoId ? this.elements.servicoId.value : '';
            if (servicoId) {
                servicoData.id = parseInt(servicoId);
            }
            
            return servicoData;
        } catch (error) {
            console.error('Erro ao obter dados do formulário:', error);
            Utils.showAlert('error', 'Erro ao obter dados do formulário');
            return null;
        }
    }
};

// Quando o DOM estiver pronto, inicializa o módulo
document.addEventListener('DOMContentLoaded', function() {
    ServicosModule.init();
});

// Alias para uso por outros módulos
const Servicos = {
    getServicos: function() {
        return DB.getServicos();
    },
    
    getServico: function(id) {
        return DB.getServicoById(parseInt(id));
    }
}; 