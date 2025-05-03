let allTaxons = [];

document.addEventListener("DOMContentLoaded", async () => {
    const observationId = new URLSearchParams(window.location.search).get('id');
    if (!observationId) {
        document.getElementById('loading-message').innerHTML =
            '<div class="error">No se proporcionó ID de observación</div>';
        return;
    }
    await loadAllTaxons();
    setupTaxonAutocomplete();
    loadObservationData(observationId);
    loadUsers();

    document.getElementById('delete-btn').addEventListener('click', confirmDeleteObservation);
    document.getElementById('save-btn').addEventListener('click', () => saveChanges(observationId));
    document.getElementById('cancel-btn').addEventListener('click', () => {
        if (confirm('¿Desea descartar los cambios?')) { window.location.href = 'observacion_detalle.html?id=' + observationId; }
    });
    document.getElementById('image-url').addEventListener('change', updateImagePreview);
});

async function loadObservationData(observationId) {
    try {
        const response = await fetch(`http://localhost:8080/api/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                    SELECT 
                        o.observation_id,
                        t.taxon_name,
                        t.common_name,
                        TO_CHAR(o.date_obs, 'YYYY-MM-DD') AS observation_date,
                        o.latitude_obs,
                        o.longitude_obs,
                        o.note,
                        o.user_id,
                        i.url AS image_url,
                        i.image_id
                    FROM biodiversidad.observation o
                    JOIN biodiversidad.taxon t ON o.taxon_id = t.taxon_id
                    LEFT JOIN biodiversidad.image i ON o.image_id = i.image_id
                    WHERE o.observation_id = ${observationId}
                `
            })
        });

        if (!response.ok) throw new Error(await response.text());

        const data = await response.json();
        if (data.length === 0) throw new Error('Observación no encontrada');

        displayObservationForm(data[0]);

    } catch (error) {
        showError('loading-message', `Error al cargar observación: ${error.message}`);
    }
}

function displayObservationForm(observation) {
    document.getElementById('taxon-name').value = observation.taxon_name || '';
    document.getElementById('image-url').value = observation.image_url || '';
    document.getElementById('date').value = observation.observation_date || '';
    document.getElementById('latitude').value =  observation.latitude_obs;
    document.getElementById('longitude').value = observation.longitude_obs;
    document.getElementById('note').value = observation.note || '';
    document.getElementById('image-id').value = observation.image_id;

    setTimeout(() => {
        if (observation.user_id) { document.getElementById('user').value = observation.user_id; }
    }, 100);

    document.getElementById('loading-message').style.display = 'none';
    document.getElementById('form-content').style.display = 'block';
    updateImagePreview();
}

async function loadUsers() {
    try {
        const response = await fetch('http://localhost:8080/api/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `SELECT user_id, first_name, last_name FROM biodiversidad.user`})
        });

        if (!response.ok) throw new Error(await response.text());

        const users = await response.json();
        const select = document.getElementById('user');

        select.innerHTML = '<option value="">-- Seleccione un usuario --</option>';

        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.user_id;
            option.textContent = `${user.first_name} ${user.last_name}`;
            select.appendChild(option);
        });

    } catch (error) {
        showError('user', 'Error al cargar usuarios');
    }
}

async function loadAllTaxons() {
    try {
        const response = await fetch('http://localhost:8080/api/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: "SELECT taxon_id, taxon_name, rank FROM biodiversidad.taxon ORDER BY taxon_name"
            })
        });

        if (!response.ok) throw new Error(await response.text());
        allTaxons = await response.json();
    } catch (error) {
    }
}

function updateImagePreview() {
    const url = document.getElementById('image-url').value;
    const preview = document.getElementById('image-preview');

    if (url) { preview.innerHTML = `<img src="${url}" class="observation-img" alt="Vista previa" onerror="this.style.display='none'">`;
    } else { preview.innerHTML = ''; }
}

function validDate(dateString) {
    const inputDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate <= today;
}

async function saveChanges(observationId) {
    const taxonName = document.getElementById('taxon-name').value.trim();
    const date = document.getElementById('date').value;
    const latitude = parseFloat(document.getElementById('latitude').value);
    const longitude = parseFloat(document.getElementById('longitude').value);
    const note = document.getElementById('note').value;
    const userId = document.getElementById('user').value;
    const imageId = document.getElementById('image-id').value;

    if (!taxonName || !date || isNaN(latitude) || isNaN(longitude) || !userId) {
        alert('Por favor complete todos los campos requeridos');
        return;
    }

    if (!validDate(date)) {
        alert("Fecha inválida");
        document.getElementById("date").focus();
        return;
    }

    if (latitude < -90 || latitude > 90) {
        alert('La latitud debe estar entre -90 y 90 grados.');
        latitude.focus();
        return
    }

    if (longitude < -180 || longitude > 180) {
        alert('La longitud debe estar entre -180 y 180 grados.');
        longitude.focus();
        return
    }

    const [year, month, day] = date.split('-');
    const dateObj = new Date(year, month - 1, parseInt(day, 10));
    dateObj.setDate(dateObj.getDate() + 1);
    const dateFix = {
        year: dateObj.getFullYear(),
        month: dateObj.getMonth() + 1,
        day: dateObj.getDate()
    };

    try {
        const date = `${dateFix.year}-${String(dateFix.month).padStart(2, '0')}-${String(dateFix.day).padStart(2, '0')}`
        const taxonResponse = await fetch('http://localhost:8080/api/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `SELECT taxon_id FROM biodiversidad.taxon WHERE taxon_name = '${taxonName}'`
            })
        });

        if (!taxonResponse.ok) throw new Error(await taxonResponse.text());

        const taxonData = await taxonResponse.json();
        if (taxonData.length === 0) throw new Error('Taxón no encontrado');
        const taxonId = taxonData[0].taxon_id;

        const updateResponse = await fetch(`http://localhost:8080/observations/${observationId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                taxon_id: taxonId,
                user_id: userId,
                date_obs: date,
                latitude_obs: latitude,
                longitude_obs: longitude,
                note: note,
                image_id: imageId
            })
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || 'Error al actualizar');
        }

        if (imageId) {
            try {
                const imageResponse = await fetch(`http://localhost:8080/images/${imageId}`);
                if (!imageResponse.ok) throw new Error('Error al encontrar la imágen');

                const currentImage = await imageResponse.json();
                const imageUpdate = {
                    ...currentImage,
                    taxon_id: taxonId
                };

                const updateImageResponse = await fetch(`http://localhost:8080/images/${imageId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(imageUpdate)
                });

                if (!updateImageResponse.ok) {
                }
            } catch (error) {
            }
        }
        window.location.href = 'observacion_detalle.html?id=' + observationId;

    } catch (error) {
        alert(`Error al guardar cambios: ${error.message}`);
    }
}

async function confirmDeleteObservation() {
    const observationId = new URLSearchParams(window.location.search).get('id');
    if (!observationId) return;

    const hasIdentifications = await checkForIdentifications(observationId);

    let message = '¿Está seguro que desea eliminar esta observación?';
    if (hasIdentifications) { message += '\n\nEsta observación tiene identificaciones asociadas que también serán eliminadas.'; }
    if (confirm(message)) { await deleteObservation(observationId); }
}

async function checkForIdentifications(observationId) {
    try {
        const response = await fetch('http://localhost:8080/api/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `SELECT COUNT(*) as count FROM biodiversidad.identification WHERE observation_id = ${observationId}`
            })
        });

        if (!response.ok) throw new Error(await response.text());

        const data = await response.json();
        return data[0].count > 0;

    } catch (error) {
        return false;
    }
}

async function deleteObservation(observationId) {
    try {
        const observationResponse = await fetch('http://localhost:8080/api/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `SELECT image_id FROM biodiversidad.observation WHERE observation_id = ${observationId}`
            })
        });

        if (!observationResponse.ok) throw new Error(await observationResponse.text());
        const observationData = await observationResponse.json();
        const imageId = observationData[0]?.image_id;

        await deleteAssociatedIdentifications(observationId);
        const deleteResponse = await fetch(`http://localhost:8080/observations/${observationId}`, {
            method: 'DELETE'
        });
        if (!deleteResponse.ok) throw new Error(await deleteResponse.text());
        if (imageId) { await deleteImage(imageId); }

        alert('Observación, identificaciones e imagen asociada eliminadas con éxito');
        window.location.href = 'consulta_obs.html';

    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function deleteImage(imageId) {
    try {
        const response = await fetch(`http://localhost:8080/images/${imageId}`, {
            method: 'DELETE'
        });
        if (!response.ok) { throw new Error(await response.text()); }
        return true;

    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function deleteAssociatedIdentifications(observationId) {
    try {
        const response = await fetch('http://localhost:8080/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query:
                `SELECT i.identification_id FROM biodiversidad.identification i WHERE i.observation_id = ${observationId}`
            }),
        });

        const identifications = await response.json();

        if (!identifications || identifications.length === 0) {
            console.log('No se encontraron identificaciones para eliminar');
            return;
        }

        for (const identification of identifications) {
            const id = identification.identification_id;
            const deleteResponse = await fetch(`http://localhost:8080/identifications/${id}`, {
                method: 'DELETE'
            });
            if (!deleteResponse.ok) { alert(`Error al eliminar identificación ${id}`); }
        }
    } catch (error) {
        alert(`Error: ${error.message}`)
    }
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.innerHTML = `<div class="error">${message}</div>`;
    element.style.display = 'block';
}

function setupTaxonAutocomplete() {
    const input = document.getElementById('taxon-name');
    const suggestionsContainer = document.getElementById('taxon-suggestions');
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
                taxon.taxon_name.toLowerCase().includes(query.toLowerCase())
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
            } else { suggestionsContainer.style.display = 'none'; }
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