function Widget(name, html, appendElement, type)
{
    //internal object namespace
    var self = this;
    
    //Sanitizing parameters
    var n = typeof name === 'string' ? name : '';
    var h = typeof html === 'string' ? html : '';
    var ae = appendElement instanceof jQuery ? appendElement : $('#widgets');
    var t = typeof type === 'string' ? type : live.WidgetType.STANDARD;
    
    /**
     * The name of the widget
     * @type string
     */
    this.name = n;
    
    /**
     * The widget's html body
     * @type string
     */
    this.html = h;
    
    /**
     * a jQuery reference to the widget body
     * @type jQuery element
     */
    this.jhtml = $(h);
    
    /**
     * The element where the widget will be appended to.
     * @type jQuery element
     */
    this.appendLocation = ae;
    
    /**
     * The type of widget.
     * @type live.WidgetType
     */
    this.type = t;
    
    /**
     * A reference to the widget's widget figure
     * @type jQuery element
     */
    this.widget = this.jhtml.filter('figure.widget');
    
    /**
     * A simplified reference to the widget's widget figure
     * @type jQuery element
     */
    this.w = this.widget;
    
    /**
     * A reference to the widget's widget main view
     * @type jQuery element
     */
    this.view = this.jhtml.filter('main.view');
    
    /**
     * A simplified reference to the widget's main view
     * @type jQuery element
     */
    this.v = this.view;
    
    /**
     * A collective reference to the widget's widget figure and main view
     * @type jQuery element collection
     */
    this.widgetView = this.widget.add(this.view);
    
    /**
     * A simplified collective reference to the widget's widget figure and main view
     * @type jQuery element collection
     */
    this.wv = this.widgetView;
    
    /**
     * A reference to the widget's specific type namespace
     * @type object
     */
    this.js = window[self.name];
    
    /**
     * A reference to the widget object namespace
     * @type object
     */
    this.js.widget = this;
    
    /**
     * A simplified reference to the widget's widget figure
     * @type jQuery element
     */
    this.js.w = this.widget;
    
    /**
     * A simplified reference to the widget's main view
     * @type jQuery element
     */
    this.js.v = this.view;
    
    /**
     * A simplified collective reference to the widget's widget figure and main view
     * @type jQuery element collection
     */
    this.js.wv = this.widgetView;
    
    
    
    /**
     * Initializes the widget
     * @returns {undefined}
     */
    this.initialize = function()
    {
        initializeFunction('initialize');
        initializeFunction('setLocation');
        initializeFunction('viewStart');
        initializeFunction('viewEnd');
        initializeFunction('widgetStart');
        initializeFunction('widgetEnd');
        initializeFunction('toggleView');
        
        self.widget.click(function() {
            self.toggleView(false);
        }).appendTo(this.appendLocation);
         self.widget.unbind('addViewAnimationsComplete').on('addViewAnimationsComplete', self.startView);
         self.widget.unbind('removeViewAnimationsComplete').on('removeViewAnimationsComplete', self.endView);
                                                     
        self.js.initialize();
        
        return self;
    };
    
    /**
     * Toggles the widget's view between open and closed.
     * @param {boolean} dontHide - a boolean to determine whether or not 
     *      to hide the view panel when toggled.
     * @param {boolean} supressWidgetAnimation - a boolean to determine
     *      whether or not to surpress the supplemental widget animations.
     * @returns {undefined}
     */
    this.toggleView = function(dontHide, surpressWidgetAnimation)
    {
        var toAdd = live.validateAddView(self.view, self.type);

        if (toAdd) 
        {
            self.addViewAnimations();
        }
        else 
        {
            self.removeViewAnimations(surpressWidgetAnimation);
        }
    };
    
    /**
     * Performs intialization operations when the view is opened.
     * @returns {undefined}
     */
    this.startView = function()
    { 
        live.addView(self.view, self.type);
        self.js.viewStart();
        
        $('.close-button', self.view).unbind('click').click(function(e) {
            self.toggleView(false, true);
        });

        if(self.view.hasClass('maps'))//lazy load for maps
        {
            setTimeout(function(){self.js.setLocation(live.location);}, 300);
        }
    }
    
    /**
     * Performs closedown operations when the view is closed.
     * @returns {undefined}
     */
    this.endView = function()
    {
        live.addView(self.view, self.type);        
        self.js.viewEnd();
    }
    
    /**
     * Animates widgets to facilitate a view being added.
     * @returns {undefined}
     */
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
    
    /**
     * Animates widgets to facilitate a view being removed.
     * @param {boolean} supressWidgetAnimation - a boolean to determine
     *      whether or not to surpress the supplemental widget animations.
     * @returns {undefined}
     */
    this.removeViewAnimations = function(surpressWidgetAnimation)
    {
        if(surpressWidgetAnimation !== true)
        {
            self.widget.velocity({scale: .95}, {duration:100}).velocity({scale: 1}, {easing: [250, 10], duation:100});
        }
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
    
    /**
     * Animates supplemental widgets to their initial state.
     * @returns {undefined}
     */
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
    
    /**
     * Creates an expected function in case it is not created manually.
     * @param {string} name - the name of the function to create.
     * @returns {undefined}
     */
    var initializeFunction = function(name) 
    {
        if(name == 'toggleView')
        {
            self.js[name] = self.toggleView;
        }
        if (self.js[name] === undefined) {
            self.js[name] = function() {};
        }
    };
    
    /**
     * Shows the loading overlay for the widget's view.
     * @returns {undefined}
     */
    this.showViewLoading = function()
    {
        self.showLoading(self.view);
    };
    
    /**
     * Hides the loading overlay for the widget's view.
     * @returns {undefined}
     */
    this.hideViewLoading = function()
    {
        self.hideLoading(self.view);
    };
    
    /**
     * Shows the loading overlay for the widget's widget.
     * @returns {undefined}
     */
    this.showWidgetLoading = function()
    {
        self.showLoading(self.widget);
    };
    
    /**
     * Hides the loading overlay for the widget's view.
     * @returns {undefined}
     */
    this.hideWidgetLoading = function()
    {
        self.hideLoading(self.widget);
    };
    
    /**
     * Shows the loading overlay for an element.
     * @param {jQuery element} selector - The view element that will have
     *      have a loading overlay displayed.
     * @returns {undefined}
     */
    this.showLoading = function(selector)
    {
        if (selector === undefined)
        {
            selector = self.widgetView;
        }
        selector.find('.loading').show();
    };
    
    /**
     * Hides the loading overlay for an element.
     * @param {jQuery element} selector - The view element that will have
     *      have a loading overlay hidden.
     * @returns {undefined}
     */
    this.hideLoading = function(selector)
    { 
        if (selector === undefined)
        {
            selector = self.widgetView;
        }
        selector.find('.loading').hide();
    };
    
    /**
     * A reference to the widget's showLoading function
     * @type function(selector)
     */
    
    this.js.showLoading = this.showLoading;
    
    /**
     * A reference to the widget's hideLoading function
     * @type function(selector)
     */
    this.js.hideLoading = this.hideLoading;
    
    /**
     * A reference to the widget's showViewLoading function
     * @type function()
     */
    this.js.showViewLoading = this.showViewLoading;
    
    /**
     * A reference to the widget's hideViewLoading function
     * @type function()
     */
    this.js.hideViewLoading = this.hideViewLoading;
    
    /**
     * A reference to the widget's showWidgetLoading function
     * @type function()
     */
    this.js.showWidgetLoading = this.showWidgetLoading;
    
    /**
     * A reference to the widget's hideWidgetLoading function
     * @type function()
     */
    this.js.hideWidgetLoading = this.hideWidgetLoading;
}