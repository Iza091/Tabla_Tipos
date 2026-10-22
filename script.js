const TIPOS = {
    normal:   { es: 'Normal',    color: '#919AA2' },
    fire:     { es: 'Fuego',     color: '#FD7D24' },
    water:    { es: 'Agua',      color: '#4392C4' },
    electric: { es: 'Eléctrico', color: '#FBD23C' },
    grass:    { es: 'Planta',    color: '#3FA129' },
    ice:      { es: 'Hielo',     color: '#74CEC0' },
    fighting: { es: 'Lucha',     color: '#EF6239' },
    poison:   { es: 'Veneno',    color: '#AB6AC8' },
    ground:   { es: 'Tierra',    color: '#D97845' },
    flying:   { es: 'Volador',   color: '#A98EF1' },
    psychic:  { es: 'Psíquico',  color: '#F366B9' },
    bug:      { es: 'Bicho',     color: '#90C12C' },
    rock:     { es: 'Roca',      color: '#A799C2' },
    ghost:    { es: 'Fantasma',  color: '#5269AC' },
    dragon:   { es: 'Dragón',    color: '#0B6AB3' },
    dark:     { es: 'Siniestro', color: '#5A5465' },
    steel:    { es: 'Acero',     color: '#5A8EA1' },
    fairy:    { es: 'Hada',      color: '#EF8EF9' }
};

const CUBETAS_DEFENSA = [
    { m: 4,    peso: '×4', titulo: 'Le daña muchísimo',      clase: 'nivel4' },
    { m: 2,    peso: '×2', titulo: 'Le daña',                clase: 'nivel2' },
    { m: 0.5,  peso: '×½', titulo: 'Le resiste',             clase: 'nivel05' },
    { m: 0.25, peso: '×¼', titulo: 'Le resiste mucho',       clase: 'nivel025' },
    { m: 0,    peso: '×0', titulo: 'Es inmune',              clase: 'nivel0' },
    { m: 1,    peso: '×1', titulo: 'Daño normal',            clase: 'nivel1' }
];

const CUBETAS_ATAQUE = [
    { m: 2,   peso: '×2', titulo: 'Supereficaz',   clase: 'nivel2' },
    { m: 0.5, peso: '×½', titulo: 'Poco eficaz',   clase: 'nivel05' },
    { m: 0,   peso: '×0', titulo: 'Sin efecto',    clase: 'nivel0' }
];

const URL_API = 'https://pokeapi.co/api/v2/type/';
const URL_SPRITES = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
const CLAVE_CACHE = 'tabla-tipos-v3-tipo-';
const POR_PAGINA = 48;

let modo = '';
let primario = '';
let secundario = '';
let pokemonActual = [];
let paginaPokemon = 1;
const cacheTipos = new Map();

const almacen = (typeof sessionStorage !== 'undefined') ? sessionStorage : null;

function obtenerTipo(id) {
    if (cacheTipos.has(id)) return cacheTipos.get(id);
    const promesa = (async () => {
        if (almacen) {
            const guardado = almacen.getItem(CLAVE_CACHE + id);
            if (guardado) {
                const datos = JSON.parse(guardado);
                cacheTipos.set(id, datos);
                return datos;
            }
        }
        try {
            const respuesta = await fetch(URL_API + id);
            if (!respuesta.ok) throw new Error('La PokéAPI respondió ' + respuesta.status);
            const datos = await respuesta.json();
            if (almacen) {
                try { almacen.setItem(CLAVE_CACHE + id, JSON.stringify(datos)); } catch (o) {}
            }
            return datos;
        } catch (error) {
            cacheTipos.delete(id);
            throw error;
        }
    })();
    cacheTipos.set(id, promesa);
    return promesa;
}

function extraerId(url) {
    const m = /\/(\d+)\/?$/.exec(url || '');
    return m ? Number(m[1]) : null;
}

function digerir(datos) {
    const nombres = (lista) => (lista || []).map(r => r.name);
    return {
        id: datos.name,
        d2: nombres(datos.damage_relations.double_damage_to),
        dm: nombres(datos.damage_relations.half_damage_to),
        d0: nombres(datos.damage_relations.no_damage_to),
        pokemon: (datos.pokemon || [])
            .map(p => ({ nombre: p.pokemon.name, id: extraerId(p.pokemon.url) })),
    };
}

function multiplicadorDefensa(tipoBlanco, atacante) {
    if (atacante.d0.includes(tipoBlanco)) return 0;
    if (atacante.d2.includes(tipoBlanco)) return 2;
    if (atacante.dm.includes(tipoBlanco)) return 0.5;
    return 1;
}

function calcularDefensa(tiposBlanco, digests) {
    return Object.keys(TIPOS).map(idAtacante => {
        let m = 1;
        tiposBlanco.forEach(tipo => { m *= multiplicadorDefensa(tipo, digests[idAtacante]); });
        return { id: idAtacante, m };
    });
}

function deDigestAtaque(digest) {
    const lista = [];
    digest.d2.forEach(id => lista.push({ id, m: 2 }));
    digest.dm.forEach(id => lista.push({ id, m: 0.5 }));
    digest.d0.forEach(id => lista.push({ id, m: 0 }));
    return lista;
}

function agruparPorMultiplicador(entries) {
    const grupos = {};
    entries.forEach(e => {
        const clave = String(e.m);
        (grupos[clave] = grupos[clave] || []).push(e.id);
    });
    return grupos;
}

function ordenarPokemon(lista) {
    return [...lista].sort((a, b) => (a.id || 999999) - (b.id || 999999));
}

function pokemonDeAmbos(listaA, listaB) {
    const enB = new Set(listaB.map(p => p.nombre));
    const vistos = new Set();
    return ordenarPokemon(listaA.filter(p => {
        if (!enB.has(p.nombre) || vistos.has(p.nombre)) return false;
        vistos.add(p.nombre);
        return true;
    }));
}

function colorTexto(hex) {
    const n = hex.replace('#', '');
    const r = parseInt(n.slice(0, 2), 16);
    const g = parseInt(n.slice(2, 4), 16);
    const b = parseInt(n.slice(4, 6), 16);
    const luminancia = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminancia > 0.6 ? '#141822' : '#ffffff';
}

function nombreBonito(nombre) {
    return nombre.split('-').join(' ').replace(/(^|\s)(\w)/g, (m) => m.toUpperCase());
}

function completaBusqueda() {
    return !!modo && !!primario && (modo === 'single' || !!secundario);
}

function crearChip(id) {
    const meta = TIPOS[id];
    if (!meta) return null;
    const chip = document.createElement('span');
    chip.className = 'tipo-chip';
    chip.style.setProperty('--tipo', meta.color);
    const img = document.createElement('img');
    img.src = './img/' + id + '.svg';
    img.alt = '';
    const nombre = document.createElement('span');
    nombre.textContent = meta.es;
    chip.append(img, nombre);
    return chip;
}

function crearInsignia(id) {
    const meta = TIPOS[id];
    const insignia = document.createElement('span');
    insignia.className = 'insignia';
    insignia.style.background = meta.color;
    insignia.style.color = colorTexto(meta.color);
    const img = document.createElement('img');
    img.src = './img/' + id + '.svg';
    img.alt = '';
    const texto = document.createElement('span');
    texto.textContent = meta.es;
    insignia.append(img, texto);
    return insignia;
}

function crearRejilla() {
    const bloque = document.createElement('div');
    bloque.className = 'selector-bloque';
    const titulo = document.createElement('p');
    titulo.className = 'panel-titulo';
    titulo.textContent = modo === 'dual' ? 'Elige dos tipos, uno tras otro' : 'Tipo';
    const rejilla = document.createElement('div');
    rejilla.className = 'rejilla-tipos';
    Object.entries(TIPOS).forEach(([id, meta]) => {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'boton-tipo';
        boton.style.setProperty('--tipo', meta.color);
        boton.dataset.tipo = id;
        const esPrimario = primario === id;
        const esSecundario = secundario === id;
        if (esPrimario || (modo === 'dual' && esSecundario)) boton.classList.add('marcado');
        if (modo === 'dual' && (esPrimario || esSecundario)) {
            const orden = document.createElement('span');
            orden.className = 'orden';
            orden.style.background = meta.color;
            orden.style.color = colorTexto(meta.color);
            orden.textContent = esPrimario ? '1' : '2';
            boton.append(orden);
        }
        const img = document.createElement('img');
        img.src = './img/' + id + '.svg';
        img.alt = '';
        const texto = document.createElement('span');
        texto.textContent = meta.es;
        boton.append(img, texto);
        rejilla.append(boton);
    });
    bloque.append(titulo, rejilla);
    return bloque;
}

function buildPanel() {
    const panel = document.getElementById('search-container');
    panel.innerHTML = '';

    const bloqueModo = document.createElement('div');
    const tituloModo = document.createElement('p');
    tituloModo.className = 'panel-titulo';
    tituloModo.textContent = '¿Qué deseas buscar?';
    const filaModo = document.createElement('div');
    filaModo.className = 'botones-modo';
    [['single', 'Pokémon de un tipo'], ['dual', 'Pokémon de dos tipos']].forEach(([valor, texto]) => {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.dataset.modo = valor;
        boton.textContent = texto;
        boton.className = 'boton-modo' + (modo === valor ? ' activo' : '');
        filaModo.append(boton);
    });
    bloqueModo.append(tituloModo, filaModo);
    panel.append(bloqueModo);

    if (modo) panel.append(crearRejilla());
    if (modo) {
        const limpiar = document.createElement('button');
        limpiar.type = 'button';
        limpiar.id = 'limpiar';
        limpiar.textContent = 'Quitar selección';
        limpiar.className = 'btn-limpiar';
        panel.append(limpiar);
    }
}

function limpiarEstado() {
    folio++;
    modo = '';
    primario = '';
    secundario = '';
    buildPanel();
    limpiarResultados();
}

function elegirModo(nuevoModo) {
    folio++;
    if (modo === nuevoModo) return;
    modo = nuevoModo;
    primario = '';
    secundario = '';
    buildPanel();
    limpiarResultados();
}

function elegirTipo(tipo) {
    folio++;
    if (modo === 'dual') {
        if (primario === tipo) {
            primario = secundario;
            secundario = '';
        } else if (secundario === tipo) {
            secundario = '';
        } else if (!primario) {
            primario = tipo;
        } else if (!secundario) {
            secundario = tipo;
        } else {
            primario = secundario;
            secundario = tipo;
        }
    } else {
        primario = (primario === tipo) ? '' : tipo;
    }
    buildPanel();
    if (completaBusqueda()) {
        buscar();
    } else {
        limpiarResultados();
    }
}

function limpiarResultados() {
    const resultados = document.getElementById('results-container');
    resultados.innerHTML = '';
    const aviso = document.createElement('div');
    aviso.className = 'estado-vacio';
    aviso.textContent = completaBusqueda() ? ''
        : (modo && primario && modo === 'dual' && !secundario)
            ? 'El primer tipo está puesto. Elige el segundo para ver la combinación.'
            : 'Elige un modo y un tipo para ver los resultados.';
    if (!completaBusqueda()) resultados.append(aviso);
}

function mostrarCargando(mensaje) {
    const resultados = document.getElementById('results-container');
    resultados.innerHTML = '';
    const caja = document.createElement('div');
    caja.className = 'cargando';
    const img = document.createElement('img');
    img.className = 'esfera';
    img.src = './img/Pokeball.png';
    img.alt = '';
    const texto = document.createElement('span');
    texto.textContent = mensaje;
    caja.append(img, texto);
    resultados.append(caja);
}

function mostrarError(mensaje) {
    const resultados = document.getElementById('results-container');
    resultados.innerHTML = '';
    const caja = document.createElement('div');
    caja.className = 'aviso';
    caja.textContent = mensaje;
    const reintentar = document.createElement('button');
    reintentar.type = 'button';
    reintentar.textContent = 'Reintentar';
    reintentar.addEventListener('click', () => { buscar(); });
    caja.append(reintentar);
    resultados.append(caja);
}

function crearFilaCubeta(cubeta, ids, colapsable) {
    if (colapsable) {
        const detalle = document.createElement('details');
        detalle.className = 'fila ' + cubeta.clase;
        const resumen = document.createElement('summary');
        const etiqueta = document.createElement('span');
        etiqueta.className = 'etiqueta';
        etiqueta.textContent = cubeta.peso + ' ' + cubeta.titulo + ' (' + ids.length + ')';
        resumen.append(etiqueta);
        const listaContenida = document.createElement('div');
        listaContenida.className = 'lista-tipos';
        ids.forEach(id => {
            const chip = crearChip(id);
            if (chip) listaContenida.append(chip);
        });
        const vacia = document.createElement('span');
        vacia.className = 'texto-suave';
        vacia.textContent = 'Ninguno';
        if (!ids.length) listaContenida.append(vacia);
        detalle.append(resumen);
        if (ids.length) detalle.append(listaContenida);
        return detalle;
    }
    const fila = document.createElement('div');
    fila.className = 'fila ' + cubeta.clase;
    const etiqueta = document.createElement('span');
    etiqueta.className = 'etiqueta';
    etiqueta.textContent = cubeta.peso + ' ' + cubeta.titulo;
    const lista = document.createElement('div');
    lista.className = 'lista-tipos';
    ids.forEach(id => {
        const chip = crearChip(id);
        if (chip) lista.append(chip);
    });
    if (!ids.length) {
        const vacia = document.createElement('span');
        vacia.className = 'texto-suave';
        vacia.textContent = 'Ninguno';
        lista.append(vacia);
    }
    fila.append(etiqueta, lista);
    return fila;
}

function crearSeccionAtaque(idTipo, filas, conTitular) {
    const seccion = document.createElement('div');
    seccion.className = 'ataque-tanda' + (conTitular ? ' con-titular' : '');
    if (conTitular) {
        const titular = document.createElement('h4');
        titular.append(crearInsignia(idTipo));
        seccion.append(titular);
    }
    const grupos = agruparPorMultiplicador(filas);
    CUBETAS_ATAQUE.forEach(cubeta => {
        const ids = grupos[String(cubeta.m)] || [];
        const fila = document.createElement('div');
        fila.className = 'fila ' + cubeta.clase;
        const etiqueta = document.createElement('span');
        etiqueta.className = 'etiqueta';
        etiqueta.textContent = cubeta.peso + ' ' + cubeta.titulo;
        const lista = document.createElement('div');
        lista.className = 'lista-tipos';
        ids.forEach(id => {
            const chip = crearChip(id);
            if (chip) lista.append(chip);
        });
        if (!ids.length) {
            const vacia = document.createElement('span');
            vacia.className = 'texto-suave';
            vacia.textContent = 'Ninguno';
            lista.append(vacia);
        }
        fila.append(etiqueta, lista);
        seccion.append(fila);
    });
    return seccion;
}

function crearGrillaPokemon(lista) {
    paginaPokemon = Math.min(Math.max(paginaPokemon, 1), Math.max(1, Math.ceil(lista.length / POR_PAGINA)));
    const totalPaginas = Math.ceil(lista.length / POR_PAGINA);
    const visibles = lista.slice((paginaPokemon - 1) * POR_PAGINA, paginaPokemon * POR_PAGINA);

    const seccion = document.createElement('section');
    seccion.className = 'bloque bloque-pokemon';
    const titulo = document.createElement('h3');
    titulo.className = 'seccion-titulo';
    const texto = document.createElement('span');
    texto.textContent = 'Pokémon de ' + (modo === 'dual'
        ? TIPOS[primario].es + ' + ' + TIPOS[secundario].es
        : TIPOS[primario].es);
    const contador = document.createElement('span');
    contador.className = 'contador';
    contador.textContent = lista.length + ' Pokémon';
    titulo.append(texto, contador);
    const grilla = document.createElement('div');
    grilla.className = 'pokemon-grilla';
    visibles.forEach(p => grilla.append(crearPokemonItem(p)));
    seccion.append(titulo, grilla);

    if (totalPaginas > 1) {
        const paginador = document.createElement('nav');
        paginador.className = 'paginador';
        const anterior = document.createElement('button');
        anterior.type = 'button';
        anterior.textContent = '‹';
        anterior.setAttribute('aria-label', 'Página anterior');
        anterior.disabled = paginaPokemon === 1;
        anterior.addEventListener('click', () => { paginaPokemon--; redibujarPokemon(true); });
        paginador.append(anterior);
        for (let n = 1; n <= totalPaginas; n++) {
            const boton = document.createElement('button');
            boton.type = 'button';
            boton.textContent = String(n);
            boton.setAttribute('aria-label', 'Ir a la página ' + n);
            if (n === paginaPokemon) boton.classList.add('activo');
            boton.addEventListener('click', () => {
                if (n === paginaPokemon) return;
                paginaPokemon = n;
                redibujarPokemon(true);
            });
            paginador.append(boton);
        }
        const siguiente = document.createElement('button');
        siguiente.type = 'button';
        siguiente.textContent = '›';
        siguiente.setAttribute('aria-label', 'Página siguiente');
        siguiente.disabled = paginaPokemon === totalPaginas;
        siguiente.addEventListener('click', () => { paginaPokemon++; redibujarPokemon(true); });
        paginador.append(siguiente);
        seccion.append(paginador);
    }

    const nota = document.createElement('p');
    nota.className = 'texto-suave nota-pokemon';
    nota.textContent = 'Incluye formas alternativas (regionales, Mega y demás).';
    seccion.append(nota);
    return seccion;
}

function redibujarPokemon(bajar) {
    const viejo = document.querySelector('.bloque-pokemon');
    if (!viejo) return;
    const nuevo = crearGrillaPokemon(pokemonActual);
    viejo.replaceWith(nuevo);
    if (bajar) nuevo.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function crearPokemonItem(p) {
    const caja = document.createElement('div');
    caja.className = 'pokemon';
    caja.title = nombreBonito(p.nombre);
    if (p.id) {
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.width = 52;
        img.height = 52;
        img.src = URL_SPRITES + p.id + '.png';
        img.alt = nombreBonito(p.nombre);
        img.addEventListener('error', () => {
            img.remove();
            caja.classList.add('sin-imagen');
        });
        caja.append(img);
    } else {
        caja.classList.add('sin-imagen');
    }
    const nombre = document.createElement('span');
    nombre.className = 'nombre';
    nombre.textContent = nombreBonito(p.nombre);
    const numero = document.createElement('span');
    numero.className = 'numero';
    numero.textContent = p.id ? '#' + p.id : '—';
    caja.append(nombre, numero);
    return caja;
}

function mostrarResultados(gruposDefensa, tandasAtaque, pokemon) {
    const resultados = document.getElementById('results-container');
    resultados.innerHTML = '';

    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta';

    const cabecera = document.createElement('div');
    cabecera.className = 'cabecera-tipo';
    const listaTipos = modo === 'dual' ? [primario, secundario] : [primario];
    listaTipos.forEach((id, indice) => {
        if (indice > 0) {
            const mas = document.createElement('span');
            mas.className = 'simbolo-mas';
            mas.textContent = '+';
            cabecera.append(mas);
        }
        cabecera.append(crearInsignia(id));
    });
    tarjeta.append(cabecera);

    const seccionDefensa = document.createElement('section');
    seccionDefensa.className = 'bloque';
    const tituloDefensa = document.createElement('h3');
    tituloDefensa.className = 'seccion-titulo';
    tituloDefensa.textContent = 'Al recibir golpes, defiende así:';
    seccionDefensa.append(tituloDefensa);

    CUBETAS_DEFENSA.forEach(cubeta => {
        const ids = gruposDefensa[String(cubeta.m)] || [];
        if (cubeta.m === 1) {
            seccionDefensa.append(crearFilaCubeta(cubeta, ids, true));
        } else {
            seccionDefensa.append(crearFilaCubeta(cubeta, ids, false));
        }
    });
    tarjeta.append(seccionDefensa);

    const seccionAtaque = document.createElement('section');
    seccionAtaque.className = 'bloque';
    const tituloAtaque = document.createElement('h3');
    tituloAtaque.className = 'seccion-titulo';
    tituloAtaque.textContent = modo === 'dual' ? 'Al atacar, según el tipo de movimiento:' : 'Al atacar:';
    seccionAtaque.append(tituloAtaque);
    if (modo === 'dual') {
        const columnas = document.createElement('div');
        columnas.className = 'ataques-dobles';
        tandasAtaque.forEach(tanda => columnas.append(crearSeccionAtaque(tanda.id, tanda.filas, true)));
        seccionAtaque.append(columnas);
    } else {
        seccionAtaque.append(crearSeccionAtaque(primario, tandasAtaque[0].filas, false));
    }
    tarjeta.append(seccionAtaque);

    resultados.append(tarjeta);
    if (pokemon.length) {
        pokemonActual = pokemon;
        paginaPokemon = 1;
        resultados.append(crearGrillaPokemon(pokemon));
    } else {
        const caja = document.createElement('div');
        caja.className = 'tarjeta aviso';
        caja.textContent = 'No hay Pokémon con esa combinación exacta de tipos.';
        resultados.append(caja);
    }
}

let folio = 0;

async function buscar() {
    if (!completaBusqueda()) return;
    const folioMio = ++folio;
    const combinacion = { modo, primario, secundario };
    mostrarCargando('Descargando la tabla de tipos…');
    try {
        const ids = Object.keys(TIPOS);
        const respuestas = await Promise.all(ids.map(obtenerTipo));
        if (folio !== folioMio) return;
        const digests = {};
        respuestas.forEach(datos => {
            const digest = digerir(datos);
            digests[digest.id] = digest;
        });

        const tiposBlanco = combinacion.modo === 'dual'
            ? [combinacion.primario, combinacion.secundario]
            : [combinacion.primario];
        const defensa = agruparPorMultiplicador(calcularDefensa(tiposBlanco, digests));

        const tandasAtaque = tiposBlanco.map(id => ({ id, filas: deDigestAtaque(digests[id]) }));

        const pokemon = combinacion.modo === 'dual'
            ? pokemonDeAmbos(digests[combinacion.primario].pokemon, digests[combinacion.secundario].pokemon)
            : ordenarPokemon(digests[combinacion.primario].pokemon);

        if (folio !== folioMio) return;
        mostrarResultados(defensa, tandasAtaque, pokemon);
    } catch (error) {
        console.error(error);
        if (folio !== folioMio) return;
        mostrarError('No se pudieron obtener los datos de la PokéAPI. Revisa tu conexión e inténtalo de nuevo.');
    }
}

function alHacerClic(evento) {
    const botonModo = evento.target.closest('[data-modo]');
    if (botonModo) { elegirModo(botonModo.dataset.modo); return; }
    const botonTipo = evento.target.closest('[data-tipo]');
    if (botonTipo) { elegirTipo(botonTipo.dataset.tipo); return; }
    if (evento.target.closest('#limpiar')) { limpiarEstado(); }
}

function init() {
    document.addEventListener('click', alHacerClic);
    buildPanel();
    limpiarResultados();
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}
