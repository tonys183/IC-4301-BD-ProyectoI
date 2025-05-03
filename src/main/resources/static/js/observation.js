document.addEventListener("DOMContentLoaded", () => {
    loadUsers();
    document.getElementById("observation-form").addEventListener("submit", handleSubmit);
    document.getElementById("image-url").addEventListener("change", previewImage);
    setupTaxonAutocomplete();
});

async function loadUsers() {
    try {
        const response = await fetch("http://localhost:8080/users");

        if (!response.ok) { throw new Error(`Error HTTP: ${response.status}`); }

        const users = await response.json();
        const userSelect = document.getElementById("user");
        const photographerSelect = document.getElementById("photographer");
        const ownerSelect = document.getElementById("image-owner");

        userSelect.innerHTML = '<option value="">-- Seleccione un usuario --</option>';
        photographerSelect.innerHTML = '<option value="">-- Seleccione el fotógrafo --</option>';
        ownerSelect.innerHTML = '<option value="">-- Seleccione el dueño --</option>';

        users.forEach(user => {
            const optionText = `${user.first_name} ${user.last_name}`;
            const userOption = document.createElement("option");

            userOption.value = user.user_id;
            userOption.textContent = optionText;
            userSelect.appendChild(userOption);

            const photoOption = userOption.cloneNode(true);
            const ownerOption = userOption.cloneNode(true);

            photographerSelect.appendChild(photoOption);
            ownerSelect.appendChild(ownerOption);
        });

    } catch (error) {
    }
}

function previewImage() {
    const url = document.getElementById("image-url").value;
    const preview = document.getElementById("image-preview");

    if (url) {
        preview.innerHTML = `<img src="${url}" alt="Vista previa" style="max-width: 300px; max-height: 200px; margin-top: 10px;">`;
    } else {
        preview.innerHTML = '';
    }
}

function setupTaxonAutocomplete() {
    const taxonInput = document.getElementById("taxon-name");
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = 'taxon-suggestions';
    suggestionsContainer.className = 'suggestions-container';
    taxonInput.parentNode.appendChild(suggestionsContainer);

    let searchTimeout;
    let allTaxons = [];

    fetch("http://localhost:8080/taxons")
        .then(res => res.json())
        .then(taxons => {
            allTaxons = taxons;
        })
        .catch(error => console.error("Error cargando taxones:", error));

    taxonInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        if (query.length < 2) {
            suggestionsContainer.style.display = 'none';
            document.getElementById("taxon-id").value = "";
            return;
        }

        searchTimeout = setTimeout(() => {
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
            } else {
                suggestionsContainer.style.display = 'none';
            }
        }, 300);
    });

    suggestionsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('suggestion-item')) {
            const taxonId = e.target.getAttribute('data-id');
            const taxonName = e.target.getAttribute('data-name');
            taxonInput.value = taxonName;
            document.getElementById("taxon-id").value = taxonId;
            suggestionsContainer.style.display = 'none';
        }
    });

    document.addEventListener('click', function(e) {
        if (e.target !== taxonInput) {
            suggestionsContainer.style.display = 'none';
        }
    });
}

async function createImage(taxonId, imageData) {
    const photographerId = document.getElementById("photographer").value;
    const owner = document.getElementById("image-owner").options[document.getElementById("image-owner").selectedIndex].text;
    const license = document.getElementById("image-license").value;

    const imagePayload = {
        user_id: photographerId,
        taxon_id: taxonId,
        date_img: imageData.date,
        latitude_img: imageData.latitude,
        longitude_img: imageData.longitude,
        license: license,
        url: imageData.image_url,
        owner: owner
    };

    const res = await fetch("http://localhost:8080/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imagePayload)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al crear la imagen");
    }

    return await res.json();
}

function validDate(dateString) {
    const inputDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate <= today;
}

async function handleSubmit(e) {
    e.preventDefault();
    try {
        if (!document.getElementById("taxon-id").value) {
            alert("Por favor seleccione un taxón válido.");
            document.getElementById("taxon-name").focus();
            return;
        }

        const dateInput = document.getElementById("date").value;
        if (!validDate(dateInput)) {
            alert("Fecha inválida");
            document.getElementById("date").focus();
            return;
        }

        const requiredFields = [
            'user', 'taxon-name', 'image-url', 'date',
            'latitude', 'longitude', 'photographer',
            'image-owner', 'image-license'
        ];

        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                alert(`Por favor complete el campo ${field.labels[0].textContent}`);
                field.focus();
                return;
            }
        }

        const date = document.getElementById("date").value
        const [year, month, day] = date.split('-');
        const dateObj = new Date(year, month - 1, parseInt(day, 10));
        dateObj.setDate(dateObj.getDate() + 1);
        const dateFix = {
            year: dateObj.getFullYear(),
            month: dateObj.getMonth() + 1,
            day: dateObj.getDate()
        };

        const formData = {
            user_id: parseInt(document.getElementById("user").value),
            taxon_name: document.getElementById("taxon-name").value.trim(),
            image_url: document.getElementById("image-url").value.trim(),
            date: `${dateFix.year}-${String(dateFix.month).padStart(2, '0')}-${String(dateFix.day).padStart(2, '0')}`,
            latitude: parseFloat(document.getElementById("latitude").value),
            longitude: parseFloat(document.getElementById("longitude").value),
            note: document.getElementById("note").value.trim(),
            taxon_id: document.getElementById("taxon-id").value
        };
        let taxonId = formData.taxon_id;

        const image = await createImage(taxonId, {
            date: formData.date,
            latitude: document.getElementById("latitude").value,
            longitude: document.getElementById("longitude").value,
            image_url: document.getElementById("image-url").value
        });

        if (!image?.image_id) { throw new Error("No se pudo obtener el ID de la imagen creada"); }

        const observation = {
            user_id: formData.user_id,
            taxon_id: parseInt(taxonId),
            image_id: image.image_id,
            date_obs: formData.date,
            latitude_obs: formData.latitude,
            longitude_obs: formData.longitude,
            note: formData.note
        };

        const obsRes = await fetch("http://localhost:8080/observations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(observation)
        });
        if (!obsRes.ok) {
            const error = await obsRes.json();
            throw new Error(error.message || "Error al guardar observación");
        }
        const savedObservation = await obsRes.json();

        document.getElementById("observation-form").reset();
        document.getElementById("image-preview").innerHTML = '';

    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}