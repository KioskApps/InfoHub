//Geocoding Namespace
var geocoding = {};

geocoding.API_KEY = 'AIzaSyAHKeTaL2j7ovuZtRorvVqnzuhKevGBtaI';

geocoding.geocode = function(address, callback) {
    if (typeof address !== 'string') {
        return;
    }
    $.ajax('https://maps.googleapis.com/maps/api/geocode/json', {
        'data': {
            'address': address,
            'sensor': false,
            'key': geocoding.API_KEY
        }
    }).success(function(data) {
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
    });
};
geocoding.getLatLng = function(address, callback) {
    if (typeof address !== 'string') {
        return;
    }
    $.ajax('https://maps.googleapis.com/maps/api/geocode/json', {
        'data': {
            'address': address,
            'sensor': false,
            'key': geocoding.API_KEY
        }
    }).success(function(data) {
        var lat = 0;
        var lng = 0;
        var address = '';
        if (data.results.length > 0) {
            lat = data.results[0].geometry.location.lat;
            lng = data.results[0].geometry.location.lng;
            address = data.results[0].formatted_address;
            
            if (callback !== undefined) {
                callback(lat, lng, address);
            }
        }
    });
};