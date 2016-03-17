'use strict';

// Create an instance
var wavesurfer = Object.create(WaveSurfer);

// Init options & load audio file
document.addEventListener('DOMContentLoaded', function() {
    var options = {
        container: document.querySelector('#wave'),
        height: '500',
        scrollParent: true,
        waveColor: 'green',
        progressColor: '#999C99',
        cursorColor: 'red',
        cursorWidth: '1',
        skipLength: '0.5',
        fillParent: true
    };

    if (location.search.match('scroll')) {
        options.minPxPerSec = 100;
        options.scrollParent = true;
    }

    // Init
    wavesurfer.init(options);
});

// Progress bar
document.addEventListener('DOMContentLoaded', function() {
    var progressDiv = document.querySelector('#progress-bar');
    var progressBar = progressDiv.querySelector('.progress-bar');

    var showProgress = function(percent) {
        progressDiv.style.display = 'block';
        progressBar.style.width = percent + '%';
    };

    var hideProgress = function() {
        progressDiv.style.display = 'none';
    };

    wavesurfer.on('loading', showProgress);
    wavesurfer.on('ready', hideProgress);
    wavesurfer.on('destroy', hideProgress);
    wavesurfer.on('error', hideProgress);
});

// Create timeline
wavesurfer.on('ready', function() {
    var timeline = Object.create(WaveSurfer.Timeline);

    timeline.init({
        wavesurfer: wavesurfer,
        container: "#wave_timeline"
    });
});

// Converting seconds to normal time function, kurwa
String.prototype.toMMSSML = function() {
    // take input string number from currentTime
    var inputTime = parseFloat(this, 10);

    var minutes = Math.floor(inputTime / 60);
    var seconds = inputTime - minutes * 60;

    if (minutes < 10) {
        minutes = '0' + minutes;
    }

    var parsedSeconds = parseFloat(seconds);

    // convert seconds too many symbols to fixed numbers of symbols
    var secondsWithMiliseconds = parseFloat(parsedSeconds.toFixed(1));

    // add string 0 to seconds, because need 05.13 not 5.13
    if (secondsWithMiliseconds < 10) {
        secondsWithMiliseconds = '0' + secondsWithMiliseconds;
    }

    // summ and return
    var time = minutes + ':' + secondsWithMiliseconds;
    return time;
};

// Declare control buttons
var GLOBAL_ACTIONS = {

    // write keydown function
    'write': function() {
        var time = wavesurfer.getCurrentTime();
        var currentTime = parseFloat(time.toFixed(1));
        var textarea = $('#text');
        var timeForTextarea = currentTime.toString().toMMSSML();
        textarea.val('');
        textarea.val(textarea.val() + '\n' + timeForTextarea);
    },

    // play keydown function
    'play': function() {
        wavesurfer.playPause();
    },

    // back keydown function
    'back': function() {
        wavesurfer.skipBackward();
    },

    // copy to clipboard keydown function
    'copy': function() {
        var copyTextarea = document.querySelector('#text');
        copyTextarea.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text command was ' + msg);
        } catch (err) {
            console.log('Oops, unable to copy');
        }
    }
};

// Bind actions to buttons and keypresses
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('keydown', function(e) {
        var map = {
            32: 'play',     // space
            81: 'back',     // q - left
            69: 'forth',    // e - right
            87: 'write',    // w - write
            70: 'copy'      // f - copy to buffer
        };
        var action = map[e.keyCode];
        if (action in GLOBAL_ACTIONS) {
            if (document == e.target || document.body == e.target) {
                e.preventDefault();
            }
            GLOBAL_ACTIONS[action](e);
        }
    });

    [].forEach.call(document.querySelectorAll('[data-action]'), function(el) {
        el.addEventListener('click', function(e) {
            var action = e.currentTarget.dataset.action;
            if (action in GLOBAL_ACTIONS) {
                e.preventDefault();
                GLOBAL_ACTIONS[action](e);
            }
        });
    });
});

// Drag'n'drop functionality
document.addEventListener('DOMContentLoaded', function() {
    var toggleActive = function(e, toggle) {
        e.stopPropagation();
        e.preventDefault();
        toggle ? e.target.classList.add('wavesurfer-dragover') :
            e.target.classList.remove('wavesurfer-dragover');
    };

    var handlers = {
        // Drop event
        drop: function(e) {
            toggleActive(e, false);

            // Load the file into wavesurfer
            if (e.dataTransfer.files.length) {
                wavesurfer.loadBlob(e.dataTransfer.files[0]);
            } else {
                wavesurfer.fireEvent('error', 'Not a file');
            }
        },

        // Drag-over event
        dragover: function(e) {
            toggleActive(e, true);
        },

        // Drag-leave event
        dragleave: function(e) {
            toggleActive(e, false);
        }
    };

    var dropTarget = document.querySelector('#drop');
    Object.keys(handlers).forEach(function(event) {
        dropTarget.addEventListener(event, handlers[event]);
    });
});
