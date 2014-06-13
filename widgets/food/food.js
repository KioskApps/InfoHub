//Food Namespace
var food = {};
food.currentLocation;

food.UPDATE_INTERVAL = 10000;

food.initialize = function() {
    window.addEventListener('message', function(e) {
        if (e.data.widget === 'food') {
            if (e.data.results !== undefined) {
                food.startHighlightUpdates(e.data);
            }
            else if (e.data.result !== undefined) {
                food.setDetail(e.data);
            }
        }
    });
    food.v.find('.detail').append(food.createContentDiv());
};

food.setLocation = function(location) {
    food.requestNearbySearch(location);
};

food.requestNearbySearch = function(location, nextPageKey) {
    food.currentLocation = location;
    var options = {
        'types': ['restaurant']
    };
    if (nextPageKey) {
        options.pageKey = nextPageKey;
    }
    sandbox.message({
        'script': 'places',
        'widget': 'food',
        'location': location,
        'options': options
    });
};
food.requestDetails = function(reference) {
    sandbox.message({
        'script': 'places',
        'widget': 'food',
        'reference': reference
    });
};

food.setDetail = function(data) {
    var content = food.createContentDiv();
    food.updateContentDiv(content, data.result);
    food.wv.find('.detail .content').replaceWith(content);
};
food.startHighlightUpdates = function(data) {
    food.stopHighlightUpdates();
    var pageKey;
    if (data.hasNextPage) {
        pageKey = data.pageKey;
    }
    var update = new food.UpdateService(data.results, pageKey, food.currentLocation);
    update.start();
    food.currentUpdateService = update;
};
food.stopHighlightUpdates = function() {
    if (food.currentUpdateService) {
        food.currentUpdateService.stop();
    }
};
food.UpdateService = function(highlights, pageKey, location) {
    var self = this;
    
    this.highlights = highlights;
    this.index = 0;
    this.pageKey = pageKey;
    this.location = location;
    this.running = true;
    
    this.start = function() {
        if (self.running) {
            if (self.index < self.highlights.length) {
                var previous = food.createContentDiv().addClass('highlight').addClass('previous');
                var current = food.createContentDiv().addClass('highlight').addClass('current');
                var next = food.createContentDiv().addClass('highlight').addClass('next');
                food.wv.find('.highlights .highlight').filter('.previous').replaceWith(previous);
                food.wv.find('.highlights .highlight').filter('.current').replaceWith(current);
                food.wv.find('.highlights .highlight').filter('.next').replaceWith(next);
    
                food.updateContentDiv(food.wv.find('.highlights .highlight.previous'), self.highlights[self.index - 1]);
                food.updateContentDiv(food.wv.find('.highlights .highlight.current'), self.highlights[self.index]);
                food.updateContentDiv(food.wv.find('.highlights .highlight.next'), self.highlights[self.index + 1]);
                self.index++;
            }
            else if (self.pageKey) {
                food.requestNearbySearch(self.location, self.pageKey);
            }
            else {
                food.requestNearbySearch(live.location);
            }
            setTimeout(self.start, food.UPDATE_INTERVAL);
        }
    };
    this.stop = function() {
        self.running = false;
    };
};

food.createContentDiv = function() {
    var div = $('<div/>').addClass('content')
            .append($('<div/>').addClass('name'))
            .append($('<div/>').addClass('attributions'))
            .append($('<img/>').addClass('icon'))
            .append($('<div/>').addClass('rating-box')
                .append($('<div/>').addClass('price'))
                .append($('<div/>').addClass('rating')))
            .append($('<div/>').addClass('info')
                .append($('<div/>').addClass('address'))
                .append($('<div/>').addClass('phone'))
                .append($('<div/>').addClass('website')))
            .append($('<img/>').addClass('photo'))
            .append($('<div/>').addClass('photoAttributions'))
            .append($('<div/>').addClass('reference'));
    div.click(function() {
        var reference = $(this).find('.reference').html();
        food.requestDetails(reference);
    });
    return div;
};

food.updateContentDiv = function(content, data) {
    if (data !== undefined) {
        var attributions = content.find('.attributions');
        for (var i = 0; i < data.html_attributions.length; i++) {
            $('<div/>').addClass('attribution').html(data.html_attributions[i]).appendTo(attributions);
        }
        content.find('.name').html(data.name);
        content.find('.icon').attr('src', '');
        food.getExternalImage(data.icon, function(src) {
            content.find('.icon').attr('src', src);
        });
        content.find('.photo').attr('src', '');
        if (data.photos.length > 0) {
            food.getExternalImage(data.photos[0].url, function(src) {
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

        content.find('.address').click(food.mapMarkerHandler);
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

food.mapMarkerHandler = function(e) {
    if (maps) {
        var address = $(e.target).html();
        geocoding.geocode(address, function(location) {
            live.setAsideViews(maps, food);
            maps.setMarker(location);
        });
    }
};

food.getExternalImage = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function() {
        callback(window.URL.createObjectURL(xhr.response));
    };
    xhr.open('GET', url, true);
    xhr.send();
};