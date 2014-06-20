//LiveStream Namespace
var live = {};

/**
 * An array of the widgets being used
 * @type Array
 */
live.widgets = [];
/**
 * Total number of widgets being used.
 * @type Number
 */
live.widgetCount = 0;
/**
 * Total number of widgets using the Places API
 * @type Number
 */
live.placesWidgetsCount = 0;
/**
 * The amount of widgets using the Places API to be finished with loading their content from the web.
 * @type Number
 */
live.placesLoadedCount = 0;
/**
 * The current location that all widgets will use to gather data for.
 * @type Location
 */
live.location =
{
    'city': 'Dallas'
};

/**
 * A number used to modify how fast the parallax effect scrolls.
 * @type Number
 */
live.PARALLAX_SPEED = 20;
/**
 * An enumerator used to determine where a widget's view will be opened.
 * @type Enum
 */
live.WidgetType = {'STANDARD': 'standard', 'SUPPLEMENTAL': 'supplemental'}

/* Initialization */
$(document).ready(function()
{
    live.initialize();
});

/**
 * Initialize the app
 * @returns {undefined}
 */
live.initialize = function()
{
    live.initializeStillThere();
    sandbox.initialize();
    live.initializeParallax();
    live.initializeWidgets();
    live.initializeListeners();
};

/**
 * Initializes the stillhere library.
 * @returns {undefined}
 */
live.initializeStillThere = function()
{
    stillthere.timeoutStillThere = 120000; //2 minutes
    stillthere.timeout = 120001; // 2 minutes
    stillthere.addEventListener(stillthere.Event.STILL_THERE, function()
    {
        stillthere.overlay.find('.message').html('');
    });
    stillthere.addEventListener(stillthere.Event.TIMEOUT, function()
    {
        var messageHTMLArray = ['<div class="container">',
                                    '<div class="top">',
                                        '<div class="title">',
                                            '<div class="name">info<em>hub</em></div>',
                                        '</div>',
                                        '<div class="description">Discover the best <em>dining</em>, <em>entertainment</em>, <em>shopping</em>, and <em>hotels</em> in cities worldwide!</div>',
                                    '</div>',
                                    '<div class="instructions"><div class="touch-icon-wrap touch-icon-effect"><div class="touch-icon"></div></div><div class="text">Touch to begin</div></div>',
                                '</div>'];
        stillthere.overlay.find('.message').html(messageHTMLArray.join(''));
        live.closeAll();
    });
    stillthere.addEventListener(stillthere.Event.LOADED, function()
    {
        stillthere.showTimeout();
    });
};

/**
 * Initializes all of the widgets
 * @returns {undefined}
 */
live.initializeWidgets = function()
{
    live.initializeWidget('defineLocation', $('section.content .display .static-widgets .main .widgets .location'));
    live.initializeWidget('maps', $('section.content .supplemental-widgets'), live.WidgetType.SUPPLEMENTAL);
    live.initializeWidget('timezone', $('section.content .supplemental-widgets'), live.WidgetType.SUPPLEMENTAL);
    live.initializeWidget('weather', $('section.content .supplemental-widgets'), live.WidgetType.SUPPLEMENTAL);
    //Disable places temporarily to save API calls
    live.initializeWidget('dining');
    live.initializeWidget('entertainment');
    live.initializeWidget('shopping');
    live.initializeWidget('travel');
    live.initializeWidget('hotels');
    live.initializeWidget('finance');
};

/**
 * Initializes a widget
 * @returns {undefined}
 */
live.initializeWidget = function(widget, appendElement, type)
{
    live.widgetCount++;
    $.get('widgets/' + widget + '/' + widget + '.html', function(data) {
        var ae = appendElement instanceof jQuery ? appendElement : $('#widgets');
        var w = new Widget(widget, data, ae, type).initialize();
        live.widgets.push(w);
        if (live.widgets.length === live.widgetCount) {
            live.widgetsLoaded();
        }
    });
};

/**
 * Initializes global and static listeners
 * @returns {undefined}
 */
live.initializeListeners = function()
{
    $('#app-title').click(function(e){live.closeAll();});
    $('.help').click(function(){chrome.runtime.reload();});
};

/**
 * Initializes the parallax effect
 * @returns {undefined}
 */
live.initializeParallax = function()
{
    $('#widgets-container').scroll(function() 
    {
        var y = -($('#widgets-container').scrollTop() / live.PARALLAX_SPEED);
        $('main.fullscreen').css('background-position', '50% ' + y + 'px');
    });
};


/* Widget Actions */
/**
 * Starts the widgets
 * @returns {undefined}
 */
live.widgetsLoaded = function() 
{
    loading.initialize();
    live.updateLocation();
};

/**
 * Sets the global location variable
 * @returns {undefined}
 */
live.updateLocation = function() 
{
    var location = $('#location', defineLocation.v).val();
    live.hideWidgets(function()     
    {
        geocoding.geocode(location, function(location)
        {
            live.location = location;
            for (var i = 0; i < live.widgets.length; i++)
            {
                live.widgets[i].js.setLocation(location);
                live.widgets[i].w.on('placesLoaded', live.updatePlacesLoaded);
            }
            live.setCityDisplay();
        });
    });
    
};

/**
 * Hides all of the standard widgets 
 * @param {function()} callback - callback function to 
 *      execute when all standard widgets have been hidden.
 * @returns {undefined}
 */
live.hideWidgets = function(callback)
{
    var widgetCount = 0;
    live.placesLoadedCount = 0;
    live.standardWidgetsCount = $('#widgets').children().length;
    
    var loadingDiv = $('<div id="widgets-loading">Loading...</div>').appendTo('#widgets');
    loadingDiv.velocity({opacity:1, translateY:'-150%'}, {duration:1000});
    $('#widgets .widget').each(function()
    {
        $(this).velocity({opacity:0, translateZ:0, translateY: '300%'}, {'easing':[ 250, 25 ], 'delay': (widgetCount * 150)});
        widgetCount++;
    }).promise().done(function()
    {
        $('#widgets').trigger('hideWidgetsComplete');
        if(callback != undefined)
        {
            callback();
        }
    });
}

/**
 * Updates the global placesLoadedCount variable and
 * shows the widgets when all widgets have been loaded.
 * @returns {undefined}
 */
live.updatePlacesLoaded = function()
{
    live.placesLoadedCount++;
    if(live.placesLoadedCount == live.standardWidgetsCount)
    {
        setTimeout(function()
        {    
            live.showWidgets();
        }, 1500);
    }
}

/**
 * Shows all of the standard widgets 
 * @param {function()} callback - callback function to 
 *      execute when all standard widgets have been displayed.
 * @returns {undefined}
 */
live.showWidgets = function(callback)
{
    $('#widgets-loading').velocity({opacity:0, translateY:'50%'}, {duration:1000, complete:function(){$(this).remove();}});
    
    var widgetCount = 0;
    $('#widgets .widget').each(function()
    {
        $(this).velocity({opacity:1, translateZ:0, translateY: '0'}, {'easing':[ 250, 25 ], 'delay': (widgetCount * 150)});
        widgetCount++;
    }).promise().done(function()
    {
        $('#widgets').trigger('showWidgetsComplete');
        if(callback != undefined)
        {
            callback();
        }
    }); 
}

/**
 * Changes the size of the current city text.
 * @returns {undefined}
 */
live.setCityDisplay = function()
{
    var fontSize = 60;
    $('.city', defineLocation.w).html(live.location.city);
    do
    {
        $('.city', defineLocation.w).css('font-size', fontSize);
        textWidth = $('.city', defineLocation.w).outerWidth();
        fontSize = fontSize - 1;
    }
    while ((textWidth > 260));
    
    var activeAreaHeight = $('section.content .display').outerHeight() - $('section.content .display .static-widgets').outerHeight();
    $('.active').css('height', activeAreaHeight);
}

/* View Manipulation */
/**
 * Checks if a widget is already in a view
 * @param {jQuery element} selector - The view element that will be added to 
 *      the view panel.
 * @param {live.WidgetType} widgetType - The type of widget that is being checked.
 * @returns {Boolean}
 */
live.validateAddView = function(selector, widgetType) 
{    
    var viewPanel = $('#view-panel');
    var supplementalViewPanel = $('#supplemental-view-panel');
    var viewPanelVisible = viewPanel.hasClass('visible');
    var supplementalViewPanelVisible = supplementalViewPanel.hasClass('visible');
    var added = false;
    
    if(widgetType == live.WidgetType.STANDARD)
    {        
        if(viewPanelVisible)
        {
            if(viewPanel.find(selector).length <= 0)
            {
                added=true;
            }
        }
        else
        {
            added=true;
        }
    }
    else if(widgetType == live.WidgetType.SUPPLEMENTAL)
    {
        if(supplementalViewPanelVisible)
        {
            if(supplementalViewPanel.find(selector).length <= 0)
            {
                added=true;
            }
        }
        else
        {
           added=true;
        }
    }
    return added;
};
/**
 * Adds a view to a view panel and closes any currently open views in that panel.
 * @param {jQuery element} selector - The view element that will be be added to 
 *      the view panel.
 * @param {live.WidgetType} widgetType - the type of widget that is being checked.
 * @returns {Boolean}
 */
live.addView = function(selector, widgetType)
{    
    var viewPanel = $('#view-panel');
    var supplementalViewPanel = $('#supplemental-view-panel');
    var viewPanelVisible = viewPanel.hasClass('visible');
    var supplementalViewPanelVisible = supplementalViewPanel.hasClass('visible');
    var added = false;
    
    if(widgetType == live.WidgetType.STANDARD)
    {        
        if(viewPanelVisible)
        {
            //if open
            if(viewPanel.find(selector).length > 0)
            {
                //if current view is in - close panel, close view
                live.hideViewPanel(function(){selector.trigger('viewPanelHideComplete');live.closeView(viewPanel);});
                
            }
            else
            {
                //if not current view - close panel, close view, open view, open panel                
                live.hideViewPanel(function()
                {
                    var view = viewPanel.find('.view');
                    var widget = live.getWidgetFromName(live.getWidgetName(view));
                    
                    live.closeView(viewPanel, function()
                    {
                        widget.js.viewEnd();
                        live.openView(viewPanel, selector);
                        live.showViewPanel();
                    });
                });
                added=true;
            }
        }
        else
        {
            //if not open - add view, open panel
            live.openView(viewPanel, selector);
            live.showViewPanel();
            added=true;
        }
    }
    else if(widgetType == live.WidgetType.SUPPLEMENTAL)
    {
        if(supplementalViewPanelVisible)
        {
            //if open
            if(supplementalViewPanel.find(selector).length > 0)
            {
                //if current view is in - close panel, close view
                live.hideSupplementalViewPanel(function(){live.closeView(supplementalViewPanel);});

            }
            else
            {
               //if not current view - close panel, close view, open view, open panel
                live.hideSupplementalViewPanel(function(){live.closeView(supplementalViewPanel, function(){live.openView(supplementalViewPanel, selector);live.showSupplementalViewPanel();});});
                added=true;
            }
        }
        else
        {
            //if not open - add view, open panel
            live.openView(supplementalViewPanel, selector);
            live.showSupplementalViewPanel();
            added=true;
        }
    }
    return added;
};

/**
 * Shows the view panel 
 * @param {function()} callback - callback function to 
 *      execute when the view panel has finished animating.
 * @returns {undefined}
 */
live.showViewPanel = function(callback)
{
    var viewPanel = $('#view-panel');
    viewPanel.off('webkitTransitionEnd');
    viewPanel.on('webkitTransitionEnd', function()
    {
        if (callback !== undefined)
        {
            callback();
        }
    });
    viewPanel.addClass('visible');
    $('section.content>.display').addClass('shared');
}

/**
 * Hides the view panel 
 * @param {function()} callback - callback function to 
 *      execute when the view panel has finished animating.
 * @returns {undefined}
 */
live.hideViewPanel = function(callback)
{
    var viewPanel = $('#view-panel');
    viewPanel.off('webkitTransitionEnd');
    viewPanel.on('webkitTransitionEnd', function()
    {
        if (callback !== undefined)
        {
            callback();
        }
    });
    viewPanel.removeClass('visible');
    $('section.content>.display').removeClass('shared');
}

/**
 * Shows the supplemental view panel 
 * @param {function()} callback - callback function to 
 *      execute when the supplemental view panel has finished animating.
 * @returns {undefined}
 */
live.showSupplementalViewPanel = function(callback)
{
    var viewPanel = $('#supplemental-view-panel');
    viewPanel.off('webkitTransitionEnd');
    viewPanel.on('webkitTransitionEnd', function()
    {
        if (callback !== undefined)
        {
            callback();
        }
    });
    viewPanel.addClass('visible');
    $('#widgets-container').addClass('shared');
}

/**
 * Hides the supplemental view panel 
 * @param {function()} callback - callback function to 
 *      execute when the supplemental view panel has finished animating.
 * @returns {undefined}
 */
live.hideSupplementalViewPanel = function(callback)
{
    var viewPanel = $('#supplemental-view-panel');
    viewPanel.off('webkitTransitionEnd');
    viewPanel.on('webkitTransitionEnd', function()
    {
        if (callback !== undefined)
        {
            callback();
        }
    });
    viewPanel.removeClass('visible');
    $('#widgets-container').removeClass('shared');
}

/**
 * Adds a view to a view panel.
 * @param {jQuery element} viewPanel - The view panel that the view will
 *      be added to.
 * @param {jQuery element} selector - The view element that will be be added to 
 *      the view panel.
 * @returns {undefined}
 */
live.openView = function(viewPanel, selector)
{
    viewPanel.append(selector);
}
/**
 * Closes a view.
 * @param {jQuery element} viewPanel - The view panel that holds a view that
 *      will be closed.
 * @param {function()} callback - callback function to execute when the
 *      view has been closed.
 * @returns {undefined}
 */
live.closeView = function(viewPanel, callback)
{
    viewPanel.empty();
    if (callback !== undefined)
    {
        callback();
    }
}

/**
 * Closes both view panels and the views inside them.
 * @returns {undefined}
 */
live.closeAll = function()
{
    var viewPanel = $('#view-panel');
    var view = viewPanel.find('.view');
    if(view.length > 0)
    {
        var viewWidget = live.getWidgetFromName(live.getWidgetName(view));
    }
    var supplementalViewPanel = $('#supplemental-view-panel');
    var supplementalView = supplementalViewPanel.find('.view');
    if(supplementalView.length > 0)
    {
        var supplementalViewWidget = live.getWidgetFromName(live.getWidgetName(supplementalView));
    }    
    
    live.hideViewPanel(function()
    {
        view.trigger('viewPanelHideComplete');
        live.closeView(viewPanel, function()
        {
            if(viewWidget != undefined)
            {
                viewWidget.js.viewEnd();
            }
        });
    });
    
    live.hideSupplementalViewPanel(function()
    {
        supplementalView.trigger('viewPanelHideComplete');
        live.closeView(supplementalViewPanel, function()
        {
            if(supplementalViewWidget != undefined)
            {
                supplementalViewWidget.js.viewEnd();
            }
        });
    });
}




/*Helper Functions*/
/**
 * Loads an image from a url.
 * @param {string} url - The url of the image to retrieve.
 * @param {function()} callback - callback function to execute
 *      when the image has been loaded.
 * @returns {undefined}
 */
live.getExternalImage = function(url, callback)
{
    try
    {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function(event){ callback(window.URL.createObjectURL(xhr.response));};
        xhr.open('GET', url, true);
        xhr.send(null);
    }
    catch(exception)
    {
        console.log(exception.message);
    }
};

/**
 * Gets the name of a widget from that widget's view or widget element.
 * @param {jQuery element} element - The element to be used to extract
 *      the widget's name.
 * @returns {string}
 */
live.getWidgetName = function(element)
{
    var classes = element.attr('class').split(/\s+/);
    for(var i=0; i<classes.length; i++)
    {
        if(classes[i] != 'view' && classes[i] != 'places')
        {
            return classes[i];
        }
    }
}

/**
 * Gets a widget from a name.
 * @param {string} name - The name of the widget.
 * @returns {jQuery element}
 */
live.getWidgetFromName = function(name)
{
    var dashIndex = name.indexOf('-');
    if(dashIndex > -1)
    {
        var uppercaseIndex = dashIndex + 1;
        name =  name.substr(0, dashIndex) + name[uppercaseIndex].toUpperCase() + name.substr(uppercaseIndex + 1, name.length);
    }
    for(var i=0; i<live.widgets.length; i++)
    {
        if(live.widgets[i].name == name)
        {
            return live.widgets[i];
        }
    }
}
