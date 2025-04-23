/**
 * Configuracoes.js
 * Módulo responsável pela gestão de configurações e operações de importação/exportação
 */

const ConfiguracoesModule = {
    // Referências aos elementos do DOM
    elements: {
        btnExportarDados: document.getElementById('btn-exportar-dados'),
        inputImportarDados: document.getElementById('input-importar-dados'),
        btnImportarDados: document.getElementById('btn-importar-dados'),
        btnLimparDados: document.getElementById('btn-limpar-dados')
    },

    /**
     * Inicializa o módulo de configurações
     */
    init: function() {
        this.setupListeners();
    },

    /**
     * Configura os listeners de eventos
     */
    setupListeners: function() {
        const self = this;
        
        // Exportar dados
        if (this.elements.btnExportarDados) {
            this.elements.btnExportarDados.addEventListener('click', function() {
                self.exportarDados();
            });
        }
        
        // Importar dados
        if (this.elements.btnImportarDados) {
            this.elements.btnImportarDados.addEventListener('click', function() {
                self.importarDados();
            });
        }
        
        // Limpar dados
        if (this.elements.btnLimparDados) {
            this.elements.btnLimparDados.addEventListener('click', function() {
                self.limparDados();
            });
        }
    },

    /**
     * Exporta todos os dados do sistema para um arquivo JSON
     */
    exportarDados: function() {
        try {
            // Obtém todos os dados
            const data = DB.exportAllData();
            
            // Converte para JSON string
            const jsonString = JSON.stringify(data, null, 2);
            
            // Cria um blob para download
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Cria um elemento de link para download
            const a = document.createElement('a');
            a.href = url;
            
            // Nome do arquivo com data atual no formato dd_mm_aaaa
            const today = new Date();
            const day = today.getDate().toString().padStart(2, '0');
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const year = today.getFullYear();
            a.download = `Backup Dados - ${day}_${month}_${year}.json`;
            
            // Clica no link para iniciar o download
            document.body.appendChild(a);
            a.click();
            
            // Limpa
            setTimeout(function() {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 0);
            
            Utils.showAlert('Dados exportados com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            Utils.showAlert('Erro ao exportar dados. Tente novamente.', 'error');
        }
    },

    /**
     * Importa dados de um arquivo JSON
     */
    importarDados: function() {
        const fileInput = this.elements.inputImportarDados;
        
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            Utils.showAlert('Por favor, selecione um arquivo JSON válido para importar.', 'error');
            return;
        }
        
        const file = fileInput.files[0];
        
        // Verifica se é um arquivo JSON
        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            Utils.showAlert('O arquivo selecionado não é um JSON válido.', 'error');
            return;
        }
        
        // Confirmação do usuário
        const confirmed = Utils.confirm(
            'ATENÇÃO: Esta ação substituirá todos os dados atuais do sistema. ' +
            'Deseja continuar com a importação?'
        );
        
        if (!confirmed) {
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                
                // Valida minimamente os dados
                if (!data.servicos || !data.pecas || !data.vendas_pecas || !data.next_id) {
                    Utils.showAlert('O arquivo não contém dados válidos para importação.', 'error');
                    return;
                }
                
                // Importa os dados
                const success = DB.importAllData(data);
                
                if (success) {
                    Utils.showAlert('Dados importados com sucesso! Recarregando a página...', 'success');
                    
                    // Recarrega a página para atualizar todos os módulos
                    setTimeout(function() {
                        window.location.reload();
                    }, 1500);
                } else {
                    Utils.showAlert('Erro ao importar dados. Verifique se o formato é válido.', 'error');
                }
            } catch (error) {
                console.error('Erro ao processar arquivo:', error);
                Utils.showAlert('Erro ao processar o arquivo. Verifique se é um JSON válido.', 'error');
            }
        };
        
        reader.onerror = function() {
            Utils.showAlert('Erro ao ler o arquivo. Tente novamente.', 'error');
        };
        
        reader.readAsText(file);
    },

    /**
     * Limpa todos os dados do sistema
     */
    limparDados: function() {
        // Confirmação dupla para evitar acidentes
        const confirmed1 = Utils.confirm(
            '⚠️ ATENÇÃO! Você está prestes a apagar TODOS os dados do sistema. ' +
            'Esta ação é IRREVERSÍVEL!'
        );
        
        if (!confirmed1) {
            return;
        }
        
        const confirmed2 = Utils.confirm(
            '⚠️ CONFIRMAÇÃO FINAL: Todos os serviços, peças e vendas serão PERMANENTEMENTE EXCLUÍDOS. ' +
            'Tem certeza que deseja continuar?'
        );
        
        if (!confirmed2) {
            return;
        }
        
        // Limpa os dados
        const success = DB.clearAllData();
        
        if (success) {
            Utils.showAlert('Todos os dados foram apagados com sucesso! Recarregando a página...', 'success');
            
            // Recarrega a página para atualizar todos os módulos
            setTimeout(function() {
                window.location.reload();
            }, 1500);
        } else {
            Utils.showAlert('Erro ao limpar os dados. Tente novamente.', 'error');
        }
    }
};

// Quando o DOM estiver pronto, inicializa o módulo
document.addEventListener('DOMContentLoaded', function() {
    ConfiguracoesModule.init();
}); 