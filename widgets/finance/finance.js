//Food Namespace
var finance = {};
finance.currentLocation;

finance.UPDATE_INTERVAL = 10000;

finance.initialize = function() {
    finance.v.find('.detail').append(places.createContentDiv());
};

finance.setLocation = function(location) {
    var types = [
        'atm',
        'bank',
        'finance'
    ];
    finance.w.find('.highlights').empty();
    var results = places.getNearbySearch('finance', location, types);
    
    results.onfinish = function() {
        finance.startHighlightUpdates(results);
    };
};

finance.viewStart = function()
{
    finance.w.unbind('click');
};
finance.viewEnd = function()
{
    finance.w.unbind('click').click(function(e)
    {
        finance.toggleView(false);
    });
};

finance.startHighlightUpdates = function(results) {
    finance.stopHighlightUpdates();
    
    var update = new finance.UpdateService(results);
    update.results.triggerDiv.on('placesLoaded', function(){finance.w.trigger('placesLoaded');});
    update.start();
    finance.currentUpdateService = update;
};
finance.stopHighlightUpdates = function() {
    if (finance.currentUpdateService) {
        finance.currentUpdateService.stop();
    }
};
finance.UpdateService = function(results) {
    var self = this;
    
    this.results = results;
    this.index = 0;
    this.running = true;
    
    this.start = function()
    {
        finance.v.find('.places-list').empty();
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
            finance.v.find('.places-list').append(div);
        }
        self.update();
    };
    this.update = function()
    {
        if(self.running)
        {
            self.updateWidget(finance.w);
            self.index++;
            if(self.index > self.results.results.length)
            {
                self.index = 0;
            }

            setTimeout(self.update, finance.UPDATE_INTERVAL);
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
            $(e.currentTarget).clone().appendTo(finance.v.find('.detail').empty()).removeClass('highlight');
        }
        else
        {
            finance.v.find('.detail .content').detach().appendTo(finance.v.find('.places-list')).addClass('highlight');
            view.appendTo(finance.v.find('.detail').empty()).removeClass('highlight');
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
        
        slider.navigateTo($('.slider', finance.w), current, slider.Direction.RIGHT).on(slider.Event.AFTER_OPEN, function(){self.animateWidgetData(widget);});
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