(function(window, JSON) {
    //Geocoding Scope
    var geocoding = {};
    window.geocoding = geocoding;

    /**
     * Google Maps API Key.
     */
    geocoding.API_KEY = 'AIzaSyAHKeTaL2j7ovuZtRorvVqnzuhKevGBtaI';

    /**
     * Geocodes a given address String and returns the result in the provided 
     * callback function.
     * <p>
     * The object passed to the callback will have the following properties:
     * <ul>
     * <li>address (the original string passed)</li>
     * <li>country</li>
     * <li>countryShort</li>
     * <li>state</li>
     * <li>stateShort</li>
     * <li>county</li>
     * <li>city</li>
     * <li>formattedAddress (full formatted address from Google Maps)</li>
     * <li>lat</li>
     * <li>lng</li>
     * </ul>
     * @param {string} address an address to geocode
     * @param {function(Object)} callback the callback function to return the 
     *      result of the geocoding
     * @returns {undefined}
     */
    geocoding.geocode = function(address, callback) {
        if (typeof address !== 'string') {
            return;
        }
        
        var param = {
            'address': address,
            'sensor': false,
            'key': geocoding.API_KEY
        };
        var url = [];
        url.push('https://maps.googleapis.com/maps/api/geocode/json');
        url.push('?');
        for (var key in param) {
            url.push(key);
            url.push('=');
            url.push(param[key]);
            url.push('&');
        }
        url.pop();
        
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var location = {};
                    location.address = address;
                    location.country = '';
                    location.countryShort = '';
                    location.state = '';
                    location.stateShort = '';
                    location.county = '';
                    location.city = '';
                    location.formattedAddress = '';
                    location.lat = 0;
                    location.lng = 0;

                    var data = JSON.parse(xhr.responseText);
                    if (data.results.length > 0) {
                        location.formattedAddress = data.results[0].formatted_address;
                        location.lat = data.results[0].geometry.location.lat;
                        location.lng = data.results[0].geometry.location.lng;

                        var ac = data.results[0].address_components;
                        for (var i = 0; i < ac.length; i++) {
                            switch (ac[i].types[0]) {
                                case 'country':
                                    location.country = ac[i].long_name;
                                    location.countryShort = ac[i].short_name;
                                    break;
                                case 'administrative_area_level_1':
                                    location.state = ac[i].long_name;
                                    location.stateShort = ac[i].short_name;
                                    break;
                                case 'administrative_area_level_2':
                                    location.county = ac[i].long_name;
                                    break;
                                case 'locality':
                                    location.city = ac[i].long_name;;
                                    break;
                            }
                        }

                        if (callback !== undefined) {
                            callback(location);
                        }
                    }
                }
            }
        };
        xhr.open('GET', url.join(''));
        xhr.send();
    };
})(window, JSON);