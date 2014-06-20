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
    entertainment.w.find('.highlights').empty();
    var results = places.getNearbySearch('entertainment', location, types);
    
    results.onfinish = function() {
        entertainment.startHighlightUpdates(results);
        entertainment.w.trigger('placesLoaded');
    };
};

entertainment.viewStart = function()
{
    entertainment.w.unbind('click');
};
entertainment.viewEnd = function()
{
    entertainment.w.unbind('click').click(function(e)
    {
        entertainment.toggleView(false);
    });
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
    
    this.start = function()
    {
        entertainment.v.find('.places-list').empty();
        for(var i = 0; i < self.results.results.length; i++)
        {
            var div = self.results.getContentDiv(i);
            if(div != undefined)
            {
                div.click(function(e)
                {
                    var index = $(this).data('index');
                    var view = self.results.resultsDivs[index].viewDiv;
                    self.highlightClickHandler(e, view);
                });
            }
            entertainment.v.find('.places-list').append(div);
        }
        self.update();
    };
    this.update = function()
    {
        if(self.running)
        {
            self.updateWidget(entertainment.w);
            self.index++;
            if(self.index > self.results.results.length)
            {
                self.index = 0;
            }

            setTimeout(self.update, entertainment.UPDATE_INTERVAL);
        }
    }
    this.stop = function()
    {
        self.running = false;
    };
    
    this.highlightClickHandler = function(e, view)
    {
        if(view == undefined)
        {
            $(e.currentTarget).clone().appendTo(entertainment.v.find('.detail').empty()).removeClass('highlight');
        }
        else
        {
            entertainment.v.find('.detail .content').detach().appendTo(entertainment.v.find('.places-list')).addClass('highlight');
            view.appendTo(entertainment.v.find('.detail').empty()).removeClass('highlight');
        }
    };
    
    this.updateWidget = function(widget)
    {
        var div = self.results.getContentDiv(self.index, 'w');
        var current = div.addClass('current').click(function(e)
        {
            var index = $(this).data('index');
            var view = self.results.resultsDivs[index].viewDiv;
            self.highlightClickHandler(e, view);
        });
        
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
};