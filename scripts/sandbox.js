//Sandbox Namespace
var sandbox = {};
sandbox.loaded = false;

sandbox.initialize = function() {
    window.addEventListener('message', function(e) {
        if (e.data.loaded) {
            sandbox.loaded = true;
        }
    });
    sandbox.loadCheck();
};

sandbox.message = function(message) {
    if (sandbox.loaded) {
        sandbox.postMessage(message);
    }
    else {
        setTimeout(function() {
            sandbox.message(message);
        }, 100);
    }
};

sandbox.postMessage = function(message) {
    var win = $('#scripts-sandbox').get(0).contentWindow;
    if (win !== null) {
        win.postMessage(message, '*');
    }
};

sandbox.loadCheck = function() {
    if (!sandbox.loaded) {
        sandbox.postMessage({
            'loadCheck': true
        });
        setTimeout(sandbox.loadCheck, 100);
    }
};