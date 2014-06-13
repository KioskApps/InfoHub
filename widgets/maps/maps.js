//Maps Namespace
var maps = {};

//Global Variables
maps.API_KEY = 'AIzaSyCEc-ILEMoraGX8sL0pMdgtfqSq2kOkleo';


maps.initialize = function() {
    $('<iframe/>').attr('src', 'widgets/maps/sandbox.html').appendTo(maps.wv.find('.frame'));
};

maps.setLocation = function(location) {
    maps.v.find('iframe').each(function() {
        var win = this.contentWindow;
        if (win !== null) {
            maps.setViewLocation(location);
        }
    });
    maps.setWidgetLocation(location);
};

maps.viewStart = function() {
    maps.setViewLocation(live.location);
    maps.v.find('.layers .traffic').click(function() {
        maps.setLayer(maps.v, 'traffic');
    });
    maps.v.find('.layers .transit').click(function() {
        maps.setLayer(maps.v, 'transit');
    });
    maps.v.find('.layers .none').click(function() {
        maps.setLayer(maps.v, 'none');
    });
};

maps.setViewLocation = function(location) {
    maps.showViewLoading();
    maps.setMapLocation(maps.v, location, maps.hideViewLoading);
};
maps.setWidgetLocation = function(location) {
    maps.showWidgetLoading();
    var url = [];
    url.push('http://maps.googleapis.com/maps/api/staticmap?zoom=13&size=1000x1000');
    url.push('&center=');
    url.push(location.city);
    live.getExternalImage(url.join(''), function(src) {
        maps.w.find('.static').css('background-image', 'url("' + src + '")');
        maps.hideWidgetLoading();
    });
};
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

maps.setLayer = function(selector, layer) {
    maps.postMessage(selector, {
        'widget': 'maps',
        'layer': layer
    });
};

maps.setMarker = function(location) {
    maps.postMessage(maps.v, {
        'widget': 'maps',
        'marker': location
    });
};

maps.postMessage = function(selector, message) {
    selector.find('iframe').each(function() {
        var win = this.contentWindow;
        if (win !== null) {
            win.postMessage(message, '*');
        }
    });
};