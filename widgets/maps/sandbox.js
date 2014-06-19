var map;
var layers = {};
var layersArray = [];
var layersIndex = 0;
var marker;

var currentLat;
var currentLng;

var lastTouchX;
var lastTouchY;

function initializeMap() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&' +
            'callback=initializeCallback';
    document.body.appendChild(script);
}
function initializeCallback() {
    layers.traffic = new google.maps.TrafficLayer();
    layers.transit = new google.maps.TransitLayer();
    layersArray.push('none');
    layersArray.push('traffic');
    layersArray.push('transit');
    
    drawMap();
}
function drawMap() {
    var mapOptions = {
        'center': {
            'lat': currentLat,
            'lng': currentLng
        },
        'zoom': 13,
        'disableDefaultUI': true
    };
    
    var mapCanvas = document.getElementById('map-canvas');
    map = new google.maps.Map(mapCanvas, mapOptions);
    mapCanvas.addEventListener('touchstart', function() {
        lastTouchX = 0;
        lastTouchY = 0;
    });
    mapCanvas.addEventListener('touchend', function() {
        lastTouchX = 0;
        lastTouchY = 0;
    });
    mapCanvas.addEventListener('touchmove', mapDragged);
}
function mapDragged(e) {
    if (map) {
        var newX = e.touches[0].screenX;
        var newY = e.touches[0].screenY;
        if (lastTouchX !== 0 && lastTouchY !== 0) {
            var deltaX = lastTouchX - newX;
            var deltaY = lastTouchY - newY;
            map.panBy(deltaX, deltaY);
        }
        lastTouchX = newX;
        lastTouchY = newY;
    }
}

function setLayer(layer, noUpdate) {
    if (!noUpdate) {
        layerLastSet = Date.now();
    }
    for (var key in layers) {
        layers[key].setMap(null);
    }
    if (layers[layer]) {
        layers[layer].setMap(map);
    }
}

function setMarker(location) {
    if (marker !== undefined) {
        marker.setMap(null);
    }
    var latLng = {
        'lat': parseFloat(location.lat),
        'lng': parseFloat(location.lng)
    };
    marker = new google.maps.Marker({
        'animation': google.maps.Animation.DROP,
        'position': latLng
    });
    map.setCenter(latLng);
    marker.setMap(map);
}

function updateMap(e) {
    if (e.data.widget === 'maps') {
        if (e.data.lat && e.data.lng) {
            currentLat = parseFloat(e.data.lat);
            currentLng = parseFloat(e.data.lng);
        }
        if (map === undefined) {
            initializeMap();
        }
        else {
            if (e.data.layer) {
                setLayer(e.data.layer);
            }
            else if (e.data.marker) {
                setMarker(e.data.marker);
            }
            else if (e.data.lat && e.data.lng) {
                map.setCenter({
                    'lat': currentLat,
                    'lng': currentLng
                });
            }
        }
    }
}

window.onload = function() {
    window.addEventListener('message', updateMap);
};