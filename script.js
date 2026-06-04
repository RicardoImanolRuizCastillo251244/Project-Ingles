// Matriz de 8x8 pre-diseñada con HAPPY y SAD instaladas
// H A P P Y está en la diagonal (desde 1,1)
// S A D está en la fila de abajo (fila index 6)
const gridData = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I'],
    ['O', 'H', 'P', 'A', 'S', 'D', 'F', 'G'],
    ['H', 'J', 'A', 'K', 'L', 'Z', 'X', 'C'],
    ['V', 'B', 'N', 'P', 'M', 'Q', 'W', 'E'],
    ['R', 'T', 'Y', 'U', 'P', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'Y', 'H', 'J'],
    ['K', 'S', 'A', 'D', 'L', 'Z', 'X', 'C'],
    ['V', 'B', 'N', 'M', 'Q', 'W', 'E', 'R']
];

// Coordenadas exactas [fila, columna] de las palabras correctas
const targetWords = {
    'HAPPY': [ '1,1', '2,2', '3,3', '4,4', '5,5' ], // Diagonal
    'SAD': [ '6,1', '6,2', '6,3' ]                  // Horizontal abajo
};

let selectedCells = [];
let isMouseDown = false;
const foundWords = [];

const gridContainer = document.getElementById('wordSearchGrid');

// Inicializar el tablero
function initGrid() {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.textContent = gridData[r][c];
            cell.dataset.row = r;
            cell.dataset.col = c;

            // Eventos para arrastrar y seleccionar con el mouse
            cell.addEventListener('mousedown', () => startSelection(cell));
            cell.addEventListener('mouseenter', () => extendSelection(cell));
            cell.addEventListener('mouseup', endSelection);

            gridContainer.appendChild(cell);
        }
    }
    // Si el usuario suelta el click fuera de las celdas, termina la selección
    window.addEventListener('mouseup', endSelection);
}

function startSelection(cell) {
    if (cell.classList.contains('found')) return;
    isMouseDown = true;
    selectCell(cell);
}

function extendSelection(cell) {
    if (!isMouseDown || cell.classList.contains('found')) return;
    selectCell(cell);
}

function selectCell(cell) {
    // Evita duplicar la misma celda en la selección actual
    if (!selectedCells.includes(cell)) {
        cell.classList.add('selected');
        selectedCells.push(cell);
    }
}

function endSelection() {
    if (!isMouseDown) return;
    isMouseDown = false;

    // Convertimos las celdas seleccionadas a sus coordenadas de texto
    const selectedCoords = selectedCells.map(c => `${c.dataset.row},${c.dataset.col}`);
    
    let wordFound = false;

    // Verificar si las celdas seleccionadas coinciden exactamente con alguna palabra
    for (const [word, coords] of Object.entries(targetWords)) {
        if (!foundWords.includes(word)) {
            // Comprobamos si todas las coordenadas requeridas están seleccionadas
            const match = coords.every(coord => selectedCoords.includes(coord)) && 
                          coords.length === selectedCoords.length;

            if (match) {
                markAsFound(word, selectedCells);
                wordFound = true;
                break;
            }
        }
    }

    // Si no fue una palabra correcta, limpiamos el color azul
    if (!wordFound) {
        selectedCells.forEach(c => c.classList.remove('selected'));
    }

    selectedCells = [];
}

// Acción cuando se encuentra una palabra correcta
function markAsFound(word, cells) {
    foundWords.push(word);
    
    // Cambiar color azul a verde permanente
    cells.forEach(c => {
        c.classList.remove('selected');
        c.classList.add('found');
    });

    // Tachar de la lista visual
    document.getElementById(`word-${word}`).classList.add('crossed');

    // Verificar si ganó
    if (foundWords.length === Object.keys(targetWords).length) {
        setTimeout(() => alert('¡Felicidades! Encontraste todos los adjetivos.'), 300);
    }
}

// Arrancar el juego
initGrid();