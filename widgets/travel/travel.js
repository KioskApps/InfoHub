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
    travel.w.find('.highlights').empty();
    var results = places.getNearbySearch('travel', location, types);
    
    results.onfinish = function() {
        travel.startHighlightUpdates(results);
    };
};

travel.viewStart = function()
{
    travel.w.unbind('click');
};
travel.viewEnd = function()
{
    travel.w.unbind('click').click(function(e)
    {
        travel.toggleView(false);
    });
};

travel.startHighlightUpdates = function(results) {
    travel.stopHighlightUpdates();
    
    var update = new travel.UpdateService(results);
    update.results.triggerDiv.on('placesLoaded', function(){travel.w.trigger('placesLoaded');});
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
    
    this.start = function()
    {
        travel.v.find('.places-list').empty();
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
            travel.v.find('.places-list').append(div);
        }
        self.update();
    };
    this.update = function()
    {
        if(self.running)
        {
            self.updateWidget(travel.w);
            self.index++;
            if(self.index > self.results.results.length)
            {
                self.index = 0;
            }

            setTimeout(self.update, travel.UPDATE_INTERVAL);
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
            $(e.currentTarget).clone().appendTo(travel.v.find('.detail').empty()).removeClass('highlight');
        }
        else
        {
            travel.v.find('.detail .content').detach().appendTo(travel.v.find('.places-list')).addClass('highlight');
            view.appendTo(travel.v.find('.detail').empty()).removeClass('highlight');
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
};