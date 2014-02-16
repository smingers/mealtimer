$(document).ready(function () {
    var countDown; // counts down the time using setInterval
    var currentStep = 0; // current step in the recipe (zero indexed)
    var paused;  // assigned boolean value if timer paused (true) or not (false)
    var startTime; // date.now when current step begins
    var elapsed; // amount of time elapsed in the current step
    var userAddedTime = 0; // time added to the current step by the user
    var titleReg = document.title;
    var titleAlert = "(!) " + document.title;
    var elapsedTimes = []; // actual completion times for the user
    var recipeStepTimes = []; // times, in ms, for each step in the recipe
    
    // DOM elements called > 1x
    var $display = $('.display');
    var $play = $('.play');
    var $pause = $('.pause');
    var $add = $('.add');
    var $prev = $('.prev');
    var $next = $('.next');
    var $navbar = $('.navbar');
    var $timerRow = $('.timer-row');
    var $jumbotron = $('.jumbotron');
    var $progress = $('.progress');
    var $start = $('#start');
    var $stop = $('.stop');
    
    //TODO: use ordinal for current step instead of 0-indexed place in array + 1,
    
    // convert milliseconds into human readable format
    var convertMS = function (milliseconds) {
        // converts time into hours, minutes, seconds
        var absMilliseconds = Math.abs(milliseconds);
        var hours = Math.floor(absMilliseconds / 3600000);
        var minutes = Math.floor((absMilliseconds % 3600000) / 60000);
        var seconds = Math.floor(((absMilliseconds % 3600000) % 60000) / 1000);
        var time = [hours, minutes, seconds, milliseconds];
        return time;
    };
    
    var stopWatchTime = function (time) {
        if (time[3] > -1000) {
            return ("0" + time[0]).slice(-2) + ":" + ('0' + time[1]).slice(-2) + ":" + ("0" + time[2]).slice(-2);
        } else {
            return "-" + ("0" + time[0]).slice(-2) + ":" + ('0' + time[1]).slice(-2) + ":" + ("0" + time[2]).slice(-2);
        }
    };
    
    var textTime = function (time) {
        var timeString = "";
        if (time[0] > 0) {
            timeString += (time[0] + " hours ");
        }
        if (time[1] > 0) {
            timeString += (time[1] + " minutes ");
        }
        if (time[2] > 0) {
            timeString += (time[2] + " seconds");
        }
        return timeString;
    };
    
    
    // load recipe content from JSON 
    var buildRecipe = function (recipe) {
        
        var totalTime = 0;
        var numNullSteps = 0; // for calculating progress bar
        for (var i = 0, length = recipe.steps.length; i < length; i++) {
            
            var stepNum = recipe.steps[i].ordinal;
            var stepTime = textTime(convertMS(recipe.steps[i].time));
            var stepText = recipe.steps[i].text;
            $('.steps').append("<div class=\"panel panel-default\" id=\"" + stepNum + "\"><div class=\"panel-heading\"><h3 class=\"panel-title \">Step <span class=\"step-number\">" + stepNum + "</span> <small><span class=\"step-time\">" + stepTime + "</span><span class=\"elapsed-time\"></span></small></h3></div><div class=\"panel-body\">" + stepText + "</div></div>");
            
            recipeStepTimes.push(recipe.steps[i].time);
            totalTime += recipe.steps[i].time;
            elapsedTimes.push(recipe.steps[i].elapsed);
            
            if (recipe.steps[i].time === null) {
                numNullSteps++;
            }
        }
        
        // progress bar
        for (i = 0, length = recipe.steps.length; i < length; i++) {
            var widthNum;
            if (recipe.steps[i].time === null || recipe.steps[i].time === 0) {
                widthNum = 0.5;
            } else {
                widthNum = recipe.steps[i].time * (100 - numNullSteps * 0.5) / totalTime;
            }
            var progressBarStep ="<div class=\"progress-bar progress-bar-step\" style=\"width: " + widthNum + "%\" id=\"progress"+ ( i + 1 ) + "\" href=\""+ (i + 1) +"\"></div>";
            $progress.append(progressBarStep);
        }
        
        // other page elements
        $display.text(stopWatchTime(convertMS(totalTime)));
        $jumbotron.css("background-image", "url('" + recipe.bgImage + "')");
        $('.title').text(recipe.title);
        $('.description').html(recipe.description);
        $('.author').html('By ' + recipe.author);
        $('.yield').append('<li>' + recipe.yield + '</li>');
        for (i = 0, length = recipe.time.length; i < length; i++) {
            $('.prep-time').append('<li>' + recipe.time[i] + '</li>');
        }
        for (i = 0, length = recipe.tools.length; i < length; i++) {
            $('.tools').append('<li>' + recipe.tools[i] + '</li>');
        }
        for (i = 0, length = recipe.ingredients.length; i < length; i++) {
            $('.ingredients').append('<li>' + recipe.ingredients[i] + '</li>');
        }
        
        // IN PROGRESS stop function
         $stop.click(function () {
            clearInterval(countDown);
            currentStep = 0;
            $display.text(stopWatchTime(convertMS(totalTime)));
            $('.step').text('');
            $prev.addClass('disabled');
            $play.removeClass('disabled');
            $pause.addClass('disabled');
            $add.addClass('disabled');
            $next.addClass('disabled');
            $('.panel').removeClass('completed');
            $('.progress-bar-step').removeClass('progress-bar-step-current');
            $('.progress-bar-step').removeClass('progress-bar-step-completed');
            $start.css('visibility', 'visible');
            $stop.css('visibility', 'hidden');
            elapsedTimes = elapsedTimes.map(function(){
               return 0;
            });
        });
        
        // affix progress bar
        $progress.affix({
            offset: {
                top: function () {
                    return (this.top = $jumbotron.outerHeight() - $navbar.outerHeight());
                }, 
                bottom: function () {
                    return (this.bottom = $('.bs-footer').outerHeight(true));
                }
            }
        });
        
        
        // affix sidebar  (IN PROGRESS - WHY DO HEIGHT AND OUTERHEIGHT === 550 WHEN CALCULATED AND 570 IN CHROME DEV TOOLS?)
        var affixSidebar = function () {
            var windowHeight = $(window).height();
            var windowWidth = $(window).width();
            var $toolsIngredients = $('.tools-ingredients');
            
            if (windowHeight > $toolsIngredients.height() && windowWidth >= 992) {
                $toolsIngredients.affix({
                    offset: {
                      top: function () {
                          return (this.top = $toolsIngredients.offset().top - $navbar.outerHeight(true) - $progress.outerHeight());
                      }, 
                      bottom: function () {
                        return (this.bottom = $('.bs-footer').outerHeight(true));
                      }
                    }
                });
            } else {
                $toolsIngredients.removeClass("affix affix-top affix-bottom");
            }
            // console.log("window height: " + windowHeight + "\nwindow width: " + windowWidth + "\n div height: " + $toolsIngredients.height()); TEST
        };
        
        affixSidebar();
        $(window).resize(affixSidebar);
        
    };
    
    // intiate countdown and refresh every second using setInterval
    var startCountdown = function () { 
        $('.step').text('Step ' + (currentStep + 1));
        
        // checks for null time value
        if (recipeStepTimes[currentStep] === null) {
            $display.text('N/A');
            $pause.addClass('disabled'); 
            $add.addClass('disabled');
            
            // IN PROGRESS attempting to discretely update elapsed w/o modifying time display...
            elapsed = elapsedTimes[currentStep];
            countDown = setInterval(function () {
                elapsed += 1000;
                elapsedTimes[currentStep] = elapsed;
                console.log(elapsedTimes);
            }, 1000);
            
        } else {
            $pause.removeClass('disabled');
            $add.removeClass('disabled');
            elapsed = elapsedTimes[currentStep];
            startTime = Date.now() - elapsed;
            displayRemainingTime(startTime);
            countDown = setInterval(function () {
                displayRemainingTime(startTime);
            }, 1000);
        }
        
        // smooth scrolling
        $('html, body').stop().animate({
            scrollTop: $('#' + (currentStep + 1)).offset().top - $navbar.outerHeight(true) - $progress.outerHeight()
        }, 500);
        
    };
        
        
    // displays the remaining time 1x when called (called every second by setInterval fn)
    var displayRemainingTime = function(startTime) {
        elapsed = Date.now() - startTime;
        elapsedTimes[currentStep] = elapsed;
        console.log(elapsedTimes);
        var remaining = Math.round((recipeStepTimes[currentStep] - (elapsed - userAddedTime)) / 1000) * 1000;
        $display.text(stopWatchTime(convertMS(remaining)));
        
        // time expires
        if (remaining < 0) {
            $('#' + (currentStep + 1)).addClass('times-up');
            $('#progress' + (currentStep + 1)).addClass('progress-bar-step-times-up');
            if (document.title === titleReg) {
                document.title = titleAlert;
            } else {
                document.title = titleReg;
            }
        } else if (remaining === 0) {
            // plays audio once
            $('#timer-audio')[0].play();
        } else {
            $('#' + (currentStep + 1)).removeClass('times-up');
            $timerRow.removeClass('timer-row-times-up');
            document.title = titleReg;
        }
    };
    
    // disable prev and next buttons at the beginning and end of the recipe, respectively
    var prevDisabler = function(currentStep) {
        if (currentStep === 0) {
            $prev.addClass('disabled');
        } else {
            $prev.removeClass('disabled');
        }
    };

    var nextDisabler = function(currentStep) {
        if (currentStep === (recipeStepTimes.length - 1)) {
            $next.addClass('disabled');
        } else {
            $next.removeClass('disabled');
        }
    };
    
    // BUTTONS
    // play function, takes the first value in recipeStepTimes, loads it, starts counting down (timeout)
    $play.click(function () {
        // adjusts button appearances
        $pause.removeClass('disabled');
        $play.addClass('disabled');
        $add.removeClass('disabled');
        $start.css('visibility', 'hidden');
        $stop.css('visibility', 'visible');
        prevDisabler(currentStep);
        nextDisabler(currentStep);
        
        // change the appearance of the step panel
        $('#' + (currentStep + 1)).addClass('current');
        $('#progress' + (currentStep + 1)).addClass('progress-bar-step-current');
        
        // determines whether timer is currently paused
        if (paused) {
            startCountdown(elapsed);
            paused = false;
        } else {
            startCountdown();
        }
    });
    

    // pause function, freezes the timer until play is pressed again
    $pause.click(function () {
        // adjusts button appearances
        $pause.addClass('disabled');
        $play.removeClass('disabled');
        
        // freezes visible timer
        paused = true;
        clearInterval(countDown);
    });


    // add function, initially adds a fixed amount of time (1 minute)
    $add.click(function() {
        // IN PROGRESS TO DO: round "current time" down to display time so that adding 60 seconds doesn't appear to the end user to be adding 59 seconds.
        userAddedTime += 60000;
        displayRemainingTime(startTime);
    });
    
    
    // go back to the previous step
    var prev = function () {
        clearInterval(countDown);
        userAddedTime = 0;
        currentStep -= 1;
        elapsed = elapsedTimes[currentStep - 1]; // TEST IN PROGRESS  !!!! IMPORTANT
        prevDisabler(currentStep);
        nextDisabler(currentStep);
        
        // change the appearance of the step panels
        $('#' + (currentStep + 1)).removeClass('completed');
        $('#' + (currentStep + 1)).addClass('current');
        $('#' + (currentStep + 2)).removeClass('current');
        $('#' + (currentStep + 2)).removeClass('times-up');
        $('#progress' + (currentStep + 1)).addClass('progress-bar-step-current');
        $('#progress' + (currentStep + 1)).removeClass('progress-bar-step-completed');
        $('#progress' + (currentStep + 2)).removeClass('progress-bar-step-current');
        $('#progress' + (currentStep + 2)).removeClass('progress-bar-step-times-up');
        
        startCountdown();   
    };
    
    // advance to the next step
    var next = function () {
        clearInterval(countDown);
        userAddedTime = 0;
        currentStep += 1;
        prevDisabler(currentStep);
        nextDisabler(currentStep);

        $('#' + (currentStep)).find('.elapsed-time').text("Completed in " + textTime(convertMS(elapsedTimes[currentStep - 1])));
        elapsedTimes[currentStep - 1] = elapsed; // TEST
        
        // change the appearance of the step panels
        $('#' + (currentStep + 1)).addClass('current');
        $('#' + currentStep).removeClass('current');
        $('#' + currentStep).removeClass('times-up');
        $('#' + currentStep).addClass('completed');
        $('#progress' + (currentStep)).removeClass('progress-bar-step-times-up');
        $('#progress' + (currentStep + 1)).addClass('progress-bar-step-current');
        $('#progress' + (currentStep)).addClass('progress-bar-step-completed');
        
        startCountdown();
        
    };
    
    $prev.click(prev);
    $next.click(next);
    

    // Uses left and right arrow keys to go back / forward a step IN PROGRESS - CREATES PROBLEMS WITH SPACE AND ENTER
    $(document).keydown(function(objEvent) {
        if (!$prev.hasClass('disabled') && objEvent.keyCode == 37) {
             prev();
        } else if (!$next.hasClass('disabled') && objEvent.keyCode == 39) {
            next();
        }
    });
    
    
   // get recipe from JSON array of objects; currently hard coding the ID number IN PROGRESS
    $.getJSON("recipes.json", function(recipes) {
        var recipe;
        for (var i = 0, length = recipes.length; i < length && !recipe; i++) {
            if (recipes[i].id === "1") {
                recipe = recipes[i];
            }
        }
        
        buildRecipe(recipe);
    });
    
});  
    

/*

var confirmMsg = function() {
    confirm("Your recipe timer is still in progress. Are you sure you want to leave this page?");
};


    // IN PROGRESS close window alert
    window.onbeforeunload = function() {
        // if (!paused) {
            confirmMsg();
        // }
    };
    
*/