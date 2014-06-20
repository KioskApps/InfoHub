//Food Namespace
var dining = {};
dining.currentLocation;

dining.UPDATE_INTERVAL = 10000;

dining.initialize = function() {
    dining.v.find('.detail').append(places.createContentDiv());
};

dining.setLocation = function(location) {
    var types = [
        'bakery', 
        'bar', 
        'cafe', 
        'food', 
        'meal_delivery',
        'meal_takeaway',
        'restaurant'
    ];
    dining.w.find('.highlights').empty();
    var results = places.getNearbySearch('dining', location, types);
    
    results.onfinish = function() {
        dining.startHighlightUpdates(results);
        dining.w.trigger('placesLoaded');
    };
};

dining.viewStart = function()
{
    dining.w.unbind('click');
};
dining.viewEnd = function()
{
    dining.w.unbind('click').click(function(e)
    {
        dining.toggleView(false);
    });
};

dining.startHighlightUpdates = function(results) {
    dining.stopHighlightUpdates();
    
    var update = new dining.UpdateService(results);
    update.start();
    dining.currentUpdateService = update;
};
dining.stopHighlightUpdates = function() {
    if (dining.currentUpdateService) {
        dining.currentUpdateService.stop();
    }
};
dining.UpdateService = function(results) {
    var self = this;
    
    this.results = results;
    this.index = 0;
    this.running = true;
    
    this.start = function()
    {
        dining.v.find('.places-list').empty();
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
            dining.v.find('.places-list').append(div);
        }
        self.update();
    };
    this.update = function()
    {
        if(self.running)
        {
            self.updateWidget(dining.w);
            self.index++;
            if(self.index > self.results.results.length)
            {
                self.index = 0;
            }

            setTimeout(self.update, dining.UPDATE_INTERVAL);
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
            $(e.currentTarget).clone().appendTo(dining.v.find('.detail').empty()).removeClass('highlight');
        }
        else
        {
            dining.v.find('.detail .content').detach().appendTo(dining.v.find('.places-list')).addClass('highlight');
            view.appendTo(dining.v.find('.detail').empty()).removeClass('highlight');
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
        
        slider.navigateTo($('.slider', dining.w), current, slider.Direction.RIGHT).on(slider.Event.AFTER_OPEN, function(){self.animateWidgetData(widget);});
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