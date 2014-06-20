var wiki = {};
wiki.event;
wiki.messageHandler = function(e) {
    wiki.event = e;
    wiki.getExtract(e.data.location);
};

wiki.getExtract = function(location) {        
    var param = {
        'action': 'query',
        'prop': 'extracts',
        'format': 'json',
        'exintro': true,
        'titles': location,
        'redirects': true,
        'callback': 'wiki.postMessage'
    };
    var url = [];
    url.push('http://en.wikipedia.org/w/api.php?');
    for (var key in param) {
        url.push(key);
        url.push('=');
        url.push(param[key]);
        url.push('&');
    }
    url.pop();

    var script = document.getElementById('jsonp');
    if (script !== null) {
        document.body.removeChild(script);
    }
    script = document.createElement('script');
    script.id = 'jsonp';
    script.src = url.join('');
    document.body.appendChild(script);
};

wiki.getImages = function(location)
{
    
}

wiki.getImage = function(filename)
{
    
}

wiki.postMessage = function(data) {
    var title = '';
    var extract = '';
    for (var key in data.query.pages) {
        title = data.query.pages[key].title;
        extract = data.query.pages[key].extract;
        break;
    }
    wiki.event.source.postMessage({
        'script': 'wiki',
        'widget': wiki.event.data.widget,
        'title': title,
        'extract': extract
    }, wiki.event.origin);
};