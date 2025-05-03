document.addEventListener("DOMContentLoaded", async () => {
    try {
        const recursiveQuery = `
            WITH RECURSIVE taxon_hierarchy AS (
            SELECT t.taxon_id, t.parent_id, t.rank, t.taxon_name, t.common_name, o.observation_id, 
            CONCAT(t.rank, ': ', t.taxon_name,
            CASE WHEN t.common_name IS NOT NULL THEN ' (' || t.common_name || ')' ELSE '' END) AS taxon_line,
            1 AS level
            FROM biodiversidad.observation o
            JOIN biodiversidad.taxon t ON o.taxon_id = t.taxon_id
            
            UNION ALL

            SELECT p.taxon_id, p.parent_id, p.rank, p.taxon_name, p.common_name, th.observation_id,
            CONCAT(p.rank, ': ', p.taxon_name, 
            CASE WHEN p.common_name IS NOT NULL THEN ' (' || p.common_name || ')' ELSE '' END),
            th.level + 1
            FROM biodiversidad.taxon p
            JOIN taxon_hierarchy th ON p.taxon_id = th.parent_id)
            SELECT o.observation_id, o.date_obs, t.taxon_name AS species_name,
            t.common_name AS species_common_name, (SELECT string_agg(th2.taxon_line, ' > ' ORDER BY th2.level DESC)
            FROM taxon_hierarchy th2
            WHERE th2.observation_id = o.observation_id) AS taxonomy_hierarchy
            FROM biodiversidad.observation o
            JOIN biodiversidad.taxon t ON o.taxon_id = t.taxon_id
            ORDER BY o.date_obs DESC;
        `;

        const response = await fetch('http://localhost:8080/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: recursiveQuery })
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const observationsWithHierarchy = await response.json();
        displayObservations(observationsWithHierarchy);

    } catch (error) {
        document.getElementById("observations-body").innerHTML = `
            <tr>
                <td colspan="4" class="error">Error al cargar datos: ${error.message}</td>
            </tr>
        `;
    }
});

function displayObservations(observations) {
    const tbody = document.getElementById("observations-body");
    tbody.innerHTML = '';

    if (!observations || observations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4">No se encontraron observaciones</td>
            </tr>
        `;
        return;
    }

    observations.forEach(obs => {
        const row = document.createElement('tr');

        const observationDate = obs.date_obs || 'Sin fecha';
        const speciesName = obs.species_name || 'Desconocido';
        const commonName = obs.species_common_name ? `<small>(${obs.species_common_name})</small>` : '';

        let hierarchyHTML = 'No disponible';
        if (obs.taxonomy_hierarchy) {
            const hierarchyParts = obs.taxonomy_hierarchy.split(' > ');

            hierarchyHTML = hierarchyParts.map(part => {
                const rankMatch = part.match(/^([^:]+):/);
                const nameMatch = part.match(/: ([^(]+)/);
                const commonNameMatch = part.match(/\(([^)]+)\)/);

                const rank = rankMatch ? rankMatch[1].trim() : '';
                const taxonName = nameMatch ? nameMatch[1].trim() : part;
                const commonName = commonNameMatch ? commonNameMatch[1].trim() : null;

                return `
                    <div class="hierarchy-item">
                        <span class="rank-label">${translateRank(rank)}:</span>
                        <span>${taxonName}</span>
                        ${commonName ? `<small>(${commonName})</small>` : ''}
                    </div>
                `;
            }).join('');
        }

        row.innerHTML = `
            <td>${obs.observation_id || 'N/A'}</td>
            <td>
                ${speciesName}
                ${commonName}
            </td>
            <td>${observationDate}</td>
            <td>${hierarchyHTML}</td>
        `;

        tbody.appendChild(row);
    });
}

function translateRank(rank) {
    const translations = {
        'domain': 'Dominio',
        'kingdom': 'Reino',
        'phylum': 'Filo',
        'class': 'Clase',
        'order': 'Orden',
        'family': 'Familia',
        'genus': 'Género',
        'species': 'Especie'
    };
    return translations[rank.toLowerCase()] || rank;
}