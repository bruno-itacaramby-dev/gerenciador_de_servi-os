/**
 * Pecas.js
 * Módulo responsável pelo gerenciamento de peças
 */

const PecasModule = {
    // Referências aos elementos do DOM
    elements: {
        pecasTable: document.getElementById('pecas-table'),
        btnNovaPeca: document.getElementById('btn-nova-peca'),
        modalPeca: document.getElementById('modal-peca'),
        formPeca: document.getElementById('form-peca'),
        modalPecaTitle: document.getElementById('modal-peca-title'),
        pecaId: document.getElementById('peca-id'),
        pecaCodigo: document.getElementById('peca-codigo'),
        pecaDescricao: document.getElementById('peca-descricao'),
        pecaCategoria: document.getElementById('peca-categoria'),
        pecaQuantidade: document.getElementById('peca-quantidade'),
        pecaPreco: document.getElementById('peca-preco'),
        pecaStatus: document.getElementById('peca-status'),
        btnCancelarPeca: document.getElementById('btn-cancelar-peca'),
        searchPeca: document.getElementById('search-peca'),
        filterCategory: document.getElementById('filter-category'),
        showEsgotadas: document.getElementById('show-esgotadas'),
        
        // Modal de venda
        modalVendaPeca: document.getElementById('modal-venda-peca'),
        formVendaPeca: document.getElementById('form-venda-peca'),
        vendaPecaCodigo: document.getElementById('venda-peca-codigo'),
        vendaPecaDescricao: document.getElementById('venda-peca-descricao'),
        vendaPecaQuantidade: document.getElementById('venda-peca-quantidade'),
        vendaPecaQuantidadeDisponivel: document.getElementById('venda-peca-quantidade-disponivel'),
        vendaPecaPrecoUnitario: document.getElementById('venda-peca-preco-unitario'),
        vendaPecaPrecoVenda: document.getElementById('venda-peca-preco-venda'),
        vendaPecaData: document.getElementById('venda-peca-data'),
        btnCancelarVendaPeca: document.getElementById('btn-cancelar-venda-peca'),
        vendaPecaLucro: document.getElementById('venda-peca-lucro')
    },

    // Estado da paginação
    pagination: {
        currentPage: 1,
        itemsPerPage: 25,
        totalPages: 1
    },

    /**
     * Inicializa o módulo de peças
     */
    init: function() {
        this.setupListeners();
        this.loadPecas();
        
        // Configuração do campo de quantidade
        if (this.elements.pecaQuantidade) {
            this.elements.pecaQuantidade.addEventListener('focus', function(e) {
                if (e.target.value === '0') {
                    e.target.value = '';
                }
            });
            
            this.elements.pecaQuantidade.addEventListener('blur', function(e) {
                if (e.target.value === '') {
                    e.target.value = '0';
                }
            });
        }
        
        // Configuração do campo de preço unitário
        if (this.elements.pecaPreco) {
            // Ao focar no campo, limpa o valor
            this.elements.pecaPreco.addEventListener('focus', function(e) {
                // Armazena o valor atual para referência
                const currentValue = e.target.value;
                
                // Limpa o campo para permitir nova entrada
                e.target.value = '';
                
                // Adiciona um evento de keydown para detectar quando o usuário começa a digitar
                const keydownHandler = (event) => {
                    // Se o usuário pressionar uma tecla numérica ou de controle
                    if (event.key.match(/[0-9]/) || event.key === 'Backspace' || event.key === 'Delete') {
                        // Remove o evento de keydown após a primeira tecla pressionada
                        e.target.removeEventListener('keydown', keydownHandler);
                    }
                };
                
                // Adiciona o evento de keydown
                e.target.addEventListener('keydown', keydownHandler);
                
                // Adiciona um evento de blur para restaurar o valor se o campo for deixado vazio
                const blurHandler = () => {
                    if (!e.target.value) {
                        e.target.value = currentValue;
                    }
                    // Remove o evento de blur após ser acionado
                    e.target.removeEventListener('blur', blurHandler);
                };
                
                // Adiciona o evento de blur
                e.target.addEventListener('blur', blurHandler);
            });

            // Durante a digitação, formata o valor
            this.elements.pecaPreco.addEventListener('input', function(e) {
                // Remove tudo que não for número
                let value = e.target.value.replace(/\D/g, '');
                
                // Adiciona os decimais
                while (value.length < 3) {
                    value = '0' + value;
                }
                
                // Coloca o ponto decimal no lugar correto
                const intPart = value.slice(0, -2);
                const decPart = value.slice(-2);
                
                // Formata com separador de milhar
                let formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                
                // Remove zeros à esquerda desnecessários
                formattedInt = formattedInt.replace(/^0+/, '') || '0';
                
                // Junta as partes com vírgula e adiciona o prefixo R$
                e.target.value = 'R$ ' + formattedInt + ',' + decPart;
            });

            // Ao perder o foco, garante o formato correto
            this.elements.pecaPreco.addEventListener('blur', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                // Garante pelo menos 3 dígitos (1 real + 2 centavos)
                while (value.length < 3) {
                    value = '0' + value;
                }
                
                const intPart = value.slice(0, -2);
                const decPart = value.slice(-2);
                
                // Formata com separador de milhar
                let formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                formattedInt = formattedInt.replace(/^0+/, '') || '0';
                
                e.target.value = 'R$ ' + formattedInt + ',' + decPart;
            });
        }
    },

    /**
     * Configura os listeners de eventos
     */
    setupListeners: function() {
        const self = this;
        
        // Botão para abrir o formulário de nova peça
        this.elements.btnNovaPeca.addEventListener('click', () => {
            self.openPecaForm();
        });
        
        // Cancelar cadastro/edição de peça
        this.elements.btnCancelarPeca.addEventListener('click', () => {
            Utils.closeModal('modal-peca');
        });
        
        // Fechar modal ao clicar no X
        this.elements.modalPeca.querySelector('.close-modal').addEventListener('click', () => {
            Utils.closeModal('modal-peca');
        });
        
        // Submissão do formulário de peça
        this.elements.formPeca.addEventListener('submit', function(e) {
            e.preventDefault();
            self.savePeca();
        });
        
        // Busca de peças
        this.elements.searchPeca.addEventListener('input', function() {
            self.searchPecas();
        });
        
        // Filtro por categoria
        this.elements.filterCategory.addEventListener('change', function() {
            self.searchPecas();
        });
        
        // Checkbox para exibir peças esgotadas
        this.elements.showEsgotadas.addEventListener('change', function() {
            self.searchPecas();
        });
        
        // Configurações do modal de venda de peças
        if (this.elements.modalVendaPeca) {
            // Fechar modal ao clicar no X
            this.elements.modalVendaPeca.querySelector('.close-modal').addEventListener('click', () => {
                Utils.closeModal('modal-venda-peca');
            });
            
            // Cancelar venda de peça
            if (this.elements.btnCancelarVendaPeca) {
                this.elements.btnCancelarVendaPeca.addEventListener('click', () => {
                    Utils.closeModal('modal-venda-peca');
                });
            }
            
            // Submissão do formulário de venda
            if (this.elements.formVendaPeca) {
                this.elements.formVendaPeca.addEventListener('submit', function(e) {
                    e.preventDefault();
                    self.registrarVendaPeca();
                });
            }
            
            // Atualizar lucro ao alterar quantidade ou preço de venda
            if (this.elements.vendaPecaQuantidade && this.elements.vendaPecaPrecoVenda) {
                this.elements.vendaPecaQuantidade.addEventListener('input', function() {
                    self.atualizarPrecoTotalVenda();
                });
                
                this.elements.vendaPecaPrecoVenda.addEventListener('input', function() {
                    self.atualizarPrecoTotalVenda();
                });
            }
        }
    },

    /**
     * Carrega a lista de peças
     */
    loadPecas: function() {
        // Obtém todas as peças
        let pecas = DB.getPecas();
        
        // Aplica o filtro de peças esgotadas se o checkbox não estiver marcado
        if (this.elements.showEsgotadas && !this.elements.showEsgotadas.checked) {
            pecas = pecas.filter(peca => {
                // Considera como esgotada se a quantidade for 0 ou o status for 'esgotada'
                return peca.quantidade > 0 && peca.status !== 'esgotada';
            });
        }
        
        // Renderiza a tabela com as peças filtradas
        this.renderPecasTable(pecas);
        
        // Atualiza o contador de peças no dashboard
        this.updateDashboardCount();
    },

    /**
     * Renderiza a tabela de peças
     * @param {Array} pecas - Lista de peças a serem exibidas
     */
    renderPecasTable: function(pecas) {
        const table = document.getElementById('pecas-table');
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        // Limpa a tabela
        tbody.innerHTML = '';

        // Verifica se há peças
        if (!pecas || pecas.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="7" style="text-align: center;">Nenhuma peça cadastrada</td>`;
            tbody.appendChild(tr);
            return;
        }

        // Calcula o total de páginas
        this.pagination.totalPages = Math.ceil(pecas.length / this.pagination.itemsPerPage);
        
        // Calcula o índice inicial e final dos itens da página atual
        const startIndex = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
        const endIndex = Math.min(startIndex + this.pagination.itemsPerPage, pecas.length);
        
        // Filtra as peças para a página atual
        const pecasPaginadas = pecas.slice(startIndex, endIndex);
        
        // Renderiza as peças da página atual
        pecasPaginadas.forEach(peca => {
            const tr = document.createElement('tr');
            
            // Define o status se não existir
            const status = peca.status || 'disponivel';
            
            tr.innerHTML = `
                <td>${peca.codigo}</td>
                <td>${peca.descricao}</td>
                <td>${Utils.formatCategoria(peca.categoria)}</td>
                <td>${peca.quantidade}</td>
                <td>${Utils.formatCurrency(parseFloat(peca.preco))}</td>
                <td><span class="status status-${status === 'disponivel' ? 'aprovado' : 'cancelado'}">${status === 'disponivel' ? 'Disponível' : 'Esgotada'}</span></td>
                <td class="table-actions">
                    <button class="btn edit-peca" data-codigo="${peca.codigo}">Editar</button>
                    <button class="btn danger delete-peca" data-codigo="${peca.codigo}">Excluir</button>
                    ${parseInt(peca.quantidade) > 0 ? 
                    `<button class="btn primary vender-peca" data-codigo="${peca.codigo}">Vender</button>` : ''}
                </td>
            `;
            
            tbody.appendChild(tr);
            
            // Adiciona eventos aos botões
            const editBtn = tr.querySelector('.edit-peca');
            const deleteBtn = tr.querySelector('.delete-peca');
            const venderBtn = tr.querySelector('.vender-peca');
            
            editBtn.addEventListener('click', () => {
                this.editPeca(peca.codigo);
            });
            
            deleteBtn.addEventListener('click', () => {
                this.deletePeca(peca.codigo);
            });
            
            if (venderBtn) {
                venderBtn.addEventListener('click', () => {
                    this.openVendaPecaForm(peca.codigo);
                });
            }
        });

        // Renderiza os controles de paginação
        this.renderPaginationControls(pecas.length);
    },

    /**
     * Renderiza os controles de paginação
     * @param {number} totalItems - Total de itens
     */
    renderPaginationControls: function(totalItems) {
        // Remove qualquer container de paginação existente
        const existingContainer = document.querySelector('#pecas .pagination-controls');
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
                    onclick="PecasModule.changePage(${this.pagination.currentPage - 1})"
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
                    onclick="PecasModule.changePage(${this.pagination.currentPage + 1})"
                    style="padding: 5px 15px;">
                Próximo
            </button>
        `;

        html += '</div>';
        
        paginationContainer.innerHTML = html;
        
        // Adiciona o container ao DOM
        const pecasSection = document.getElementById('pecas');
        if (pecasSection) {
            pecasSection.appendChild(paginationContainer);
        }
    },

    /**
     * Muda para a página especificada
     * @param {number} page - Número da página
     */
    changePage: function(page) {
        if (page < 1 || page > this.pagination.totalPages) return;
        
        this.pagination.currentPage = page;
        this.loadPecas(); // Recarrega a lista de peças com a nova página
    },

    /**
     * Gera um código alfanumérico aleatório de 4 caracteres
     * @returns {string} Código gerado (somente letras maiúsculas e números)
     */
    gerarCodigoPeca: function() {
        // Caracteres permitidos (letras maiúsculas e números)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        
        // Gera um código de 4 caracteres
        let tentativas = 0;
        const maxTentativas = 50; // Limite de tentativas para evitar loop infinito
        
        while (tentativas < maxTentativas) {
            let codigo = '';
            
            // Gera um código de 4 caracteres
            for (let i = 0; i < 4; i++) {
                codigo += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            
            // Verifica se o código já existe
            const pecaExistente = DB.getPecaByCodigo(codigo);
            
            if (!pecaExistente) {
                return codigo; // Retorna o código se for único
            }
            
            tentativas++;
        }
        
        // Se chegou aqui, não conseguiu gerar um código único
        // Adiciona timestamp para garantir que seja único
        const timestamp = new Date().getTime().toString(36).slice(-4).toUpperCase();
        return timestamp;
    },

    /**
     * Abre o formulário para nova peça
     */
    openPecaForm: function() {
        // Limpa o formulário
        Utils.clearForm('form-peca');

        // Habilita o campo de código da peça
        this.elements.pecaCodigo.disabled = false;
        
        // Gera código alfanumérico automático
        this.elements.pecaCodigo.value = this.gerarCodigoPeca();
        
        // Define status como disponível por padrão
        if (this.elements.pecaStatus) {
            this.elements.pecaStatus.value = 'disponivel';
        }
        
        // Atualiza o título do modal
        this.elements.modalPecaTitle.textContent = 'Nova Peça';
        
        // Abre o modal
        Utils.openModal('modal-peca');
    },

    /**
     * Abre o formulário para edição de peça
     * @param {string} codigo - Código da peça a ser editada
     */
    editPeca: function(codigo) {
        const peca = DB.getPecaByCodigo(codigo);
        
        if (!peca) {
            Utils.showAlert('Peça não encontrada!', 'error');
            return;
        }
        
        // Preenche o formulário com os dados da peça
        this.elements.pecaCodigo.value = peca.codigo;
        this.elements.pecaCodigo.disabled = true; // Não permite alterar o código
        this.elements.pecaDescricao.value = peca.descricao;
        this.elements.pecaCategoria.value = peca.categoria;
        this.elements.pecaQuantidade.value = peca.quantidade;
        
        // Formata o preço com o prefixo R$
        const preco = parseFloat(peca.preco);
        if (!isNaN(preco)) {
            this.elements.pecaPreco.value = this.formatarPreco(preco);
        } else {
            this.elements.pecaPreco.value = 'R$ 0,00';
        }
        
        // Define o status se existir o campo
        if (this.elements.pecaStatus) {
            this.elements.pecaStatus.value = peca.status || 'disponivel';
        }
        
        // Atualiza o título do modal
        this.elements.modalPecaTitle.textContent = 'Editar Peça';
        
        // Abre o modal
        Utils.openModal('modal-peca');
    },

    /**
     * Salva uma nova peça ou atualiza uma existente
     */
    savePeca: function() {
        // Obtém os dados do formulário
        const pecaData = {
            codigo: this.elements.pecaCodigo.value.trim(),
            descricao: this.elements.pecaDescricao.value.trim(),
            categoria: this.elements.pecaCategoria.value,
            quantidade: parseInt(this.elements.pecaQuantidade.value) || 0,
            preco: parseFloat(this.elements.pecaPreco.value.replace('R$ ', '').replace(/\./g, '').replace(',', '.')) || 0,
            status: this.elements.pecaStatus ? this.elements.pecaStatus.value : 'disponivel'
        };
        
        // Se a quantidade for 0, marca como esgotada
        if (pecaData.quantidade === 0) {
            pecaData.status = 'esgotada';
        }
        
        // Verifica se está editando (código desabilitado) ou adicionando nova peça
        if (this.elements.pecaCodigo.disabled) {
            // Atualizando peça existente
            const updated = DB.updatePeca(pecaData);
            
            if (!updated) {
                Utils.showAlert('Erro ao atualizar peça!', 'error');
                return;
            }
        } else {
            // Adicionando nova peça
            const newPeca = DB.addPeca(pecaData);
            
            if (!newPeca) {
                Utils.showAlert('Erro ao adicionar peça! Verifique se o código já existe.', 'error');
                return;
            }
        }
        
        // Fecha o modal
        Utils.closeModal('modal-peca');
        
        // Recarrega a lista de peças
        this.loadPecas();
    },

    /**
     * Abre o formulário para venda de peça
     * @param {string} codigo - Código da peça a ser vendida
     */
    openVendaPecaForm: function(codigo) {
        const peca = DB.getPecaByCodigo(codigo);
        const self = this;
        
        if (!peca) {
            Utils.showAlert('Peça não encontrada!', 'error');
            return;
        }
        
        if (parseInt(peca.quantidade) <= 0) {
            Utils.showAlert('Não há estoque disponível para esta peça!', 'error');
            return;
        }
        
        // Limpa o formulário
        if (this.elements.formVendaPeca) {
            Utils.clearForm('form-venda-peca');
        }
        
        // Preenche o formulário com os dados da peça
        if (this.elements.vendaPecaCodigo) {
            this.elements.vendaPecaCodigo.value = peca.codigo;
            this.elements.vendaPecaCodigo.disabled = true;
        }
        
        if (this.elements.vendaPecaDescricao) {
            this.elements.vendaPecaDescricao.value = peca.descricao;
            this.elements.vendaPecaDescricao.disabled = true;
        }
        
        if (this.elements.vendaPecaQuantidadeDisponivel) {
            this.elements.vendaPecaQuantidadeDisponivel.value = peca.quantidade;
            this.elements.vendaPecaQuantidadeDisponivel.disabled = true;
        }
        
        if (this.elements.vendaPecaQuantidade) {
            this.elements.vendaPecaQuantidade.value = "1";
            this.elements.vendaPecaQuantidade.max = peca.quantidade;
            
            // Adiciona evento para atualizar o lucro quando a quantidade mudar
            this.elements.vendaPecaQuantidade.addEventListener('input', function() {
                self.atualizarPrecoTotalVenda();
            });
        }
        
        if (this.elements.vendaPecaPrecoUnitario) {
            this.elements.vendaPecaPrecoUnitario.value = this.formatarPreco(peca.preco);
            this.elements.vendaPecaPrecoUnitario.disabled = true;
        }
        
        if (this.elements.vendaPecaPrecoVenda) {
            // Inicializa com o mesmo preço unitário
            this.elements.vendaPecaPrecoVenda.value = this.formatarPreco(peca.preco);
            
            // Limpa os eventos anteriores para evitar duplicação
            const oldElement = this.elements.vendaPecaPrecoVenda;
            const newElement = oldElement.cloneNode(true);
            oldElement.parentNode.replaceChild(newElement, oldElement);
            this.elements.vendaPecaPrecoVenda = newElement;
            
            // Ao focar no campo, limpa o valor
            this.elements.vendaPecaPrecoVenda.addEventListener('focus', function(e) {
                // Armazena o valor atual para referência
                const currentValue = e.target.value;
                
                // Limpa o campo para permitir nova entrada
                e.target.value = '';
                
                // Adiciona um evento de keydown para detectar quando o usuário começa a digitar
                const keydownHandler = (event) => {
                    // Se o usuário pressionar uma tecla numérica ou de controle
                    if (event.key.match(/[0-9]/) || event.key === 'Backspace' || event.key === 'Delete') {
                        // Remove o evento de keydown após a primeira tecla pressionada
                        e.target.removeEventListener('keydown', keydownHandler);
                    }
                };
                
                // Adiciona o evento de keydown
                e.target.addEventListener('keydown', keydownHandler);
                
                // Adiciona um evento de blur para restaurar o valor se o campo for deixado vazio
                const blurHandler = () => {
                    if (!e.target.value) {
                        e.target.value = currentValue;
                    }
                    // Remove o evento de blur após ser acionado
                    e.target.removeEventListener('blur', blurHandler);
                };
                
                // Adiciona o evento de blur
                e.target.addEventListener('blur', blurHandler);
            });

            // Durante a digitação, formata o valor
            this.elements.vendaPecaPrecoVenda.addEventListener('input', function(e) {
                // Remove tudo que não for número
                let value = e.target.value.replace(/\D/g, '');
                
                // Adiciona os decimais
                while (value.length < 3) {
                    value = '0' + value;
                }
                
                // Coloca o ponto decimal no lugar correto
                const intPart = value.slice(0, -2);
                const decPart = value.slice(-2);
                
                // Formata com separador de milhar
                let formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                
                // Remove zeros à esquerda desnecessários
                formattedInt = formattedInt.replace(/^0+/, '') || '0';
                
                // Junta as partes com vírgula e adiciona o prefixo R$
                e.target.value = 'R$ ' + formattedInt + ',' + decPart;
                
                // Atualiza o lucro
                self.atualizarPrecoTotalVenda();
            });

            // Ao perder o foco, garante o formato correto
            this.elements.vendaPecaPrecoVenda.addEventListener('blur', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                // Garante pelo menos 3 dígitos (1 real + 2 centavos)
                while (value.length < 3) {
                    value = '0' + value;
                }
                
                const intPart = value.slice(0, -2);
                const decPart = value.slice(-2);
                
                // Formata com separador de milhar
                let formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                formattedInt = formattedInt.replace(/^0+/, '') || '0';
                
                e.target.value = 'R$ ' + formattedInt + ',' + decPart;
                
                // Atualiza o lucro
                self.atualizarPrecoTotalVenda();
            });
        }
        
        if (this.elements.vendaPecaData) {
            this.elements.vendaPecaData.value = Utils.getCurrentDate();
        }
        
        // Abre o modal
        Utils.openModal('modal-venda-peca');
        
        // Calcula o lucro inicial
        this.atualizarPrecoTotalVenda();
    },
    
    /**
     * Atualiza o preço total da venda com base na quantidade selecionada
     */
    atualizarPrecoTotalVenda: function() {
        if (this.elements.vendaPecaQuantidade && this.elements.vendaPecaPrecoUnitario && 
            this.elements.vendaPecaPrecoVenda && this.elements.vendaPecaLucro) {
            
            const quantidade = parseInt(this.elements.vendaPecaQuantidade.value) || 0;
            const precoUnitario = this.parsePreco(this.elements.vendaPecaPrecoUnitario.value);
            const precoVenda = this.parsePreco(this.elements.vendaPecaPrecoVenda.value);
            
            // Calcula o lucro total (preço de venda - preço unitário) × quantidade
            const lucroUnitario = precoVenda - precoUnitario;
            const lucroTotal = lucroUnitario * quantidade;
            
            // Atualiza o campo de lucro com o valor negativo se for prejuízo
            this.elements.vendaPecaLucro.value = this.formatarPreco(lucroTotal);
            
            // Adiciona classe visual para indicar lucro ou prejuízo
            if (lucroTotal < 0) {
                this.elements.vendaPecaLucro.style.color = '#dc3545'; // vermelho para prejuízo
            } else if (lucroTotal > 0) {
                this.elements.vendaPecaLucro.style.color = '#28a745'; // verde para lucro
            } else {
                this.elements.vendaPecaLucro.style.color = '#333'; // cor padrão para zero
            }
        }
    },

    /**
     * Formata um valor numérico para o padrão brasileiro de moeda
     * @param {number} valor - Valor a ser formatado
     * @returns {string} Valor formatado (ex: R$ 1.234,56)
     */
    formatarPreco: function(valor) {
        if (valor === undefined || valor === null || isNaN(valor)) {
            return 'R$ 0,00';
        }
        
        // Converte para string com 2 casas decimais
        let valorStr = Math.abs(valor).toFixed(2);
        
        // Separa parte inteira e decimal
        const [inteira, decimal] = valorStr.split('.');
        
        // Adiciona pontos de milhar
        const inteiraFormatada = inteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        
        // Retorna valor formatado com prefixo R$
        return `R$ ${inteiraFormatada},${decimal}`;
    },
    
    /**
     * Formata o preço durante a digitação
     * @param {string} valor - Valor atual do campo
     * @returns {string} Valor formatado com prefixo R$
     */
    formatarPrecoAoDigitar: function(valor) {
        // Remove tudo que não for número
        let nums = valor.replace(/\D/g, '');
        
        // Adiciona zeros à esquerda se necessário
        while (nums.length < 3) {
            nums = '0' + nums;
        }
        
        // Separa parte inteira e decimal
        const inteira = nums.slice(0, -2);
        const decimal = nums.slice(-2);
        
        // Formata parte inteira com pontos
        let inteiraFormatada = inteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        inteiraFormatada = inteiraFormatada.replace(/^0+/, '') || '0';
        
        // Retorna valor formatado com prefixo R$
        return `R$ ${inteiraFormatada},${decimal}`;
    },
    
    /**
     * Converte um valor formatado em moeda para número
     * @param {string} valor - Valor formatado (ex: R$ 1.234,56)
     * @returns {number} Valor numérico
     */
    parsePreco: function(valor) {
        if (!valor) return 0;
        // Remove o prefixo R$, pontos e troca vírgula por ponto
        return parseFloat(valor.replace('R$ ', '').replace(/\./g, '').replace(',', '.')) || 0;
    },
    
    /**
     * Registra a venda de uma peça
     */
    registrarVendaPeca: function() {
        if (!this.elements.vendaPecaCodigo || !this.elements.vendaPecaQuantidade || 
            !this.elements.vendaPecaPrecoVenda || !this.elements.vendaPecaData) {
            Utils.showAlert('Erro no formulário de venda!', 'error');
            return;
        }
        
        // Obtém os dados do formulário
        const vendaData = {
            codigoPeca: this.elements.vendaPecaCodigo.value.trim(),
            quantidade: parseInt(this.elements.vendaPecaQuantidade.value) || 0,
            precoVenda: this.parsePreco(this.elements.vendaPecaPrecoVenda.value),
            data: this.elements.vendaPecaData.value
        };
        
        // Validações básicas
        if (vendaData.quantidade <= 0) {
            Utils.showAlert('A quantidade deve ser maior que zero!', 'error');
            return;
        }
        
        if (vendaData.precoVenda <= 0) {
            Utils.showAlert('O preço de venda deve ser maior que zero!', 'error');
            return;
        }
        
        // Registra a venda
        const venda = DB.registrarVendaPeca(vendaData);
        
        if (venda) {
            // Fecha o modal
            Utils.closeModal('modal-venda-peca');
            
            // Recarrega a lista de peças
            this.loadPecas();
        } else {
            Utils.showAlert('Erro ao registrar venda! Verifique se há estoque suficiente.', 'error');
        }
    },

    /**
     * Exclui uma peça
     * @param {string} codigo - Código da peça a ser excluída
     */
    deletePeca: function(codigo) {
        // Confirma a exclusão
        const confirmed = Utils.confirm('Tem certeza que deseja excluir esta peça?');
        
        if (!confirmed) {
            return;
        }
        
        const deleted = DB.deletePeca(codigo);
        
        if (deleted) {
            // Recarrega a lista de peças
            this.loadPecas();
        } else {
            Utils.showAlert('Erro ao excluir peça!', 'error');
        }
    },

    /**
     * Busca e filtra peças pelos critérios selecionados
     */
    searchPecas: function() {
        const searchTerm = this.elements.searchPeca.value;
        const categoryFilter = this.elements.filterCategory.value;
        const showEsgotadas = this.elements.showEsgotadas.checked;
        
        // Obtém todas as peças
        let pecas = DB.getPecas();
        
        // Filtra peças esgotadas se o checkbox não estiver marcado
        if (!showEsgotadas) {
            pecas = pecas.filter(peca => {
                // Considera como esgotada se a quantidade for 0 ou o status for 'esgotada'
                return peca.quantidade > 0 && peca.status !== 'esgotada';
            });
        }
        
        // Aplica filtro de categoria, se houver
        if (categoryFilter !== 'todas') {
            pecas = pecas.filter(peca => peca.categoria === categoryFilter);
        }
        
        // Aplica filtro de busca, se houver
        if (searchTerm && searchTerm.trim() !== '') {
            // Campos a serem considerados na busca
            const searchFields = ['codigo', 'descricao'];
            
            // Filtra a lista de peças
            pecas = Utils.filterList(pecas, searchTerm, searchFields);
        }
        
        // Atualiza a tabela
        this.renderPecasTable(pecas);
    },

    /**
     * Atualiza o contador de peças no dashboard
     */
    updateDashboardCount: function() {
        const pecas = DB.getPecas();
        const totalPecas = pecas.reduce((total, peca) => total + peca.quantidade, 0);
        
        const dashboardPecasCount = document.querySelector('#dashboard .card:nth-child(4) .count');
        if (dashboardPecasCount) {
            dashboardPecasCount.textContent = totalPecas;
        }
    },

    /**
     * Obtém as estatísticas de peças por categoria
     * @returns {Object} Estatísticas de peças
     */
    getPecasStats: function() {
        const pecas = DB.getPecas();
        const categories = {};
        let totalValue = 0;
        
        pecas.forEach(peca => {
            const categoria = peca.categoria;
            const quantidade = parseInt(peca.quantidade);
            const valor = quantidade * parseFloat(peca.preco);
            
            if (!categories[categoria]) {
                categories[categoria] = {
                    count: 0,
                    value: 0
                };
            }
            
            categories[categoria].count += quantidade;
            categories[categoria].value += valor;
            totalValue += valor;
        });
        
        return {
            categories,
            totalValue,
            totalItems: pecas.reduce((total, peca) => total + parseInt(peca.quantidade), 0)
        };
    },
    
    /**
     * Obtém estatísticas de vendas para um período
     * @param {string} startDate - Data inicial no formato YYYY-MM-DD
     * @param {string} endDate - Data final no formato YYYY-MM-DD
     * @returns {Object} Estatísticas das vendas
     */
    getVendasStats: function(startDate, endDate) {
        // Obtém todas as vendas
        const vendas = DB.getVendasPecas();
        
        // Converte datas para objetos Date para comparação correta
        const inicio = Utils.parseDate(startDate);
        const fim = Utils.parseDate(endDate);
        fim.setHours(23, 59, 59); // Inclui todo o último dia
        
        // Filtra vendas no período
        const vendasFiltradas = vendas.filter(venda => {
            const dataVenda = Utils.parseDate(venda.data);
            return dataVenda >= inicio && dataVenda <= fim;
        });
        
        // Calcula valor total das vendas
        const valorTotal = vendasFiltradas.reduce((total, venda) => {
            return total + parseFloat(venda.precoVenda);
        }, 0);
        
        // Agrupa vendas por código de peça
        const vendasPorPeca = {};
        vendasFiltradas.forEach(venda => {
            const codigoPeca = venda.codigoPeca;
            
            if (!vendasPorPeca[codigoPeca]) {
                const peca = DB.getPecaByCodigo(codigoPeca);
                vendasPorPeca[codigoPeca] = {
                    codigo: codigoPeca,
                    descricao: peca ? peca.descricao : 'Peça não encontrada',
                    quantidade: 0,
                    valor: 0
                };
            }
            
            vendasPorPeca[codigoPeca].quantidade += parseInt(venda.quantidade);
            vendasPorPeca[codigoPeca].valor += parseFloat(venda.precoVenda);
        });
        
        return {
            total: vendasFiltradas.length,
            valorTotal,
            vendasPorPeca,
            vendas: vendasFiltradas
        };
    }
};

// Quando o DOM estiver pronto, inicializa o módulo
document.addEventListener('DOMContentLoaded', function() {
    PecasModule.init();
}); 