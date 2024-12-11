// Admin Panel JavaScript

// Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const section = btn.dataset.section;
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        document.getElementById(section).classList.add('active');
        
        loadSectionData(section);
    });
});

// Load section data
async function loadSectionData(section) {
    switch(section) {
        case 'plans':
            await loadPlans();
            break;
        case 'features':
            await loadFeatures();
            break;
        case 'users':
            await loadUsers();
            break;
    }
}

// Plans Management
async function loadPlans() {
    try {
        const response = await fetch('/api/subscriptions/plans');
        const plans = await response.json();
        
        const plansGrid = document.getElementById('plans-grid');
        plansGrid.innerHTML = plans.map(plan => `
            <div class="plan-card">
                <h3>${plan.name}</h3>
                <p class="price">$${plan.price}/${plan.interval}</p>
                <p class="description">${plan.description}</p>
                <div class="features-list">
                    ${plan.features.map(f => `
                        <div class="feature-item ${f.access}">
                            <span>${f.feature.name}</span>
                            <span class="access-badge">${f.access}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="card-actions">
                    <button onclick="editPlan('${plan._id}')">Edit</button>
                    <button onclick="togglePlan('${plan._id}', ${!plan.active})">${plan.active ? 'Disable' : 'Enable'}</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading plans:', error);
    }
}

async function savePlan(formData) {
    try {
        const method = formData.get('id') ? 'PUT' : 'POST';
        const url = `/api/subscriptions/plans${formData.get('id') ? '/' + formData.get('id') : ''}`;
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Object.fromEntries(formData))
        });
        
        if (response.ok) {
            await loadPlans();
            closeModal('plan-modal');
        }
    } catch (error) {
        console.error('Error saving plan:', error);
    }
}

// Features Management
async function loadFeatures() {
    try {
        const response = await fetch('/api/features');
        const features = await response.json();
        
        const featuresGrid = document.getElementById('features-grid');
        featuresGrid.innerHTML = features.map(feature => `
            <div class="feature-card">
                <h3>${feature.name}</h3>
                <p class="key">Key: ${feature.key}</p>
                <p class="category">${feature.category}</p>
                <p class="description">${feature.description}</p>
                ${feature.limitedAccess ? `
                    <div class="limits">
                        <h4>Limited Access</h4>
                        <p>Max Usage: ${feature.limitedAccess.maxUsage} per ${feature.limitedAccess.timeFrame}</p>
                        <p>${feature.limitedAccess.description}</p>
                    </div>
                ` : ''}
                <div class="card-actions">
                    <button onclick="editFeature('${feature._id}')">Edit</button>
                    <button onclick="toggleFeature('${feature._id}', ${!feature.active})">${feature.active ? 'Disable' : 'Enable'}</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading features:', error);
    }
}

async function saveFeature(formData) {
    try {
        const method = formData.get('id') ? 'PUT' : 'POST';
        const url = `/api/features${formData.get('id') ? '/' + formData.get('id') : ''}`;
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Object.fromEntries(formData))
        });
        
        if (response.ok) {
            await loadFeatures();
            closeModal('feature-modal');
        }
    } catch (error) {
        console.error('Error saving feature:', error);
    }
}

// Users Management
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        
        const usersTable = document.getElementById('users-table');
        usersTable.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Plan</th>
                        <th>Status</th>
                        <th>Trial Ends</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.firstName} ${user.lastName}</td>
                            <td>${user.email}</td>
                            <td>${user.subscription.plan?.name || 'No Plan'}</td>
                            <td>${user.subscription.status}</td>
                            <td>${new Date(user.subscription.trialEnds).toLocaleDateString()}</td>
                            <td>
                                <button onclick="viewUser('${user._id}')">View</button>
                                <button onclick="extendTrial('${user._id}')">Extend Trial</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Modal Management
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPlans();
});
