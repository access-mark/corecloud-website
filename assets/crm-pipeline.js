// crm-pipeline.js
(function() {
  const PASSWORD = '50050058';
  if (prompt('Enter CRM password:') !== PASSWORD) {
    document.body.innerHTML = '<p style="text-align:center;margin-top:4rem;">Access Denied.</p>';
    return;
  }

  const contactsKey = 'crmContacts';
  const pipelineKey = 'crmPipeline';

  const crmApp = document.getElementById('crmApp');
  const pipelineApp = document.getElementById('pipelineApp');

  // Helper to create input field
  function createInput(type, id, placeholder, required = false) {
    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    input.placeholder = placeholder;
    if (required) input.required = true;
    return input;
  }

  // === CRM FORM ===
  const crmForm = document.createElement('form');
  crmForm.className = 'portal-form';
  crmForm.innerHTML = '<input type="hidden" id="contactIndex" />';
  ['firstName','lastName','company','position','industry','mobile','landline','website','email'].forEach(f => {
    const type = f === 'email' ? 'email' : f === 'website' ? 'url' : 'text';
    crmForm.appendChild(createInput(type, f, f.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()), ['firstName','lastName','email'].includes(f)));
  });
  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn-primary';
  saveBtn.textContent = 'Save Contact';
  crmForm.appendChild(saveBtn);
  crmApp.appendChild(crmForm);

  const contactsTable = document.createElement('table');
  contactsTable.className = 'portal-table';
  contactsTable.innerHTML = `
    <thead><tr><th>First</th><th>Last</th><th>Company</th><th>Position</th>
    <th>Industry</th><th>Mobile</th><th>Landline</th><th>Website</th><th>Email</th><th></th></tr></thead>
    <tbody id="contactsList"></tbody>`;
  crmApp.appendChild(contactsTable);

  // === PIPELINE FORM ===
  const pipeForm = document.createElement('form');
  pipeForm.className = 'portal-form';
  pipeForm.innerHTML = '<input type="hidden" id="pipelineIndex" />';
  const pipeFields = [
    ['oppName', 'Opportunity Name'],
    ['clientName', 'Client / Company'],
    ['contactPerson', 'Contact Person'],
    ['dealValue', 'Deal Value'],
    ['stage', 'Stage'],
    ['closeDate', 'Expected Close Date']
  ];
  pipeFields.forEach(([id, label]) => {
    if (id === 'stage') {
      const select = document.createElement('select');
      select.id = id;
      select.required = true;
      select.innerHTML = `
        <option value="">Select Stage…</option>
        <option>Qualification</option><option>Proposal</option><option>Negotiation</option>
        <option>Closed Won</option><option>Closed Lost</option>`;
      pipeForm.appendChild(select);
    } else {
      const input = createInput(id === 'dealValue' ? 'number' : id === 'closeDate' ? 'date' : 'text', id, label, id !== 'contactPerson');
      pipeForm.appendChild(input);
    }
  });
  const pipeSaveBtn = document.createElement('button');
  pipeSaveBtn.className = 'btn-primary';
  pipeSaveBtn.textContent = 'Save Pipeline Item';
  pipeForm.appendChild(pipeSaveBtn);
  pipelineApp.appendChild(pipeForm);

  const pipeTable = document.createElement('table');
  pipeTable.className = 'portal-table';
  pipeTable.innerHTML = `
    <thead><tr><th>Opportunity</th><th>Client</th><th>Contact</th>
    <th>Value</th><th>Stage</th><th>Close Date</th><th></th></tr></thead>
    <tbody id="pipelineList"></tbody>`;
  pipelineApp.appendChild(pipeTable);

  // === CRM DATA ===
  let contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
  const cList = document.getElementById('contactsList');
  function renderContacts() {
    cList.innerHTML = contacts.map((c,i)=>`
      <tr>
        <td>${c.firstName}</td><td>${c.lastName}</td><td>${c.company||''}</td><td>${c.position||''}</td>
        <td>${c.industry||''}</td><td>${c.mobile||''}</td><td>${c.landline||''}</td>
        <td>${c.website ? `<a href="${c.website}" target="_blank">${c.website}</a>` : ''}</td>
        <td>${c.email}</td>
        <td><span data-i="${i}" class="portal-delete">&times;</span></td>
      </tr>`).join('');
  }
  crmForm.onsubmit = e => {
    e.preventDefault();
    const idx = document.getElementById('contactIndex').value;
    const obj = {};
    ['firstName','lastName','company','position','industry','mobile','landline','website','email']
      .forEach(id => obj[id] = document.getElementById(id).value.trim());
    idx === '' ? contacts.push(obj) : contacts[idx] = obj;
    localStorage.setItem(contactsKey, JSON.stringify(contacts));
    crmForm.reset();
    document.getElementById('contactIndex').value = '';
    renderContacts();
  };
  cList.onclick = e => {
    if (!e.target.classList.contains('portal-delete')) return;
    const i = e.target.dataset.i;
    if (confirm('Delete contact?')) {
      contacts.splice(i, 1);
      localStorage.setItem(contactsKey, JSON.stringify(contacts));
      renderContacts();
    }
  };
  renderContacts();

  // === PIPELINE DATA ===
  let pipeline = JSON.parse(localStorage.getItem(pipelineKey) || '[]');
  const pList = document.getElementById('pipelineList');
  function renderPipeline() {
    pList.innerHTML = pipeline.map((p,i)=>`
      <tr>
        <td>${p.oppName}</td><td>${p.clientName}</td><td>${p.contactPerson||''}</td>
        <td>${p.dealValue||''}</td><td>${p.stage||''}</td><td>${p.closeDate||''}</td>
        <td><span data-i="${i}" class="portal-delete">&times;</span></td>
      </tr>`).join('');
  }
  pipeForm.onsubmit = e => {
    e.preventDefault();
    const idx = document.getElementById('pipelineIndex').value;
    const obj = {};
    ['oppName','clientName','contactPerson','dealValue','stage','closeDate']
      .forEach(id => obj[id] = document.getElementById(id).value);
    idx === '' ? pipeline.push(obj) : pipeline[idx] = obj;
    localStorage.setItem(pipelineKey, JSON.stringify(pipeline));
    pipeForm.reset();
    document.getElementById('pipelineIndex').value = '';
    renderPipeline();
  };
  pList.onclick = e => {
    if (!e.target.classList.contains('portal-delete')) return;
    const i = e.target.dataset.i;
    if (confirm('Delete this pipeline item?')) {
      pipeline.splice(i, 1);
      localStorage.setItem(pipelineKey, JSON.stringify(pipeline));
      renderPipeline();
    }
  };
  renderPipeline();

  // For dashboard access
  window.getPipelineData = () => pipeline;
})();
