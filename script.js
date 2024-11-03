// Lista de los 18 tipos elementales y traducciones
const validTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

const translations = {
    normal: 'Normal', fire: 'Fuego', water: 'Agua', electric: 'Eléctrico',
    grass: 'Planta', ice: 'Hielo', fighting: 'Lucha', poison: 'Veneno',
    ground: 'Tierra', flying: 'Volador', psychic: 'Psíquico', bug: 'Bicho',
    rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón', dark: 'Siniestro',
    steel: 'Acero', fairy: 'Hada'
};

// Variables globales
let typeDataCache = {};
let selectedMode = '';
let selectedPrimaryType = '';
let selectedSecondaryType = '';

// Función para crear el selector de modo
function createModeSelector() {
    const modeContainer = document.createElement('div');
    modeContainer.className = 'mode-selector';

    const modeTitle = document.createElement('h3');
    modeTitle.textContent = '¿Qué deseas buscar?';
    modeContainer.appendChild(modeTitle);

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'mode-buttons';

    const singleButton = document.createElement('button');
    singleButton.textContent = 'Pokémon de un tipo';
    singleButton.className = 'mode-button';
    singleButton.onclick = () => selectMode('single');

    const dualButton = document.createElement('button');
    dualButton.textContent = 'Pokémon de dos tipos';
    dualButton.className = 'mode-button';
    dualButton.onclick = () => selectMode('dual');

    buttonContainer.appendChild(singleButton);
    buttonContainer.appendChild(dualButton);
    modeContainer.appendChild(buttonContainer);

    return modeContainer;
}

// Función para crear el selector de tipos
function createTypeSelector(isSecondary = false) {
    const selectorContainer = document.createElement('div');
    selectorContainer.className = `type-selector ${isSecondary ? 'secondary' : 'primary'}`;

    const selectorTitle = document.createElement('h3');
    selectorTitle.textContent = isSecondary ? 'Selecciona el tipo secundario:' : 'Selecciona el tipo primario:';
    selectorContainer.appendChild(selectorTitle);

    const customSelect = document.createElement('div');
    customSelect.className = 'custom-select-container';

    const selectedOption = document.createElement('div');
    selectedOption.className = 'selected-option';
    selectedOption.innerHTML = `
        <img class="selected-type-icon" src="" alt="" style="display: none">
        <span>Selecciona un tipo</span>
        <div class="arrow"></div>
    `;

    const optionsList = document.createElement('div');
    optionsList.className = 'options-list';

    // Filtrar tipos disponibles
    let availableTypes = isSecondary ? 
        validTypes.filter(type => type !== selectedPrimaryType) : 
        validTypes;

    availableTypes.forEach(type => {
        const option = document.createElement('div');
        option.className = 'option';
        option.dataset.value = type;
        option.innerHTML = `
            <img src="./img/${type}.svg" alt="${translations[type]}">
            <span>${translations[type]}</span>
        `;
        option.addEventListener('click', () => handleTypeSelection(type, isSecondary));
        optionsList.appendChild(option);
    });

    customSelect.appendChild(selectedOption);
    customSelect.appendChild(optionsList);
    selectorContainer.appendChild(customSelect);

    // Event listener para abrir/cerrar el selector
    selectedOption.addEventListener('click', (e) => {
        const isOpen = optionsList.style.display === 'block';
        optionsList.style.display = isOpen ? 'none' : 'block';
        selectedOption.classList.toggle('active', !isOpen);
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            optionsList.style.display = 'none';
            selectedOption.classList.remove('active');
        }
    });

    return selectorContainer;
}

// Función para manejar la selección de tipo
function handleTypeSelection(type, isSecondary) {
    if (isSecondary) {
        selectedSecondaryType = type;
    } else {
        selectedPrimaryType = type;
        if (selectedMode === 'dual') {
            selectedSecondaryType = ''; // Resetear tipo secundario
        }
    }
    
    updateUI();
}

// Función para actualizar la UI
function updateUI() {
    const searchContainer = document.querySelector('.search-container');
    searchContainer.innerHTML = '';

    // Agregar selector de modo
    const modeSelector = createModeSelector();
    searchContainer.appendChild(modeSelector);

    // Actualizar botones de modo
    document.querySelectorAll('.mode-button').forEach(button => {
        button.classList.remove('active');
        if (button.textContent.includes(selectedMode === 'single' ? 'un tipo' : 'dos tipos')) {
            button.classList.add('active');
        }
    });

    // Agregar selector de tipo primario
    if (selectedMode) {
        const primarySelector = createTypeSelector(false);
        searchContainer.appendChild(primarySelector);

        // Actualizar UI del tipo primario si está seleccionado
        if (selectedPrimaryType) {
            const primarySelectedOption = primarySelector.querySelector('.selected-option');
            const primaryIcon = primarySelectedOption.querySelector('.selected-type-icon');
            const primaryText = primarySelectedOption.querySelector('span');
            primaryIcon.src = `./img/${selectedPrimaryType}.svg`;
            primaryIcon.alt = translations[selectedPrimaryType];
            primaryIcon.style.display = 'block';
            primaryText.textContent = translations[selectedPrimaryType];
        }

        // Agregar selector de tipo secundario en modo dual
        if (selectedMode === 'dual' && selectedPrimaryType) {
            const secondarySelector = createTypeSelector(true);
            searchContainer.appendChild(secondarySelector);

            // Actualizar UI del tipo secundario si está seleccionado
            if (selectedSecondaryType) {
                const secondarySelectedOption = secondarySelector.querySelector('.selected-option');
                const secondaryIcon = secondarySelectedOption.querySelector('.selected-type-icon');
                const secondaryText = secondarySelectedOption.querySelector('span');
                secondaryIcon.src = `./img/${selectedSecondaryType}.svg`;
                secondaryIcon.alt = translations[selectedSecondaryType];
                secondaryIcon.style.display = 'block';
                secondaryText.textContent = translations[selectedSecondaryType];
            }
        }

        // Mostrar botón de búsqueda si se han seleccionado los tipos necesarios
        if ((selectedMode === 'single' && selectedPrimaryType) || 
            (selectedMode === 'dual' && selectedPrimaryType && selectedSecondaryType)) {
            const searchButton = document.createElement('button');
            searchButton.textContent = 'Buscar';
            searchButton.id = 'search-button';
            searchButton.onclick = handleSearch;
            searchContainer.appendChild(searchButton);
        }
    }
}

// Función para seleccionar modo
function selectMode(mode) {
    selectedMode = mode;
    selectedPrimaryType = '';
    selectedSecondaryType = '';
    updateUI();
}


// Función para manejar la búsqueda
async function handleSearch() {
    if (!selectedPrimaryType || (selectedMode === 'dual' && !selectedSecondaryType)) {
        return;
    }

    try {
        if (selectedMode === 'single') {
            // Búsqueda de un solo tipo
            if (!typeDataCache[selectedPrimaryType]) {
                const response = await fetch(`https://pokeapi.co/api/v2/type/${selectedPrimaryType}`);
                typeDataCache[selectedPrimaryType] = await response.json();
            }
            displaySearchResults(typeDataCache[selectedPrimaryType]);
        } else {
            // Búsqueda de tipo dual
            const combinedData = await calculateCombinedEffectiveness(selectedPrimaryType, selectedSecondaryType);
            displaySearchResults(combinedData, true);
        }
    } catch (error) {
        console.error('Error fetching type data:', error);
        alert('Error al obtener los datos del tipo Pokémon');
    }
}

// Función para calcular efectividades combinadas
async function calculateCombinedEffectiveness(primaryType, secondaryType) {
    try {
        // Obtener datos de ambos tipos
        const [primaryData, secondaryData] = await Promise.all([
            typeDataCache[primaryType] || 
                fetch(`https://pokeapi.co/api/v2/type/${primaryType}`).then(r => r.json()),
            typeDataCache[secondaryType] || 
                fetch(`https://pokeapi.co/api/v2/type/${secondaryType}`).then(r => r.json())
        ]);

        // Cachear los datos
        typeDataCache[primaryType] = primaryData;
        typeDataCache[secondaryType] = secondaryData;

        // Combinar efectividades
        const effectiveness = {
            name: `${primaryType}/${secondaryType}`,
            damage_relations: {
                double_damage_from: [],
                half_damage_from: [],
                no_damage_from: [],
                double_damage_to: [],
                half_damage_to: [],
                no_damage_to: []
            }
        };

        // Procesar relaciones de daño
        const processRelations = (relations, category) => {
            relations.forEach(type => {
                const existingType = effectiveness.damage_relations[category].find(t => t.name === type.name);
                if (!existingType) {
                    effectiveness.damage_relations[category].push(type);
                }
            });
        };

        // Combinar relaciones de ambos tipos
        ['double_damage_from', 'half_damage_from', 'no_damage_from', 
         'double_damage_to', 'half_damage_to', 'no_damage_to'].forEach(category => {
            processRelations(primaryData.damage_relations[category], category);
            processRelations(secondaryData.damage_relations[category], category);
        });

        return effectiveness;
    } catch (error) {
        console.error('Error calculating combined effectiveness:', error);
        throw error;
    }
}

// Función para mostrar los resultados
function displaySearchResults(typeData, isDualType = false) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';

    const resultCard = document.createElement('div');
    resultCard.className = 'type-result-card';

    // Mostrar encabezado
    const typeHeader = document.createElement('div');
    typeHeader.className = 'type-header';
    
    if (isDualType) {
        typeHeader.innerHTML = `
            <div class="dual-type-header">
                <img src="./img/${selectedPrimaryType}.svg" alt="${translations[selectedPrimaryType]}" class="type-icon">
                <span>/</span>
                <img src="./img/${selectedSecondaryType}.svg" alt="${translations[selectedSecondaryType]}" class="type-icon">
                <h2>${translations[selectedPrimaryType]} / ${translations[selectedSecondaryType]}</h2>
            </div>
        `;
    } else {
        typeHeader.innerHTML = `
            <img src="./img/${typeData.name}.svg" alt="${translations[typeData.name]}" class="type-icon">
            <h2>${translations[typeData.name]}</h2>
        `;
    }
    resultCard.appendChild(typeHeader);

    // Mostrar relaciones de daño
    const createRelationSection = (title, relations, relationClass) => {
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
    };

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
function initializeApp() {
    const mainContainer = document.createElement('div');
    mainContainer.id = 'main-container';
    
    const title = document.createElement('h1');
    title.textContent = 'Buscador de Tipos Pokémon';
    mainContainer.appendChild(title);
    
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    mainContainer.appendChild(searchContainer);

    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'results-container';
    mainContainer.appendChild(resultsContainer);

    document.body.appendChild(mainContainer);
    
    updateUI();
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', initializeApp);