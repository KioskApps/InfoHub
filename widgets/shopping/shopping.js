//Food Namespace
var shopping = {};
shopping.currentLocation;

shopping.UPDATE_INTERVAL = 10000;

shopping.initialize = function() {
    shopping.v.find('.detail').append(places.createContentDiv());
};

shopping.setLocation = function(location) {
    var types = [
        'book_store',
        'clothing_store',
        'department_store',
        'electronics_store',
        'florist',
        'furniture_store',
        'grocery_or_supermarket',
        'hair_care',
        'hardware_store',
        'health',
        'home_goods_store',
        'jewelry_store',
        'liquor_store',
        'pet_store',
        'pharmacy',
        'shoe_store',
        'shopping_mall',
        'store'
    ];
    shopping.w.find('.highlights').empty();
    var results = places.getNearbySearch('shopping', location, types);
    
    results.onfinish = function() {
        shopping.startHighlightUpdates(results);
        shopping.w.trigger('placesLoaded');
    };
};

shopping.viewStart = function()
{
    shopping.w.unbind('click');
};
shopping.viewEnd = function()
{
    shopping.w.unbind('click').click(function(e)
    {
        shopping.toggleView(false);
    });
};

shopping.startHighlightUpdates = function(results) {
    shopping.stopHighlightUpdates();
    
    var update = new shopping.UpdateService(results);
    update.start();
    shopping.currentUpdateService = update;
};
shopping.stopHighlightUpdates = function() {
    if (shopping.currentUpdateService) {
        shopping.currentUpdateService.stop();
    }
};
shopping.UpdateService = function(results) {
    var self = this;
    
    this.results = results;
    this.index = 0;
    this.running = true;
    
    this.start = function()
    {
        shopping.v.find('.places-list').empty();
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
            shopping.v.find('.places-list').append(div);
        }
        self.update();
    };
    this.update = function()
    {
        if(self.running)
        {
            self.updateWidget(shopping.w);
            self.index++;
            if(self.index > self.results.results.length)
            {
                self.index = 0;
            }

            setTimeout(self.update, shopping.UPDATE_INTERVAL);
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
            $(e.currentTarget).clone().appendTo(shopping.v.find('.detail').empty()).removeClass('highlight');
        }
        else
        {
            shopping.v.find('.detail .content').detach().appendTo(shopping.v.find('.places-list')).addClass('highlight');
            view.appendTo(shopping.v.find('.detail').empty()).removeClass('highlight');
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
        
        slider.navigateTo($('.slider', shopping.w), current, slider.Direction.RIGHT).on(slider.Event.AFTER_OPEN, function(){self.animateWidgetData(widget);});
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