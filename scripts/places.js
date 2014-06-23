//Places Namespace
var places = {};

/**
 * Stores callbacks for the message event to reference.
 * @type object
 */
places.callbacks = {};

/**
 * Gets nearby businesses from the PlacesAPI. 
 * @param {widget} widget - The widget object that is calling
 *      the PlacesAPI.
 * @param {location} location - The location object that defines the
 *      location for the PlacesAPI to reference.
 * @param {array} types - Array of types of locations to return.
 * @returns {PlaceResults}
 */
places.getNearbySearch = function(widget, location, types)
{
    var results = new places.PlaceResults(widget, null, location);
    
    places.nearbySearch(widget, function(data) {
        results.addResults(data);
    }, location, types);
    
    return results;
};

/**
 * Sends a message to the sandbox to make the actual PlacesAPI call for nearby businesses. 
 * @param {widget} widget - The widget object that is calling
 *      the PlacesAPI.
 * @param {function()} callback - A callback function to be executed
 *      when the sandbox posts are response message.
 * @param {location} location - The location object that defines the
 *      location for the PlacesAPI to reference.
 * @param {array} types - Array of types of locations to return.
 * @param {Number} pageKey - A key to determine the page of results 
 *      that should be returned.
 * @returns {undefined}
 */
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

/**
 * Sends a message to the sandbox to make a PlacesAPI call to get business detail. 
 * @param {widget} widget - The widget object that is calling
 *      the PlacesAPI.
 * @param {function()} callback - A callback function to be executed
 *      when the sandbox posts are response message.
 * @param {string} reference - ???
 * @returns {undefined}
 */
places.detail = function(widget, callback, reference) {
    places.callbacks[widget] = callback;
    sandbox.message({
        'script': 'places',
        'widget': widget,
        'reference': reference
    });
};

/**
 * Recieves message data and places a callback to distribute that data. 
 * @param {event} e - The message event
 * @returns {undefined}
 */
places.messageHandler = function(e) {
    if (e.data.script === 'places') {
        if (places.callbacks[e.data.widget] !== undefined) {
            var callback = places.callbacks[e.data.widget];
            delete places.callbacks[e.data.widget];
            callback(e.data);
        }
    }
};

/* Initializes the places object */
$(document).ready(function() {
    window.addEventListener('message', places.messageHandler);
});

/**
 * An object that holds the results recieved from the PlacesAPI 
 * @param {widget} widget - The widget object that is calling
 *      the PlacesAPI.
 * @param {object} data - Data from the message event for the PlacesAPI call.
 * @param {location} location - The location object that defines the
 *      location for the PlacesAPI to reference.
 * @returns {PlaceResults}
 */
places.PlaceResults = function(widget, data, location)
{
    //internal object namespace
    var self = this;
    
    /**
     * The PlacesResults' parent widget object
     * @type widget
     */
    this.widget = widget;
    
    /**
     * The results returned by the places API
     * @type array
     */
    this.results = [];
    
    /**
     * The widget and view divs created from the results
     * @type array
     */
    this.resultsDivs = [];
    
    /**
     * ???
     * @type object
     */
    this.resultsMap = {};
    
    /**
     * ???
     * @type object
     */
    this.detailMap = {};
    
    /**
     * The location these results were returned for
     * @type live.location
     */
    this.location = location;
    
    /**
     * Determines whether the results call has been completed.
     * @type boolean
     */
    this.finished = false;
    
    /**
     * A function to call once the results call has been completed.
     * @type function()
     */
    this.onfinish = function() {};
    
    /**
     * The number of photos loaded for the results
     * @type number
     */
    this.photosLoaded = 0;
    
    /**
     * Uses the data object to parse the results returned.
     * @param {object} data - Data from the message event for the PlacesAPI call.
     * @returns {undefined}
     */
    this.addResults = function(data)
    {
        if (!data) {
            return;
        }
        
        if (data.results) {
            for (var i = 0; i < data.results.length; i++) {
                self.results.push(data.results[i]);
                self.resultsMap[data.results[i].id] = data.results[i];
            }
            
            var getNextPage = false;
            
//            This code can be used to get more pages of results. Commented out to save on API calls and loading.
//            if (data.hasNextPage) 
//            {
//                getNextPage = true;
//            }
            
            if (getNextPage) 
            {
                fetchPage(data.pageKey);
            }
            else 
            {
                self.populateContentDivs();
                self.finished = true;
                self.onfinish();
            }
        }
    };
    
    /**
     * Uses the data object to parse the business details returned.
     * @param {object} data - Data from the message event for the PlacesAPI call.
     * @returns {undefined}
     */
    this.addDetail = function(data)
    {
        if (!data) {
            return;
        }
        
        if (data.result) {
            self.detailMap[data.result.id] = data.result;            
        }
    };
    
    /**
     * Gets a places results page from a pageKey
     * @param {number} pageKey - A key to determine the page of results 
     *      that should be returned.
     * @returns {undefined}
     */
    var fetchPage = function(pageKey) 
    {
        places.nearbySearch(self.widget, self.addResults, self.location, [], pageKey);
    };
    
    //Add results from data upon object initialization
    this.addResults(data);
    
    /**
     * Adds div data to the resultsDivs array
     * @returns {undefined}
     */
    this.populateContentDivs = function()
    {
        for(var i = 0; i < self.results.length; i++)
        {
            var div = self.populateContentDiv(i);
            var widgetDiv = self.populateContentDiv(i, 'w');
            
            var resultDiv = {'name': self.results[i].name, 'viewDiv': div, 'widgetDiv': widgetDiv};
            self.resultsDivs.push(resultDiv);
        }
    };
    
    /**
     * Sets all the data, in the page elements, for a result
     * @param {number} index - The index of the result to populate data from.
     * @param {string} type - An indicator to determine whether the result is
     *      populating a widget or a view
     * @returns {jQuery element}
     */
    this.populateContentDiv = function(index, type)
    {
        if(type === 'w')
        {
            var div = places.createWidgetContentDiv(index).attr('data-index', index).addClass('highlight');
        }
        else
        {
            var div = places.createContentDiv(index).attr('data-index', index).addClass('highlight');
        }
        var data = self.results[index];
        if (data)
        {
            places.updateContentDiv(div, data);
        }
        return div;
    };
    
    /**
     * Gets a result div from the resultsDivs array
     * @param {number} index - The index of the resultDiv to return.
     * @param {string} type - An indicator to determine whether the result is
     *      populating a widget or a view
     * @returns {jQuery element}
     */
    this.getContentDiv = function(index, type)
    {
        var resultDiv = self.resultsDivs[index];
        if(typeof resultDiv !== 'undefined')
        {
            var photoDiv = resultDiv.widgetDiv.find('.photo');
            if(photoDiv.attr('src') === '')
            {
                var newSource = 'images/noImage.jpg';
                photoDiv.attr('src', newSource);
                photoDiv = resultDiv.viewDiv.find('.photo');
                photoDiv.attr('src', newSource);
            }
            
            if(type === 'w')
            {
                return resultDiv.widgetDiv;
            }
            else
            {
                return resultDiv.viewDiv;
            }
        }
    };
};

/**
 * Creates an element containing the data from a result to function as a view element.
 * @param {number} index - The index of the result to populate data from.
 * @returns {jQuery element}
 */
places.createContentDiv = function(index)
{
    var div = $('<div />').addClass('content').data('index', index).data('photoLoaded', false)
            .append($('<div/>').addClass('photo-box')
                .append($('<div/>').addClass('title')
                    .append($('<div/>').addClass('name-container')
                    .append($('<img/>').addClass('icon').attr('width', 35).attr('height', 35))
                    .append($('<div/>').addClass('name')))
                    .append($('<div>view on map <div class="iconmelon small-icon first"><svg viewBox="0 0 34 34"><use xlink:href="#svg-icon-map-pin"></use></svg></div></div>').addClass('map-button').addClass('button')))
                .append($('<img src="images/noImage.jpg"/>').addClass('photo').attr('width', 888))
                .append($('<div/>').addClass('photoAttributions')))
            .append($('<div/>').addClass('attributions'))
            .append($('<div/>').addClass('info')
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
                    .append($('<div/>').addClass('address').addClass('data').addClass('button'))))
            .append($('<div/>').addClass('reference'));
    return div;
};

/**
 * Creates an element containing the data from a result to function as a widget element.
 * @returns {jQuery element}
 */
places.createWidgetContentDiv = function()
{
    var div = $('<div/>').addClass('content')
            .append($('<div/>').addClass('name'))
            .append($('<div />').addClass('data')
                    .append($('<img/>').addClass('icon').attr('width', 71).attr('height', 71))
                    .append($('<div/>').addClass('rating-box')
                        .append($('<div/>').addClass('price'))
                        .append($('<div/>').addClass('rating'))))
            .append($('<img/>').addClass('photo'))
            .append($('<div/>').addClass('photo-overlay'));
    return div;
};

/**
 * Sets all the data, in an element, for a result.
 * @param {jQuery element} content - The element that will have its data updated.
 * @param {object} data - The data object from a PlacesAPI call that contains the
 *      data to update the content element with.
 * @returns {jQuery element}
 */
places.updateContentDiv = function(content, data)
{
    if (data !== undefined) 
    {
        var attributions = content.find('.attributions');
        for (var i = 0; i < data.html_attributions.length; i++) {
            $('<div/>').addClass('attribution').html(data.html_attributions[i]).appendTo(attributions);
        }
        content.find('.name').html(data.name);
        content.find('.icon').attr('src', '');
        live.getExternalImage(data.icon, function(src)
        {
            content.find('.icon').attr('src', src);
            content.trigger('iconLoaded');
        });
        content.find('.photo').attr('src', '');
        if (data.photos.length > 0) {
            live.getExternalImage(data.photos[0].url, function(src) {
                content.find('.photo').attr('src', src);
                content.trigger('photoLoaded');
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

        var address = content.find('.address');
        content.find('.address').click(function(e){places.mapMarkerHandler(address);});
        content.find('.map-button').click(function(e){places.mapMarkerHandler(address);});
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

/**
 * Opens the map widget and sets a map marker for a result's address.
 * @param {jQuery element} address - TA result's address element.
 * @returns {undefined}
 */
places.mapMarkerHandler = function(address) {
    if (maps) {
        address = address.html();
        geocoding.geocode(address, function(location)
        {
            var mapsWidgetDisplayed = ($('#supplemental-view-panel').find('.maps').length > 0);
            var mapsWidget = live.getWidgetFromName('maps');
            if(mapsWidgetDisplayed === false)
            {
                mapsWidget.w.on('markerReady', function()
                {
                    setTimeout(function()
                    {
                        maps.setMarker(location);
                        mapsWidget.w.unbind('markerReady');
                    }, 1000);
                });
                mapsWidget.js.toggleView(false, false);
            }
            else
            {
                maps.setMarker(location); 
            }
            
        });
    }
};