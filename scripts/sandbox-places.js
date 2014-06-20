/* Places Sandbox */
var places = {};
places.service;
places.events = {};
places.pagination = {};

places.checkScript = function() {
    return google && google.maps && google.maps.places;
};

places.getScriptUrl = function() {
    return 'http://maps.googleapis.com/maps/api/js?libraries=places&sensor=false';
};

places.messageHandler = function(e) {
    places.events[e.data.widget] = e;
    if (typeof places.service === 'undefined') {
        places.service = new google.maps.places.PlacesService(document.createElement('places-service'));
    }
    
    if (e.data.reference !== undefined) {
        places.getDetails(e.data.reference, e);
    }
    else {
        places.getNearbySearch(e.data.location, e.data.options, e);
    }
};
places.getNearbySearch = function(location, options, event) {
    if (options.pageKey === undefined) {
        var request = {
            'location': {
                'lat': location.lat,
                'lng': location.lng
            },
            'radius': 5000
        };
        for (var key in options) {
            request[key] = options[key];
        }
        places.service.nearbySearch(request, function(results, status, pages) {
            var pageKey = 0;
            if (pages.hasNextPage) {
                pageKey = Math.floor((Math.random() * 5000) + 1);
                places.pagination[pageKey] = pages;
            }

            var resultsCopy = [];
            for (var i = 0; i < results.length; i++) {
                resultsCopy.push(places.createPlaceResultMessage(results[i]));
            }
            var message = {
                'script': 'places',
                'widget': event.data.widget,
                'results': resultsCopy,
                'status': status,
                'hasNextPage': pages.hasNextPage,
                'pageKey': pageKey
            };
            window.sandbox.returnMessage(event, message);
        });
    }
    else if (places.pagination[options.pageKey] !== undefined) {
        places.pagination[options.pageKey].nextPage();
        delete places.pagination[options.pageKey];
    }
};
places.getDetails = function(reference, event) {
    var request = {
        'reference': reference
    };
    places.service.getDetails(request, function(result, status) {
        if (result === null) {
            //If a details request is requested too soon after a reference is 
            //provided, the result will be null. There is a short delay after 
            //a reference is provided before details can be retrieved
            return;
        }
        var resultCopy = places.createPlaceResultMessage(result);
        var message = {
            'script': 'places',
            'widget': event.data.widget,
            'result': deepCopySafeMessage(resultCopy),
            'status': status
        };
        window.sandbox.returnMessage(event, message);
    });
};
places.createPlaceResultMessage = function(result) {
    var copy = deepCopySafeMessage(result);
    if (copy.photos === undefined) {
        copy.photos = [];
    }
    for (var j = 0; j < copy.photos.length; j++) {
        copy.photos[j].url = result.photos[j].getUrl({
            'maxWidth': copy.photos[j].width,
            'maxHeight': copy.photos[j].height
        });
    }
    return copy;
};