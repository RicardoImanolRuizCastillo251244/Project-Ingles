// --------------------------------------------------------------
// MATRIZ ORIGINAL 8x8 CON HAPPY y SAD posicionados exactamente
// HAPPY: diagonal desde [1][1] -> [5][5] (fila,columna)
// SAD: horizontal en fila 6, columnas 1,2,3
// --------------------------------------------------------------
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

// Coordenadas exactas de cada palabra (formato "fila,columna")
const targetWords = {
    'HAPPY': ['1,1', '2,2', '3,3', '4,4', '5,5'], // Diagonal H A P P Y
    'SAD': ['6,1', '6,2', '6,3']                  // Horizontal S A D
};

// Estado del juego
let selectedCells = [];       // Celdas actualmente en selección activa (resaltadas azul)
let isSelecting = false;      // Para mouse y dedo: si estamos pulsando
let foundWords = [];           // Palabras ya encontradas
let allCells = [];             // Almacenar todas las celdas DOM para manipulación rápida

const gridContainer = document.getElementById('wordSearchGrid');

// --------------------------------------------------------------
// FUNCIÓN PARA COMPROBAR SI LA SELECCIÓN ACTUAL CORRESPONDE A UNA PALABRA VÁLIDA
// --------------------------------------------------------------
function isExactWordMatch(selectedCoordsArray, wordCoordsArray) {
    if (selectedCoordsArray.length !== wordCoordsArray.length) return false;
    // Copia y ordena para comparar sets (independientemente del orden de selección)
    const sortedSelected = [...selectedCoordsArray].sort();
    const sortedTarget = [...wordCoordsArray].sort();
    for (let i = 0; i < sortedSelected.length; i++) {
        if (sortedSelected[i] !== sortedTarget[i]) return false;
    }
    return true;
}

// Marcar palabra como encontrada y actualizar UI
function markWordAsFound(word, cellsToMark) {
    if (foundWords.includes(word)) return false;
    
    foundWords.push(word);
    
    // Pintar las celdas de verde permanente
    cellsToMark.forEach(cell => {
        cell.classList.remove('selected');
        cell.classList.add('found');
    });
    
    // Tachar de la lista visual
    const wordElement = document.getElementById(`word-${word}`);
    if (wordElement) wordElement.classList.add('crossed');
    
    // Verificar si ya completó el juego
    if (foundWords.length === Object.keys(targetWords).length) {
        setTimeout(() => {
            if (document.querySelector('.toast-win')) return;
            const winDiv = document.createElement('div');
            winDiv.className = 'toast-win';
            winDiv.innerText = '🎉 ¡Felicidades! Encontraste todos los adjetivos. 🎉';
            document.body.appendChild(winDiv);
            setTimeout(() => {
                if (winDiv) winDiv.remove();
            }, 3000);
        }, 150);
    }
    return true;
}

// Procesar la selección terminada (mouseup o touchend)
function finalizeSelection() {
    if (!isSelecting) return;
    isSelecting = false;
    
    if (selectedCells.length === 0) return;
    
    // Obtener coordenadas actuales de las celdas seleccionadas
    const selectedCoords = selectedCells.map(cell => `${cell.dataset.row},${cell.dataset.col}`);
    let anyWordMatched = false;
    
    // Recorrer todas las palabras no encontradas aún
    for (const [word, requiredCoords] of Object.entries(targetWords)) {
        if (!foundWords.includes(word)) {
            if (isExactWordMatch(selectedCoords, requiredCoords)) {
                markWordAsFound(word, selectedCells);
                anyWordMatched = true;
                break; // Solo una palabra por selección
            }
        }
    }
    
    // Si no coincidió con ninguna palabra, limpiar el resaltado azul
    if (!anyWordMatched) {
        selectedCells.forEach(cell => {
            cell.classList.remove('selected');
        });
    }
    
    // Limpiar array de selección
    selectedCells = [];
}

// Reiniciar selección actual sin verificar
function abortSelection() {
    if (selectedCells.length) {
        selectedCells.forEach(cell => {
            cell.classList.remove('selected');
        });
        selectedCells = [];
    }
    isSelecting = false;
}

// Agregar una celda a la selección actual
function addCellToSelection(cell) {
    if (cell.classList.contains('found')) return false;
    if (selectedCells.includes(cell)) return false;
    
    cell.classList.add('selected');
    selectedCells.push(cell);
    return true;
}

// ----- MANEJADORES TÁCTILES (para móviles) -----
function getCellFromTouch(touch) {
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    if (elem && elem.classList && elem.classList.contains('cell')) return elem;
    let target = elem;
    while (target && target !== gridContainer) {
        if (target.classList && target.classList.contains('cell')) return target;
        target = target.parentElement;
    }
    return null;
}

function onTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const cell = getCellFromTouch(touch);
    if (!cell) return;
    if (cell.classList.contains('found')) return;
    
    isSelecting = true;
    selectedCells = [];
    addCellToSelection(cell);
}

function onTouchMove(e) {
    if (!isSelecting) return;
    e.preventDefault();
    const touch = e.touches[0];
    const cell = getCellFromTouch(touch);
    if (!cell) return;
    if (cell.classList.contains('found')) return;
    if (!selectedCells.includes(cell)) {
        addCellToSelection(cell);
    }
}

function onTouchEnd(e) {
    e.preventDefault();
    if (!isSelecting) return;
    finalizeSelection();
}

function onTouchCancel(e) {
    e.preventDefault();
    abortSelection();
}

// ----- MANEJADORES DE MOUSE (para escritorio) -----
function onMouseDown(e) {
    e.preventDefault();
    const cell = e.target.closest('.cell');
    if (!cell) return;
    if (cell.classList.contains('found')) return;
    
    isSelecting = true;
    selectedCells = [];
    addCellToSelection(cell);
}

function onMouseMove(e) {
    if (!isSelecting) return;
    e.preventDefault();
    const cell = e.target.closest('.cell');
    if (!cell) return;
    if (cell.classList.contains('found')) return;
    if (!selectedCells.includes(cell)) {
        addCellToSelection(cell);
    }
}

function onMouseUp(e) {
    if (!isSelecting) return;
    e.preventDefault();
    finalizeSelection();
}

function onMouseLeaveGrid() {
    if (isSelecting) {
        abortSelection();
    }
}

// ----- Inicializar la cuadrícula y eventos duales -----
function initGrid() {
    gridContainer.innerHTML = '';
    allCells = [];
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.textContent = gridData[r][c];
            cell.dataset.row = r;
            cell.dataset.col = c;
            gridContainer.appendChild(cell);
            allCells.push(cell);
        }
    }
    
    // EVENTOS TÁCTILES
    gridContainer.addEventListener('touchstart', onTouchStart, { passive: false });
    gridContainer.addEventListener('touchmove', onTouchMove, { passive: false });
    gridContainer.addEventListener('touchend', onTouchEnd);
    gridContainer.addEventListener('touchcancel', onTouchCancel);
    
    // EVENTOS MOUSE
    gridContainer.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    gridContainer.addEventListener('mouseleave', onMouseLeaveGrid);
    
    document.body.addEventListener('mouseup', (e) => {
        if (isSelecting) finalizeSelection();
    });
}

// Función para reiniciar el juego (opcional)
function resetGame() {
    foundWords = [];
    selectedCells.forEach(c => c.classList.remove('selected'));
    selectedCells = [];
    isSelecting = false;
    
    allCells.forEach(cell => {
        cell.classList.remove('found', 'selected');
    });
    
    const wordHappy = document.getElementById('word-HAPPY');
    const wordSad = document.getElementById('word-SAD');
    if (wordHappy) wordHappy.classList.remove('crossed');
    if (wordSad) wordSad.classList.remove('crossed');
    
    const toast = document.querySelector('.toast-win');
    if (toast) toast.remove();
}

// Inicializar el juego
initGrid();

// Configuración táctil global
document.body.style.touchAction = 'pan-x pan-y';
if (gridContainer) gridContainer.style.touchAction = 'none';