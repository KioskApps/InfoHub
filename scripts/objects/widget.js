function Widget(name, html, appendElement, type) {
    
    var self = this;
    
    var n = typeof name === 'string' ? name : '';
    var h = typeof html === 'string' ? html : '';
    var ae = appendElement instanceof jQuery ? appendElement : $('#widgets');
    var t = typeof type === 'string' ? type : live.WidgetType.STANDARD;
    
    this.name = n;
    this.html = h;
    this.jhtml = $(h);
    this.appendLocation = ae;
    this.type = t;
    
    this.widget = this.jhtml.filter('figure.widget');
    this.w = this.widget;
    this.view = this.jhtml.filter('main.view');
    this.v = this.view;
    this.widgetView = this.widget.add(this.view);
    this.wv = this.widgetView;
    
    this.js = window[self.name];
    this.js.widget = this;
    this.js.w = this.widget;
    this.js.v = this.view;
    this.js.wv = this.widgetView;
    
    this.initialize = function() {
        initializeFunction('initialize');
        initializeFunction('setLocation');
        initializeFunction('viewStart');
        initializeFunction('viewEnd');
        initializeFunction('widgetStart');
        initializeFunction('widgetEnd');
        
        self.widget.click(function() {
            self.toggleView(false);
        }).appendTo(this.appendLocation);
         self.widget.unbind('addViewAnimationsComplete').on('addViewAnimationsComplete', self.startView);
         self.widget.unbind('removeViewAnimationsComplete').on('removeViewAnimationsComplete', self.endView);
                                                     
        self.js.initialize();
        
        return self;
    };
    this.toggleView = function(dontHide)
    {
        var toAdd = live.validateAddView(self.view, self.type);

        if (toAdd) 
        {
            self.addViewAnimations();
        }
        else 
        {
            self.removeViewAnimations();
        }
    };
    this.startView = function(added)
    { 
        live.addView(self.view, self.type);
        self.js.viewStart();
        
        $('.close-button', self.view).unbind('click').click(function(e) {
            self.widget.click();
        });

        if(self.view.hasClass('maps'))//lazy load for maps
        {
            setTimeout(function(){self.js.setLocation(live.location);}, 300);
        }
    }
    this.endView = function()
    {
        live.addView(self.view, self.type);        
        self.js.viewEnd();
    }
    
    this.addViewAnimations = function()
    {
        self.widget.velocity({scale: .95}, {duration:100}).velocity({scale: 1}, {easing: [250, 10], duation:100});
        if(self.type == live.WidgetType.STANDARD)
        {
            var secondaryWidgets = $('.static-widgets .main .widgets .supplemental-widgets .widget');
            var widgetCount = 0;
            secondaryWidgets.each(function()
            {
                $(this).velocity({opacity:0, translateZ:0, translateY: '100%'}, {'easing':[ 250, 25 ], 'delay': (widgetCount * 150)});
                widgetCount++;
            }).promise().done(function()
            {
                secondaryWidgets.addClass('small');
                self.widget.trigger('addViewAnimationsComplete');
                
                widgetCount = 0;
                secondaryWidgets.each(function()
                {
                    $(this).velocity({opacity:0, translateZ:0, translateY: 0, translateX: '-100%'}, {duration:0});
                    $(this).velocity({opacity:1, translateZ:0, translateX: 0}, {'easing':[ 250, 25 ], 'delay': (widgetCount * 150)});
                    widgetCount++;
                });
            });
        }
        else
        {
            self.widget.trigger('addViewAnimationsComplete');
        }
    }
    this.removeViewAnimations = function()
    {
        self.widget.velocity({scale: .95}, {duration:100}).velocity({scale: 1}, {easing: [250, 10], duation:100});
        self.view.unbind('viewPanelHideComplete').on('viewPanelHideComplete', this.resetSupplementalWidgets);
        if(self.type == live.WidgetType.STANDARD)
        {
            var secondaryWidgets = $('.static-widgets .main .widgets .supplemental-widgets .widget');
            var widgetCount = 0;
            secondaryWidgets.each(function()
            {
                $(this).velocity({opacity:0, translateZ:0, translateX: '-100%'}, {'easing':[ 250, 25 ], 'delay': (widgetCount * 150)});
                widgetCount++;
            }).promise().done(function()
            {
                secondaryWidgets.css('height', '0');
                self.widget.trigger('removeViewAnimationsComplete');
            });
        }
        else
        {
            self.widget.trigger('removeViewAnimationsComplete');
        }
    }
    
    this.resetSupplementalWidgets = function()
    {
        var secondaryWidgets = $('.static-widgets .main .widgets .supplemental-widgets .widget');
        secondaryWidgets.css('height', 'auto');
        widgetCount = 0;
        secondaryWidgets.each(function()
        {
            $(this).velocity({opacity:0, translateZ:0, translateX: '-150%', translateY: '-100%'}, {duration:0});
            $(this).velocity({opacity:1, translateZ:0, translateX: 0, translateY: 0}, {'easing':[ 250, 25 ], 'delay': (widgetCount * 150)});
            widgetCount++;
        });

        secondaryWidgets.removeClass('small');
    }
    
    var initializeFunction = function(name) {
        if (self.js[name] === undefined) {
            self.js[name] = function() {};
        }
    };
    
    this.showViewLoading = function() {
        self.showLoading(self.view);
    };
    this.hideViewLoading = function() {
        self.hideLoading(self.view);
    };
    this.js.showViewLoading = this.showViewLoading;
    this.js.hideViewLoading = this.hideViewLoading;
    this.showWidgetLoading = function() {
        self.showLoading(self.widget);
    };
    this.hideWidgetLoading = function() {
        self.hideLoading(self.widget);
    };
    this.js.showWidgetLoading = this.showWidgetLoading;
    this.js.hideWidgetLoading = this.hideWidgetLoading;
    this.showLoading = function(selector) {
        if (selector === undefined) {
            selector = self.widgetView;
        }
        selector.find('.loading').show();
    };
    this.hideLoading = function(selector) { 
        if (selector === undefined) {
            selector = self.widgetView;
        }
        selector.find('.loading').hide();
    };
    this.js.showLoading = this.showLoading;
    this.js.hideLoading = this.hideLoading;
}