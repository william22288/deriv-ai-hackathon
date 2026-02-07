// Global variables
let currentDocumentId = null;
let currentSessionId = generateSessionId();

// Utility functions
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
    
    // Load data for specific tabs
    if (tabName === 'documents') {
        loadRecentDocuments();
    } else if (tabName === 'compliance') {
        loadComplianceDashboard();
    }
}

// Phase 1: Document Generation Functions
document.getElementById('doc-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const docType = document.getElementById('doc-type').value;
    const employeeId = document.getElementById('employee-id').value;
    const locale = document.getElementById('locale').value;
    
    // First, create a sample employee if needed
    await createSampleEmployee(employeeId);
    
    try {
        const response = await fetch('/api/documents/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                document_type: docType,
                employee_id: employeeId,
                locale: locale
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentDocumentId = data.document_id;
            displayDocumentResult(data);
        } else {
            alert('Error: ' + (data.detail || 'Failed to generate document'));
        }
    } catch (error) {
        alert('Error generating document: ' + error.message);
    }
});

async function createSampleEmployee(employeeId) {
    // This would normally be a separate employee management feature
    // For demo purposes, we'll add some basic data via direct DB access
    console.log('Employee setup for:', employeeId);
}

function displayDocumentResult(data) {
    const resultDiv = document.getElementById('doc-result');
    const contentDiv = document.getElementById('doc-content');
    
    let validationHtml = '';
    if (data.validation) {
        const validationClass = data.validation.validation_passed ? 'alert-success' : 'alert-warning';
        validationHtml = `
            <div class="alert ${validationClass}">
                <strong>AI Validation:</strong><br>
                ${data.validation.analysis}
            </div>
        `;
    }
    
    contentDiv.innerHTML = `
        ${validationHtml}
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4>Generated Document (ID: ${data.document_id})</h4>
            <pre style="white-space: pre-wrap; line-height: 1.6;">${data.content}</pre>
        </div>
        <p><strong>Status:</strong> <span class="status-badge pending">${data.status}</span></p>
    `;
    
    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

async function approveDocument() {
    if (!currentDocumentId) return;
    
    try {
        const response = await fetch('/api/documents/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                document_id: currentDocumentId,
                approved: true,
                reviewer_id: 'user_' + Date.now()
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('✓ Document approved successfully!');
            document.getElementById('doc-result').style.display = 'none';
            loadRecentDocuments();
        }
    } catch (error) {
        alert('Error approving document: ' + error.message);
    }
}

async function rejectDocument() {
    if (!currentDocumentId) return;
    
    try {
        const response = await fetch('/api/documents/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                document_id: currentDocumentId,
                approved: false,
                reviewer_id: 'user_' + Date.now(),
                comments: 'Rejected by user'
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Document rejected.');
            document.getElementById('doc-result').style.display = 'none';
            loadRecentDocuments();
        }
    } catch (error) {
        alert('Error rejecting document: ' + error.message);
    }
}

async function loadRecentDocuments() {
    try {
        const response = await fetch('/api/documents/list');
        const data = await response.json();
        
        const listDiv = document.getElementById('doc-list');
        
        if (data.documents && data.documents.length > 0) {
            listDiv.innerHTML = data.documents.map(doc => `
                <div class="list-item">
                    <strong>${doc.document_type}</strong> - ${doc.employee_id}
                    <span class="status-badge ${doc.status}">${doc.status}</span>
                    <br>
                    <small>Created: ${new Date(doc.created_at).toLocaleString()}</small>
                </div>
            `).join('');
        } else {
            listDiv.innerHTML = '<p style="text-align: center; color: #666;">No documents yet. Generate your first document above!</p>';
        }
    } catch (error) {
        console.error('Error loading documents:', error);
    }
}

// Phase 2: HR Assistant Functions
function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Display user message
    addChatMessage(message, 'user');
    input.value = '';
    
    try {
        const response = await fetch('/api/assistant/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                user_id: 'user_demo',
                session_id: currentSessionId
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            addChatMessage(data.response, 'bot');
            
            // Show action info if any
            if (data.action) {
                let actionMsg = '';
                if (data.action.type === 'update_employee_details') {
                    actionMsg = '📝 Your update request has been submitted for approval.';
                } else if (data.action.route_to) {
                    actionMsg = `📤 Your request has been routed to ${data.action.route_to}.`;
                }
                if (actionMsg) {
                    addChatMessage(actionMsg, 'bot');
                }
            }
        }
    } catch (error) {
        addChatMessage('Sorry, I encountered an error. Please try again.', 'bot');
    }
}

function addChatMessage(message, sender) {
    const messagesDiv = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    if (sender === 'bot') {
        messageDiv.innerHTML = `<strong>HR Assistant:</strong> ${message}`;
    } else {
        messageDiv.innerHTML = `<strong>You:</strong> ${message}`;
    }
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function quickQuery(query) {
    document.getElementById('chat-input').value = query;
    sendMessage();
}

// Phase 3: Compliance Functions
document.getElementById('compliance-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const employeeId = document.getElementById('comp-employee-id').value;
    const compType = document.getElementById('comp-type').value;
    const compName = document.getElementById('comp-name').value;
    const expiry = document.getElementById('comp-expiry').value;
    
    // Create sample employee if needed
    await createSampleEmployee(employeeId);
    
    try {
        const response = await fetch('/api/compliance/records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                employee_id: employeeId,
                compliance_type: compType,
                name: compName,
                issue_date: new Date().toISOString(),
                expiry_date: new Date(expiry).toISOString()
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('✓ Compliance record added successfully!');
            e.target.reset();
            loadComplianceDashboard();
        } else {
            alert('Error: ' + (data.detail || 'Failed to add record'));
        }
    } catch (error) {
        alert('Error adding compliance record: ' + error.message);
    }
});

async function checkCompliance() {
    try {
        const response = await fetch('/api/compliance/check');
        const data = await response.json();
        
        displayComplianceResult(data, 'Compliance Check Results');
    } catch (error) {
        alert('Error checking compliance: ' + error.message);
    }
}

async function generateReport() {
    try {
        const response = await fetch('/api/compliance/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ report_type: 'summary' })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayComplianceResult(data, 'AI-Generated Compliance Report');
        }
    } catch (error) {
        alert('Error generating report: ' + error.message);
    }
}

async function predictRisks() {
    try {
        const response = await fetch('/api/compliance/predict-risks');
        const data = await response.json();
        
        if (response.ok) {
            displayComplianceResult(data, 'AI Risk Prediction Analysis');
        }
    } catch (error) {
        alert('Error predicting risks: ' + error.message);
    }
}

function displayComplianceResult(data, title) {
    const resultDiv = document.getElementById('compliance-result');
    
    let html = `<h3>${title}</h3>`;
    
    if (data.report) {
        html += `<div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <pre style="white-space: pre-wrap; line-height: 1.6;">${data.report}</pre>
        </div>`;
    }
    
    if (data.risk_prediction) {
        html += `<div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <pre style="white-space: pre-wrap; line-height: 1.6;">${data.risk_prediction}</pre>
        </div>`;
    }
    
    if (data.alerts && data.alerts.length > 0) {
        html += '<h4>Alerts:</h4><div class="alerts-container">';
        data.alerts.forEach(alert => {
            const alertClass = alert.severity === 'critical' ? 'critical' : '';
            html += `
                <div class="alert-item ${alertClass}">
                    <strong>${alert.type}</strong> - ${alert.employee_id}<br>
                    ${alert.message}<br>
                    <small>Action: ${alert.action_required}</small>
                </div>
            `;
        });
        html += '</div>';
    }
    
    if (data.compliant !== undefined) {
        const statusClass = data.compliant ? 'alert-success' : 'alert-danger';
        html += `<div class="alert ${statusClass}">
            Overall Status: ${data.compliant ? '✓ COMPLIANT' : '✗ NON-COMPLIANT'}
        </div>`;
    }
    
    resultDiv.innerHTML = html;
    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

async function loadComplianceDashboard() {
    try {
        const response = await fetch('/api/compliance/dashboard');
        const data = await response.json();
        
        const overviewDiv = document.getElementById('compliance-overview');
        const alertsDiv = document.getElementById('compliance-alerts');
        
        // Overview
        const overview = data.overview;
        overviewDiv.innerHTML = `
            <div class="stat-number">${overview.total_records}</div>
            <div class="stat-label">Total Records</div>
            <hr style="margin: 20px 0; opacity: 0.3;">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; text-align: center;">
                <div>
                    <div class="stat-number" style="font-size: 2em;">${overview.active}</div>
                    <div class="stat-label">Active</div>
                </div>
                <div>
                    <div class="stat-number" style="font-size: 2em;">${overview.expiring_soon}</div>
                    <div class="stat-label">Expiring</div>
                </div>
                <div>
                    <div class="stat-number" style="font-size: 2em;">${overview.expired}</div>
                    <div class="stat-label">Expired</div>
                </div>
            </div>
        `;
        
        // Alerts
        if (overview.alerts && overview.alerts.length > 0) {
            alertsDiv.innerHTML = overview.alerts.map(alert => {
                const alertClass = alert.severity === 'critical' ? 'critical' : '';
                return `
                    <div class="alert-item ${alertClass}">
                        <strong>${alert.type}</strong><br>
                        ${alert.message}
                    </div>
                `;
            }).join('');
        } else {
            alertsDiv.innerHTML = '<div style="text-align: center; padding: 20px;">No alerts - All compliant! ✓</div>';
        }
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('compliance-overview').innerHTML = 
            '<div class="loading">Add compliance records to see dashboard data</div>';
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    loadRecentDocuments();
    loadComplianceDashboard();
});
