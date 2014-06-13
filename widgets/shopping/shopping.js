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
    var results = places.getNearbySearch('shopping', location, types);
    
    results.onfinish = function() {
        shopping.startHighlightUpdates(results);
    };
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
//shopping.UpdateService = function(results) {
//    var self = this;
//    
//    this.results = results;
//    this.index = 0;
//    this.running = true;
//    
//    this.start = function() {
//        if (self.running) {
//            shopping.wv.each(function() {
//                var divs = self.results.getContentDivs(self.index, 3);
//                var previous = divs[0].addClass('previous').click(self.highlightClickHandler);
//                var current = divs[1].addClass('current').click(self.highlightClickHandler);
//                var next = divs[2].addClass('next').click(self.highlightClickHandler);
//
//                $(this).find('.highlights .highlight.previous').replaceWith(previous);
//                $(this).find('.highlights .highlight.current').replaceWith(current);
//                $(this).find('.highlights .highlight.next').replaceWith(next);
//            });
//            self.index++;
//            
//            setTimeout(self.start, shopping.UPDATE_INTERVAL);
//        }
//    };
//    this.stop = function() {
//        self.running = false;
//    };
//    
//    this.highlightClickHandler = function(e) {
//        var index = $(e.target).closest('.highlight').attr('data-index');
//        var div = self.results.getDetailDiv(index);
//        shopping.wv.find('.detail').replaceWith(div);
//    };
//};

shopping.UpdateService = function(results) {
    var self = this;
    
    this.results = results;
    this.index = 0;
    this.running = true;
    
    this.start = function() {
        if (self.running) {
            
            self.updateWidget(shopping.w);
            self.updateView(shopping.v);
            self.index++;
            
            setTimeout(self.start, shopping.UPDATE_INTERVAL);
        }
    };
    this.stop = function() {
        self.running = false;
    };
    
    this.highlightClickHandler = function(e) {
        var index = $(e.target).closest('.highlight').attr('data-index');
        var div = self.results.getDetailDiv(index);
        shopping.wv.find('.detail').replaceWith(div);
    };
    
    this.updateWidget = function(widget)
    {
        var divs = self.results.getContentDivs(self.index, 3, 'w');
        var current = divs[1].addClass('current').click(self.highlightClickHandler);
        
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