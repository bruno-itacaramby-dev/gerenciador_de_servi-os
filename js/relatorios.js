/**
 * Relatorios.js
 * Módulo responsável pela geração de relatórios
 */

const RelatoriosModule = {
    // Referências aos elementos do DOM
    elements: {
        // Elementos de relatório de serviços
        reportDateFrom: document.getElementById('report-date-from'),
        reportDateTo: document.getElementById('report-date-to'),
        reportCatFilter: document.getElementById('report-cat-filter'),
        reportPeriod: document.getElementById('report-period'),
        btnGerarRelatorioServicos: document.getElementById('btn-gerar-relatorio-servicos'),
        btnGerarRelatorioPecas: document.getElementById('btn-gerar-relatorio-pecas'),
        btnGerarRelatorioReceita: document.getElementById('btn-gerar-relatorio-receita'),
        btnGerarRelatorioVendas: document.getElementById('btn-gerar-relatorio-vendas'),
        reportVendasDateFrom: document.getElementById('report-vendas-date-from'),
        reportVendasDateTo: document.getElementById('report-vendas-date-to'),
        reportResult: document.getElementById('report-result'),
        
        // Modal de período personalizado
        modalPeriodoPersonalizado: document.getElementById('modal-periodo-personalizado'),
        periodoPersonalizadoFrom: document.getElementById('periodo-personalizado-from'),
        periodoPersonalizadoTo: document.getElementById('periodo-personalizado-to'),
        btnConfirmarPeriodoPersonalizado: document.getElementById('btn-confirmar-periodo-personalizado'),
        btnCancelarPeriodoPersonalizado: document.getElementById('btn-cancelar-periodo-personalizado')
    },

    /**
     * Inicializa o módulo de relatórios
     */
    init: function() {
        this.setupListeners();
        this.setDefaultDates();
        
        // Oculta o container de resultado inicialmente
        if (this.elements.reportResult) {
            this.elements.reportResult.style.display = 'none';
        }
    },

    /**
     * Configura os listeners de eventos
     */
    setupListeners: function() {
        const self = this;
        
        // Botão de gerar relatório de serviços
        if (this.elements.btnGerarRelatorioServicos) {
            this.elements.btnGerarRelatorioServicos.addEventListener('click', function() {
                self.gerarRelatorioServicos();
            });
        }
        
        // Botão de gerar relatório de peças
        if (this.elements.btnGerarRelatorioPecas) {
            this.elements.btnGerarRelatorioPecas.addEventListener('click', function() {
                self.gerarRelatorioPecas();
            });
        }
        
        // Botão de gerar relatório de receita
        if (this.elements.btnGerarRelatorioReceita) {
            this.elements.btnGerarRelatorioReceita.addEventListener('click', function() {
                // Verifica se o período selecionado é personalizado
                if (self.elements.reportPeriod.value === 'personalizado') {
                    self.abrirModalPeriodoPersonalizado();
                } else {
                    self.gerarRelatorioReceita();
                }
            });
        }
        
        // Configuração do modal de período personalizado
        if (this.elements.btnConfirmarPeriodoPersonalizado) {
            this.elements.btnConfirmarPeriodoPersonalizado.addEventListener('click', function() {
                self.gerarRelatorioReceitaPersonalizado();
            });
        }
        
        if (this.elements.btnCancelarPeriodoPersonalizado) {
            this.elements.btnCancelarPeriodoPersonalizado.addEventListener('click', function() {
                Utils.closeModal('modal-periodo-personalizado');
            });
        }
        
        // Se existir o modal, adicionar evento para o X fechar
        if (this.elements.modalPeriodoPersonalizado) {
            const closeModalBtn = this.elements.modalPeriodoPersonalizado.querySelector('.close-modal');
            if (closeModalBtn) {
                closeModalBtn.addEventListener('click', function() {
                    Utils.closeModal('modal-periodo-personalizado');
                });
            }
        }
        
        // Delegação de eventos para os botões de expandir/recolher
        if (this.elements.reportResult) {
            this.elements.reportResult.addEventListener('click', function(e) {
                if (e.target.classList.contains('toggle-section')) {
                    const contentEl = e.target.parentElement.nextElementSibling;
                    
                    if (contentEl.classList.contains('report-section-content')) {
                        // Alterna a classe expanded
                        contentEl.classList.toggle('expanded');
                        
                        // Atualiza o texto do botão
                        e.target.textContent = contentEl.classList.contains('expanded') ? '-' : '+';
                    }
                }
            });
        }
    },

    /**
     * Define datas padrão para os campos de data
     */
    setDefaultDates: function() {
        // Define a data atual para o campo "até"
        if (this.elements.reportDateTo) {
            this.elements.reportDateTo.value = Utils.getCurrentDate();
        }
        
        if (this.elements.reportVendasDateTo) {
            this.elements.reportVendasDateTo.value = Utils.getCurrentDate();
        }
        
        // Define 30 dias atrás para o campo "de"
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        const year = thirtyDaysAgo.getFullYear();
        const month = (thirtyDaysAgo.getMonth() + 1).toString().padStart(2, '0');
        const day = thirtyDaysAgo.getDate().toString().padStart(2, '0');
        
        if (this.elements.reportDateFrom) {
            this.elements.reportDateFrom.value = `${year}-${month}-${day}`;
        }
        
        if (this.elements.reportVendasDateFrom) {
            this.elements.reportVendasDateFrom.value = `${year}-${month}-${day}`;
        }
        
        // Define datas padrão para o período personalizado
        if (this.elements.periodoPersonalizadoTo) {
            this.elements.periodoPersonalizadoTo.value = Utils.getCurrentDate();
        }
        
        if (this.elements.periodoPersonalizadoFrom) {
            this.elements.periodoPersonalizadoFrom.value = `${year}-${month}-${day}`;
        }
    },

    /**
     * Abre o modal de período personalizado
     */
    abrirModalPeriodoPersonalizado: function() {
        // Atualiza as datas padrão
        if (this.elements.periodoPersonalizadoTo) {
            this.elements.periodoPersonalizadoTo.value = Utils.getCurrentDate();
        }
        
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        const year = thirtyDaysAgo.getFullYear();
        const month = (thirtyDaysAgo.getMonth() + 1).toString().padStart(2, '0');
        const day = thirtyDaysAgo.getDate().toString().padStart(2, '0');
        
        if (this.elements.periodoPersonalizadoFrom) {
            this.elements.periodoPersonalizadoFrom.value = `${year}-${month}-${day}`;
        }
        
        // Abre o modal
        Utils.openModal('modal-periodo-personalizado');
    },

    /**
     * Cria um botão de expandir/recolher para uma seção
     * @returns {string} HTML do botão
     */
    createToggleButton: function() {
        return `<span class="toggle-section">+</span>`;
    },

    /**
     * Gera relatório de serviços concluídos no período selecionado
     */
    gerarRelatorioServicos: function() {
        const startDate = this.elements.reportDateFrom.value;
        const endDate = this.elements.reportDateTo.value;
        
        if (!startDate || !endDate) {
            Utils.showAlert('Por favor, selecione as datas inicial e final para o relatório.', 'error');
            return;
        }
        
        // Obtém estatísticas de serviços para o período
        const stats = ServicosModule.getServicosStats(startDate, endDate);
        
        // Agrupa serviços por status
        const servicosPorStatus = {};
        stats.servicosFiltrados.forEach(servico => {
            if (!servicosPorStatus[servico.status]) {
                servicosPorStatus[servico.status] = [];
            }
            servicosPorStatus[servico.status].push(servico);
        });
        
        // Total de serviços
        const totalServicos = stats.servicosFiltrados.length;
        
        // Formata o relatório
        let reportHtml = `
            <div class="report-header">
                <h3>Relatório de Serviços por Status</h3>
                <p>Período: ${Utils.formatDate(startDate)} a ${Utils.formatDate(endDate)}</p>
                <p>Total de serviços no período: <strong>${totalServicos}</strong></p>
            </div>
            
            <div class="report-section">
                <h4>Distribuição por Status</h4>
        `;
        
        // Se não houver serviços no período
        if (totalServicos === 0) {
            reportHtml += `<p>Nenhum serviço encontrado no período selecionado.</p>`;
        } else {
            // Adiciona resumo por status
            Object.keys(servicosPorStatus).forEach(status => {
                const count = servicosPorStatus[status].length;
                const percentual = ((count / totalServicos) * 100).toFixed(1);
                reportHtml += `
                    <p>
                        ${Utils.formatStatus(status)}: 
                        <strong>${count}</strong> 
                        (${percentual}%)
                    </p>
                `;
            });
        }
        
        reportHtml += `
            </div>
            
            <div class="report-section">
                <h4>Serviços no Período ${this.createToggleButton()}</h4>
                <div class="report-section-content">
        `;
        
        // Lista resumida de serviços
        if (totalServicos > 0) {
            // Organiza serviços por data (mais recentes primeiro)
            const servicosOrdenados = stats.servicosFiltrados.sort((a, b) => {
                return new Date(b.data) - new Date(a.data);
            });
            
            reportHtml += `
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Aparelho</th>
                            <th>Data</th>
                            <th>Status</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            servicosOrdenados.forEach(servico => {
                const statusClass = servico.status === 'concluido' ? 'aprovado' : 
                                   servico.status === 'cancelado' ? 'cancelado' : 'pendente';
                                   
                reportHtml += `
                    <tr>
                        <td>${servico.id}</td>
                        <td>${servico.nomeCliente}</td>
                        <td>${servico.aparelho}</td>
                        <td>${Utils.formatDate(servico.data)}</td>
                        <td><span class="status status-${statusClass}">${Utils.formatStatus(servico.status)}</span></td>
                        <td>${Utils.formatCurrency(parseFloat(servico.valor) || 0)}</td>
                    </tr>
                `;
            });
            
            reportHtml += `
                    </tbody>
                </table>
            `;
        } else {
            reportHtml += `<p>Nenhum serviço encontrado no período selecionado.</p>`;
        }
        
        reportHtml += `</div></div>`;
        
        // Exibe o relatório
        this.showReport(reportHtml);
    },

    /**
     * Gera o relatório de estoque de peças
     */
    gerarRelatorioPecas: function() {
        const categoriaFilter = this.elements.reportCatFilter.value;
        
        // Obtém todas as peças
        let pecas = DB.getPecas();
        
        // Filtra por categoria, se necessário
        if (categoriaFilter !== 'todas') {
            pecas = pecas.filter(peca => peca.categoria === categoriaFilter);
        }
        
        // Calcula estatísticas gerais
        const totalPecas = pecas.length;
        const totalValorEstoque = pecas.reduce((total, peca) => {
            return total + parseFloat(peca.preco) * parseInt(peca.quantidade);
        }, 0);
        
        // Estatísticas por categoria
        const categorias = {};
        pecas.forEach(peca => {
            const categoria = peca.categoria;
            if (!categorias[categoria]) {
                categorias[categoria] = {
                    count: 0,
                    value: 0
                };
            }
            
            categorias[categoria].count += 1;
            categorias[categoria].value += parseFloat(peca.preco) * parseInt(peca.quantidade);
        });
        
        // Formata o relatório
        let reportHtml = `
            <div class="report-header">
                <h3>Relatório de Peças em Estoque</h3>
                <p>Categoria: ${categoriaFilter === 'todas' ? 'Todas as categorias' : Utils.formatCategoria(categoriaFilter)}</p>
            </div>
            
            <div class="report-section">
                <p>Total de itens: <strong>${totalPecas}</strong></p>
                <p>Valor total em estoque: <strong>${Utils.formatCurrency(totalValorEstoque)}</strong></p>
            </div>
            
            <div class="report-section">
                <h4>Distribuição por Categoria ${this.createToggleButton()}</h4>
                <div class="report-section-content">
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Categoria</th>
                            <th>Quantidade de Itens</th>
                            <th>Valor em Estoque</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Adiciona linhas para cada categoria
        Object.keys(categorias).forEach(categoria => {
            reportHtml += `
                <tr>
                    <td>${Utils.formatCategoria(categoria)}</td>
                    <td>${categorias[categoria].count}</td>
                    <td>${Utils.formatCurrency(categorias[categoria].value)}</td>
                </tr>
            `;
        });
        
        reportHtml += `
                    </tbody>
                </table>
                </div>
            </div>
        `;
        
        // Adiciona tabela detalhada de peças
        if (pecas.length > 0) {
            reportHtml += `
                <div class="report-section">
                    <h4>Detalhamento de Itens ${this.createToggleButton()}</h4>
                    <div class="report-section-content">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Descrição</th>
                                <th>Categoria</th>
                                <th>Quantidade</th>
                                <th>Valor Unitário</th>
                                <th>Valor Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            pecas.forEach(peca => {
                const valorTotal = parseInt(peca.quantidade) * parseFloat(peca.preco);
                reportHtml += `
                    <tr>
                        <td>${peca.codigo}</td>
                        <td>${peca.descricao}</td>
                        <td>${Utils.formatCategoria(peca.categoria)}</td>
                        <td>${peca.quantidade}</td>
                        <td>${Utils.formatCurrency(parseFloat(peca.preco))}</td>
                        <td>${Utils.formatCurrency(valorTotal)}</td>
                        <td>${peca.status === 'disponivel' ? 'Disponível' : 'Esgotada'}</td>
                    </tr>
                `;
            });
            
            reportHtml += `
                        </tbody>
                    </table>
                    </div>
                </div>
            `;
        }
        
        // Exibe o relatório
        this.showReport(reportHtml);
    },

    /**
     * Gera o relatório de vendas de peças
     */
    gerarRelatorioVendasPecas: function() {
        const dateFrom = this.elements.reportVendasDateFrom.value;
        const dateTo = this.elements.reportVendasDateTo.value;
        
        if (!dateFrom || !dateTo) {
            Utils.showAlert('Por favor, selecione as datas de início e fim!', 'error');
            return;
        }
        
        // Obtém as estatísticas de vendas
        const stats = PecasModule.getVendasStats(dateFrom, dateTo);
        
        // Formata as datas para exibição
        const dataInicio = Utils.formatDate(dateFrom);
        const dataFim = Utils.formatDate(dateTo);
        
        // Prepara o HTML do relatório
        let html = `
            <div class="report-header">
                <h3>Relatório de Vendas de Peças - ${dataInicio} a ${dataFim}</h3>
                <p>Total de vendas no período: <strong>${stats.total}</strong></p>
                <p>Valor total das vendas: <strong>${Utils.formatCurrency(stats.valorTotal)}</strong></p>
            </div>
            
            <div class="report-section">
                <h4>Vendas por Peça</h4>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Descrição</th>
                            <th>Quantidade</th>
                            <th>Valor Total</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Adiciona cada peça ao relatório
        const pecasCodigos = Object.keys(stats.vendasPorPeca);
        
        if (pecasCodigos.length === 0) {
            html += `<tr><td colspan="4" style="text-align: center;">Nenhuma venda no período</td></tr>`;
        } else {
            pecasCodigos.forEach(codigo => {
                const venda = stats.vendasPorPeca[codigo];
                
                html += `
                    <tr>
                        <td>${venda.codigo}</td>
                        <td>${venda.descricao}</td>
                        <td>${venda.quantidade}</td>
                        <td>${Utils.formatCurrency(venda.valor)}</td>
                    </tr>
                `;
            });
        }
        
        html += `
                    </tbody>
                </table>
            </div>
            
            <div class="report-section">
                <h4>Detalhamento de Vendas</h4>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Código Peça</th>
                            <th>Descrição</th>
                            <th>Quantidade</th>
                            <th>Valor</th>
                            <th>Data</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Adiciona cada venda ao relatório
        if (stats.vendas.length === 0) {
            html += `<tr><td colspan="6" style="text-align: center;">Nenhuma venda no período</td></tr>`;
        } else {
            stats.vendas.forEach(venda => {
                const peca = DB.getPecaByCodigo(venda.codigoPeca);
                const descricao = peca ? peca.descricao : 'Peça não encontrada';
                
                html += `
                    <tr>
                        <td>${venda.id}</td>
                        <td>${venda.codigoPeca}</td>
                        <td>${descricao}</td>
                        <td>${venda.quantidade}</td>
                        <td>${Utils.formatCurrency(parseFloat(venda.precoVenda))}</td>
                        <td>${Utils.formatDate(venda.data)}</td>
                    </tr>
                `;
            });
        }
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        // Exibe o relatório
        this.showReport(html);
    },

    /**
     * Gera o relatório de receita por período
     */
    gerarRelatorioReceita: function() {
        const periodo = this.elements.reportPeriod.value;
        
        // Determina as datas com base no período selecionado
        let dataInicio, dataFim;
        const today = new Date();
        
        dataFim = Utils.getCurrentDate(); // Data atual
        
        switch (periodo) {
            case '7dias':
                dataInicio = Utils.addDays(dataFim, -7);
                break;
            case '30dias':
                dataInicio = Utils.addDays(dataFim, -30);
                break;
            case '90dias':
                dataInicio = Utils.addDays(dataFim, -90);
                break;
            case 'ano':
                dataInicio = `${today.getFullYear()}-01-01`;
                break;
            case 'personalizado':
                // Tratado em outro método
                return;
            default:
                dataInicio = Utils.addDays(dataFim, -30);
        }
        
        // Usa o mesmo formato do período personalizado para todos os períodos
        this.gerarRelatorioReceitaComDatas(dataInicio, dataFim);
    },

    /**
     * Gera relatório de receita com período personalizado
     */
    gerarRelatorioReceitaPersonalizado: function() {
        const startDate = this.elements.periodoPersonalizadoFrom.value;
        const endDate = this.elements.periodoPersonalizadoTo.value;
        
        if (!startDate || !endDate) {
            Utils.showAlert('Por favor, selecione as datas inicial e final para o relatório.', 'error');
            return;
        }
        
        // Fecha o modal
        Utils.closeModal('modal-periodo-personalizado');
        
        // Gera o relatório com as datas selecionadas
        this.gerarRelatorioReceitaComDatas(startDate, endDate);
    },
    
    /**
     * Gera relatório de receita com datas específicas
     */
    gerarRelatorioReceitaComDatas: function(startDate, endDate) {
        // Estatísticas de serviços
        const statsServicos = ServicosModule.getServicosStats(startDate, endDate);
        
        // Calcula a receita apenas de serviços concluídos
        const servicosConcluidos = statsServicos.servicosFiltrados.filter(s => s.status === 'concluido');
        const receitaServicos = servicosConcluidos.reduce((total, servico) => {
            return total + (parseFloat(servico.valor) || 0);
        }, 0);
        
        // Estatísticas de vendas de peças - usando parseDate para comparações corretas
        const vendasPecas = DB.getVendasPecas().filter(venda => {
            const dataVenda = Utils.parseDate(venda.data);
            const inicio = Utils.parseDate(startDate);
            const fim = Utils.parseDate(endDate);
            fim.setHours(23, 59, 59); // Inclui todo o último dia
            
            return dataVenda >= inicio && dataVenda <= fim;
        });
        
        // Calcula receita e custo das vendas de peças
        let receitaVendas = 0;
        let custoVendas = 0;
        
        vendasPecas.forEach(venda => {
            const peca = DB.getPecaByCodigo(venda.codigoPeca);
            const quantidade = parseInt(venda.quantidade) || 0;
            const precoVenda = parseFloat(venda.precoVenda) || 0;
            const precoCusto = peca ? parseFloat(peca.preco) || 0 : 0;
            
            // Receita = preço de venda × quantidade
            receitaVendas += precoVenda * quantidade;
            
            // Custo = preço de compra × quantidade
            custoVendas += precoCusto * quantidade;
        });
        
        // Lucro das vendas = receita - custo
        const lucroVendas = receitaVendas - custoVendas;
        
        // Receita total (inclui serviços e lucro das vendas)
        const receitaTotal = receitaServicos + lucroVendas;
        
        // Formata o relatório
        let reportHtml = `
            <div class="report-header">
                <h3>Relatório de Receita</h3>
                <p>Período: ${Utils.formatDate(startDate)} a ${Utils.formatDate(endDate)}</p>
            </div>
            
            <div class="report-section">
                <p>Receita de Serviços: <strong>${Utils.formatCurrency(receitaServicos)}</strong></p>
                <p>Custo das Peças Vendidas: <strong>${Utils.formatCurrency(custoVendas)}</strong></p>
                <p>Lucro das Vendas de Peças: <strong>${Utils.formatCurrency(lucroVendas)}</strong></p>
                <p>Receita Total: <strong>${Utils.formatCurrency(receitaTotal)}</strong></p>
            </div>
            
            <div class="report-section">
                <h4>Detalhamento de Serviços Concluídos ${this.createToggleButton()}</h4>
                <div class="report-section-content">
        `;
        
        if (servicosConcluidos.length > 0) {
            reportHtml += `
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Aparelho</th>
                            <th>Data</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            servicosConcluidos.forEach(servico => {
                reportHtml += `
                    <tr>
                        <td>${servico.id}</td>
                        <td>${servico.nomeCliente}</td>
                        <td>${servico.aparelho}</td>
                        <td>${Utils.formatDate(servico.data)}</td>
                        <td>${Utils.formatCurrency(parseFloat(servico.valor) || 0)}</td>
                    </tr>
                `;
            });
            
            reportHtml += `
                    </tbody>
                </table>
            `;
        } else {
            reportHtml += `<p>Nenhum serviço concluído no período selecionado.</p>`;
        }
        
        reportHtml += `
            </div>
            </div>
            
            <div class="report-section">
                <h4>Detalhamento de Vendas de Peças ${this.createToggleButton()}</h4>
                <div class="report-section-content">
        `;
        
        if (vendasPecas.length > 0) {
            reportHtml += `
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Código da Peça</th>
                            <th>Quantidade</th>
                            <th>Data</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            vendasPecas.forEach(venda => {
                const peca = DB.getPecaByCodigo(venda.codigoPeca);
                reportHtml += `
                    <tr>
                        <td>${venda.id}</td>
                        <td>${venda.codigoPeca} ${peca ? `(${peca.descricao})` : ''}</td>
                        <td>${venda.quantidade}</td>
                        <td>${Utils.formatDate(venda.data)}</td>
                        <td>${Utils.formatCurrency(parseFloat(venda.precoVenda) || 0)}</td>
                    </tr>
                `;
            });
            
            reportHtml += `
                    </tbody>
                </table>
            `;
        } else {
            reportHtml += `<p>Nenhuma venda de peças no período selecionado.</p>`;
        }
        
        reportHtml += `
            </div>
            </div>
        `;
        
        // Exibe o relatório
        this.showReport(reportHtml);
    },

    /**
     * Exibe um relatório na área de resultado
     * @param {string} html - HTML do relatório
     */
    showReport: function(html) {
        if (!this.elements.reportResult) {
            console.error('Elemento de resultado não encontrado');
            return;
        }
        
        // Exibe o container
        this.elements.reportResult.style.display = 'block';
        
        // Define o conteúdo
        this.elements.reportResult.innerHTML = html;
        
        // Rola até o relatório
        this.elements.reportResult.scrollIntoView({ behavior: 'smooth' });
    }
};

// Quando o DOM estiver pronto, inicializa o módulo
document.addEventListener('DOMContentLoaded', function() {
    RelatoriosModule.init();
}); 