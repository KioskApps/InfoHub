//Wiki Namespace
var wiki = {};

wiki.scrollerTimeout = 5000;
wiki.scrollSpeed = 500;

wiki.initialize = function() {
    window.addEventListener('message', function(e) {
        if (e.data.widget === 'wiki') {
            wiki.setExtract(e.data);
        }
    });
    //setInterval(wiki.scroller, wiki.scrollSpeed);
};
wiki.setLocation = function(location) {
    sandbox.message({
        'script': 'wiki',
        'widget': 'wiki',
        'location': location.city
    });
};

wiki.setExtract = function(data) {
    wiki.wv.find('.city').html(data.title);
    var extract = data.extract;
    //Remove most pronunciation guides
    extract = extract.replace(/\/ˈ(.)*?\//g, '');
    //Remove first parentheses
    extract = extract.replace(/\(.*?\)/g, '');
    wiki.wv.find('.description').html(extract);
    wiki.w.find('.description').html(extract.split('\n')[0]);
};

wiki.scroller = function() {
    var div = wiki.wv.find('.description');
    var pos = div.scrollTop();

    div.scrollTop(++pos);
    if (div.scrollTop() + div.innerHeight() >= div.get(0).scrollHeight) {
        div.animate({
            scrollTop: 0
        }, 500);
    }
};