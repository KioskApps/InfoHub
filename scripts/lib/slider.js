(function(window, $) {
    //Slider Scope
    var slider = {};
    window.slider = slider;
    
    /**
     * Defines before/after open/close event types.
     * <p>
     * For example:
     * <pre>
     * $(mypage).on(slider.Event.BEFORE_OPEN, functionToCallBefore);
     * </pre>
     * Note that these events should be used for quick actions. If a 
     * long-running function needs to be called before a slide is opened, 
     * use the "beforeOpen" parameter in slider.slide() to display a processing 
     * page first.
     */
    slider.Event = {
        BEFORE_OPEN: 'before-open',
        AFTER_OPEN: 'after-open',
        BEFORE_CLOSE: 'before-close',
        AFTER_CLOSE: 'after-close'
    };
    /**
     * Defines the direction a slide will be opened.
     */
    slider.Direction = {
        LEFT: 'left',
        RIGHT: 'right'
    };
    /**
     * The duration (ms) of the slide animation
     */
    slider.duration = 350;
    /**
     * The jQuery selector for the processing page.
     * <p>
     * If specified, when using slider.slide() with a "beforeOpen" parameter, 
     * the processing page will be opened first, the beforeOpen function run, 
     * and then the next page displayed.
     * <p>
     * If the processing page is not specified, using "beforeOpen" on 
     * slider.slide() would be equivalent to binding the function to the 
     * "before-open" trigger, and no processing page will be displayed.
     */
    slider.processing;
    /**
     * The jQuery selector for the hidden storage div.
     * <p>
     * If specified, when removing slides, slider.js will append their content 
     * to the storage div. This is important if the pages need to be accessed 
     * again and are not stored in memory.
     */
    slider.storage;
    
    //Processing jQuery selector
    var $process;
    
    /**
     * Slides the provided page into the specified slider.
     * <p>
     * By default, the direction is left.
     * <p>
     * If a function is provided to execute before opening the page, a 
     * processing page (if defined in slider.processing) will be opened 
     * first, the function executed, and then the page displayed.
     * @param {string|jQuery} slideContainer the slider to display the page in
     * @param {string|jQuery} page the page to display
     * @param {string} direction the direction to slide the page from
     * @param {function} beforeOpen optional function to execute before opening
     * @param {Object} param optional parameters for the optional function
     * @returns {undefined}
     */
    slider.slide = function(slideContainer, page, direction, beforeOpen, param) {
        //If beforeOpen is specified and a processing page is specified,
        if (typeof beforeOpen === 'function' && slider.processing) {
            //Define the processing page selector if it has not been defined yet
            if (!$process) {
                $process = $(slider.processing);
            }
            
            //Wrap the page in a slide and open the page after the process 
            //slide has opened fully
            var processSlide = $('<div/>').addClass('slide').append($process);
            processSlide.on(slider.Event.AFTER_OPEN, function(e) {
                e.stopPropagation(); //Prevents second trigger
                var targetSlide = $('<div/>').addClass('slide').append($(page));
                targetSlide.on(slider.Event.BEFORE_OPEN, function() {
                    beforeOpen(param);
                });
                open(slideContainer, targetSlide, direction);
            });
            open(slideContainer, processSlide, direction);
        }
        else {
            //If no processing page is specified, execute the beforeOpen
            //function immediately and open the page
            if (typeof beforeOpen === 'function') {
                beforeOpen(param);
            }
            var targetSlide = $('<div/>').addClass('slide').append($(page));
            open(slideContainer, targetSlide, direction);
            //Temporary fix for widget code
            return targetSlide;
        }
    };

    /**
     * Opens a slide in the specified slider.
     * @param {string|jQuery} slideContainer the slider to open the slide into
     * @param {string|jQuery} target the target slide to open
     * @param {string} direction the direction to slide the target from
     * @returns {undefined}
     */
    var open = function(slideContainer, target, direction) {
        //If no direction is specified, default to left
        direction = direction === slider.Direction.LEFT ? slider.Direction.LEFT : slider.Direction.RIGHT;
        
        var $slider = $(slideContainer);
        
        //Get the current center slide
        var center = $slider.find('.slide.center');
        //Trigger events on the slide's wrapped children
        center.children().trigger(slider.Event.BEFORE_CLOSE);
        center.animate({
            left: direction === slider.Direction.LEFT ? '100%' : '-100%'
        }, slider.duration, function() {
            center.children().trigger(slider.Event.AFTER_CLOSE);
            if (slider.storage) {
                //If storage is specified, add the children to storage
                center.children().appendTo(slider.storage);
            }
            center.detach();
        });

        //Get the incoming target slide and add it to the slider
        target = $(target);
        target.addClass(direction).appendTo($slider);
        //Trigger events on the slide's wrapped children
        target.children().trigger(slider.Event.BEFORE_OPEN);
        target.animate({
            left: 0
        }, slider.duration, function() {
            target.removeClass(direction).addClass('center');
            target.children().trigger(slider.Event.AFTER_OPEN);
        });    
    };
})(window, jQuery);