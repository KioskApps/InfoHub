//Places Namespace
var places = {};
places.callbacks = {};

places.getNearbySearch = function(widget, location, types) {
    var results = new places.PlaceResults(widget, null, location);
    
    places.nearbySearch(widget, function(data) {
        results.addResults(data);
    }, location, types);
    
    return results;
};
places.nearbySearch = function(widget, callback, location, types, pageKey) {
    places.callbacks[widget] = callback;
    var options = {
        'types': types
    };
    if (pageKey) {
        options.pageKey = pageKey;
    }
    sandbox.message({
        'script': 'places',
        'widget': widget,
        'location': location,
        'options': options
    });
};
places.detail = function(widget, callback, reference) {
    places.callbacks[widget] = callback;
    sandbox.message({
        'script': 'places',
        'widget': widget,
        'reference': reference
    });
};

places.messageHandler = function(e) {
    if (e.data.script === 'places') {
        if (places.callbacks[e.data.widget] !== undefined) {
            var callback = places.callbacks[e.data.widget];
            delete places.callbacks[e.data.widget];
            callback(e.data);
        }
    }
};
$(document).ready(function() {
    window.addEventListener('message', places.messageHandler);
    
    /*console.log('starting update');
    var latlng = {
        'lat': 32.77,
        'lng': -96.79
    };
    var us = places.getNearbySearch('mywidget', latlng, [
        'airport'
    ]);
    us.onfinish = function() {
        $('#test').append(us.getContentDiv(0));
        $('#test').append(us.getDetailDiv(0));
        console.log('update finished');
        console.log('results: ' + us.results.length);
        var i = us.getContentDivs(10, 3);
    };*/
});


places.PlaceResults = function(widget, data, location) {
    var self = this;
    
    this.widget = widget;
    this.results = [];
    this.resultsMap = {};
    this.detailMap = {};
    this.location = location;
    
    this.finished = false;
    this.onfinish = function() {};
    
    this.addResults = function(data) {
        if (!data) {
            return;
        }
        
        if (data.results) {
            for (var i = 0; i < data.results.length; i++) {
                self.results.push(data.results[i]);
                self.resultsMap[data.results[i].id] = data.results[i];
            }
            
            if (data.hasNextPage) {
                fetchPage(data.pageKey);
            }
            else {
                self.finished = true;
                self.onfinish();
            }
        }
    };
    this.addDetail = function(data) {
        if (!data) {
            return;
        }
        
        if (data.result) {
            self.detailMap[data.result.id] = data.result;            
        }
    };
    var fetchPage = function(pageKey) {
        places.nearbySearch(self.widget, self.addResults, self.location, [], pageKey);
    };
    var fetchDetail = function(reference, content) {
        var detailCallback = 'DetailRequest' + Math.floor((Math.random() * 1000) + 1);
        places.detail(detailCallback, function(data) {
            self.addDetail(data);
            places.updateContentDiv(content, data.result);
        }, reference);
    };
    this.addResults(data);
        
    this.getContentDiv = function(index, type) {
        if(type == 'w')
        {
            var div = places.createWidgetContentDiv().attr('data-index', index).addClass('highlight'); 
        }
        else
        {
            var div = places.createContentDiv().attr('data-index', index).addClass('highlight');
        }
        var data = self.results[index];
        if (data) {
            places.updateContentDiv(div, data);
        }
        return div;
    };
    this.getContentDivs = function(startIndex, length, type) {
        var divs = [];        
        for (var i = 0; i < length; i++) {
            if (!self.results[startIndex]) {
                startIndex = 0;
            }
            divs.push(this.getContentDiv(startIndex, type));
            startIndex++;
        }        
        return divs;
    };
    this.getDetailDiv = function(index) {
        var div = places.createContentDiv().attr('data-index', index).addClass('detail');
        var data = self.results[index];
        if (data) {
            fetchDetail(self.results[index].reference, div);
        }        
        return div;
    };
};


places.createContentDiv = function() {
    var div = $('<div/>').addClass('content')
            .append($('<div/>').addClass('photo-box').css('width', '760px')
                .append($('<div/>').addClass('name'))
                .append($('<img/>').addClass('photo').attr('width', 760))
                .append($('<div/>').addClass('photoAttributions')))
            .append($('<div/>').addClass('attributions'))
            .append($('<img/>').addClass('icon').attr('width', 71).attr('height', 71))
            .append($('<div/>').addClass('info').css('width', '760px')
                .append($('<div/>').addClass('price-container').addClass('container')
                    .append($('<div>Price</div>').addClass('title'))
                    .append($('<div>|</div>').addClass('separator'))
                    .append($('<div/>').addClass('price').addClass('data')))
                .append($('<div/>').addClass('rating-container').addClass('container')
                    .append($('<div>Rating</div>').addClass('title'))
                    .append($('<div>|</div>').addClass('separator'))
                    .append($('<div/>').addClass('rating').addClass('data')))
                .append($('<div/>').addClass('phone-container').addClass('container')
                    .append($('<div>Phone</div>').addClass('title'))
                    .append($('<div>|</div>').addClass('separator'))
                    .append($('<div/>').addClass('phone').addClass('data')))
                .append($('<div/>').addClass('address-container').addClass('container')
                    .append($('<div>Address</div>').addClass('title'))
                    .append($('<div>|</div>').addClass('separator'))
                    .append($('<div/>').addClass('address').addClass('data'))))
            .append($('<div/>').addClass('reference'));
    return div;
};

places.createWidgetContentDiv = function() {
    var div = $('<div/>').addClass('content')
            .append($('<div/>').addClass('name'))
            .append($('<div />').addClass('data')
                    .append($('<img/>').addClass('icon').attr('width', 71).attr('height', 71))
                    .append($('<div/>').addClass('rating-box')
                        .append($('<div/>').addClass('price'))
                        .append($('<div/>').addClass('rating'))))
            .append($('<img/>').addClass('photo'));
    return div;
};

places.updateContentDiv = function(content, data) {
    if (data !== undefined) {
        var attributions = content.find('.attributions');
        for (var i = 0; i < data.html_attributions.length; i++) {
            $('<div/>').addClass('attribution').html(data.html_attributions[i]).appendTo(attributions);
        }
        content.find('.name').html(data.name);
        content.find('.icon').attr('src', '');
        live.getExternalImage(data.icon, function(src) {
            content.find('.icon').attr('src', src);
        });
        content.find('.photo').attr('src', '');
        if (data.photos.length > 0) {
            live.getExternalImage(data.photos[0].url, function(src) {
                content.find('.photo').attr('src', src);
            });
            attributions = content.find('.photoAttributions');
            for (var i = 0; i < data.photos[0].html_attributions.length; i++) {
                $('<div/>').addClass('attribution').html(data.photos[0].html_attributions[i]).appendTo(attributions);
            }
        }
        var price = data.price_level;
        if (price === undefined) {
            price = 2;
        }
        for (var i = 0; i < price; i++) {
            content.find('.price').append($('<span/>').addClass('dollar').html('$'));
        }
        var rating = data.rating;
        if (rating === undefined) {
            rating = 0;
        }
        rating = Math.round(rating);
        for (var i = 0; i < rating; i++) {
            content.find('.rating').append($('<span/>').addClass('star').addClass('filled').html('★'));
        }
        for (var i = 0; i < (5 - rating); i++) {
            content.find('.rating').append($('<span/>').addClass('star').html('☆'));        
        }

        content.find('.address').click(places.mapMarkerHandler);
        if (data.formatted_address !== undefined) {
            content.find('.address').html(data.formatted_address);
        }
        else if (data.vicinity !== undefined) {
            content.find('.address').html(data.vicinity);        
        }

        if (data.formatted_phone_number !== undefined) {
            content.find('.phone').html(data.formatted_phone_number);
        }
        if (data.website !== undefined) {
            content.find('.website').html(data.website);
        }

        content.find('.reference').html(data.reference);
    }
    return content;
};

places.mapMarkerHandler = function(e) {
    if (maps) {
        var address = $(e.target).html();
        geocoding.geocode(address, function(location) {
            //live.setAsideViews(maps, food);
            //TODO: Set views will change with layout changes
            maps.setMarker(location);
        });
    }
};