// Auth state e handlers
const auth = {
    user: null,
    token: localStorage.getItem('token'),

    init() {
        const user = localStorage.getItem('user');
        if (user) {
            this.user = JSON.parse(user);
            this.updateUI();
        }

        // Event listeners
        document.getElementById('form-login').addEventListener('submit', this.handleLogin);
        document.getElementById('form-register').addEventListener('submit', this.handleRegister);
    },

    async handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        try {
            const { user, token } = await api.login(
                form.email.value,
                form.password.value
            );
            auth.setSession(user, token);
            app.showPage('dashboard');
        } catch (err) {
            alert(err.message);
        }
    },

    async handleRegister(e) {
        e.preventDefault();
        const form = e.target;
        try {
            const { user, token } = await api.register(
                form.name.value,
                form.email.value,
                form.password.value
            );
            auth.setSession(user, token);
            app.showPage('dashboard');
        } catch (err) {
            alert(err.message);
        }
    },

    setSession(user, token) {
        this.user = user;
        this.token = token;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        this.updateUI();
    },

    logout() {
        this.user = null;
        this.token = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this.updateUI();
        app.showPage('login');
    },

    updateUI() {
        const navUser = document.getElementById('nav-user');
        if (this.user) {
            navUser.innerHTML = `
                <span>Olá, ${this.user.name}</span>
                <button onclick="auth.logout()">Sair</button>
            `;
        } else {
            navUser.innerHTML = '';
        }
    }
};