// Lista de los 18 tipos elementales y traducciones
const validTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

const translations = {
    normal: 'Normal', fire: 'Fuego', water: 'Agua', electric: 'Eléctrico',
    grass: 'Planta', ice: 'Hielo', fighting: 'Lucha', poison: 'Veneno',
    ground: 'Tierra', flying: 'Volador', psychic: 'Psíquico', bug: 'Bicho',
    rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón', dark: 'Siniestro',
    steel: 'Acero', fairy: 'Hada'
};

// Objeto para almacenar los datos de tipos
let typeDataCache = {};
let selectedType = '';

// Función para crear el formulario de búsqueda
function createSearchForm() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';

    // Crear el contenedor del select personalizado
    const customSelect = document.createElement('div');
    customSelect.className = 'custom-select-container';

    // Crear el elemento que muestra la selección actual
    const selectedOption = document.createElement('div');
    selectedOption.className = 'selected-option';
    selectedOption.innerHTML = `
        <img class="selected-type-icon" src="" alt="" style="display: none">
        <span>Selecciona un tipo</span>
        <div class="arrow"></div>
    `;

    // Crear la lista de opciones
    const optionsList = document.createElement('div');
    optionsList.className = 'options-list';

    // Agregar todas las opciones de tipos
    validTypes.forEach(type => {
        const option = document.createElement('div');
        option.className = 'option';
        option.dataset.value = type;
        option.innerHTML = `
            <img src="./img/${type}.svg" alt="${translations[type]}">
            <span>${translations[type]}</span>
        `;
        optionsList.appendChild(option);
    });

    // Agregar elementos al contenedor del select
    customSelect.appendChild(selectedOption);
    customSelect.appendChild(optionsList);

    // Manejar la apertura/cierre del select
    selectedOption.addEventListener('click', () => {
        const isOpen = optionsList.style.display === 'block';
        optionsList.style.display = isOpen ? 'none' : 'block';
        selectedOption.classList.toggle('active', !isOpen);
    });

    // Manejar la selección de opciones
    optionsList.addEventListener('click', (e) => {
        const option = e.target.closest('.option');
        if (option) {
            const value = option.dataset.value;
            const selectedIcon = selectedOption.querySelector('.selected-type-icon');
            const selectedText = selectedOption.querySelector('span');

            selectedType = value; // Actualizar el tipo seleccionado
            selectedIcon.src = `./img/${value}.svg`;
            selectedIcon.alt = translations[value];
            selectedIcon.style.display = 'block';
            selectedText.textContent = translations[value];

            optionsList.style.display = 'none';
            selectedOption.classList.remove('active');
        }
    });

    // Cerrar el select cuando se hace clic fuera
    document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            optionsList.style.display = 'none';
            selectedOption.classList.remove('active');
        }
    });

    // Crear botón de búsqueda
    const searchButton = document.createElement('button');
    searchButton.textContent = 'Buscar';
    searchButton.id = 'search-button';

    // Agregar elementos al contenedor principal
    searchContainer.appendChild(customSelect);
    searchContainer.appendChild(searchButton);

    return searchContainer;
}

// Función para mostrar los resultados de la búsqueda
function displaySearchResults(typeData) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = ''; // Limpiar resultados anteriores

    if (!typeData) return; // Si no hay datos, solo limpiamos

    // Crear contenedor para los resultados
    const resultCard = document.createElement('div');
    resultCard.className = 'type-result-card';

    // Mostrar el tipo seleccionado
    const typeHeader = document.createElement('div');
    typeHeader.className = 'type-header';
    typeHeader.innerHTML = `
        <img src="./img/${typeData.name}.svg" alt="${translations[typeData.name]}" class="type-icon">
        <h2>${translations[typeData.name]}</h2>
    `;
    resultCard.appendChild(typeHeader);

    // Función helper para crear sección de relaciones
    function createRelationSection(title, relations, relationClass) {
        const section = document.createElement('div');
        section.className = 'relation-section';
        
        const sectionTitle = document.createElement('h3');
        sectionTitle.textContent = title;
        section.appendChild(sectionTitle);

        const typesList = document.createElement('div');
        typesList.className = 'types-list';

        relations.forEach(type => {
            const typeContainer = document.createElement('div');
            typeContainer.className = `type-container ${relationClass}`;
            
            const typeImg = document.createElement('img');
            typeImg.src = `./img/${type.name}.svg`;
            typeImg.alt = translations[type.name];
            typeImg.className = 'type-icon';

            const typeName = document.createElement('span');
            typeName.textContent = translations[type.name];
            typeName.className = 'type-name';

            typeContainer.appendChild(typeImg);
            typeContainer.appendChild(typeName);
            typesList.appendChild(typeContainer);
        });

        if (relations.length === 0) {
            const noTypes = document.createElement('p');
            noTypes.textContent = 'Ninguno';
            typesList.appendChild(noTypes);
        }

        section.appendChild(typesList);
        return section;
    }

    // Agregar secciones de relaciones
    resultCard.appendChild(createRelationSection('Eficaz contra:', 
        typeData.damage_relations.double_damage_to, 'effective'));
    resultCard.appendChild(createRelationSection('Débil contra:', 
        typeData.damage_relations.double_damage_from, 'weak'));
    resultCard.appendChild(createRelationSection('Resistente contra:', 
        typeData.damage_relations.half_damage_from, 'resistant'));
    resultCard.appendChild(createRelationSection('Inmune contra:', 
        typeData.damage_relations.no_damage_from, 'immune'));

    resultsContainer.appendChild(resultCard);
}

// Función para inicializar la aplicación
async function initializeApp() {
    // Crear contenedor principal si no existe
    const mainContainer = document.createElement('div');
    mainContainer.id = 'main-container';
    
    // Agregar título
    const title = document.createElement('h1');
    title.textContent = 'Buscador de Tipos Pokémon';
    mainContainer.appendChild(title);
    
    document.body.appendChild(mainContainer);

    // Agregar el formulario de búsqueda
    const searchForm = createSearchForm();
    mainContainer.appendChild(searchForm);

    // Crear contenedor para resultados
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'results-container';
    mainContainer.appendChild(resultsContainer);

    // Agregar event listener para el botón de búsqueda
    document.getElementById('search-button').addEventListener('click', async () => {
        if (!selectedType) {
            displaySearchResults(null); // Limpiar resultados si no hay tipo seleccionado
            return;
        }

        try {
            // Usar caché si existe, si no, hacer fetch
            if (!typeDataCache[selectedType]) {
                const response = await fetch(`https://pokeapi.co/api/v2/type/${selectedType}`);
                typeDataCache[selectedType] = await response.json();
            }
            displaySearchResults(typeDataCache[selectedType]);
        } catch (error) {
            console.error('Error fetching type data:', error);
            alert('Error al obtener los datos del tipo Pokémon');
        }
    });
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', initializeApp);