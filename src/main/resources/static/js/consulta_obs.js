document.addEventListener("DOMContentLoaded", () => {
    loadObservations();
    document.getElementById("retry-button").addEventListener("click", loadObservations);
});

async function loadObservations() {
    const grid = document.getElementById("observations-grid");
    const loadingState = document.getElementById("loading-state");
    const errorState = document.getElementById("error-state");

    grid.innerHTML = '';
    loadingState.style.display = 'block';
    errorState.style.display = 'none';

    try {
        const sqlQuery = `
            SELECT
                o.observation_id,
                kingdom.taxon_name AS kingdom,
                species.taxon_name AS species,
                species.common_name,
                TO_CHAR(o.date_obs, 'YYYY-MM-DD') AS observation_date,
                o.latitude_obs,
                o.longitude_obs,
                u.first_name || ' ' || u.last_name AS observer,
                i.url AS image_url
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
                ORDER BY o.date_obs DESC
        `;

        const response = await fetch('http://localhost:8080/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: sqlQuery })
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const observations = await response.json();
        displayObservations(observations);

    } catch (error) {
        errorState.querySelector('p').textContent = `Error al cargar observaciones`;
        errorState.style.display = 'block';
    } finally {
        loadingState.style.display = 'none';
    }
}

function displayObservations(observations) {
    const grid = document.getElementById("observations-grid");

    if (observations.length === 0) {
        grid.innerHTML = '<p class="no-results">No se encontraron observaciones</p>';
        return;
    }

    observations.forEach(obs => {
        const card = document.createElement('div');
        card.className = 'observation-card';

       const location = (obs.latitude_obs !== null && obs.longitude_obs !== null)
           ? `${obs.latitude_obs.toFixed(4)}, ${obs.longitude_obs.toFixed(4)}`
           : 'No registrada';

        const image = obs.image_url
            ? `<img src="${obs.image_url}" class="observation-image" alt="${obs.species || 'Observación'}">`
            : '<div class="observation-image no-image">Sin imagen</div>';

        card.innerHTML = `
            <a href="observacion_detalle.html?id=${obs.observation_id}">
                ${image}
                <div class="observation-content">
                    <h3 class="observation-species">${obs.species || 'Desconocido'}</h3>
                    ${obs.common_name ? `<span class="observation-common-name">${obs.common_name}</span>` : ''}
                    <p class="observation-meta"><span>Reino:</span> ${obs.kingdom || 'Desconocido'}</p>
                    <p class="observation-meta"><span>Fecha:</span> ${obs.observation_date || 'Sin fecha'}</p>
                    <p class="observation-meta"><span>Ubicación:</span> ${location}</p>
                    <p class="observation-meta"><span>Observador:</span> ${obs.observer || 'Desconocido'}</p>
                </div>
            </a>
        `;

        grid.appendChild(card);
    });
}