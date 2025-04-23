/**
 * App.js
 * Script principal da aplicação
 */

const App = {
    // Referências aos elementos do DOM
    elements: {
        navLinks: document.querySelectorAll('.nav-link'),
        pages: document.querySelectorAll('.page')
    },

    /**
     * Inicializa a aplicação
     */
    init: function() {
        // Atualiza as referências aos elementos DOM (importante para elementos adicionados dinamicamente)
        this.refreshDOMReferences();
        this.setupListeners();
        this.setupModalClosers();
        
        // Verifica se há uma página ativa armazenada no localStorage
        const lastActivePage = localStorage.getItem('active_page');
        if (lastActivePage) {
            this.changePage(lastActivePage);
        }
    },

    /**
     * Atualiza as referências aos elementos DOM
     */
    refreshDOMReferences: function() {
        this.elements.navLinks = document.querySelectorAll('.nav-link');
        this.elements.pages = document.querySelectorAll('.page');
    },

    /**
     * Configura os listeners de eventos
     */
    setupListeners: function() {
        // Links de navegação
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.changePage(page);
            });
        });
    },

    /**
     * Configura fechamento de modais ao clicar fora
     */
    setupModalClosers: function() {
        // Lista de todos os modais
        const modals = document.querySelectorAll('.modal');
        
        // Adiciona evento de clique para fechar modal quando clica fora do conteúdo
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    },

    /**
     * Muda a página ativa
     * @param {string} pageId - ID da página a ser ativada
     */
    changePage: function(pageId) {
        // Desativa todos os links e páginas
        this.elements.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        this.elements.pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Ativa o link e a página correspondente
        const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
        const activePage = document.getElementById(pageId);
        
        if (activeLink && activePage) {
            activeLink.classList.add('active');
            activePage.classList.add('active');
            
            // Salva a página ativa no localStorage
            localStorage.setItem('active_page', pageId);
        }
    }
};

// Quando o DOM estiver pronto, inicializa a aplicação
document.addEventListener('DOMContentLoaded', function() {
    App.init();
}); 