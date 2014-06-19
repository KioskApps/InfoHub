//Location Namespace
var defineLocation = {};

//Global Variables
defineLocation.VIEW_LOCATIONS = [
    'San Francisco',
    'Dallas',
    'Los Angeles',
    'Denver',
    'Chicago',
    'New York',
    'London',
    'Beijing'
];

defineLocation.initialize = function() {
    
};

defineLocation.setLocation = function(location) {
     
};

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
defineLocation.viewEnd = function() {
    $('#location', defineLocation.v).val('');
};
defineLocation.widgetStart = function() {
     
};
defineLocation.widgetEnd = function() {
    
};
defineLocation.iconStart = function() {
    
};
defineLocation.iconEnd = function() {
    
};