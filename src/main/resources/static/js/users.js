document.addEventListener("DOMContentLoaded", async () => {
    try {
        const sqlQuery = `
            SELECT
                u.user_id,
                u.first_name || ' ' || u.last_name AS user_name,
                t.taxon_name AS species_name,
                t.common_name,
                img.url AS image_url,
                COUNT(i.identification_id) AS identification_count
            FROM biodiversidad.observation o
                     INNER JOIN biodiversidad.user u ON o.user_id = u.user_id
                     INNER JOIN biodiversidad.image img ON o.image_id = img.image_id
                     INNER JOIN biodiversidad.taxon t ON o.taxon_id = t.taxon_id
                     LEFT JOIN biodiversidad.identification i ON o.observation_id = i.observation_id
            GROUP BY
                u.user_id, u.first_name, u.last_name, t.taxon_name, t.common_name, img.url
            ORDER BY
                u.last_name, u.first_name, identification_count 
                DESC
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

        const userObservations = await response.json();
        displayUserObservations(userObservations);

    } catch (error) {
        document.getElementById("users-body").innerHTML = `
            <tr>
                <td colspan="4" class="error">Error al cargar datos: ${error.message}</td>
            </tr>
        `;
    }
});

function displayUserObservations(userObservations) {
    const tbody = document.getElementById("users-body");
    tbody.innerHTML = '';

    if (userObservations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4">No se encontraron usuarios con observaciones</td>
            </tr>
        `;
        return;
    }

    userObservations.forEach(obs => {
        const row = document.createElement('tr');

        const imageCell = obs.image_url
            ? `<img src="${obs.image_url}" class="user-img" onerror="this.style.display='none'">`
            : 'No disponible';

        row.innerHTML = `
            <td>${obs.user_name || 'Desconocido'}</td>
            <td>
                ${obs.species_name || 'Desconocido'}
                ${obs.common_name ? `<br><small>(${obs.common_name})</small>` : ''}
            </td>
            <td>${obs.identification_count || '0'}</td>
            <td>${imageCell}</td>
        `;

        tbody.appendChild(row);
    });
}