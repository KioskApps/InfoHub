//Food Namespace
var hotels = {};
hotels.currentLocation;

hotels.UPDATE_INTERVAL = 10000;

hotels.initialize = function() {
    hotels.v.find('.detail').append(places.createContentDiv());
};

hotels.setLocation = function(location) {
    var types = [
        'campground',
        'lodging',
        'rv_park'
    ];
    hotels.w.find('.highlights').empty();
    var results = places.getNearbySearch('hotels', location, types);
    
    results.onfinish = function() {
        hotels.startHighlightUpdates(results);
    };
};

hotels.viewStart = function()
{
    hotels.w.unbind('click');
};
hotels.viewEnd = function()
{
    hotels.w.unbind('click').click(function(e)
    {
        hotels.toggleView(false);
    });
};

hotels.startHighlightUpdates = function(results) {
    hotels.stopHighlightUpdates();
    
    var update = new hotels.UpdateService(results);
    update.results.triggerDiv.on('placesLoaded', function(){hotels.w.trigger('placesLoaded');});
    update.start();
    hotels.currentUpdateService = update;
};
hotels.stopHighlightUpdates = function() {
    if (hotels.currentUpdateService) {
        hotels.currentUpdateService.stop();
    }
};
hotels.UpdateService = function(results) {
    var self = this;
    
    this.results = results;
    this.index = 0;
    this.running = true;
    
    this.start = function()
    {
        hotels.v.find('.places-list').empty();
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
            hotels.v.find('.places-list').append(div);
        }
        self.update();
    };
    this.update = function()
    {
        if(self.running)
        {
            self.updateWidget(hotels.w);
            self.index++;
            if(self.index > self.results.results.length)
            {
                self.index = 0;
            }

            setTimeout(self.update, hotels.UPDATE_INTERVAL);
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
            $(e.currentTarget).clone().appendTo(hotels.v.find('.detail').empty()).removeClass('highlight');
        }
        else
        {
            hotels.v.find('.detail .content').detach().appendTo(hotels.v.find('.places-list')).addClass('highlight');
            view.appendTo(hotels.v.find('.detail').empty()).removeClass('highlight');
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
        
        slider.navigateTo($('.slider', hotels.w), current, slider.Direction.RIGHT).on(slider.Event.AFTER_OPEN, function(){self.animateWidgetData(widget);});
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