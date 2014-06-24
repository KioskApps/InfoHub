//Travel Namespace
var travel = {};

/**
 * The location that the widget is currently set to.
 * @type live.location
 */
travel.currentLocation;

/**
 * Time between rotating the widget slider.
 * @type number
 */
travel.UPDATE_INTERVAL = 10000;

/**
 * Initializes the travel widget
 * @returns {undefined}
 */
travel.initialize = function()
{
    travel.v.find('.detail').append(places.createContentDiv());
};

/**
 * Resets the widget to display data based on a new location.
 * @param {location} location - The location object that defines the
 *      location for the widget to reference.
 * @returns {undefined}
 */
travel.setLocation = function(location)
{
    var types = [
        'bus_station',
        'car_rental',
        'gas_station',
        'parking',
        'subway_station',
        'taxi_stand',
        'train_station',
        'travel_agency'
    ];
    travel.w.find('.highlights').empty();
    var results = places.getNearbySearch('travel', location, types);
    
    results.onfinish = function() {
        travel.startHighlightUpdates(results);
        travel.w.trigger('placesLoaded');
    };
};

/**
 * Performs intialization operations when the view is opened.
 * @returns {undefined}
 */
travel.viewStart = function()
{
    travel.w.unbind('click');
};

/**
 * Performs closedown operations when the view is opened.
 * @returns {undefined}
 */
travel.viewEnd = function()
{
    travel.w.unbind('click').click(function(e)
    {
        travel.toggleView(false);
    });
};

/**
 * Creates the update service and starts the widget highlight slider.
 * @param {PlaceResults} results - The placeResults from the PlacesAPI call.
 * @returns {undefined}
 */
travel.startHighlightUpdates = function(results)
{
    travel.stopHighlightUpdates();
    
    var update = new travel.UpdateService(results);
    update.start();
    travel.currentUpdateService = update;
};

/**
 * Stops the widget highlight slider.
 * @returns {undefined}
 */
travel.stopHighlightUpdates = function()
{
    if (travel.currentUpdateService) {
        travel.currentUpdateService.stop();
    }
};

/**
 * An object that updates the widget with results from the placesResults 
 * @param {PlaceResults} results - The placeResults from the PlacesAPI call.
 * @returns {UpdateService}
 */
travel.UpdateService = function(results)
{
    //internal object namespace
    var self = this;
    
    /**
     * The placeResults from the PlacesAPI call.
     * @type PlaceResults
     */
    this.results = results;
    
    /**
     * The index of the result that is currently displayed on the widget.
     * @type number
     */
    this.index = 0;
    
    /**
     * Determines whether the widget updates.
     * @type boolean
     */
    this.running = true;
    
    /**
     * Adds the places to the view and starts the widget updates.
     * @returns {undefined}
     */
    
    this.start = function()
    {
        travel.v.find('.places-list').empty();
        for(var i = 0; i < self.results.results.length; i++)
        {
            var div = self.results.getContentDiv(i);
            if(typeof div !== 'undefined')
            {
                div.click(function(e)
                {
                    var index = $(this).data('index');
                    var view = self.results.resultsDivs[index].viewDiv;
                    self.highlightClickHandler(e, view);
                });
            }
            travel.v.find('.places-list').append(div);
        }
        self.update();
    };
    
    /**
     * Updates the widget.
     * @returns {undefined}
     */
    this.update = function()
    {
        if(self.running)
        {
            self.updateWidget(travel.w);
            self.index++;
            if (self.index >= self.results.results.length)
            {
                self.index = 0;
            }

            setTimeout(self.update, travel.UPDATE_INTERVAL);
        }
    };
    
    /**
     * Stops the widget slider.
     * @returns {undefined}
     */
    this.stop = function()
    {
        self.running = false;
    };
    
    /**
     * Adds the places result element to the detail element.
     * @param {event} e - The click event data.
     * @param {jQuery element} view - The widget's view element from the resultsDiv object.
     * @returns {undefined}
     */
    this.highlightClickHandler = function(e, view)
    {
        if(typeof view === 'undefined')
        {
            $(e.currentTarget).clone().appendTo(travel.v.find('.detail').empty()).removeClass('highlight');
        }
        else
        {
            travel.v.find('.detail .content').detach().appendTo(travel.v.find('.places-list')).addClass('highlight');
            view.appendTo(travel.v.find('.detail').empty()).removeClass('highlight');
        }
    };
    
    /**
     * Updates the widget's slider.
     * @param {jQuery element} widget - The widget's widget element from the resultsDiv object.
     * @returns {undefined}
     */
    this.updateWidget = function(widget)
    {
        var div = self.results.getContentDiv(self.index, 'w');
        var current = div.addClass('current').click(function(e)
        {
            var index = $(this).data('index');
            var view = self.results.resultsDivs[index].viewDiv;
            self.highlightClickHandler(e, view);
        });
        
        slider.slide($('.slider', travel.w), current, slider.Direction.RIGHT).on(slider.Event.AFTER_OPEN, function(){self.animateWidgetData(widget);});
    };
    
    /**
     * Animates the data that appears on the widget.
     * @param {jQuery element} widget - The widget's widget element.
     * @returns {undefined}
     */
    this.animateWidgetData = function(widget)
    {        
        var price = widget.find('.price');
        price.velocity({opacity:0, translateZ:0, translateY: '100%'}, {duration:0});
        price.velocity({opacity:1, translateZ:0, translateY: 0}, [ 500, 20 ]);
        
        var icon = widget.find('.icon');
        icon.velocity({translateZ: 0,scaleX: "0",scaleY: "0"}, {duration:0});
        icon.velocity({opacity: 1, translateZ: 0,scaleX: "1",scaleY: "1"}, [ 500, 20 ]);
        
        var starCount = 0;
        var starRating = widget.find('.rating');
        starRating.find('.star').each(function()
        {
            var position = $(this).outerWidth() * starCount;            
            $(this).velocity({opacity:0, translateZ:0, translateX: '-100%'}, {duration:0});
            $(this).velocity({opacity:1, translateZ:0, translateX: position}, {'easing':[ 250, 25 ], 'delay': (starCount * 150)});
            starCount++;
        });
    };
};