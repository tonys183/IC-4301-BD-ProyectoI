document.addEventListener("DOMContentLoaded", () => {
    setupTaxonAutocomplete();
});

async function setupTaxonAutocomplete() {
    const taxonInput = document.getElementById("taxon-name");
    const suggestionsContainer = document.getElementById("suggestions-container");
    const hierarchyList = document.getElementById("hierarchy-list");
    const taxonHierarchy = document.getElementById("taxon-hierarchy");

    let allTaxons = [];

    try {
        const response = await fetch("http://localhost:8080/taxons");
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        allTaxons = await response.json();
    } catch (error) {
        mostrarError("Error al cargar la base de taxones");
        return;
    }

    let searchTimeout;

    taxonInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        if (query.length < 2) {
            suggestionsContainer.classList.add('suggestions-hidden');
            return;
        }

        searchTimeout = setTimeout(() => {
            const filtered = allTaxons.filter(taxon =>
                taxon.taxon_name.toLowerCase().includes(query.toLowerCase()) &&
                taxon.rank === "species"
            );

            if (filtered.length > 0) {
                suggestionsContainer.innerHTML = filtered.map(taxon => `
                    <div class="suggestion-item" 
                         data-id="${taxon.taxon_id}"
                         data-name="${taxon.taxon_name}">
                        ${taxon.taxon_name}${taxon.common_name ? ` (${taxon.common_name})` : ''}
                    </div>
                `).join('');
                suggestionsContainer.classList.remove('suggestions-hidden');
            } else {
                suggestionsContainer.classList.add('suggestions-hidden');
            }
        }, 300);
    });

    suggestionsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('suggestion-item')) {
            const taxonId = e.target.getAttribute('data-id');
            const taxonName = e.target.getAttribute('data-name');

            taxonInput.value = taxonName;
            document.getElementById("taxon-id").value = taxonId;
            suggestionsContainer.classList.add('suggestions-hidden');

            mostrarJerarquia(taxonId);
        }
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.taxon-search')) {
            suggestionsContainer.classList.add('suggestions-hidden');
        }
    });
}

async function mostrarJerarquia(taxonId) {
    const lista = document.getElementById("hierarchy-list");
    const contenedor = document.getElementById("taxon-hierarchy");

    lista.innerHTML = '<li class="loading">Buscando información taxonómica...</li>';
    contenedor.style.display = "block";

    try {
        const res = await fetch("http://localhost:8080/taxons");
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        const taxons = await res.json();

        const especie = taxons.find(t => t.taxon_id == taxonId);
        if (!especie) throw new Error("Especie no encontrada");

        const jerarquia = [];
        let actual = especie;

        while (actual) {
            jerarquia.unshift({
                rank: actual.rank,
                name: actual.taxon_name,
                commonName: actual.common_name
            });
            actual = taxons.find(t => t.taxon_id === actual.parent_id);
        }

        lista.innerHTML = "";
        jerarquia.forEach(nivel => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span class="rank-label">${traducirRango(nivel.rank)}:</span>
                <span class="taxon-name">${nivel.name}</span>
                ${nivel.commonName ? `<br><small>(${nivel.commonName})</small>` : ''}
            `;
            lista.appendChild(li);
        });

    } catch (error) {
        mostrarError("Hubo un error al obtener la jerarquía. Intenta nuevamente.");
    }
}

function traducirRango(rank) {
    const traducciones = {
        'domain': 'Dominio',
        'kingdom': 'Reino',
        'phylum': 'Filo',
        'class': 'Clase',
        'order': 'Orden',
        'family': 'Familia',
        'genus': 'Género',
        'species': 'Especie'
    };
    return traducciones[rank] || rank;
}

function mostrarError(mensaje) {
    const lista = document.getElementById("hierarchy-list");
    const contenedor = document.getElementById("taxon-hierarchy");

    lista.innerHTML = `<li class="error">${mensaje}</li>`;
    contenedor.style.display = "block";
}