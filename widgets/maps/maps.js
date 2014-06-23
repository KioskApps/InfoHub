//Maps Namespace
var maps = {};

//Global Variables
/**
 * API key for accessing the Google Maps API.
 * @type string
 */
maps.API_KEY = 'AIzaSyCEc-ILEMoraGX8sL0pMdgtfqSq2kOkleo';

/**
 * Types of map layers to be used by the map.
 * @type array
 */
maps.layersArray = ['none', 'traffic', 'transit'];

/**
 * The index of the current layer in the layersArray.
 * @type number
 */
maps.layersIndex = 0;

/**
 * The time between automatically switching to the next map layer.
 * @type number
 */
maps.layersUpdateTime = 10000;

/**
 * The interval id for switching the map layers.
 * @type number
 */
maps.layersUpdateInterval;

/**
 * Initializes the maps widget
 * @returns {undefined}
 */
maps.initialize = function() {
    $('<iframe/>').attr('src', 'widgets/maps/sandbox.html').appendTo(maps.wv.find('.frame'));
};

/**
 * Resets the widget to display data based on a new location.
 * @param {location} location - The location object that defines the
 *      location for the widget to reference.
 * @returns {undefined}
 */
maps.setLocation = function(location) {
    maps.v.find('iframe').each(function() {
        var win = this.contentWindow;
        if (win !== null) {
            maps.setViewLocation(location);
        }
    });
};

/**
 * Performs intialization operations when the view is opened.
 * @returns {undefined}
 */
maps.viewStart = function() {
    maps.setViewLocation(live.location);
    maps.layersIndex = 0;
    maps.layersUpdateTime = 10000;
    maps.v.find('.layers .traffic').click(function() {
        maps.setLayer(maps.v, 'traffic');
    });
    maps.v.find('.layers .transit').click(function() {
        maps.setLayer(maps.v, 'transit');
    });
    maps.v.find('.layers .none').click(function() {
        maps.setLayer(maps.v, 'none');
    });
    maps.layersUpdate();
    clearInterval(maps.layersUpdateInterval);
    maps.layersUpdateInterval = setInterval(function()
    {
        maps.layersUpdate();
    }, maps.layersUpdateTime);
    
    maps.w.trigger('markerReady');
};

/**
 * Sets the view to a loading state while the map refreshes.
 * @param {location} location - The location object that defines the
 *      location for the widget to reference.
 * @returns {undefined}
 */
maps.setViewLocation = function(location) {
    maps.showViewLoading();
    maps.setMapLocation(maps.v, location, maps.hideViewLoading);
};

/**
 * Sends a message to the MapsAPI sandbox to set the location.
 * @param {jQuery element} selector - The element that holds the iframe
 *      Maps element to update.
 * @param {location} location - The location object that defines the
 *      location for the widget to reference.
 * @param {function()} callback - callback function to 
 *      execute when message has been sent.
 * @returns {undefined}
 */
maps.setMapLocation = function(selector, location, callback) {
    setTimeout(function() {
        selector.find('iframe').each(function() {
            var win = this.contentWindow;
            if (win === null) {
                maps.setMapLocation(selector, location, callback);
            }
            else {
                win.postMessage({
                    'widget': 'maps',
                    'lat': location.lat,
                    'lng': location.lng
                }, '*');
                if (callback !== undefined) {
                    callback();
                }
            }
        });
    }, 100);
};

/**
 * Sends a message to the MapsAPI sandbox to set the location.
 * @param {jQuery element} selector - The element that holds the iframe
 *      Maps element to update.
 * @param {string} layer - The location object that defines the
 *      location for the widget to reference.
 * @returns {undefined}
 */
maps.setLayer = function(selector, layer) {
    maps.postMessage(selector, {
        'widget': 'maps',
        'layer': layer
    });
    $('.layers button', selector).removeClass('selected');
    $('.layers .' + layer, selector).addClass('selected');
    maps.layersIndex = maps.layersArray.indexOf(layer);
};

/**
 * Changes the currently selected map layer.
 * @returns {undefined}
 */
maps.layersUpdate = function()
{
    maps.setLayer(maps.v, maps.layersArray[maps.layersIndex]);
    maps.layersIndex++;
    if (maps.layersIndex > maps.layersArray.length - 1)
    {
        maps.layersIndex = 0;
    }    
};

/**
 * Adds a marker to the map.
 * @param {location} location - The location object that defines the
 *      location for the map marker.
 * @returns {undefined}
 */
maps.setMarker = function(location) {
    maps.postMessage(maps.v, {
        'widget': 'maps',
        'marker': location
    });
};

/**
 * Posts a message to the MapsAPI sandbox.
 * @param {jQuery element} selector - The element that holds the iframe
 *      Maps element to update.
 * @param {string} message - The message to send to the MapsAPI
 * @returns {undefined}
 */
maps.postMessage = function(selector, message) {
    selector.find('iframe').each(function() {
        var win = this.contentWindow;
        if (win !== null) {
            win.postMessage(message, '*');
        }
    });
};