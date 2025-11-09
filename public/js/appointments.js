// Gerenciamento de agendamentos
const appointments = {
    items: [],

    init() {
        // Event listeners
        document.getElementById('btn-new-appointment').addEventListener('click', () => {
            document.getElementById('modal-appointment').style.display = 'flex';
        });

        document.getElementById('btn-cancel-appointment').addEventListener('click', () => {
            document.getElementById('modal-appointment').style.display = 'none';
        });

        document.getElementById('form-appointment').addEventListener('submit', this.handleCreate);

        if (auth.token) {
            this.load();
        }
    },

    async load() {
        try {
            this.items = await api.getAppointments();
            this.render();
        } catch (err) {
            alert(err.message);
        }
    },

    async handleCreate(e) {
        e.preventDefault();
        const form = e.target;
        try {
            const appointment = await api.createAppointment({
                patientName: form.patientName.value,
                date: form.date.value,
                notes: form.notes.value
            });
            appointments.items.unshift(appointment);
            appointments.render();
            form.reset();
            document.getElementById('modal-appointment').style.display = 'none';
        } catch (err) {
            alert(err.message);
        }
    },

    async handleDelete(id) {
        if (!confirm('Remover este agendamento?')) return;
        try {
            await api.deleteAppointment(id);
            this.items = this.items.filter(a => a.id !== id);
            this.render();
        } catch (err) {
            alert(err.message);
        }
    },

    render() {
        const list = document.getElementById('appointments-list');
        list.innerHTML = this.items.length ? this.items.map(appointment => `
            <div class="appointment-card">
                <h4>${appointment.patient_name}</h4>
                <p>${new Date(appointment.date).toLocaleString()}</p>
                ${appointment.notes ? `<p>${appointment.notes}</p>` : ''}
                <button onclick="appointments.handleDelete(${appointment.id})" style="background:var(--danger)">
                    Remover
                </button>
            </div>
        `).join('') : '<p>Nenhum agendamento</p>';
    }
};