//Food Namespace
var travel = {};
travel.currentLocation;

travel.UPDATE_INTERVAL = 10000;

travel.initialize = function() {
    travel.v.find('.detail').append(places.createContentDiv());
};

travel.setLocation = function(location) {
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
    var results = places.getNearbySearch('travel', location, types);
    
    results.onfinish = function() {
        travel.startHighlightUpdates(results);
    };
};

travel.startHighlightUpdates = function(results) {
    travel.stopHighlightUpdates();
    
    var update = new travel.UpdateService(results);
    update.start();
    travel.currentUpdateService = update;
};
travel.stopHighlightUpdates = function() {
    if (travel.currentUpdateService) {
        travel.currentUpdateService.stop();
    }
};


travel.UpdateService = function(results) {
    var self = this;
    
    this.results = results;
    this.index = 0;
    this.running = true;
    
    this.start = function() {
        if (self.running) {
            
            self.updateWidget(travel.w);
            self.updateView(travel.v);
            self.index++;
            
            setTimeout(self.start, travel.UPDATE_INTERVAL);
        }
    };
    this.stop = function() {
        self.running = false;
    };
    
    this.highlightClickHandler = function(e) {
        var index = $(e.target).closest('.highlight').attr('data-index');
        var div = self.results.getDetailDiv(index);
        travel.wv.find('.detail').replaceWith(div);
    };
    
    this.updateWidget = function(widget)
    {
        var divs = self.results.getContentDivs(self.index, 3, 'w');
        var current = divs[1].addClass('current').click(self.highlightClickHandler);
        
        slider.navigateTo($('.slider', travel.w), current, slider.Direction.RIGHT).on(slider.Event.AFTER_OPEN, function(){self.animateWidgetData(widget);});
    }
    
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
    }
    
    this.updateView = function(view)
    {
        var divs = self.results.getContentDivs(self.index, 3);
        var previous = divs[0].addClass('previous').click(self.highlightClickHandler);
        var current = divs[1].addClass('current').click(self.highlightClickHandler);
        var next = divs[2].addClass('next').click(self.highlightClickHandler);

        view.find('.highlights .highlight.previous').replaceWith(previous);
        view.find('.highlights .highlight.current').replaceWith(current);
        view.find('.highlights .highlight.next').replaceWith(next);
    }
};