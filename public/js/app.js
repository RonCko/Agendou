// App principal
const app = {
    init() {
        // Inicializar módulos
        auth.init();
        appointments.init();

        // Mostrar página inicial
        this.showPage(auth.token ? 'dashboard' : 'login');
    },

    showPage(name) {
        // Esconder todas as páginas
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });
        
        // Mostrar página solicitada
        document.getElementById(`page-${name}`).style.display = 'block';
        
        // Carregar dados se necessário
        if (name === 'dashboard') {
            appointments.load();
        }
    }
};

// Iniciar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => app.init());