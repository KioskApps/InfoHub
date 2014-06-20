//Loading Namespace
var loading = {};

/**
 * Initialize the loading object.
 * Gets all .loading elements and adds the loading animation to them.
 * @returns {undefined}
 */
loading.initialize = function() 
{
    var div = loading.createLoadingDiv();
    for (var i = 0; i < live.widgets.length; i++) {
        live.widgets[i].wv.find('.loading').html(div);
    }
};

/**
 * Creates the loading animation element.
 * @returns {undefined}
 */
loading.createLoadingDiv = function() 
{
    return $('<div/>').addClass('circle')
            .append($('<div/>').addClass('dot').addClass('d1'))
            .append($('<div/>').addClass('dot').addClass('d2'))
            .append($('<div/>').addClass('dot').addClass('d3'))
            .append($('<div/>').addClass('dot').addClass('d4'))
            .append($('<div/>').addClass('dot').addClass('d5'))
            .append($('<div/>').addClass('dot').addClass('d6'))
            .append($('<div/>').addClass('dot').addClass('d7'))
            .append($('<div/>').addClass('dot').addClass('d8'));
};