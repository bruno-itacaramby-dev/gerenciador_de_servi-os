/**
 * Módulo responsável pela geração e atualização dos gráficos
 */
const GraficosModule = {
    // Referências aos elementos do DOM
    elements: {
        periodSelect: document.getElementById('grafico-periodo'),
        dataInicio: document.getElementById('grafico-data-inicio'),
        dataFim: document.getElementById('grafico-data-fim'),
        btnAtualizar: document.getElementById('btn-atualizar-graficos'),
        
        // Canvas dos gráficos
        canvasFaturamento: document.getElementById('grafico-faturamento'),
        canvasServicos: document.getElementById('grafico-servicos'),
        canvasPecas: document.getElementById('grafico-pecas'),
        
        // Elementos do modal de tela cheia
        modalFullscreen: document.getElementById('modal-grafico-fullscreen'),
        modalTitle: document.getElementById('modal-grafico-title'),
        canvasFullscreen: document.getElementById('grafico-fullscreen'),
        btnFullscreen: document.querySelectorAll('.btn-fullscreen')
    },

    // Instâncias dos gráficos
    charts: {
        faturamento: null,
        servicos: null,
        pecas: null,
        fullscreen: null
    },

    // Gráfico atual em tela cheia
    currentFullscreenChart: null,

    /**
     * Inicializa o módulo de gráficos
     */
    init: function() {
        // Registra o plugin de datalabels
        Chart.register(ChartDataLabels);
        
        this.setupListeners();
        this.initCharts();
        
        // Define data inicial como primeiro dia do mês atual
        const hoje = new Date();
        const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        this.elements.dataInicio.value = Utils.formatDateForInput(primeiroDia);
        
        // Define data final como hoje
        this.elements.dataFim.value = Utils.formatDateForInput(hoje);
        
        // Carrega os dados iniciais
        this.atualizarGraficos();
    },

    /**
     * Configura os listeners de eventos
     */
    setupListeners: function() {
        // Atualiza os gráficos quando clicar no botão
        this.elements.btnAtualizar.addEventListener('click', () => {
            this.atualizarGraficos();
        });

        // Atualiza os gráficos quando mudar o período
        this.elements.periodSelect.addEventListener('change', () => {
            this.atualizarGraficos();
        });
        
        // Configura os botões de tela cheia
        this.elements.btnFullscreen.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const graficoId = e.target.getAttribute('data-grafico');
                this.abrirGraficoTelaCheia(graficoId);
            });
        });
        
        // Fecha o modal de tela cheia
        const closeBtn = this.elements.modalFullscreen.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            this.fecharGraficoTelaCheia();
        });
        
        // Fecha o modal ao clicar fora dele
        this.elements.modalFullscreen.addEventListener('click', (e) => {
            if (e.target === this.elements.modalFullscreen) {
                this.fecharGraficoTelaCheia();
            }
        });
    },

    /**
     * Inicializa os gráficos vazios
     */
    initCharts: function() {
        // Configuração base para todos os gráficos
        const config = {
            type: 'line',
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            padding: 10
                        }
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': R$ ' + context.parsed.y.toLocaleString('pt-BR');
                            }
                        }
                    },
                    datalabels: {
                        display: false // Desativa por padrão nos gráficos normais
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                }
            }
        };

        // Inicializa gráfico de faturamento
        this.charts.faturamento = new Chart(this.elements.canvasFaturamento, {
            ...config,
            data: {
                labels: [],
                datasets: [{
                    label: 'Faturamento Total',
                    data: [],
                    borderColor: '#2c3e50',
                    tension: 0.1,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            }
        });

        // Inicializa gráfico de serviços
        this.charts.servicos = new Chart(this.elements.canvasServicos, {
            ...config,
            data: {
                labels: [],
                datasets: [{
                    label: 'Receita de Serviços',
                    data: [],
                    borderColor: '#3498db',
                    tension: 0.1,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            }
        });

        // Inicializa gráfico de peças
        this.charts.pecas = new Chart(this.elements.canvasPecas, {
            ...config,
            data: {
                labels: [],
                datasets: [{
                    label: 'Receita de Peças',
                    data: [],
                    borderColor: '#e74c3c',
                    tension: 0.1,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            }
        });
        
        // Ajusta o tamanho dos gráficos após a inicialização
        setTimeout(() => {
            this.charts.faturamento.resize();
            this.charts.servicos.resize();
            this.charts.pecas.resize();
        }, 100);
        
        // Adiciona listener para redimensionar os gráficos quando a janela for redimensionada
        window.addEventListener('resize', () => {
            this.charts.faturamento.resize();
            this.charts.servicos.resize();
            this.charts.pecas.resize();
        });
    },

    /**
     * Abre o gráfico em tela cheia
     * @param {string} graficoId - ID do gráfico a ser exibido
     */
    abrirGraficoTelaCheia: function(graficoId) {
        // Armazena o gráfico atual
        this.currentFullscreenChart = graficoId;
        
        // Atualiza o título do modal
        let titulo = '';
        switch(graficoId) {
            case 'faturamento':
                titulo = 'Faturamento Total';
                break;
            case 'servicos':
                titulo = 'Receita de Serviços';
                break;
            case 'pecas':
                titulo = 'Receita de Peças';
                break;
        }
        this.elements.modalTitle.textContent = titulo;
        
        // Configuração para o gráfico em tela cheia
        const config = {
            type: 'line',
            data: this.charts[graficoId].data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: 16
                            }
                        }
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': R$ ' + context.parsed.y.toLocaleString('pt-BR');
                            }
                        }
                    },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'top',
                        offset: 5,
                        formatter: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        },
                        font: {
                            weight: 'bold',
                            size: 14
                        },
                        color: '#333',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: 4,
                        padding: 4
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            },
                            font: {
                                size: 14
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 14
                            }
                        }
                    }
                }
            }
        };
        
        // Destrói o gráfico anterior se existir
        if (this.charts.fullscreen) {
            this.charts.fullscreen.destroy();
        }
        
        // Cria o novo gráfico
        this.charts.fullscreen = new Chart(this.elements.canvasFullscreen, config);
        
        // Exibe o modal
        this.elements.modalFullscreen.style.display = 'block';
        
        // Ajusta o tamanho do gráfico após a exibição
        setTimeout(() => {
            this.charts.fullscreen.resize();
        }, 100);
    },
    
    /**
     * Fecha o gráfico em tela cheia
     */
    fecharGraficoTelaCheia: function() {
        // Esconde o modal
        this.elements.modalFullscreen.style.display = 'none';
        
        // Destrói o gráfico
        if (this.charts.fullscreen) {
            this.charts.fullscreen.destroy();
            this.charts.fullscreen = null;
        }
        
        // Limpa o gráfico atual
        this.currentFullscreenChart = null;
    },

    /**
     * Atualiza os dados dos gráficos
     */
    atualizarGraficos: function() {
        const periodo = this.elements.periodSelect.value;
        const dataInicio = this.elements.dataInicio.value;
        const dataFim = this.elements.dataFim.value;

        // Obtém os dados do período selecionado
        const dados = this.getDadosPeriodo(dataInicio, dataFim, periodo);

        // Atualiza cada gráfico
        this.atualizarGraficoFaturamento(dados);
        this.atualizarGraficoServicos(dados);
        this.atualizarGraficoPecas(dados);
        
        // Se houver um gráfico em tela cheia, atualiza-o também
        if (this.currentFullscreenChart) {
            this.abrirGraficoTelaCheia(this.currentFullscreenChart);
        }
    },

    /**
     * Obtém os dados agrupados por período
     */
    getDadosPeriodo: function(dataInicio, dataFim, periodo) {
        const servicos = DB.getServicos();
        const vendas = DB.getVendasPecas();
        const dados = {};

        // Filtra os dados pelo período
        const servicosFiltrados = servicos.filter(servico => {
            const data = new Date(servico.data);
            return data >= new Date(dataInicio) && data <= new Date(dataFim);
        });

        const vendasFiltradas = vendas.filter(venda => {
            const data = new Date(venda.data);
            return data >= new Date(dataInicio) && data <= new Date(dataFim);
        });

        // Agrupa os dados conforme o período selecionado
        servicosFiltrados.forEach(servico => {
            let chave = this.getChavePeriodo(new Date(servico.data), periodo);
            
            if (!dados[chave]) {
                dados[chave] = {
                    servicos: 0,
                    pecas: 0,
                    total: 0
                };
            }
            
            const valor = parseFloat(servico.valor) || 0;
            dados[chave].servicos += valor;
            dados[chave].total += valor;
        });

        vendasFiltradas.forEach(venda => {
            let chave = this.getChavePeriodo(new Date(venda.data), periodo);
            
            if (!dados[chave]) {
                dados[chave] = {
                    servicos: 0,
                    pecas: 0,
                    total: 0
                };
            }
            
            // Obtém a peça para calcular o lucro
            const peca = DB.getPecaByCodigo(venda.codigoPeca);
            const quantidade = parseInt(venda.quantidade) || 0;
            const precoVenda = parseFloat(venda.precoVenda) || 0;
            const precoCusto = peca ? parseFloat(peca.preco) || 0 : 0;
            
            // Calcula o lucro (preço de venda - preço de custo) × quantidade
            const lucro = (precoVenda - precoCusto) * quantidade;
            
            dados[chave].pecas += lucro;
            dados[chave].total += lucro;
        });

        return dados;
    },

    /**
     * Gera a chave do período para agrupamento
     */
    getChavePeriodo: function(data, periodo) {
        switch (periodo) {
            case 'diario':
                return Utils.formatDateForInput(data);
            
            case 'mensal':
                return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
            
            case 'trimestral':
                const trimestre = Math.floor(data.getMonth() / 3) + 1;
                return `${data.getFullYear()}-T${trimestre}`;
        }
    },

    /**
     * Formata o label do período para exibição
     */
    formatLabelPeriodo: function(chave, periodo) {
        switch (periodo) {
            case 'diario':
                return new Date(chave).toLocaleDateString('pt-BR');
            
            case 'mensal':
                const [ano, mes] = chave.split('-');
                return `${mes}/${ano}`;
            
            case 'trimestral':
                const [anoTrim, trimestre] = chave.split('-T');
                return `${trimestre}º Trim/${anoTrim}`;
        }
    },

    /**
     * Atualiza o gráfico de faturamento total
     */
    atualizarGraficoFaturamento: function(dados) {
        const periodo = this.elements.periodSelect.value;
        const labels = Object.keys(dados).sort().map(chave => this.formatLabelPeriodo(chave, periodo));
        const values = Object.keys(dados).sort().map(chave => dados[chave].total);

        this.charts.faturamento.data.labels = labels;
        this.charts.faturamento.data.datasets[0].data = values;
        this.charts.faturamento.update();
    },

    /**
     * Atualiza o gráfico de serviços
     */
    atualizarGraficoServicos: function(dados) {
        const periodo = this.elements.periodSelect.value;
        const labels = Object.keys(dados).sort().map(chave => this.formatLabelPeriodo(chave, periodo));
        const values = Object.keys(dados).sort().map(chave => dados[chave].servicos);

        this.charts.servicos.data.labels = labels;
        this.charts.servicos.data.datasets[0].data = values;
        this.charts.servicos.update();
    },

    /**
     * Atualiza o gráfico de peças
     */
    atualizarGraficoPecas: function(dados) {
        const periodo = this.elements.periodSelect.value;
        const labels = Object.keys(dados).sort().map(chave => this.formatLabelPeriodo(chave, periodo));
        const values = Object.keys(dados).sort().map(chave => dados[chave].pecas);

        this.charts.pecas.data.labels = labels;
        this.charts.pecas.data.datasets[0].data = values;
        this.charts.pecas.update();
    }
};

// Inicializa o módulo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    GraficosModule.init();
}); 