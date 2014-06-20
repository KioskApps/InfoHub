//Weather Namespace
var weather = {};

/**
 * Time between updating the weather information.
 * @type number
 */
weather.UPDATE_INTERVAL = 60000 * 5;

/**
 * Days of the week.
 * @type array
 */
weather.days = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

/**
 * Initializes the weather widget
 * @returns {undefined}
 */
weather.initialize = function()
{
    setInterval(weather.update, weather.UPDATE_INTERVAL);
};

/**
 * Resets the widget to display data based on a new location.
 * @param {location} location - The location object that defines the
 *      location for the widget to reference.
 * @returns {undefined}
 */
weather.setLocation = function(location)
{
    weather.showWidgetLoading();
    weather.getForecast(location, 1, function(data) {
        weather.setCurrentWeather(data);
        weather.hideWidgetLoading();
    });
    weather.showViewLoading();
    weather.getForecast(location, 6, function(data) {
        weather.setForecast(data);
        weather.hideViewLoading();
    });
};

/**
 * Gets a forecast for the next five days
 * @param {location} location - The location object that defines the
 *      location for the widget to reference.
 * @param {number} days - The number of days to forcast for.
 * @param {function} callback - A callback to be called when the 
 *      forecast has been returned from the API.
 * @returns {undefined}
 */
weather.getForecast = function(location, days, callback)
{
    var url = 'http://api.openweathermap.org/data/2.5/forecast/daily';
    var param = {
        'q': location.city + ',' + location.country,
        'units': 'imperial',
        'cnt': days
    };
    $.ajax(url, {
        'data': param
    }).success(function(data) {
        if (callback !== undefined) {
            callback(data);
        }
    });
};

/**
 * Updates the weather forecast.
 * @returns {undefined}
 */
weather.update = function()
{
    weather.setLocation(live.location);
};

/**
 * Sets the weather information for the current day.
 * @param {object} data - The data returned from the weather
 *      API call.
 * @returns {undefined}
 */
weather.setCurrentWeather = function(data)
{
    var current = weather.w.find('.current-weather');
    if (parseInt(data.cod) === 200) {
        weather.v.find('.location').replaceWith(weather.setLocationData());
        
        if (data.list.length > 0) {
            var day = weather.createWidgetDiv();
            weather.setDayData(day, data.list[0]);
            if (current.find('.day').length > 0) {
                current.find('.day').replaceWith(day);
            }
            else {
                current.append(day);
            }
        }
    }
    else {
        weather.w.find('.error').html(data.message);
    }
};

/**
 * Sets the weather information for the 5 day forecast.
 * @param {object} data - The data returned from the weather
 *      API call.
 * @returns {undefined}
 */
weather.setForecast = function(data)
{
    var forecast = weather.wv.find('.forecast');
    forecast.empty();
    if (parseInt(data.cod) === 200) {
        weather.v.find('.location').replaceWith(weather.setLocationData());
        
        for (var i = 0; i < data.list.length; i++) {
            var day = weather.createDayDiv();
            weather.setDayData(day, data.list[i]);
            forecast.append(day);
        }
    }
    else {
        weather.v.find('.error').html(data.message);
    }
};

/**
 * Creates an element that contains the location data for the
 *      current location.
 * @returns {jQuery element}
 */
weather.setLocationData = function()
{
    var location = weather.createLocationDiv();
    location.find('.city').html(live.location.city);
    location.find('.state').html(live.location.state);
    location.find('.country').html(live.location.country);
    return location;
};

/**
 * Sets the weather information for an element.
 * @param {jQuery element} day - The element that will hold the
 *      weather information.
 * @param {object} data - The data to be set in the day element.
 * @returns {jQuery element}
 */
weather.setDayData = function(day, data) 
{
    var date = new Date(parseFloat(data.dt) * 1000);
    day.find('.date').html(weather.days[date.getDay()]);
    day.find('.temperature .temp').html(Math.round(data.temp.day));
    day.find('.temperature .min').html(Math.round(data.temp.min));
    day.find('.temperature .max').html(Math.round(data.temp.max));
    day.find('.humidity').html(Math.round(data.humidity));
    if (data.weather.length > 0) {
        day.find('.icon').attr('src', weather.getIconUrl(data.weather[0].icon)).addClass('code-' + data.weather[0].icon);
        weather.replaceIconSvg(day.find('.icon'));
        day.find('.message').html(data.weather[0].main);
    }
    if(!day.hasClass('notheme'))
    {
        weather.setTheme(day, data);
    }
    return day;
};

/**
 * Sets color information for an element from its weather data.
 * @param {jQuery element} day - The element that will hold the
 *      weather information.
 * @param {object} data - The data to be used to determine the theme.
 * @returns {undefined}
 */
weather.setTheme = function(day, data)
{
    var backgroundColor = '#EEB932';
    if(Math.round(data.temp.day) > 90)
    {
        backgroundColor = '#C50606';
    }
    if(Math.round(data.temp.day) < 70)
    {
        backgroundColor = '#1CBBF8';
    }
    if((data.weather[0].main).toLowerCase() == 'clouds')
    {
        backgroundColor = '#666666';
    }
    if((data.weather[0].main).toLowerCase() == 'rain')
    {
        backgroundColor = '#7B45AD';
    }
    
    day.css('background-color', backgroundColor);
}

/**
 * Creates an element to contain location data.
 * @returns {jQuery element}
 */
weather.createLocationDiv = function() {
    return $('<div/>').addClass('location')
            .append($('<div/>').addClass('city'))
            .append($('<div/>').addClass('state'))
            .append($('<div/>').addClass('country'));
};

/**
 * Creates an element to contain weather data.
 * @returns {jQuery element}
 */
weather.createDayDiv = function() {
    var div = $('<div/>').addClass('day');
    div.append($('<div/>').addClass('conditions')
        .append($('<img/>').addClass('icon'))
        .append($('<div/>').addClass('message'))
        .append($('<div/>').addClass('humidity')));
    div.append($('<div/>').addClass('data')
        .append($('<div/>').addClass('date'))
        .append($('<div/>').addClass('temperature')
            .append($('<div/>').addClass('temp'))
            .append($('<div/>').addClass('variance')
                .append($('<div/>').addClass('min'))
                .append($('<div>-</div>').addClass('spacer'))
                .append($('<div/>').addClass('max')))));
    return div;
};

/**
 * Creates an element to contain the weather data that
 *      will be displayed in the widget.
 * @returns {jQuery element}
 */
weather.createWidgetDiv = function()
{
    var div = $('<div/>').addClass('day').addClass('notheme');
    div.append($('<img/>').addClass('icon'));
    var temp = $('<div/>').addClass('temperature')
            .append($('<div/>').addClass('temp'));
    div.append(temp);
    return div;
}

/**
 * Gets and icon url for a forecast from the forecast's icon code.
 * @param {string} code - The icon code for the icon.
 * @returns {string}
 */
weather.getIconUrl = function(code)
{
    return 'widgets/weather/icons/' + code + '.svg';
};

/**
 * Replaces an inline image with the body of an external svg icon
 * @param {jQuery element} selector - The icon element to replace.
 * @returns {undefined}
 */
weather.replaceIconSvg = function(selector)
{
    var imgID = selector.attr('id');
    var imgClass = selector.attr('class');
    var imgURL = selector.attr('src');

    $.get(imgURL, function(data) {
        // Get the SVG tag, ignore the rest
        var $svg = $(data).find('svg');

        // Add replaced image's ID to the new SVG
        if(typeof imgID !== 'undefined') {
            $svg = $svg.attr('id', imgID);
        }
        // Add replaced image's classes to the new SVG
        if(typeof imgClass !== 'undefined') {
            $svg = $svg.attr('class', imgClass +' replaced-svg');
        }

        // Remove any invalid XML tags as per http://validator.w3.org
        $svg = $svg.removeAttr('xmlns:a');

        // Replace image with new SVG
        selector.replaceWith($svg);
    }, 'xml');
};