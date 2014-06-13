//LiveStream Namespace
var live = {};
live.widgets = [];
live.widgetCount = 0;
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
live.initializeListeners = function() {
//    $('#widgets-container').mousewheel(function(e, delta)
//    {
//        this.scrollLeft -= delta * 100;
//        e.preventDefault();
//    });
};
live.initializeParallax = function() {
    $('#widgets-container').scroll(function() {
        var x = -($('#widgets-container').scrollLeft() / live.PARALLAX_SPEED);
        $('main.fullscreen').css('background-position', x + 'px 50%');
    });
};

live.updateLocation = function() {
    var location = $('#location', defineLocation.v).val();
    geocoding.geocode(location, function(location) {
        live.location = location;
        for (var i = 0; i < live.widgets.length; i++) {
            live.widgets[i].js.setLocation(location);
        }
        live.setCityDisplay();
    });
};
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
                live.hideViewPanel(function(){live.closeView(viewPanel, function(){live.openView(viewPanel, selector);live.showViewPanel();});});
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

live.getExternalImage = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function() {
        if(this.status == 200 || this.status == 304)
        {
            callback(window.URL.createObjectURL(xhr.response));
        }
    };
    xhr.open('GET', url, true);
    try
    {
        xhr.send();
    }
    catch(exception)
    {
        console.log(exception.message);
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function() {
            if(this.status == 200 || this.status == 304)
            {
                callback(window.URL.createObjectURL(xhr.response));
            }
        };
        xhr.open('GET', 'images/noImage.jpg', true);
    }
};

live.externalImageError = function(event)
{
    console.log('error getting image');
}
live.externalImageBadStatus = function(event)
{
    console.log('error getting image');
}
