// Sistema de Hemodiálisis - JavaScript Principal
class HemodialysisApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.patients = [];
        this.alerts = [];
        this.init();
    }

    init() {
        this.loadInitialData();
        this.setupEventListeners();
        this.showSection('dashboard');
    }

    setupEventListeners() {
        // Formulario de nuevo paciente
        const newPatientForm = document.getElementById('new-patient-form');
        if (newPatientForm) {
            newPatientForm.addEventListener('submit', (e) => this.handleNewPatient(e));
        }

        // Búsqueda de pacientes
        const searchInput = document.getElementById('search-patients');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchPatients(e.target.value));
        }
    }

    async loadInitialData() {
        try {
            // Cargar datos desde API
            await this.loadPatients();
            await this.loadAlerts();
            this.updateDashboard();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Error al cargar los datos iniciales');
        }
    }

    async loadPatients() {
        try {
            const response = await fetch('/api/patients');
            if (response.ok) {
                this.patients = await response.json();
            } else {
                // Datos de ejemplo si no hay API
                this.patients = [
                    {
                        id: 1,
                        documento: 'CC 12345678',
                        nombres: 'María Elena',
                        apellidos: 'González López',
                        edad: 58,
                        genero: 'F',
                        eps: 'Nueva EPS',
                        fecha_inicio_hd: '2022-06-10',
                        causa_erc: 'Diabetes Mellitus tipo 2',
                        activo: true
                    },
                    {
                        id: 2,
                        documento: 'CC 87654321',
                        nombres: 'Carlos Andrés',
                        apellidos: 'Rodríguez Martín',
                        edad: 65,
                        genero: 'M',
                        eps: 'Sanitas EPS',
                        fecha_inicio_hd: '2021-11-05',
                        causa_erc: 'Nefropatía hipertensiva',
                        activo: true
                    },
                    {
                        id: 3,
                        documento: 'CC 45678912',
                        nombres: 'Ana Lucia',
                        apellidos: 'Pérez Silva',
                        edad: 51,
                        genero: 'F',
                        eps: 'SURA EPS',
                        fecha_inicio_hd: '2023-01-18',
                        causa_erc: 'Glomerulonefritis crónica',
                        activo: true
                    }
                ];
            }
        } catch (error) {
            console.error('Error loading patients:', error);
        }
    }

    async loadAlerts() {
        try {
            const response = await fetch('/api/alerts');
            if (response.ok) {
                this.alerts = await response.json();
            } else {
                // Alertas de ejemplo
                this.alerts = [
                    {
                        id: 1,
                        paciente_id: 1,
                        tipo: 'CRITICA',
                        categoria: 'ANEMIA',
                        mensaje: 'Hemoglobina crítica: 7.8 g/dl. Considerar transfusión urgente.',
                        fecha_creacion: new Date().toISOString(),
                        paciente_nombre: 'María Elena González López'
                    },
                    {
                        id: 2,
                        paciente_id: 2,
                        tipo: 'MODERADA',
                        categoria: 'MINERAL_OSEO',
                        mensaje: 'PTH elevada: 420 pg/ml. Revisar dosis de vitamina D.',
                        fecha_creacion: new Date().toISOString(),
                        paciente_nombre: 'Carlos Andrés Rodríguez Martín'
                    },
                    {
                        id: 3,
                        paciente_id: 3,
                        tipo: 'PREVENTIVA',
                        categoria: 'ACCESO_VASCULAR',
                        mensaje: 'Riesgo de disfunción de acceso: 78%. Programar evaluación vascular.',
                        fecha_creacion: new Date().toISOString(),
                        paciente_nombre: 'Ana Lucia Pérez Silva'
                    }
                ];
            }
        } catch (error) {
            console.error('Error loading alerts:', error);
        }
    }

    updateDashboard() {
        // Actualizar métricas
        document.getElementById('total-patients').textContent = this.patients.length;

        const criticalAlerts = this.alerts.filter(a => a.tipo === 'CRITICA').length;
        const moderateAlerts = this.alerts.filter(a => a.tipo === 'MODERADA').length;
        const preventiveAlerts = this.alerts.filter(a => a.tipo === 'PREVENTIVA').length;

        document.getElementById('critical-alerts').textContent = criticalAlerts;
        document.getElementById('moderate-alerts').textContent = moderateAlerts;
        document.getElementById('preventive-alerts').textContent = preventiveAlerts;

        // Mostrar alertas
        this.renderAlerts();
    }

    renderAlerts() {
        const container = document.getElementById('alerts-container');
        if (!container) return;

        if (this.alerts.length === 0) {
            container.innerHTML = `
                <div class="text-center text-success">
                    <i class="fas fa-check-circle fa-2x mb-3"></i>
                    <p>No hay alertas activas en el sistema</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.alerts.map(alert => {
            const alertClass = alert.tipo === 'CRITICA' ? 'alert-critical' : 
                             alert.tipo === 'MODERADA' ? 'alert-moderate' : 'alert-preventive';
            const icon = alert.tipo === 'CRITICA' ? 'fas fa-exclamation-triangle' :
                        alert.tipo === 'MODERADA' ? 'fas fa-exclamation-circle' : 'fas fa-info-circle';

            return `
                <div class="${alertClass}">
                    <div class="d-flex align-items-start">
                        <i class="${icon} me-2 mt-1"></i>
                        <div class="flex-grow-1">
                            <strong>${alert.tipo} - ${alert.categoria}</strong><br>
                            <strong>Paciente:</strong> ${alert.paciente_nombre}<br>
                            <strong>Mensaje:</strong> ${alert.mensaje}<br>
                            <small class="text-muted">
                                Fecha: ${new Date(alert.fecha_creacion).toLocaleDateString('es-CO')}
                            </small>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderPatients() {
        const container = document.getElementById('patients-table');
        if (!container) return;

        if (this.patients.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted">
                    <i class="fas fa-users fa-2x mb-3"></i>
                    <p>No hay pacientes registrados</p>
                </div>
            `;
            return;
        }

        const table = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Documento</th>
                            <th>Nombre Completo</th>
                            <th>Edad</th>
                            <th>Género</th>
                            <th>EPS</th>
                            <th>Causa ERC</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.patients.map(patient => `
                            <tr class="patient-row" data-patient-id="${patient.id}">
                                <td>${patient.id}</td>
                                <td>${patient.documento}</td>
                                <td>${patient.nombres} ${patient.apellidos}</td>
                                <td>${patient.edad} años</td>
                                <td>${patient.genero === 'M' ? 'Masculino' : 'Femenino'}</td>
                                <td>${patient.eps}</td>
                                <td>${patient.causa_erc}</td>
                                <td>
                                    <span class="badge ${patient.activo ? 'bg-success' : 'bg-secondary'}">
                                        ${patient.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = table;

        // Agregar event listeners para las filas de pacientes
        document.querySelectorAll('.patient-row').forEach(row => {
            row.addEventListener('click', (e) => {
                const patientId = e.currentTarget.dataset.patientId;
                this.showPatientDetails(patientId);
            });
        });
    }

    async handleNewPatient(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const patientData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/patients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(patientData)
            });

            if (response.ok) {
                const newPatient = await response.json();
                this.patients.push(newPatient);
                this.renderPatients();
                e.target.reset();
                this.showSuccess('Paciente registrado exitosamente');
            } else {
                throw new Error('Error al registrar paciente');
            }
        } catch (error) {
            console.error('Error creating patient:', error);
            this.showError('Error al registrar el paciente');
        }
    }

    searchPatients(searchTerm) {
        if (!searchTerm.trim()) {
            this.renderPatients();
            return;
        }

        const filtered = this.patients.filter(patient => {
            const fullName = `${patient.nombres} ${patient.apellidos}`.toLowerCase();
            const documento = patient.documento.toLowerCase();
            const id = patient.id.toString();
            const term = searchTerm.toLowerCase();

            return fullName.includes(term) || documento.includes(term) || id.includes(term);
        });

        // Renderizar resultados filtrados
        const container = document.getElementById('patients-table');
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted">
                    <i class="fas fa-search fa-2x mb-3"></i>
                    <p>No se encontraron pacientes con ese criterio</p>
                </div>
            `;
        } else {
            // Similar al renderPatients pero con filtered
            const table = `
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Documento</th>
                                <th>Nombre Completo</th>
                                <th>Edad</th>
                                <th>Género</th>
                                <th>EPS</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.map(patient => `
                                <tr class="patient-row" data-patient-id="${patient.id}">
                                    <td>${patient.id}</td>
                                    <td>${patient.documento}</td>
                                    <td>${patient.nombres} ${patient.apellidos}</td>
                                    <td>${patient.edad} años</td>
                                    <td>${patient.genero === 'M' ? 'Masculino' : 'Femenino'}</td>
                                    <td>${patient.eps}</td>
                                    <td>
                                        <span class="badge ${patient.activo ? 'bg-success' : 'bg-secondary'}">
                                            ${patient.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            container.innerHTML = table;
        }
    }

    showPatientDetails(patientId) {
        const patient = this.patients.find(p => p.id == patientId);
        if (!patient) return;

        // Modal o página de detalles del paciente
        alert(`Detalles del paciente: ${patient.nombres} ${patient.apellidos}\nID: ${patient.id}\nDocumento: ${patient.documento}`);
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'} position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Funciones globales para navegación
function showSection(sectionName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });

    // Mostrar la sección seleccionada
    const selectedSection = document.getElementById(`${sectionName}-section`);
    if (selectedSection) {
        selectedSection.style.display = 'block';

        // Renderizar contenido específico de la sección
        if (sectionName === 'patients') {
            app.renderPatients();
        } else if (sectionName === 'dashboard') {
            app.updateDashboard();
        }
    }

    // Actualizar navegación activa
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
}

// Inicializar aplicación cuando el DOM esté listo
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new HemodialysisApp();
});