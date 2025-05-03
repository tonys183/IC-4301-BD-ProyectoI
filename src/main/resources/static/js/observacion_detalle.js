let currentEditId = null;
let allTaxons = [];

document.addEventListener("DOMContentLoaded", () => {
    const observationId = new URLSearchParams(window.location.search).get('id');
    if (!observationId) {
        document.getElementById('loading-message').innerHTML =
            '<div class="error">No se proporcionó ID de observación</div>';
        return;
    }
    loadObservationDetails(observationId);
    loadIdentifications();
    loadUsers();

    document.getElementById('add-identification-btn').addEventListener('click', addIdentification);
    const form = document.querySelector('.id-form');
    form.insertAdjacentHTML('beforeend', `
    <button id="update-identification-btn" class="btn" style="display: none;"> Actualizar </button>
    <button id="cancel-edit-btn" class="btn" style="display: none;"> Cancelar </button>`);
    document.getElementById('update-identification-btn').addEventListener('click', updateIdentification);
    document.getElementById('cancel-edit-btn').addEventListener('click', cancelEdit);
    document.getElementById('edit-observation-btn').addEventListener('click', function() {
        const observationId = new URLSearchParams(window.location.search).get('id');
        if (observationId) { window.location.href = `modificar_observacion.html?id=${observationId}`; }
    });
});

document.addEventListener("DOMContentLoaded", async () => {
    await loadAllTaxons();
    setupIdentificationAutocomplete();
});


async function loadObservationDetails(observationId) {
    try {
        const response = await fetch(`http://localhost:8080/api/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({
                query: `
                    SELECT
                    kingdom.taxon_name AS kingdom,
                    species.taxon_name AS species,
                    species.common_name,
                    TO_CHAR(o.date_obs, 'YYYY-MM-DD') AS observation_date,
                    o.latitude_obs,
                    o.longitude_obs,
                    u.first_name || ' ' || u.last_name AS observer,
                    i.url AS image_url,
                    o.note
                    FROM biodiversidad.observation o
                    JOIN biodiversidad.taxon species ON o.taxon_id = species.taxon_id
                    JOIN biodiversidad.user u ON o.user_id = u.user_id
                    LEFT JOIN biodiversidad.image i ON o.image_id = i.image_id
                    LEFT JOIN biodiversidad.taxon genus ON species.parent_id = genus.taxon_id AND genus.rank = 'genus'
                    LEFT JOIN biodiversidad.taxon family ON genus.parent_id = family.taxon_id AND family.rank = 'family'
                    LEFT JOIN biodiversidad.taxon "order" ON family.parent_id = "order".taxon_id AND "order".rank = 'order'
                    LEFT JOIN biodiversidad.taxon class ON "order".parent_id = class.taxon_id AND class.rank = 'class'
                    LEFT JOIN biodiversidad.taxon phylum ON class.parent_id = phylum.taxon_id AND phylum.rank = 'phylum'
                    LEFT JOIN biodiversidad.taxon kingdom ON phylum.parent_id = kingdom.taxon_id AND kingdom.rank = 'kingdom'
                    WHERE o.observation_id = ${observationId}
                    ORDER BY o.date_obs DESC
                `
            })
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();
        if (data.length === 0) {
            throw new Error('Observación no encontrada');
        }

        const observation = data[0];
        displayObservationDetails(observation);

    } catch (error) {
        document.getElementById('observation-details').innerHTML = `
            <div class="error">Error al cargar observación: ${error.message}</div>
        `;
    }
}

async function loadUsers() {
    try {
        const response = await fetch("http://localhost:8080/users");

        if (!response.ok) throw new Error(await response.text());

        const users = await response.json();
        const select = document.getElementById('user-select');

        select.innerHTML = '<option value="">-- Seleccione usuario --</option>';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.user_id;
            option.textContent = `${user.first_name} ${user.last_name}`;
            select.appendChild(option);
        });

    } catch (error) {
        const select = document.getElementById('user-select');
        select.innerHTML = '<option value="">Error al cargar usuarios</option>';
    }
}

function displayObservationDetails(observation) {
    const location = (observation.latitude_obs !== null && observation.longitude_obs !== null)
        ? `${observation.latitude_obs.toFixed(4)}, ${observation.longitude_obs.toFixed(4)}`
        : 'No registrada';

    const imageHtml = observation.image_url
        ? `<img src="${observation.image_url}" class="observation-img" onerror="this.style.display='none'">`
        : '<p>No hay imagen disponible</p>';

    document.getElementById('observation-details').innerHTML = `
        <div class="detail-grid">
            <div class="detail-label">Especie:</div>
            <div class="detail-value">
                ${observation.species || 'Desconocido'}
                ${observation.common_name ? `<br><small>(${observation.common_name})</small>` : ''}
            </div>
            
            <div class="detail-label">Reino:</div>
            <div class="detail-value">${observation.kingdom || 'Desconocido'}</div>
            
            <div class="detail-label">Fecha:</div>
            <div class="detail-value">${observation.observation_date || 'Sin fecha'}</div>
            
            <div class="detail-label">Ubicación:</div>
            <div class="detail-value">${location}</div>
            
            <div class="detail-label">Observador:</div>
            <div class="detail-value">${observation.observer || 'Desconocido'}</div>
            
            <div class="detail-label">Notas:</div>
            <div class="detail-value">${observation.note || 'No hay notas'}</div>
        </div>
        
        <div class="image-container">
            ${imageHtml}
        </div>
    `;
}

async function loadIdentifications() {
    const observationId = new URLSearchParams(window.location.search).get('id');

    try {
        const response = await fetch(`http://localhost:8080/api/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                    SELECT 
                        i.identification_id,
                        i.user_id,
                        t.taxon_name,
                        t.common_name,
                        TO_CHAR(i.date_identifi, 'YYYY-MM-DD') AS date_identified,
                        u.first_name || ' ' || u.last_name AS identifier
                    FROM biodiversidad.identification i
                    LEFT JOIN biodiversidad.taxon t ON i.taxon_id = t.taxon_id
                    LEFT JOIN biodiversidad.user u ON i.user_id = u.user_id
                    WHERE i.observation_id = ${observationId}
                    ORDER BY i.date_identifi DESC
                `
            })
        });

        if (!response.ok) throw new Error(await response.text());

        const identifications = await response.json();
        displayIdentifications(identifications);

    } catch (error) {
        document.getElementById('identifications-list').innerHTML = `
            <div class="error">Error: ${error.message}</div>
        `;
    }
}

function displayIdentifications(identifications) {
    const container = document.getElementById('identifications-list');

    if (identifications.length === 0) {
        container.innerHTML = '<p>No hay identificaciones registradas</p>';
        return;
    }

    container.innerHTML = identifications.map(id => `
        <div class="identification-item">
            <div class="id-info">
                <div><strong>Taxón:</strong> ${id.taxon_name} ${id.common_name ? `(${id.common_name})` : ''}</div>
                <div><strong>Usuario:</strong> ${id.identifier} <span class="user-id" style="display:none">${id.user_id}</span></div>
                <div><strong>Fecha:</strong> ${id.date_identified}</div>
            </div>
            <div class="id-actions">
                <button class="btn-edit" 
                        data-id="${id.identification_id}"
                        data-taxon="${id.taxon_name}"
                        data-user="${id.user_id}">
                    ✏️ Modificar
                </button>
                <button class="btn-delete" data-id="${id.identification_id}">
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    `).join('');

    setupActionButtons();
}

function setupActionButtons() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const taxon = e.target.getAttribute('data-taxon');
            const userId = e.target.getAttribute('data-user');
            prepareEditIdentification(id, taxon, userId);
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            deleteIdentification(id);
        });
    });
}

function prepareEditIdentification(id, taxonName, userId) {
    document.getElementById('new-identification').value = taxonName;
    const userSelect = document.getElementById('user-select');
    userSelect.value = userId;
    document.getElementById('add-identification-btn').style.display = 'none';
    document.getElementById('update-identification-btn').style.display = 'inline-block';
    document.getElementById('cancel-edit-btn').style.display = 'inline-block';
    currentEditId = id;
}

async function updateIdentification() {
    if (!currentEditId) return;

    const newTaxonName = document.getElementById('new-identification').value.trim();
    const userId = document.getElementById('user-select').value;

    if (!newTaxonName || !userId) {
        alert('Por favor complete todos los campos');
        return;
    }

    try {
        const taxonResponse = await fetch('http://localhost:8080/api/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `SELECT taxon_id FROM biodiversidad.taxon WHERE taxon_name = '${newTaxonName}' and rank='species'`
            })
        });

        if (!taxonResponse.ok) throw new Error(await taxonResponse.text());

        const taxonData = await taxonResponse.json();
        if (taxonData.length === 0) throw new Error('Taxón no encontrado');

        const newTaxonId = taxonData[0].taxon_id;
        const observationId = new URLSearchParams(window.location.search).get('id');
        const updateResponse = await fetch(`http://localhost:8080/identifications/${currentEditId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                observation_id: observationId,
                taxon_id: newTaxonId,
                user_id: userId,
                date_identifi: new Date().toISOString().split('T')[0]
            })
        });

        if (!updateResponse.ok) throw new Error(await updateResponse.text());

        cancelEdit();
        await loadIdentifications();

    } catch (error) {
        alert(`Error al modificar identificación: ${error.message}`);
    }
}

function cancelEdit() {
    document.getElementById('new-identification').value = '';
    document.getElementById('user-select').value = '';
    document.getElementById('add-identification-btn').style.display = 'inline-block';
    document.getElementById('update-identification-btn').style.display = 'none';
    document.getElementById('cancel-edit-btn').style.display = 'none';
    currentEditId = null;
}

async function deleteIdentification(id) {
    if (!confirm('¿Está seguro que desea eliminar esta identificación?')) { return; }

    try {
        const deleteResponse = await fetch(`http://localhost:8080/identifications/${id}`, {
            method: 'DELETE'
        });

        if (!deleteResponse.ok) throw new Error(await deleteResponse.text());
        location.reload();
        await loadIdentifications();

    } catch (error) {
        alert(`Error al eliminar la identificación`);
    }
}

function getLocalISODate() {const date = new Date();
    const day = String(date.getDate()+1).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}

async function addIdentification() {
    const observationId = new URLSearchParams(window.location.search).get('id');
    const taxonName = document.getElementById('new-identification').value.trim();
    const userId = document.getElementById('user-select').value;

    if (!observationId || !taxonName) {
        alert('Por favor complete el nombre científico');
        return;
    }

    if (!userId) {
        alert('Por favor seleccione un usuario');
        return;
    }

    try {
        const taxon = allTaxons.find(t => t.taxon_name.toLowerCase() === taxonName.toLowerCase());

        if (!taxon) {
            throw new Error('Taxón no encontrado');
        }

        const currentDate = getLocalISODate();
        const createResponse = await fetch('http://localhost:8080/identifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                observation_id: observationId,
                taxon_id: taxon.taxon_id,
                user_id: userId,
                date_identifi: currentDate
            })
        });

        if (!createResponse.ok) {
            throw new Error(await createResponse.text());
        }
        alert('Identificación añadida con éxito');
        document.getElementById('new-identification').value = '';
        loadIdentifications();

    } catch (error) {
        alert(`Error al agregar identificación: ${error.message}`);
    }
}

async function loadAllTaxons() {
    try {
        const response = await fetch('http://localhost:8080/api/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: "SELECT taxon_id, taxon_name, rank FROM biodiversidad.taxon where rank = 'species' ORDER BY taxon_name"
            })
        });

        if (!response.ok) throw new Error(await response.text());
        allTaxons = await response.json();
    } catch (error) {
        alert("Error al cargar taxones:" + error);
    }
}

function setupIdentificationAutocomplete() {
    const input = document.getElementById('new-identification');
    const suggestionsContainer = document.getElementById('identification-suggestions');
    let timeoutId;

    input.addEventListener('input', function(e) {
        clearTimeout(timeoutId);
        const query = e.target.value.trim();

        if (query.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        timeoutId = setTimeout(() => {
            const filtered = allTaxons.filter(taxon =>
                taxon.taxon_name.toLowerCase().includes(query.toLowerCase()) &&
                taxon.rank === "species"
            );

            if (filtered.length > 0) {
                suggestionsContainer.innerHTML = filtered.map(taxon => `
                    <div class="suggestion-item" 
                         data-id="${taxon.taxon_id}"
                         data-name="${taxon.taxon_name}">
                        ${taxon.taxon_name} (${taxon.rank})
                    </div>
                `).join('');
                suggestionsContainer.style.display = 'block';
            } else {
                suggestionsContainer.style.display = 'none';
            }
        }, 300);
    });

    suggestionsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('suggestion-item')) {
            const taxonName = e.target.getAttribute('data-name');
            input.value = taxonName;
            suggestionsContainer.style.display = 'none';
        }
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.taxon-search-container')) {
            suggestionsContainer.style.display = 'none';
        }
    });
}