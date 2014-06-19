//LiveStream Namespace
var live = {};
live.widgets = [];
live.widgetCount = 0;
live.placesWidgetsCount = 0;
live.placesLoadedCount = 0;
live.location = {
    'city': 'Dallas'
};

live.PARALLAX_SPEED = 20;
live.WidgetType = {'STANDARD': 'standard', 'SUPPLEMENTAL': 'supplemental'}

/* Initialization */
$(document).ready(function() {
    live.initialize();
});
live.initialize = function() {
    live.initializeStillThere();
    sandbox.initialize();
    live.initializeParallax();
    live.initializeWidgets();
    live.initializeListeners();
};
live.initializeWidgets = function() {
    live.initializeWidget('defineLocation', $('section.content .display .static-widgets .main .widgets .location'));
    //live.initializeWidget('wiki', $('section.content .display .static-widgets .secondary .widgets'));
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
live.initializeWidget = function(widget, appendElement, type) {
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
live.widgetsLoaded = function() {
    loading.initialize();
    live.updateLocation();
};
live.initializeListeners = function()
{
    $('#app-title').click(live.closeAll);
    $('.help').click(function(){
        stillthere.showTimeout();});
};
live.initializeParallax = function() {
    $('#widgets-container').scroll(function() {
        var y = -($('#widgets-container').scrollTop() / live.PARALLAX_SPEED);
        $('main.fullscreen').css('background-position', '50% ' + y + 'px');
    });
};
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
        
    });
    stillthere.addEventListener(stillthere.Event.LOADED, function()
    {
        stillthere.showTimeout();
    });
    
    live.closeAll
}

live.updateLocation = function() {
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
live.hideWidgets = function(callback)
{
    var widgetCount = 0;
    live.placesLoadedCount = 0;
    live.standardWidgetsCount = $('#widgets').children().length;
    
    var loadingDiv = $('<div id="widgets-loading">Loading...</div>').appendTo('#widgets');
    loadingDiv.velocity({opacity:1, translateY:'-150%'}, {duration:1000});
    $('#widgets .widget').each(function()
    {
        $(this).velocity({opacity:0, translateZ:0, translateY: '100%'}, {'easing':[ 250, 25 ], 'delay': (widgetCount * 150)});
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
live.validateAddView = function(selector, widgetType) {    
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

live.openView = function(viewPanel, selector)
{
    viewPanel.append(selector);
}
live.closeView = function(viewPanel, callback)
{
    viewPanel.empty();
    if (callback !== undefined)
    {
        callback();
    }
}

live.closeAll = function(event)
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

live.getExternalImage = function(url, callback) {
    try
    {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onreadystatechange = function(event){live.XMLHTTPRequestReadyStateChanged(xhr, callback)};
        xhr.onload = function(event){ callback(window.URL.createObjectURL(xhr.response));};
        xhr.open('GET', url, true);
        xhr.send(null);
    }
    catch(exception)
    {
        console.log(exception.message);
    }
};
live.XMLHTTPRequestReadyStateChanged = function(xhr, callback)
{
    if (xhr.readyState === 4)
    {
       
//        if(xhr.status === 200)
//        {
//            callback(window.URL.createObjectURL(xhr.response));
//        }
//        else
//        {
//            callback('images/noImage.jpg');
//            //console.log('Error Status: ' + xhr.status);
//        }
    } 
}

live.externalImageError = function(event)
{
    console.log('error getting image');
}
live.externalImageBadStatus = function(event)
{
    console.log('error getting image');
}

/*Helper Functions*/
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
