var mapScale = 1;  

function generateMap() {
    
    var width = document.getElementById('map-width').value;
    var height = document.getElementById('map-height').value;

    
    var mapContainer = document.getElementById('map-container');
    mapContainer.innerHTML = ''; 

    var mapContent = document.createElement('div');
    mapContent.id = 'map-content';

    for (var i = 0; i < height; i++) {
        var row = document.createElement('div');
        row.classList.add('row');
        for (var j = 0; j < width; j++) {
            var tile = document.createElement('div');
            tile.classList.add('tile');
            tile.addEventListener('click', function(e) {
                e.target.classList.remove('tree', 'water', 'river', 'road');
                e.target.classList.add(currentTexture);
            });
            tile.addEventListener('mousedown', handleTileMouseDown);
            tile.addEventListener('mouseover', handleTileMouseOver);
            tile.addEventListener('mouseup', handleTileMouseUp);
            row.appendChild(tile);
        }
        mapContent.appendChild(row);
    }
    mapContainer.appendChild(mapContent);
}

// reszta twojego kodu


function zoomIn() {
    mapScale += 0.1;  
    document.getElementById('map-content').style.transform = 'scale(' + mapScale + ')';
}

function zoomOut() {
    if (mapScale > 0.1) {
        mapScale -= 0.1;  
        document.getElementById('map-content').style.transform = 'scale(' + mapScale + ')';
    }
}

function resetZoom() {
    mapScale = 1;
    document.getElementById('map-content').style.transform = 'scale(1)';
}

document.getElementById('reset-button').addEventListener('click', resetZoom);
document.getElementById('zoom-in-button').addEventListener('click', zoomIn);
document.getElementById('zoom-out-button').addEventListener('click', zoomOut);
document.getElementById('generate-button').addEventListener('click', generateMap);



document.getElementById('export-button').addEventListener('click', exportMap);

var tileTypeMap = {
    'empty': 0,
    'tree': 1,
    'water': 2,
    'river': 3,
    'road': 4,
    // ... dodaj więcej typów płytek, jeśli potrzebujesz
};

function exportMap() {
    var mapContainer = document.getElementById('map-container');
    var rows = mapContainer.getElementsByClassName('row');
    var mapData = [];
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var tiles = row.getElementsByClassName('tile');
        var rowData = [];
        for (var j = 0; j < tiles.length; j++) {
            var tile = tiles[j];
            var tileType = 'empty'; 
            for (var type in tileTypeMap) {
                if (tile.classList.contains(type)) {
                    tileType = type;
                    break;
                }
            }
            var tileTypeNumber = tileTypeMap[tileType];
            rowData.push(tileTypeNumber);
        }
        mapData.push(rowData);
    }
    var mapDataJson = JSON.stringify(mapData);
    
    var downloadLink = document.createElement('a');
    downloadLink.href = 'data:text/plain,' + encodeURIComponent(mapDataJson);
    downloadLink.download = 'map.json';
    downloadLink.click();
}

document.getElementById('export-button').addEventListener('click', exportMap);

function importMap() {
    var importInput = document.getElementById('import-input');
    importInput.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) {
            return;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
            var contents = e.target.result;
            var mapData = JSON.parse(contents);

            var mapContainer = document.getElementById('map-container');
            mapContainer.innerHTML = '';  // usuń poprzednią mapę

            // przekształć dane z powrotem na mapę
            for (var i = 0; i < mapData.length; i++) {
                var row = document.createElement('div');
                row.classList.add('row');
                var rowData = mapData[i];
                for (var j = 0; j < rowData.length; j++) {
                    var tileTypeNumber = rowData[j];
                    var tileType = Object.keys(tileTypeMap).find(key => tileTypeMap[key] === tileTypeNumber);
                    var tile = document.createElement('div');
                    tile.classList.add('tile', tileType);
                    row.appendChild(tile);
                }
                mapContainer.appendChild(row);
            }
        };
        reader.readAsText(file);
    });

    importInput.click();  // otwórz dialog wyboru pliku
}

document.getElementById('import-button').addEventListener('click', importMap);


let mapContainer = document.getElementById('map-container');
let isDown = false;
let startX, startY;
let scrollLeft, scrollTop;
var sidebarWidth = 200;
var edgeScrollInterval = null;
var mouseX, mouseY;

mapContainer.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - mapContainer.offsetLeft;
    startY = e.pageY - mapContainer.offsetTop;
    scrollLeft = mapContainer.scrollLeft;
    scrollTop = mapContainer.scrollTop;
});

mapContainer.addEventListener('mouseleave', () => {
    isDown = false;
});

mapContainer.addEventListener('mouseup', () => {
    isDown = false;
});

mapContainer.addEventListener('mousemove', (e) => {
    var rect = mapContainer.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    var scrollingMethod = document.getElementById('scrolling-method').value;
    if (scrollingMethod === 'drag') {
        if(!isDown) return;
        e.preventDefault();
        const x = e.pageX - mapContainer.offsetLeft;
        const walkX = (x - startX);
        const y = e.pageY - mapContainer.offsetTop;
        const walkY = (y - startY);
        mapContainer.scrollLeft = scrollLeft - walkX;
        mapContainer.scrollTop = scrollTop - walkY;
    }
});


mapContainer.addEventListener('mouseenter', (e) => {
    if (edgeScrollInterval === null) {
        edgeScrollInterval = setInterval(edgeScroll, 50);  
    }
});

mapContainer.addEventListener('mouseleave', (e) => {
    if (edgeScrollInterval !== null) {
        clearInterval(edgeScrollInterval);
        edgeScrollInterval = null;  
    }
});

function edgeScroll() {
    var scrollingMethod = document.getElementById('scrolling-method').value;
    if (scrollingMethod === 'edge') {
        const edgeThreshold = 50;  // szerokosc przewijania 
        const scrollSpeed = 10;  // szybkosc przewijania
        if (mouseX < edgeThreshold) {
            if (mouseX - sidebarWidth < edgeThreshold) {
                mapContainer.scrollLeft -= scrollSpeed;
            }
            
        } else if (mouseX > mapContainer.clientWidth - edgeThreshold) {
            mapContainer.scrollLeft += scrollSpeed;
        }
        if (mouseY < edgeThreshold) {
            if (mapContainer.scrollTop > 0) {
                mapContainer.scrollTop -= scrollSpeed;
            }
        } else if (mouseY > window.innerHeight - edgeThreshold) {
            mapContainer.scrollTop += scrollSpeed;
        }
    }
}

// Przechowuje aktualną wybraną teksturę.
var currentTexture = 'tree'; 

var textureButtons = document.querySelectorAll('#texture-buttons img');
textureButtons.forEach(function(button) {
    button.addEventListener('click', function() {
        // Po kliknięciu, uaktualnij aktualną teksturę.
        currentTexture = this.getAttribute('data-value');
        
        // Opcjonalnie, możesz dodać kod do zaznaczania aktualnie wybranego przycisku.
        textureButtons.forEach(function(button) {
            button.classList.remove('selected');
        });
        this.classList.add('selected');
    });
});

// W zdarzeniu click dla kafelka, użyj zmiennej currentTexture zamiast pobierać wartość z select.
tile.addEventListener('click', function(e) {
    e.target.classList.remove('tree', 'water', 'river', 'road');
    e.target.classList.add(currentTexture);
});

var isDrawing = false;

function handleTileClick(e) {
    e.target.classList.remove('tree', 'water', 'river', 'road');
    e.target.classList.add(currentTexture);
}

function handleTileMouseDown(e) {
    isDrawing = true;
    handleTileClick(e);
}

function handleTileMouseOver(e) {
    if (isDrawing) {
        handleTileClick(e);
    }
}

function handleTileMouseUp() {
    isDrawing = false;
}
