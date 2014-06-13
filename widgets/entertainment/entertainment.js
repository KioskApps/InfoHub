//Food Namespace
var entertainment = {};
entertainment.currentLocation;

entertainment.UPDATE_INTERVAL = 10000;

entertainment.initialize = function() {
    entertainment.v.find('.detail').append(places.createContentDiv());
};

entertainment.setLocation = function(location) {
    var types = [
        'amusement_park',
        'aquarium',
        'art_gallery',
        'book_store',
        'bowling_alley',
        'casino',
        'gym',
        'library',
        'movie_theater',
        'museum',
        'night_club',
        'park',
        'spa',
        'stadium',
        'zoo'
    ];
    var results = places.getNearbySearch('entertainment', location, types);
    
    results.onfinish = function() {
        entertainment.startHighlightUpdates(results);
    };
};

entertainment.startHighlightUpdates = function(results) {
    entertainment.stopHighlightUpdates();
    
    var update = new entertainment.UpdateService(results);
    update.start();
    entertainment.currentUpdateService = update;
};
entertainment.stopHighlightUpdates = function() {
    if (entertainment.currentUpdateService) {
        entertainment.currentUpdateService.stop();
    }
};
entertainment.UpdateService = function(results) {
    var self = this;
    
    this.results = results;
    this.index = 0;
    this.running = true;
    
    this.start = function() {
        if (self.running) {
            
            self.updateWidget(entertainment.w);
            self.updateView(entertainment.v);
            self.index++;
            
            setTimeout(self.start, entertainment.UPDATE_INTERVAL);
        }
    };
    this.stop = function() {
        self.running = false;
    };
    
    this.highlightClickHandler = function(e) {
        var index = $(e.target).closest('.highlight').attr('data-index');
        var div = self.results.getDetailDiv(index);
        entertainment.wv.find('.detail').replaceWith(div);
    };
    
    this.updateWidget = function(widget)
    {
        var divs = self.results.getContentDivs(self.index, 3, 'w');
        var current = divs[1].addClass('current').click(self.highlightClickHandler);
        
        slider.navigateTo($('.slider', entertainment.w), current, slider.Direction.RIGHT).on(slider.Event.AFTER_OPEN, function(){self.animateWidgetData(widget);});
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