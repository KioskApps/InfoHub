//Demo Namespace
var demo = {};

demo.initialize = function() {
    //Any initialization here
};

demo.setLocation = function(location) {
    location.country;
    location.countryShort;
    location.state;
    location.stateShort;
    location.county;
    location.city;
    location.formattedAddress;
    location.lat;
    location.lng;   
};

demo.viewStart = function() {
    demo.showViewLoading();
    setTimeout(function() {
        demo.hideViewLoading();
    }, 2000);
    console.log('View Started');    
};
demo.viewEnd = function() {
    console.log('View Ended');    
};
demo.widgetStart = function() {
    console.log('Widget Started');    
};
demo.widgetEnd = function() {
    console.log('Widget Ended');
};
demo.iconStart = function() {
    console.log('Icon Started');
};
demo.iconEnd = function() {
    console.log('Icon Ended');
};