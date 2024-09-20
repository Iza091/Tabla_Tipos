// Lista de los 18 tipos elementales en inglés
const validTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

// Objeto de traducciones (para futuras referencias, pero no se usará aquí)
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

// Función para agregar una fila en la tabla solo con SVG
function addRow(typeData) {
    const tableBody = document.getElementById('type-table-body');
    const row = document.createElement('tr');

    // Celda para el SVG del tipo
    const typeCell = document.createElement('td');
    typeCell.innerHTML = `
        <img src="./img/${typeData.name}.svg" alt="${translations[typeData.name]}" class="type-icon">
    `;
    row.appendChild(typeCell);

    // Fuerte contra
    const strongAgainstCell = document.createElement('td');
    strongAgainstCell.innerHTML = typeData.damage_relations.double_damage_to.map(type => `
        <img src="./img/${type.name}.svg" alt="${translations[type.name]}" class="type-icon">
    `).join(', ') || '-';
    row.appendChild(strongAgainstCell);

    // Débil contra
    const weakAgainstCell = document.createElement('td');
    weakAgainstCell.innerHTML = typeData.damage_relations.double_damage_from.map(type => `
        <img src="./img/${type.name}.svg" alt="${translations[type.name]}" class="type-icon">
    `).join(', ') || '-';
    row.appendChild(weakAgainstCell);

    // Inmune contra
    const immuneAgainstCell = document.createElement('td');
    immuneAgainstCell.innerHTML = typeData.damage_relations.no_damage_from.map(type => `
        <img src="./img/${type.name}.svg" alt="${translations[type.name]}" class="type-icon">
    `).join(', ') || '-';
    row.appendChild(immuneAgainstCell);

    tableBody.appendChild(row);
}

// Llamar a la función cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', fetchTypeData);
