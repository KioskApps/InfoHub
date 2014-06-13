var slider = {};

slider.Event = {
    BEFORE_OPEN: 'before-open',
    AFTER_OPEN: 'after-open',
    BEFORE_CLOSE: 'before-close',
    AFTER_CLOSE: 'after-close'
};
slider.Direction = {
    LEFT: 'left',
    RIGHT: 'right'
};
slider.DURATION = 1000;
slider.PROCESSING = '#page-processing';
slider.STORAGE = '#pages';

slider.navigateTo = function(targetSlider, page, direction, beforeOpen, param) {
    var slide;
    if (typeof beforeOpen === 'function') {
        var processPage = $('<div/>').addClass('slide').append($(slider.PROCESSING));
        processPage.on(slider.Event.AFTER_OPEN, function() {
            var target = $('<div/>').addClass('slide').append($(page));
            target.on(slider.Event.BEFORE_OPEN, function() {
                beforeOpen(param);
            });
            slide = slider.open(targetSlider, target, direction);
        });
        slide = slider.open(targetSlider, processPage, direction);
    }
    else {
        var target = $('<div/>').addClass('slide').append($(page));
        slide = slider.open(targetSlider, target, direction);
    }
    return slide;
};

slider.open = function(targetSlider, page, direction) {
    
    direction = direction === slider.Direction.LEFT ? slider.Direction.LEFT : slider.Direction.RIGHT;
    
    var center = $(targetSlider).find('.slide.center');
    center.trigger(slider.Event.BEFORE_CLOSE);
    center.animate({
        left: direction === slider.Direction.LEFT ? '100%' : '-100%'
    }, slider.DURATION, function() {
        center.trigger(slider.Event.AFTER_CLOSE);
        //center.children().appendTo(slider.STORAGE);
        center.detach();
    });
     
    var target = $(page);
    target.addClass(direction);
    $(targetSlider).append(target);
    target.trigger(slider.Event.BEFORE_OPEN);
    target.animate({
        left: 0
    }, slider.DURATION, function() {
        target.removeClass(direction).addClass('center');
        target.trigger(slider.Event.AFTER_OPEN);
    });
    return target;
};