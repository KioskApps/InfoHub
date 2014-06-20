//Timezone Namespace
var timezone = {};

//Global Variables
/**
 * API key for accessing the timezone API.
 * @type string
 */
timezone.API_KEY = 'AIzaSyCEc-ILEMoraGX8sL0pMdgtfqSq2kOkleo';

/**
 * Locations used for the world clocks.
 * @type array
 */
timezone.VIEW_LOCATIONS = [
    'Los Angeles',
    'Denver',
    'Chicago',
    'New York',
    'London',
    'Beijing'
];

/**
 * Initializes the timezone widget
 * @returns {undefined}
 */
timezone.initialize = function()
{    
    for (var i = 0; i < timezone.VIEW_LOCATIONS.length; i++) {
        var address = timezone.VIEW_LOCATIONS[i];
        timezone.v.find('.zones').append(timezone.createTimezoneDiv(address));
        geocoding.geocode(address, function(location) {
            timezone.getOffset(location, timezone.getClockClass(location.address));
        });
    }
    
    timezone.updateClocks();
};

/**
 * Resets the widget to display data based on a new location.
 * @param {location} location - The location object that defines the
 *      location for the widget to reference.
 * @returns {undefined}
 */
timezone.setLocation = function(location)
{
    timezone.w.find('.clock').replaceWith(timezone.createTimezoneDiv(location.city, true));
    //timezone.w.append(timezone.createTimezoneDiv(location.city));
    
    var global = timezone.createTimezoneDiv(location.city).addClass('global');
    $('.global.clock').replaceWith(global);
    
    timezone.v.find('.current').empty().append(timezone.createTimezoneDiv(location.city));
    timezone.getOffset(location, timezone.getClockClass(location.city));
};

/**
 * Creates an element that will contain information about a timezone.
 * @param {string} address - The address to use to set the clock that will
 *      be displayed in the timezone element.
 * @param {boolean} isWidget - Determines whether the clock will be displayed
 *      in the widget or in the view.
 * @param {string} addressClass - The class that will be added to the
 *      timezone element.
 * @returns {jQuery element}
 */
timezone.createTimezoneDiv = function(address, isWidget, addressClass)
{
    if (typeof addressClass !== 'string') {
        addressClass = timezone.getClockClass(address);
    }
    var clock =  $('<div/>').addClass('clock').addClass(addressClass)
            .append(timezone.createClockFaceDiv());
    
    var time = $('<div/>').addClass('time')
                .append($('<span/>').addClass('hour'))
                .append($('<span/>').addClass('separator').html(':'))
                .append($('<span/>').addClass('minute'))
                .append($('<span/>').addClass('separator').html(':'))
                .append($('<span/>').addClass('second'))
                .append($('<span/>').addClass('am-pm'));
    
    var plainText = $('<div/>').addClass('text')
            .append($('<div/>').addClass('name'))
            .append($('<div/>').addClass('city'))
            .append(time);
    
    if(isWidget)
    {
       clock.append(time); 
    }
    else
    { 
        clock.append(plainText);
    }
    return clock;
};

/**
 * Creates an element that contains visual clock face.
 * @returns {jQuery element}
 */
timezone.createClockFaceDiv = function()
{
    var clock = $('<div/>').addClass('clock-face');
    for (var i = 0; i < 12; i++) {
        clock.append($('<div/>').addClass('hour-mark').css('transform', 'rotate(' + (i * 30) + 'deg)'));
    }
    for (var i = 0; i < 60; i++) {
        clock.append($('<div/>').addClass('min-mark').css('transform', 'rotate(' + (i * 6) + 'deg)'));
    }
    clock.append($('<div/>').addClass('arrow-hour'));
    clock.append($('<div/>').addClass('arrow-minute'));
    clock.append($('<div/>').addClass('arrow-second'));
    clock.append($('<div/>').addClass('arrow-dot'));
    
    return clock;
};

/**
 * Creates a class for a clock item from its address.
 * @param {string} address - The address to use to create the
 *      class name.
 * @returns {string}
 */
timezone.getClockClass = function(address)
{
    if (typeof address === 'string') {
        return address.toLowerCase().replace(/\s+/g, '');
    }
    return '';
};

/**
 * Sets the clock's offset from the UST, from its location.
 * @param {location} location - The location object that defines the
 *      location for the widget to reference.
 * @param {string} locationClass - The class of the clock that needs
 *      to be offset.
 * @returns {undefined}
 */
timezone.getOffset = function(location, locationClass)
{
    var request = [];
    request.push('https://maps.googleapis.com/maps/api/timezone/json');
    request.push('?location=');
    request.push(location.lat);
    request.push(',');
    request.push(location.lng);
    $.ajax(request.join(''), {
        data: {
            'timestamp': new Date().getTime() / 1000,
            'sensor': false,
            'key': timezone.API_KEY
        }
    }).success(function(data) {
        var clock = timezone.wv.find('.' + locationClass).add($('.global.clock').filter('.' + locationClass));
        clock.attr('rawOffset', data.rawOffset);
        clock.attr('dstOffset', data.dstOffset);
        clock.find('.name').html(data.timeZoneName);
        clock.find('.city').html(location.city);
    }).fail(function(data) {
        console.log('failed timezone call');
    });
};

/**
 * Update the clock time for each of the clocks.
 * @returns {undefined}
 */
timezone.updateClocks = function() {    
    var clocks = timezone.wv.find('.clock').add($('.global.clock'));
    clocks.each(function() {
        timezone.updateClock($(this));
    });
    
    setTimeout(timezone.updateClocks, 500);
};

/**
 * Update a clock's time.
 * @param {jQuery element} selector - The clock that will be updated.
 * @returns {undefined}
 */
timezone.updateClock = function(selector) {
    var utc = new Date();
    var offset = parseFloat(selector.attr('rawOffset')) * 1000;
    offset += parseFloat(selector.attr('dstOffset') * 1000);
    var now = new Date(utc.getTime() + offset);
    var h = now.getUTCHours();
    var m = now.getUTCMinutes();
    var s = now.getUTCSeconds();
    var amPm = h >= 12 ? ' pm' : ' am';
    h = h % 12;
    h = h ? h : 12;
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;

    selector.find('.hour').html(h);
    selector.find('.minute').html(m);
    selector.find('.second').html(s);
    selector.find('.am-pm').html(amPm);

    h = Math.round((h % 12) * 30) + Math.floor(m / 2);
    m = Math.round(m * 6);
    s = Math.round(s * 6);

    selector.find('.arrow-hour').css('transform', 'rotate(' + h + 'deg)');
    selector.find('.arrow-minute').css('transform', 'rotate(' + m + 'deg)');
    selector.find('.arrow-second').css('transform', 'rotate(' + s + 'deg)');
};