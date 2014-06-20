//Location Namespace
var defineLocation = {};

/**
 * Initializes the defineLocation widget
 * @returns {undefined}
 */
defineLocation.initialize = function() {
    
};

/**
 * Resets the widget to display data based on a new location.
 * @param {location} location - The location object that defines the
 *      location for the widget to reference.
 * @returns {undefined}
 */
defineLocation.setLocation = function(location) {
     
};

/**
 * Performs intialization operations when the view is opened.
 * @returns {undefined}
 */
defineLocation.viewStart = function()
{
    $('#location', defineLocation.v).unbind('keypress').keypress(function(e) {
        if (e.which === 13) {
            live.updateLocation();
            defineLocation.w.click();
        }
    });
    $('.search-button', defineLocation.v).unbind('click').click(function(e) {
        live.updateLocation();
        defineLocation.w.click();
    });
    $('.city', defineLocation.v).unbind('click').click(function(e)
    {
        var city = $(this).find('.title').html();
        $('#location', defineLocation.v).val(city);
        live.updateLocation();
        defineLocation.w.click();
    });
};

/**
 * Performs closedown operations when the view is opened.
 * @returns {undefined}
 */
defineLocation.viewEnd = function() {
    $('#location', defineLocation.v).val('');
};