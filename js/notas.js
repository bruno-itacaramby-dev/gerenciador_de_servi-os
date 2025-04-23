/**
 * Notas.js
 * Módulo para gerenciamento de notas e recibos
 */

const Notas = {
    // Referências aos elementos do DOM
    elements: {
        servicoSelector: document.getElementById('nota-servico-selector'),
        previewButton: document.getElementById('btn-preview-nota'),
        generateButton: document.getElementById('btn-generate-nota'),
        serviceDetails: document.querySelector('.note-service-details'),
        notePreview: document.querySelector('.note-preview'),
        notaTemplate: document.querySelector('.note-template'),
        additionalItemsContainer: document.querySelector('.note-additional-items'),
        additionalItemsList: document.querySelector('.additional-items-list'),
        additionalItemDesc: document.getElementById('additional-item-desc'),
        additionalItemValue: document.getElementById('additional-item-value'),
        addItemButton: document.getElementById('btn-add-item'),
        removeItemButton: document.getElementById('btn-remove-item')
    },

    // Array para armazenar os itens adicionais
    additionalItems: [],

    // Flag para controlar se está gerando PDF
    isGeneratingPDF: false,

    /**
     * Reseta o formulário para o estado inicial
     */
    resetForm: function() {
        // Reseta o selector de serviço
        if (this.elements.servicoSelector) {
            this.elements.servicoSelector.value = '';
        }

        // Limpa os detalhes do serviço
        if (this.elements.serviceDetails) {
            this.elements.serviceDetails.innerHTML = '';
            this.elements.serviceDetails.classList.remove('active');
        }

        // Limpa o preview da nota
        if (this.elements.notePreview) {
            this.elements.notePreview.innerHTML = '';
        }

        // Esconde o container de itens adicionais
        if (this.elements.additionalItemsContainer) {
            this.elements.additionalItemsContainer.style.display = 'none';
        }

        // Limpa a lista de itens adicionais
        this.additionalItems = [];
        this.updateAdditionalItemsList();

        // Limpa os campos de item adicional
        this.clearAdditionalItemFields();

        // Desabilita os botões
        if (this.elements.previewButton) {
            this.elements.previewButton.disabled = true;
        }
        if (this.elements.generateButton) {
            this.elements.generateButton.disabled = true;
        }
    },

    /**
     * Inicializa o módulo de notas
     */
    init: function() {
        console.log('Inicializando módulo de notas...');
        this.refreshDOMReferences();
        
        // Verificar se os elementos foram encontrados
        console.log('Elementos encontrados:', {
            servicoSelector: !!this.elements.servicoSelector,
            previewButton: !!this.elements.previewButton,
            generateButton: !!this.elements.generateButton,
            serviceDetails: !!this.elements.serviceDetails,
            notePreview: !!this.elements.notePreview,
            notaTemplate: !!this.elements.notaTemplate,
            additionalItemsContainer: !!this.elements.additionalItemsContainer,
            additionalItemsList: !!this.elements.additionalItemsList,
            additionalItemDesc: !!this.elements.additionalItemDesc,
            additionalItemValue: !!this.elements.additionalItemValue,
            addItemButton: !!this.elements.addItemButton,
            removeItemButton: !!this.elements.removeItemButton
        });

        // Inicializar estado dos elementos
        if (this.elements.additionalItemsList) {
            this.elements.additionalItemsList.style.display = 'none';
        }
        
        this.setupListeners();
        this.carregarServicosCompletos();
    },

    /**
     * Atualiza as referências aos elementos DOM
     */
    refreshDOMReferences: function() {
        this.elements = {
            servicoSelector: document.getElementById('nota-servico-selector'),
            previewButton: document.getElementById('btn-preview-nota'),
            generateButton: document.getElementById('btn-generate-nota'),
            serviceDetails: document.querySelector('.note-service-details'),
            notePreview: document.querySelector('.note-preview'),
            notaTemplate: document.querySelector('.note-template'),
            additionalItemsContainer: document.querySelector('.note-additional-items'),
            additionalItemsList: document.querySelector('.additional-items-list'),
            additionalItemDesc: document.getElementById('additional-item-desc'),
            additionalItemValue: document.getElementById('additional-item-value'),
            addItemButton: document.getElementById('btn-add-item'),
            removeItemButton: document.getElementById('btn-remove-item')
        };

        // Verificar se todos os elementos foram encontrados
        for (const [key, element] of Object.entries(this.elements)) {
            if (!element) {
                console.error(`Elemento não encontrado: ${key}`);
            }
        }
    },

    /**
     * Configura os listeners de eventos
     */
    setupListeners: function() {
        console.log('Configurando listeners...');
        
        // Verificar se os elementos existem antes de adicionar os listeners
        if (!this.elements.addItemButton) {
            console.error('Botão Adicionar Item não encontrado. Tentando buscar novamente...');
            this.elements.addItemButton = document.getElementById('btn-add-item');
        }

        if (!this.elements.removeItemButton) {
            console.error('Botão Remover Item não encontrado. Tentando buscar novamente...');
            this.elements.removeItemButton = document.getElementById('btn-remove-item');
        }

        if (this.elements.servicoSelector) {
            console.log('Adicionando listener ao servicoSelector');
            this.elements.servicoSelector.addEventListener('change', this.exibirDetalhesServico.bind(this));
        }
        
        if (this.elements.previewButton) {
            console.log('Adicionando listener ao previewButton');
            this.elements.previewButton.addEventListener('click', this.previewNota.bind(this));
        }
        
        if (this.elements.generateButton) {
            console.log('Adicionando listener ao generateButton');
            this.elements.generateButton.addEventListener('click', this.generatePDF.bind(this));
        }

        if (this.elements.addItemButton) {
            console.log('Adicionando listener ao addItemButton');
            const self = this;
            this.elements.addItemButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Clique no botão Adicionar Item detectado');
                self.addItem();
            });
        } else {
            console.error('Botão Adicionar Item não encontrado após nova tentativa');
        }

        if (this.elements.removeItemButton) {
            console.log('Adicionando listener ao removeItemButton');
            this.elements.removeItemButton.addEventListener('click', this.removeLastItem.bind(this));
        }

        // Adiciona formatação monetária ao campo de valor
        if (this.elements.additionalItemValue) {
            let previousValue = '';
            let isTyping = false;

            this.elements.additionalItemValue.addEventListener('input', (e) => {
                isTyping = true;
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

            // Ao focar, guarda o valor atual mas não limpa o campo
            this.elements.additionalItemValue.addEventListener('focus', (e) => {
                previousValue = e.target.value;
                isTyping = false;
                
                // Adiciona evento para detectar primeira tecla
                const keydownHandler = (event) => {
                    // Se for tecla numérica ou backspace/delete
                    if (event.key.match(/[0-9]/) || event.key === 'Backspace' || event.key === 'Delete') {
                        if (!isTyping) {
                            e.target.value = ''; // Limpa apenas no primeiro caractere
                            isTyping = true;
                        }
                    }
                    // Remove o handler após primeira tecla
                    e.target.removeEventListener('keydown', keydownHandler);
                };
                
                e.target.addEventListener('keydown', keydownHandler);
            });

            // Ao perder foco, reaplica formatação ou restaura valor anterior
            this.elements.additionalItemValue.addEventListener('blur', (e) => {
                if (!e.target.value || e.target.value === 'R$ 0,00') {
                    e.target.value = previousValue || 'R$ 0,00';
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
     * Carrega os serviços com status "Concluído"
     */
    carregarServicosCompletos: function() {
        const servicos = Servicos.getServicos().filter(servico => servico.status === 'concluido');
        
        if (this.elements.servicoSelector) {
            // Limpa as opções existentes
            this.elements.servicoSelector.innerHTML = '<option value="">Selecione um serviço concluído</option>';
            
            // Adiciona os serviços completos como opções
            servicos.forEach(servico => {
                const option = document.createElement('option');
                option.value = servico.id;
                option.textContent = `${servico.id} - ${servico.nomeCliente || servico.cliente} (${Utils.formatDate(servico.data)})`;
                this.elements.servicoSelector.appendChild(option);
            });
        }
    },

    /**
     * Exibe os detalhes do serviço selecionado
     */
    exibirDetalhesServico: function() {
        const servicoId = this.elements.servicoSelector.value;
        
        if (!servicoId) {
            this.elements.serviceDetails.classList.remove('active');
            this.elements.additionalItemsContainer.style.display = 'none';
            // Limpar itens adicionais quando nenhum serviço estiver selecionado
            this.additionalItems = [];
            this.updateAdditionalItemsList();
            return;
        }
        
        const servico = Servicos.getServico(servicoId);
        
        if (servico) {
            // Limpar itens adicionais quando trocar de serviço
            this.additionalItems = [];
            this.updateAdditionalItemsList();
            
            // Exibe os detalhes do serviço
            this.elements.serviceDetails.innerHTML = `
                <div class="servico-info">
                    <p><strong>Cliente:</strong> ${servico.nomeCliente || servico.cliente || 'N/A'}</p>
                    <p><strong>ID:</strong> ${servico.id}</p>
                    <p><strong>Aparelho:</strong> ${servico.aparelho || 'N/A'}</p>
                    <p><strong>Data:</strong> ${Utils.formatDate(servico.data)}</p>
                    <p><strong>Telefone:</strong> ${servico.telefoneCliente || 'N/A'}</p>
                    <p><strong>Valor:</strong> ${Utils.formatCurrency(parseFloat(servico.valor) || 0)}</p>
                    ${servico.pecas && servico.pecas.length > 0 ? `<p><strong>Valor com peças:</strong> ${Utils.formatCurrency(parseFloat(servico.valor) + this.calcularValorPecas(servico.pecas))}</p>` : ''}
                </div>
            `;
            this.elements.serviceDetails.classList.add('active');
            this.elements.additionalItemsContainer.style.display = 'block';
            
            // Habilita os botões
            if (this.elements.previewButton) {
                this.elements.previewButton.disabled = false;
            }
            
            if (this.elements.generateButton) {
                this.elements.generateButton.disabled = false;
            }
        }
    },

    /**
     * Calcula o valor total das peças
     * @param {Array} pecas - Array de peças
     * @returns {number} - Valor total das peças
     */
    calcularValorPecas: function(pecas) {
        if (!pecas || !pecas.length) return 0;
        
        return pecas.reduce((total, peca) => {
            const precoPeca = parseFloat(peca.valor || peca.preco || 0);
            const quantidade = parseInt(peca.quantidade) || 1;
            return total + (precoPeca * quantidade);
        }, 0);
    },

    /**
     * Adiciona um novo item ao recibo
     */
    addItem: function() {
        console.log('Método addItem chamado');
        
        // Tentar buscar os elementos novamente caso não existam
        if (!this.elements.additionalItemDesc) {
            this.elements.additionalItemDesc = document.getElementById('additional-item-desc');
        }
        if (!this.elements.additionalItemValue) {
            this.elements.additionalItemValue = document.getElementById('additional-item-value');
        }

        // Verificar se os elementos existem
        if (!this.elements.additionalItemDesc || !this.elements.additionalItemValue) {
            console.error('Elementos de entrada não encontrados:', {
                additionalItemDesc: !!this.elements.additionalItemDesc,
                additionalItemValue: !!this.elements.additionalItemValue
            });
            return;
        }

        // Remover classes de erro anteriores
        this.elements.additionalItemDesc.classList.remove('error');
        this.elements.additionalItemValue.classList.remove('error');

        // Obter os valores dos campos
        const descricao = this.elements.additionalItemDesc.value ? this.elements.additionalItemDesc.value.trim() : '';
        const valorStr = this.elements.additionalItemValue.value ? this.elements.additionalItemValue.value.trim() : '';
        
        console.log('Valores dos campos:', {
            descricao: descricao,
            valorStr: valorStr,
            elementoDesc: this.elements.additionalItemDesc,
            elementoValor: this.elements.additionalItemValue
        });
        
        // Verificar campos vazios e adicionar feedback visual
        let hasError = false;
        
        if (!descricao) {
            this.elements.additionalItemDesc.classList.add('error');
            hasError = true;
        }
        
        if (!valorStr || valorStr === 'R$ 0,00') {
            this.elements.additionalItemValue.classList.add('error');
            hasError = true;
        }

        if (hasError) {
            return;
        }
        
        // Converter o valor formatado para número
        const valor = parseFloat(valorStr.replace('R$ ', '').replace(/\./g, '').replace(',', '.'));

        console.log('Valores processados:', {
            descricao: descricao,
            valorOriginal: valorStr,
            valorConvertido: valor
        });

        if (isNaN(valor) || valor <= 0) {
            this.elements.additionalItemValue.classList.add('error');
            return;
        }

        console.log('Adicionando item:', { descricao, valor });
        this.additionalItems.push({ descricao, valor });
        this.updateAdditionalItemsList();
        this.clearAdditionalItemFields();
        this.previewNota(); // Atualiza o preview com o novo item
    },

    /**
     * Remove o último item adicionado
     */
    removeLastItem: function() {
        if (this.additionalItems.length > 0) {
            this.additionalItems.pop();
            this.updateAdditionalItemsList();
            this.previewNota(); // Atualiza o preview sem o item removido
        }
    },

    /**
     * Atualiza a lista de itens adicionais na interface
     */
    updateAdditionalItemsList: function() {
        if (!this.elements.additionalItemsList) return;

        if (this.additionalItems.length === 0) {
            this.elements.additionalItemsList.style.display = 'none';
            return;
        }

        this.elements.additionalItemsList.style.display = 'block';
        this.elements.additionalItemsList.innerHTML = this.additionalItems.map((item, index) => `
            <div class="additional-item" style="margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span style="margin-right: 10px;">${index + 1}.</span>
                    <span style="margin-right: 20px;">${item.descricao}</span>
                    <span>${Utils.formatCurrency(item.valor)}</span>
                </div>
                <button class="btn-remove-item" data-index="${index}" style="background: none; border: none; color: #ff4444; cursor: pointer; padding: 5px; font-weight: bold;">×</button>
            </div>
        `).join('');

        // Adiciona listeners para os botões de remoção
        const removeButtons = this.elements.additionalItemsList.querySelectorAll('.btn-remove-item');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.removeItem(index);
            });
        });
    },

    /**
     * Remove um item específico da lista
     * @param {number} index - Índice do item a ser removido
     */
    removeItem: function(index) {
        if (index >= 0 && index < this.additionalItems.length) {
            this.additionalItems.splice(index, 1);
            this.updateAdditionalItemsList();
            this.previewNota(); // Atualiza o preview sem o item removido
        }
    },

    /**
     * Limpa os campos de entrada de itens adicionais
     */
    clearAdditionalItemFields: function() {
        if (this.elements.additionalItemDesc) this.elements.additionalItemDesc.value = '';
        if (this.elements.additionalItemValue) this.elements.additionalItemValue.value = '';
    },

    /**
     * Gera a visualização da nota
     */
    previewNota: function() {
        const servicoId = this.elements.servicoSelector.value;
        
        if (!servicoId) {
            alert('Selecione um serviço para gerar a nota.');
            return;
        }
        
        const servico = Servicos.getServico(servicoId);
        
        if (servico) {
            const valorTotal = parseFloat(servico.valor || 0) + 
                             this.calcularValorPecas(servico.pecas || []) +
                             this.additionalItems.reduce((total, item) => total + item.valor, 0);
            const dataAtual = new Date();
            const dia = String(dataAtual.getDate()).padStart(2, '0');
            const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
            const ano = dataAtual.getFullYear();
            
            // Geração das linhas da tabela para as peças
            let linhasPecas = '';
            if (servico.pecas && servico.pecas.length > 0) {
                servico.pecas.forEach(peca => {
                    const quantidade = peca.quantidade || 1;
                    const valorUnitario = parseFloat(peca.preco || peca.valorUnitario || 0);
                    const subtotal = quantidade * valorUnitario;
                    
                    linhasPecas += `
                        <tr>
                            <td style="border: 2px solid #000; padding: 5px;">${peca.nome || peca.descricao || 'N/A'}</td>
                            <td style="text-align: right; border: 2px solid #000; padding: 5px;">${Utils.formatCurrency(subtotal)}</td>
                        </tr>
                    `;
                });
            }
            
            // Adiciona uma linha para o serviço
            linhasPecas += `
                <tr>
                    <td style="border: 2px solid #000; padding: 5px;">${servico.problema || servico.descricao || 'Serviço de assistência técnica'}</td>
                    <td style="text-align: right; border: 2px solid #000; padding: 5px;">${Utils.formatCurrency(parseFloat(servico.valor || 0))}</td>
                </tr>
            `;

            // Adiciona os itens adicionais
            this.additionalItems.forEach(item => {
                linhasPecas += `
                    <tr>
                        <td style="border: 2px solid #000; padding: 5px;">${item.descricao}</td>
                        <td style="text-align: right; border: 2px solid #000; padding: 5px;">${Utils.formatCurrency(item.valor)}</td>
                    </tr>
                `;
            });
            
            // Adiciona linhas vazias para preencher a tabela se necessário
            const totalLinhas = (servico.pecas ? servico.pecas.length : 0) + 1 + this.additionalItems.length;
            const linhasVazias = Array(Math.max(0, 10 - totalLinhas)).fill().map(() => `
                <tr>
                    <td style="border: 2px solid #000; height: 25px;"></td>
                    <td style="border: 2px solid #000;"></td>
                </tr>
            `).join('');
            
            // Gera o HTML da nota seguindo o modelo da imagem (sem marca d'água)
            const notaHTML = `
                <div class="note-template" style="font-size: 17.5px; width: 100%; border: 2px solid #000; padding: 10px; box-sizing: border-box; font-family: Arial, sans-serif; background-color: white; position: relative; overflow: hidden;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                        <div style="flex: 2;">
                            <h2 style="font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase;">MonizaTech Refrigeração</h2>
                            <p style="font-size: 16px; margin: 5px 0; text-transform: uppercase;">ASSISTÊNCIA TÉCNICA</p>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 10px; text-align: right;">
                        <span>Data: ______/______/________</span>
                    </div>
                    
                    <div style="margin-bottom: 5px;">
                        <span style="display: inline-block; width: 50px;">Nome:</span>
                        <span style="display: inline-block; width: calc(100% - 60px); border-bottom: 1px solid #000;">${servico.nomeCliente || 'N/A'}</span>
                    </div>
                    
                    <div style="margin-bottom: 20px; display: flex; align-items: center;">
                        <span style="white-space: nowrap;">Modelo:</span>
                        <span style="flex: 1; border-bottom: 1px solid #000; margin-left: 5px;">${servico.aparelho || 'N/A'}</span>
                    </div>
                    
                    <div style="width: 100%; border: 2px solid #000; margin-bottom: 20px; position: relative; background: transparent;">
                        <table style="width: 100%; border-collapse: collapse; background: transparent;">
                            <thead>
                                <tr>
                                    <th style="width: 70%; background-color: rgba(204, 204, 204, 0.7); border: 2px solid #000; padding: 5px; color: #000;">Descrição</th>
                                    <th style="width: 30%; background-color: rgba(204, 204, 204, 0.7); border: 2px solid #000; padding: 5px; text-align: right; color: #000;">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${linhasPecas}
                                ${linhasVazias}
                            </tbody>
                        </table>
                    </div>
                    
                    <div style="text-align: right; margin-top: 10px; margin-bottom: 10px; display: flex; justify-content: flex-end; align-items: center;">
                        <span style="font-weight: bold; font-size: 18px; line-height: 30px; padding-right: 10px;">TOTAL R$</span>
                        <div style="width: 150px; height: 30px; border: 2px solid #000; background-color: rgba(240, 240, 240, 0.7); text-align: right; font-weight: bold; line-height: 30px; padding-right: 5px;">
                            ${Utils.formatCurrency(valorTotal)}
                        </div>
                    </div>
                </div>
            `;
            
            this.elements.notePreview.innerHTML = notaHTML;
        }
    },

    /**
     * Gera o PDF da nota
     */
    generatePDF: function() {
        const servicoId = this.elements.servicoSelector.value;
        
        if (!servicoId) {
            return;
        }
        
        const servico = Servicos.getServico(servicoId);
        if (!servico) return;
        
        // Verifica se a nota foi visualizada antes
        if (!this.elements.notePreview.innerHTML.trim()) {
            this.previewNota();
        }
        
        // Obtém o elemento da nota antes de resetar
        const element = this.elements.notePreview.querySelector('.note-template');
        
        if (!element) {
            alert('Erro ao gerar a nota. Tente novamente.');
            return;
        }

        // Guarda o conteúdo da nota
        const notaContent = element.outerHTML;
        
        // Reseta o formulário imediatamente
        this.resetForm();
        
        // Cria um novo documento para impressão
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Por favor, permita popups para este site para gerar o PDF.');
            return;
        }
        
        // Estiliza o conteúdo para impressão
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Nota de Serviço ${servico.id}</title>
                <meta charset="utf-8">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                    }
                    
                    .print-container {
                        width: 210mm;
                        min-height: 200mm;
                        padding: 15mm;
                        margin: 0 auto;
                        position: relative;
                    }
                    
                    .watermark {
                        position: absolute;
                        top: 38%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        opacity: 0.25;
                        z-index: 0;
                        pointer-events: none;
                        width: 500px;
                        height: auto;
                    }
                    
                    .content {
                        position: relative;
                        z-index: 1;
                    }
                    
                    @media print {
                        html, body {
                            width: 210mm;
                            height: 297mm;
                        }
                        .print-container {
                            margin: 0;
                            padding: 15mm;
                            border: none;
                            box-shadow: none;
                        }
                        .no-print {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-container">
                    <div class="no-print" style="text-align: center; margin-bottom: 20px;">
                        <button onclick="window.print();return false;" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">
                            Imprimir / Salvar como PDF
                        </button>
                        <p style="font-size: 14px; margin-top: 10px;">Dica: Na caixa de diálogo de impressão, escolha "Salvar como PDF" para gerar um arquivo PDF.</p>
                    </div>
                    
                    <img src="img/logo.png" class="watermark" />
                    
                    <div class="content">
                        ${element.innerHTML}
                    </div>
                </div>
                
                <script>
                    // Auto-impressão após carregar
                    window.addEventListener('load', function() {
                        // Aguarda 1 segundo para garantir que a imagem seja carregada
                        setTimeout(function() {
                            // window.print();
                        }, 1000);
                    });
                </script>
            </body>
            </html>
        `;
        
        // Escreve o conteúdo na janela de impressão
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
    },
    
    /**
     * Gera uma tabela HTML para as peças (mantido para compatibilidade)
     * @param {Array} pecas - Array de peças
     * @returns {string} - HTML da tabela de peças
     */
    gerarTabelaPecas: function(pecas) {
        if (!pecas || !pecas.length) return '';
        
        let tableHTML = '';
        pecas.forEach(peca => {
            const quantidade = peca.quantidade || 1;
            const valorUnitario = parseFloat(peca.preco || peca.valorUnitario || 0);
            const subtotal = quantidade * valorUnitario;
            
            tableHTML += `
                <tr>
                    <td style="border: 2px solid #000; padding: 5px;">${peca.nome || peca.descricao || 'N/A'}</td>
                    <td style="text-align: right; border: 2px solid #000; padding: 5px;">${Utils.formatCurrency(subtotal)}</td>
                </tr>
            `;
        });
        
        return tableHTML;
    }
};

// Quando o DOM estiver pronto, inicializa o módulo de Notas
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, configurando observador para a página de notas...');
    
    // Verificamos se estamos na página de Notas antes de inicializar
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.classList.contains('active') && mutation.target.id === 'notas') {
                console.log('Página de notas ativada, inicializando módulo...');
                Notas.init();
            }
        });
    });

    const notasPage = document.getElementById('notas');
    if (notasPage) {
        console.log('Página de notas encontrada, configurando observer...');
        observer.observe(notasPage, { attributes: true });
        
        // Inicializa também se a página já estiver ativa
        if (notasPage.classList.contains('active')) {
            console.log('Página de notas já está ativa, inicializando módulo...');
            Notas.init();
        }
    } else {
        console.error('Página de notas não encontrada no DOM');
    }
}); 