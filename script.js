// Lista de los 18 tipos elementales en inglés
const validTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

// Objeto de traducciones (en español)
const translations = {
    normal: 'Normal',
    fire: 'Fuego',
    water: 'Agua',
    electric: 'Eléctrico',
    grass: 'Planta',
    ice: 'Hielo',
    fighting: 'Lucha',
    poison: 'Veneno',
    ground: 'Tierra',
    flying: 'Volador',
    psychic: 'Psíquico',
    bug: 'Bicho',
    rock: 'Roca',
    ghost: 'Fantasma',
    dragon: 'Dragón',
    dark: 'Siniestro',
    steel: 'Acero',
    fairy: 'Hada'
};

// Función para obtener datos de los tipos desde la PokéAPI
async function fetchTypeData() {
    const response = await fetch('https://pokeapi.co/api/v2/type');
    const data = await response.json();
    const types = data.results;

    for (const type of types) {
        // Comprobar si el tipo es uno de los 18 tipos elementales
        if (validTypes.includes(type.name)) {
            // Para cada tipo válido, obtenemos sus relaciones
            const typeResponse = await fetch(type.url);
            const typeData = await typeResponse.json();
            addRow(typeData);
        }
    }
}

// Debilidades 
function addRow(typeData) {
    const tableBody = document.getElementById('type-table-body');
    const row = document.createElement('tr');

    // Celda para el tipo principal (SVG con nombre)
    const typeCell = document.createElement('td');
    const typeContainer = document.createElement('div');
    typeContainer.classList.add('type-container');
    
    const typeImg = document.createElement('img');
    typeImg.src = `./img/${typeData.name}.svg`;
    typeImg.alt = translations[typeData.name]; // Asigna el texto alt desde el objeto de traducción
    typeImg.className = 'type-icon';
    
    const typeName = document.createElement('span');
    typeName.textContent = translations[typeData.name]; // Asigna el nombre del tipo
    typeName.className = 'type-name'; // Clase opcional para estilos
    
    typeContainer.appendChild(typeImg);
    typeContainer.appendChild(typeName);
    typeCell.appendChild(typeContainer);
    row.appendChild(typeCell);

    // Función auxiliar para crear celdas con múltiples tipos en su propio bloque (con nombres)
    function createTypeCell(typeArray, relation) {
        const cell = document.createElement('td');
        if (typeArray.length === 0) {
            cell.textContent = '-'; // Si no hay tipos, se muestra un guion
        } else {
            typeArray.forEach(type => {
                const container = document.createElement('div');
                container.classList.add('type-container');
                
                const img = document.createElement('img');
                img.src = `./img/${type.name}.svg`;
                img.alt = translations[type.name]; // Asigna el texto alt desde el objeto de traducción
                img.className = 'type-icon';

                const name = document.createElement('span');
                name.textContent = translations[type.name]; // Muestra el nombre traducido
                name.className = 'type-name';

                container.appendChild(img);
                container.appendChild(name);
                cell.appendChild(container);
            });
        }
        return cell;
    }

    // Agregar los tipos fuertes contra
    const strongAgainstCell = createTypeCell(typeData.damage_relations.double_damage_to, 'double_damage_to');
    row.appendChild(strongAgainstCell);

    // Agregar los tipos débiles contra
    const weakAgainstCell = createTypeCell(typeData.damage_relations.double_damage_from, 'double_damage_from');
    row.appendChild(weakAgainstCell);

    // Agregar los tipos inmunes
    const immuneAgainstCell = createTypeCell(typeData.damage_relations.no_damage_from, 'no_damage_from');
    row.appendChild(immuneAgainstCell);

    tableBody.appendChild(row);
}

// Función para agregar una fila en la tabla
function addRow(typeData) {
    const tableBody = document.getElementById('type-table-body');
    const row = document.createElement('tr');

    // Celda para el tipo principal (SVG con nombre)
    const typeCell = document.createElement('td');
    const typeContainer = document.createElement('div');
    typeContainer.classList.add('type-container');
    
    const typeImg = document.createElement('img');
    typeImg.src = `./img/${typeData.name}.svg`;
    typeImg.alt = translations[typeData.name]; // Asigna el texto alt desde el objeto de traducción
    typeImg.className = 'type-icon';
    
    const typeName = document.createElement('span');
    typeName.textContent = translations[typeData.name]; // Asigna el nombre del tipo
    typeName.className = 'type-name'; // Clase opcional para estilos
    
    typeContainer.appendChild(typeImg);
    typeContainer.appendChild(typeName);
    typeCell.appendChild(typeContainer);
    row.appendChild(typeCell);

    // Función auxiliar para crear celdas con múltiples tipos en su propio bloque (con nombres)
    function createTypeCell(typeArray) {
        const cell = document.createElement('td');
        if (typeArray.length === 0) {
            cell.textContent = '-'; // Si no hay tipos, se muestra un guion
        } else {
            typeArray.forEach(type => {
                const container = document.createElement('div');
                container.classList.add('type-container');
                
                const img = document.createElement('img');
                img.src = `./img/${type.name}.svg`;
                img.alt = translations[type.name]; // Asigna el texto alt desde el objeto de traducción
                img.className = 'type-icon';

                const name = document.createElement('span');
                name.textContent = translations[type.name]; // Muestra el nombre traducido
                name.className = 'type-name';

                container.appendChild(img);
                container.appendChild(name);
                cell.appendChild(container);
            });
        }
        return cell;
    }

    // Agregar los tipos eficaces contra (doble daño a)
    const strongAgainstCell = createTypeCell(typeData.damage_relations.double_damage_to);
    row.appendChild(strongAgainstCell);

    // Agregar los tipos débiles contra (recibe doble daño de)
    const weakAgainstCell = createTypeCell(typeData.damage_relations.double_damage_from);
    row.appendChild(weakAgainstCell);

    // Agregar los tipos resistentes contra (mitad de daño de)
    const resistantAgainstCell = createTypeCell(typeData.damage_relations.half_damage_from);
    row.appendChild(resistantAgainstCell);

    // Agregar los tipos inmunes (sin daño de)
    const immuneAgainstCell = createTypeCell(typeData.damage_relations.no_damage_from);
    row.appendChild(immuneAgainstCell);

    tableBody.appendChild(row);
}

// Llamar a la función cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', fetchTypeData);
