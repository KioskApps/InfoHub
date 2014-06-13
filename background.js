chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('window.html', {
        'state': 'maximized',
        'bounds': {
            'width': 1920,
            'height': 1080
        }
    });
});