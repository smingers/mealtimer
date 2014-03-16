/*global Tour:true, purl:true*/

$(document).ready(function () {
    // var countDown; // counts down the time using setInterval
    var currentStep = 0; // current step in the recipe (zero indexed)
    // var paused;  // assigned boolean value if timer paused (true) or not (false)
    // var startTime; // date.now when current step begins
    // var elapsed; // amount of time elapsed in the current step
    // var userAddedTime = 0; // time added to the current step by the user
    // var titleReg = document.title;
    // var titleAlert = "(!) " + document.title;
    var elapsedTimes = []; // actual completion times for the user
    var recipeStepTimes = []; // times, in ms, for each step in the recipe
    
    // DOM elements called > 1x
    var $display = $('.display');
    var $play = $('.play');
    var $pause = $('.pause');
    var $more = $('.more');
    var $prev = $('.prev');
    var $next = $('.next');
    var $navbar = $('.navbar');
    var $step = $('.step');
    // var $timerRow = $('.timer-row');
    var $jumbotron = $('.jumbotron');
    var $progress = $('#progress-bar-master');
    var $start = $('#start');
    var $stop = $('#stop');
    var $ingredients = $('.ingredients');

    // time conversion and rendering functions
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
    
    // load recipe content from JSON 
    var buildRecipe = function (recipe) {
        var totalTime = 0;
        var numNullSteps = 0; // for inserting null-time steps into the progress bar

        // step panels
        for (var i = 0, length = recipe.steps.length; i < length; i++) {
            var stepNum = recipe.steps[i].ordinal;
            var stepTime;
    
            var passive;
            if (recipe.steps[i].passive) {
                passive = true;
            } else {
                passive = false;
            }
            
            if (recipe.steps[i].time) {
                stepTime = stopWatchTime(convertMS(recipe.steps[i].time));
            } else {
                stepTime = "--:--:--";
            }
            var stepText = recipe.steps[i].text;
            
            $('.steps').append('<div class="panel panel-default" data-time="' + recipe.steps[i].time +'" data-passive="' + passive + '" id="' + stepNum + '"><div class="panel-heading"><div class="progress-bar step-progress" role="progressbar"></div><div class="step-controls"><button type="button" class="btn btn-default btn-xs play disabled"><span class="glyphicon glyphicon-play"></span></button><span class="step-times"><span class="elapsed small"></span><span class="divisor small"></span><span class="total small">' + stepTime + '</span></span></div></div><table class="table"><tr><tbody><td class="step-ordinal">' + stepNum + '</td><td class="step-text">'+ stepText +'</td></tbody></tr></table></div>');
            
            recipeStepTimes.push(recipe.steps[i].time);
            totalTime += recipe.steps[i].time;
            elapsedTimes.push(recipe.steps[i].elapsed);
            
            if (!recipe.steps[i].time) {
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
            var progressBarStep = ('<a href="#' + (i + 1) + '" class="progress-bar progress-bar-step" style="width: ' + widthNum + '%" id="progress' + ( i + 1 ) + '" data-toggle="tooltip" data-placement="bottom" title="Step ' + (i + 1) + '"></a>');
            $progress.append(progressBarStep);
        }
        $('.progress-bar-step').tooltip(); // IN PROGRESS
        
        // other page elements
        $display.text(stopWatchTime(convertMS(totalTime)));
        $jumbotron.css("background-image", "url('" + recipe.bgImage + "')");
        $('.title').text(recipe.title);
        // document.title = recipe.title + " | " + document.title; 
        $('.description').html(recipe.description);
        $('.author').html(recipe.author);
        $('.yield').append('<li>' + recipe.yield + '</li>');
        for (i = 0, length = recipe.time.length; i < length; i++) {
            $('.prep-time').append('<li>' + recipe.time[i] + '</li>');
        }
        for (i = 0, length = recipe.tools.length; i < length; i++) {
            $('.tools').append('<li>' + recipe.tools[i] + '</li>');
        }
        for (i = 0, length = recipe.ingredients.length; i < length; i++) {
            if (recipe.ingredients[i].category) {
                $ingredients.append('<h6>' + recipe.ingredients[i].category + '</h6>');
                for (var j = 0, length2 = recipe.ingredients[i].ingredients.length; j < length2; j++) {
                    $ingredients.append('<li class="ingredient">' + recipe.ingredients[i].ingredients[j] + '</li>');
                }
                $ingredients.append('<br>');
            } else {
                $ingredients.append('<li class="ingredient">' + recipe.ingredients[i] + '</li>');
            }
            
        }
        
        // stop function, restores pretty much everything back to its original state
         $stop.click(function () {
            // clearInterval(countDown);
            $more.popover('hide');
            currentStep = 0;
            $display.text(stopWatchTime(convertMS(totalTime)));
            $step.text('');
            $prev.addClass('disabled');
            $play.removeClass('disabled');
            $pause.addClass('disabled');
            $more.addClass('disabled');
            $next.addClass('disabled');
            $('.panel').removeClass('completed');
            $('.panel').removeClass('current');
            $('.progress-bar-step').removeClass('progress-bar-step-current');
            $('.progress-bar-step').removeClass('progress-bar-step-completed');
            $start.css('visibility', 'visible');
            $stop.css('visibility', 'hidden');
            clearInterval($('.total-elapsed').data('total'));
            elapsedTimes = elapsedTimes.map(function(){
               return 0; // resets all values in array to zero
            });
        });
        
        // affix progress bar
        $progress.affix({
            offset: {
                top: function () {
                    return (this.top = $jumbotron.outerHeight() - $navbar.outerHeight());
                }
            }
        });
        
        // affix sidebar  (BUGGY; WHY DO HEIGHT AND OUTERHEIGHT === 550 WHEN CALCULATED AND 570 IN CHROME DEV TOOLS?)
        var affixSidebar = function () {
            var windowHeight = $(window).height();
            var windowWidth = $(window).width();
            var $toolsIngredients = $('.tools-ingredients');
            
            if (windowHeight > $toolsIngredients.height() && windowWidth >= 992) {
                $toolsIngredients.affix({
                    offset: {
                      top: function () {
                          return (this.top = $toolsIngredients.offset().top - $navbar.outerHeight(true) - $progress.outerHeight());
                      } /*, 
                      bottom: function () {
                          console.log('bottom', $('.bs-footer').outerHeight(true));
                          return (this.bottom = $('.bs-footer').outerHeight(true));
                      } */
                    }
                });
            }
        };
        affixSidebar();
        $(window).resize(affixSidebar);
        
    };
    
    /*
    //IN PROGERSS - smooth scrolling on click of progress bar pieces
    $('.progress-bar-step').click(function (ordinal) {
        $(this).attr('href', ordinal);
        console.log(ordinal);
        // smooth scrolling
        $('html, body').stop().animate({
            scrollTop: $('#' + ordinal).offset().top - $navbar.outerHeight(true) - $progress.outerHeight()
        }, 500);
    });
    */
    
    // smooth scrolling
    var smoothScrolling = function () {
        $('html, body').stop().animate({
            scrollTop: $('#' + currentStep).offset().top - $navbar.outerHeight(true) - $progress.outerHeight()
        }, 500);
    };
    
    // disable prev and next buttons at the beginning and end of the recipe, respectively
    var prevNextDisabler = function (currentStep) {
        if (currentStep === 1) {
            $prev.addClass('disabled');
        } else {
            $prev.removeClass('disabled');
        }
        
        if (currentStep === (recipeStepTimes.length)) {
            $next.addClass('disabled');
        } else {
            $next.removeClass('disabled');
        }
    };
    
    var currentStepCountdown = function (currentStep, elapsed, stepTime) {
        var remaining;
        if (stepTime) {
            remaining = stopWatchTime(convertMS(stepTime - elapsed));
        } else {
            remaining = 'N/A';
        }
        $display.text(remaining);
        
        //currentStepClass
        if (stepTime && elapsed > stepTime) {
            $('#' + currentStep).addClass('panel-danger');
            $('#progress' + currentStep).addClass('progress-bar-step-times-up-current');
        } else {
            $('#' + currentStep).addClass('panel-info');
            $('#progress' + currentStep).addClass('progress-bar-step-playing-current');
        }
        $('#progress' + currentStep).removeClass('progress-bar-step-completed');
    };
    
    // IN PROGRESS
    var stepClasses = function (currentStep) {
        
        var $panels = $('.steps').children();
        var $progressBars = $progress.children();
        
        $panels.each(function () {
            if (+$(this).attr('id') != currentStep) {
                $(this).removeClass('panel-danger');
                $(this).removeClass('panel-info');
            }
        });
        
        $progressBars.each(function () {
            if (+$(this).attr('id').slice(8) != currentStep) {
                $(this).removeClass('progress-bar-step-times-up-current');
                $(this).removeClass('progress-bar-step-playing-current');
            }
            if (+$(this).attr('id').slice(8) < currentStep && !($(this).hasClass('playing'))) {
                $(this).addClass('progress-bar-step-completed');
            } else if (+$(this).attr('id').slice(8) < currentStep && $(this).hasClass('playing')) {
                $(this).addClass('progress-bar-step-playing');
            }
            
        });
    };
    
    var totalElapsed = function () {
        var $totalElapsed = $('.total-elapsed');
        var total = 0;
        $totalElapsed.html('Total time: '+ stopWatchTime(convertMS(total)));
        $totalElapsed.data('total', setInterval(function () {
            total += 1000;
            $totalElapsed.html('Total time: '+ stopWatchTime(convertMS(total)));
        }, 1000));
    };
    
    // BUTTONS
    $('.steps').on('click', 'button', function (event) {
        var $this = $(this);
        var $panel = $this.closest('.panel');
        // var $progressID = $('#progress' + $panel.attr('id'));
        // console.log($panel);
        var id = +$panel.attr('id') - 1; // kinda lame
        if ($this.hasClass('play')) {
            $panel.data('playing', true);
            $panel.toggleClass('playing');
            $panel.trigger('tick', id);
            $panel.data('timer', setInterval(function () {
                $panel.trigger('tick', id);
            }, 1000));
            $this.toggleClass('play').toggleClass('pause').html('<span class="glyphicon glyphicon-pause"></span>');
            // $progressID.toggleClass('progress-bar-step-playing');
        } else if ($this.hasClass('pause')) {
            $panel.data('playing', false);
            $panel.toggleClass('playing');
            $panel.removeClass('times-up');
            clearInterval($panel.data('timer'));
            $this.toggleClass('play').toggleClass('pause').html('<span class="glyphicon glyphicon-play"></span>');
        }
        stepClasses(currentStep);
    });
    
    $('.steps').on('tick', function (event, id) {
        var $element = $(event.currentTarget).children().eq(id);
        var $progressBarStep = $progress.children().eq(id);
        var $elapsed = $element.find('.elapsed');
        var elapsed = $element.data('elapsed') || 0;
        
        var $divisor = $element.find('.divisor');
        $divisor.text(' / ');
        
        var stepTime = $element.data('time');
        
        $elapsed.text(stopWatchTime(convertMS(elapsed)));
        elapsed += 1000;
        $element.data('elapsed', elapsed);
        
        if (elapsed > stepTime && stepTime) {
            $element.addClass('times-up');
            $progressBarStep.addClass('progress-bar-step-times-up');
        } else if (elapsed === stepTime && stepTime) {
            $('#timer-audio')[0].play();
        }
        
        if (id + 1 === currentStep) {
            currentStepCountdown(currentStep, elapsed, stepTime);
        }
        
    });
    
    $start.on('click', function () {
        currentStep = 1;
        $prev.removeClass('disabled');
        $next.removeClass('disabled');
        $('.play').removeClass('disabled');
        $start.css('visibility', 'hidden');
        $stop.css('visibility', 'visible');
        var $currentStepPlay = $('.steps').find('#' + currentStep + ' .play');
        $currentStepPlay.trigger('click');
        $step.text('Step ' + currentStep);
        prevNextDisabler(currentStep);
        smoothScrolling();
        totalElapsed();
    });
    
    $prev.tooltip();
    $next.tooltip();
    
    var prev = function () {
        $prev.tooltip('hide');
        var $currentStepStop = $('.steps').find('#' + currentStep + ' .pause');
        $currentStepStop.trigger('click');
        currentStep--;
        var $currentStepPlay = $('.steps').find('#' + currentStep + ' .play');
        $currentStepPlay.trigger('click');
        // stepClasses(currentStep);
        $step.text('Step ' + currentStep);
        prevNextDisabler(currentStep);
        smoothScrolling();
    };
    
    $prev.on('click', prev);
    
    var next = function () {
        $next.tooltip('hide');
        if (!$('.steps').find('#' + currentStep).data('passive')) {
            var $currentStepStop = $('.steps').find('#' + currentStep + ' .pause');
            $currentStepStop.trigger('click');
        }
        currentStep++;
        if (!$('.steps').find('#' + currentStep).data('playing')) {
            var $currentStepPlay = $('.steps').find('#' + currentStep + ' .play');
            $currentStepPlay.trigger('click');
        }
        // stepClasses(currentStep);
        $step.text('Step ' + currentStep);
        prevNextDisabler(currentStep);
        smoothScrolling();
    };
    
    $next.on('click', next);
    
    // Uses left and right arrow keys to go back / forward a step - PROBLEMS WITH SPACEBAR AND ENTER
    $(document).keydown(function (event) {
        if (!$prev.hasClass('disabled') && event.keyCode == 37) {
             prev();
        } else if (!$next.hasClass('disabled') && event.keyCode == 39) {
            next();
        }
    });
    
    /* // $more with extra time controls (add, subtract, reset)
    $more.popover({
        position: 'fixed',
        placement: 'bottom',
        html: 'true',
        content : '<div class="btn-group-vertical"><button type="button" class="btn btn-default add"><span class="glyphicon glyphicon-plus"></span> Add a minute</button><button type="button" class="btn btn-default subtract"><span class="glyphicon glyphicon-minus"></span> Subtract a minute</button><button type="button" class="btn btn-default reset"><span class="glyphicon glyphicon-repeat"></span> Reset time</button></div>'
    });
    
    $('body').on('click', '.add', function () {
        userAddedTime += 60000;
        displayRemainingTime(startTime);
    }).on('click', '.subtract', function () {
        userAddedTime -= 60000;
        displayRemainingTime(startTime);
    }).on('click', '.reset', function () {
        elapsedTimes[currentStep] = 0;
        userAddedTime = 0;
        clearInterval(countDown);
        startCountdown();
    }); */
    
    // click outside popover to dismiss; doesn't work on mobile
    // attributed to: http://stackoverflow.com/questions/11703093/how-to-dismiss-a-twitter-bootstrap-popover-by-clicking-outside and http://jsfiddle.net/mattdlockyer/C5GBU/2/
    $('body').on('click', function (event) {
        $('[data-toggle="popover"]').each(function () {
            // 'is' for buttons that trigger popups
            // 'has' for icons within a button that triggers a popup
            if (!$(this).is(event.target) && $(this).has(event.target).length === 0 && $('.popover').has(event.target).length === 0) {
                $(this).popover('hide');
            }
        });
    });
    
    var tour = new Tour({
      onEnd: function () {
        $('#1').removeClass('current').removeClass('times-up').removeClass('panel-info').removeClass('panel-danger');
      },
      steps: [
      {
        orphan: true,
        backdrop: true,
        title: "Welcome to meal&middottimer",
        content: "<strong>meal&middottimer</strong> transforms your favorite recipes with an interactive experience that helps you get dinner on the table and on time.  Take this brief tour to see how it works."
      },
      {
        element: "#start",
        title: "Start meal&middottimer",
        content: "Click <code>Start &raquo;</code> when you are ready to cook and <strong>meal&middottimer</strong> will advance to the first step."
      },
      {
        element: ".hidden-xs .btn-group",
        title: "Advance to the next step",
        content: "After finishing a step in the recipe, press <code><span class='glyphicon glyphicon-arrow-right'></span></code> to advance to the next step (you can also go back to the previous steps by clicking <code><span class='glyphicon glyphicon-arrow-left'></span></code>). Or, use the left and right arrow keys on your keyboard.",
        placement: "bottom"
      },
      {
        element: ".hidden-xs .time",
        title: "Countdown",
        content: "The primary timer counts down the time remaining in the current step.",
        placement: "bottom"
      },
      {
        element: "#1",
        title: "Recipe step",
        content: "Each step in the recipe appears in its very own box.  The appearance of the box will change as you follow the recipe.",
        placement: "left",
        onShow: function (tour) {
            $('#1').removeClass('current').removeClass('panel-info');
        }
      },
      {
        element: "#1",
        title: "Current Step",
        content: "The current step is highlighted in blue.",
        placement: "left",
        onShown: function (tour) {
            setTimeout(function () {
                $('#1').removeClass('times-up').removeClass('panel-danger');
                $('#1').addClass('current').addClass('panel-info');
            }, 1000);
        }
      },
      {
        element: "#1",
        title: "Time's Up!",
        content: "When time expires on the current step, it turns red and a chime will sound.",
        placement: "left",
        onShown: function (tour) {
            setTimeout(function () {
                $('#1').addClass('times-up').addClass('panel-danger');
                $('#timer-audio')[0].play();
            }, 1000);
        }
      },
      {
        element: "#1 .total",
        title: "Duration",
        content: "The duration of each step is shown here (untimed steps will read <code>--:--:--</code>).  While the step is in progress, the elapsed time is visible.",
        placement: "bottom",
        onShown: function (tour) {
            $('#1').removeClass('times-up').removeClass('panel-danger').removeClass('current').removeClass('panel-info');
            //$('#1 .play').click();
        }
      },
      {
        element: "#1 .play",
        title: "Play/Pause",
        content: "Working on more than one step at a time?  Just click <code><span class='glyphicon glyphicon-play'></span></code> and multiple timers will run simultaneously.",
        placement: "bottom",
        onShown: function (tour) {
            //$('#1 .play').click();
        }
      },
      {
        element: ".progress",
        title: "Progress indicator",
        content: "Visualize progress toward completing the recipe.  See which steps are complete and which are underway.",
        placement: "top"
      },
      {
        orphan: true,
        backdrop: true,
        title: "Bon Appetit!",
        content: "That's it!  Click <code>Start &raquo;</code> to begin cooking with <strong>meal&middottimer</strong>."
      }
    ]}).init().start();
    
    $('.help').tooltip();
    $('.help').on('click', function () {
        $(this).tooltip('destroy');
        tour.restart();
    });

   // get recipe (relies on purl.js file)
    $.getJSON("recipes.json", function(recipes) {
        var recipe;
        for (var i = 0, length = recipes.length; i < length && !recipe; i++) {
            if (recipes[i].id === purl().param('id')) {
                recipe = recipes[i];
            }
        }
        
        buildRecipe(recipe);
    });

}); // END