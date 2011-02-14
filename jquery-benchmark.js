/****************************
 * jQuery Benchmark Plugin
 * https://github.com/kilhage/jquery-benchmark
 *
 * MIT Licensed
 * @author Emil Kilhage
 * Version: 0.9.0
 * Last updated: 2010-12-30 22:45:51
 */
(function( $ ) {

/**
 * The Base benchmarker that do the actual benchmarking
 *
 * @param avoidMarkStart
 */
function Benchmarker( avoidMarkStart ) {
    // avoids the jQuery.benchmark.setup function 
    // from rewriting this plugin
    "benchmarked";
    if( ! ( this instanceof Benchmarker ) ) {
        return new Benchmarker( avoidMarkStart );
    }
    this.reset();
    if( ! avoidMarkStart ) {
        this.start();
    }
}

// Join the Benchmarker with jQuery
var B = $.benchmark = Benchmarker,

// Assign some private variables used in the scope

// Used in the output function
error_preg = /(\{error\}\:)/,

error_messages = {
    callback: " Callback didn't return a value!"
},

// Controlls the output
enabled = true,

// Controlls the output method
use_console = true,

// All output will be stored here
bufferd_output = "",

// Name of the plugin, used in outputs
name = "jQuery.benchmark :: ",

// Internal output function
output = function( message ) {
    // don't make any output if 
    if( ! enabled ) {
        return message;
    }
    // if not an string is passed, output an empty string instead
    message = (typeof message === "string") ? name + message : "";

    // Test if an error have accoured
    if( error_preg.test( message ) ) {
        // Build the error message and throw an error
        throw name + ((message.split( error_preg ))[ 2 ]);
    }

    // Buffer the output wich make it possible
    // to the the messages using $.benchmark.output();
    bufferd_output += message + "<br>";

    // Output the message
    if( use_console && console && console.log ) {
        console.log( message );
    } else {
        alert( message );
    }

    return message;
},

// suffixes used in the Tester
_s = "_start",
_e = "_end",

// Default test name
DF = "Default",

// currentTest
curTest = DF,

// Contains test instances
tests = {};

// Build the Benchmarker Class
B.prototype = {

    _result: 0,

    /**
     * Shortcut to make simple tests
     */
    start: function() {
        this.mark("start");
        return this;
    },

    /**
     * Shortcut to make simple tests
     *
     * @param doOutput: Output
     */
    end: function( doOutput ) {
        this.mark("end", "start", (doOutput == null ? true : doOutput));
        return this;
    },

    /**
     * Mark the start / end of a test
     *
     * @param name: Name
     * @param start: Start
     * @param doOutput: Output
     */
    mark: function( name, start, doOutput ) {
        // Make the mark
        this.marks[ name ] = B.now();
        if( start ) {
            this.elapsedTime( start, name, doOutput );
        }
        return this;
    },

    /**
     * Outputs the elapsed time and return it
     *
     * @param m1: Mark 1
     * @param m2: Mark 2
     * @param doOutput:  Output
     */
    elapsedTime: function( m1, m2, doOutput ) {
        var time = this._result = this.marks[ m2 ] - this.marks[ m1 ];
        if( doOutput ) {
            // Make the output
            this.message = output(typeof doOutput === "function" ?
                // If a function is passed as the output param,
                // run it and pass the values
                // I the function don't returns a valid value, throw an error
                // this makes it possible to build custom messages
                ( doOutput( time, m1, m2 ) || "{error}:elapsedTime->>" + error_messages.callback ) :
                // else, output the std message
                "start(" + m1 + ")->> end('" + m2 + "') :: Runtime->> " + time + " ms" + (typeof doOutput === "string" ? doOutput : ""));
        }
        return this;
    },

    result: function() {
        return this._result;
    },

    /**
     * Resets the objects tests
     */
    reset: function() {
        this.marks = {};
    }

};

$.extend( B, {

    /**
     * Function tester
     */
    test: function( a ) {
        // Set argument offset according to
        // what is passed in as the first argument
        var offset = typeof a === "object" ? 1 : 0,
        // If an array is passed in as the first
        // argument, use these arguments
        args = offset === 1 ? a : [],
        // Init the benchmarker
        bench = B(),
        // Declare some variables
        lastArg = args.length,
        i = args[ lastArg ] = 0,
        // Set callback function
        c = arguments[ 0 + offset ],
        // Set the length of the loop
        len = arguments[ 1 + offset ] || 1000;

        // Do the actual test
        for(; i <= len; args[ lastArg ] = ++i ) {
            // Apply the arguments to the function
            // and make "this" point to the DOM-Window
            c.apply( window, args );
        }
        return bench.end(function( time ) {
            return " Function tester :: Runtime->> " + time + " ms Runned->> " + len +
            " times, Average->> " + (B.round((time / len))) + " ms";
        });
    },

    /**
     * This function sets up tests object/function so you 
     * don't need to rewrite the actual function
     * to be able to test it.
     * 
     * @param {string} prefix
     * @param {object/function} object
     * @param {boolean} recursive
     * @return {object/function}
     */
    setup: (function() {

        // Checks if a function already have been rewritten
        var isRewritten = (function() {
            var fn = function(){
                "benchmarked";
            },
            preg = /"benchmarked";/,
            test = preg.test(fn);

            return function( fn ) {
                return test ? preg.test(fn) : false;
            };

        }());

        // Rewrites a function
        function rewrite( name, fn, prefix ) {
            // Don't rewrite the function twice
            if ( isRewritten(fn) ) {
                return fn;
            }

            name = prefix ? (name ? prefix + "." + name : prefix) : name;

            return function() {
                // Doesn't do anything, is used to identify
                // that this function have been rewritten.
                "benchmarked";
                //Start the function-test
                B.start(name);
                // Call the actual function
                var r = fn.apply(this, arguments);
                // End the test
                B.end(name);
                // Return the return value from the function
                return r;
            };
        }

        // The actual setup function
        return function( prefix, object, recursive ) {
            var new_object = {}, fn, prop, is_fn;

            // Switch the arguments if the first parameter isn't a string
            if ( typeof prefix === "string" ) {
                prefix = prefix.replace(/\.$/, "");
            } else {
                recursive = object;
                object = prefix;
                prefix = "";
            }

            is_fn = $.isFunction(object);

            if ( is_fn || typeof object === "object" ) {

                // If the object param is a function, rewrite it
                if ( is_fn ) {
                    new_object = ! isRewritten(object) ? rewrite("", object, prefix) : object;
                }

                // Rewrite all sub functions
                for ( prop in object ) {
                    // Filter away evil properties on from the prototype
                    if ( object.hasOwnProperty( prop ) ) {
                        // Transfer the properties to the new, modified object
                        new_object[ prop ] = (function( prop, fn ) {
                            // Rewrite the property
                            if ( $.isFunction(fn) ) {
                                return rewrite(prop, fn, prefix);
                            }
                            // Call the setup function recursively
                            else if ( typeof fn === "object" && recursive === true ) {
                                return B.setup( prefix ? prefix + "." + prop : prop, fn, true);
                            }
                            // Else, don't modify the property
                            return fn;
                        }( prop, object[ prop ] ));
                    }
                }
                // Return the modified object
                return new_object;
            }

            return object;
        };

    }()),

    // Methods to handel tests

    /**
     * Starts a new test
     *
     * @param name : test-name
     */
    startTest: function( name ) {
        curTest = name = name || DF;
        tests[ name ] = new Test( name ).start();
        return this;
    },

    /**
     * Ends and outputs a test
     *
     * @param name : test-name
     */
    endTest: function( name ) {
        if( ! tests[ (curTest = name = name || curTest || DF) ] ) {
            return this;
        } else {
            tests[ name ].end().output().reset();
        }
        return this;
    },

    /**
     * Start benchmarking a sub-test in a test
     *
     * @param name : sub-test-name
     * @param startTest : startTest
     */
    start: function( name, startTest ) {
        if( typeof name !== "string" ) {
            this.startTest();
        } else {
            tests[ curTest ].start(name);
            if( startTest ) {
                this.startTest();
            }
        }
        return this;
    },

    /**
     * Stops benchmarking a sub-test in a test
     *
     * @param name : sub-test-ame
     * @param endTest : endTest
     */
    end: function( name, endTest ) {
        if( typeof name !== "string" ) {
            this.endTest();
        } else {
            tests[ curTest ].end(name);
            if( endTest ) {
                this.endTest();
            }
        }
        return this;
    },

    /**
     * Returns the result from the previous runned test in ms,
     * is allways updated with the lastest result
     *
     * @param name : If you want to get the results of a specific test
     */
    result: function( name ) {
        return typeof tests[ ( name = name || curTest || DF ) ] === "object" ? tests[ name ].result() : 0;
    },

    /**
     * Method to enable/disable the whole output mechanism
     */
    enable: function() {
        enabled = true;
        return this;
    },

    /**
     * Method to enable/disable the whole output mechanism
     */
    disable: function() {
        enabled = false;
        return this;
    },

    /**
     * Makes it possible the watch the output in other ways than the console / in alerts
     *
     * @param avoidReset {boolean}: avoidReset
     */
    output: function( avoidReset ) {
        var returnVal = bufferd_output;
        if( ! avoidReset ) {
            bufferd_output = "";
        }
        return returnVal;
    },
    
    getTest: function(n) {
        return tests[n || curTest || DF ];
    },

    /**
     * Method to control how the output should work
     */
    useAlert: function() {
        use_console = false;
        return this;
    },

    /**
     * Method to control how the output should work
     */
    useConsole: function() {
        use_console = true;
        return this;
    },

    now: function() {
        return (new Date()).getTime();
    },

    // Math methods

    /**
     * Rounds a number: $.benchmark.round( 0,23456789876543, 5 ) ->> 0,23456
     *
     * @param n {number}: number to round
     * @param l {int}: decimals
     */
    round: function( num, dec ) {
        dec = dec || 5;
        return Math.round( num * Math.pow( 10, dec ) ) / Math.pow( 10, dec );
    }

});

// Handels tests
function Test( name ) {
    if( ! ( this instanceof Test ) ) {
        return new Test( name );
    }
    this.bench = new B();
    this.reset();
    this.name = name;
    this._result = 0;
}


Test.prototype = {

    /**
     * Start a sub-test
     *
     * @param name : Name
     * @param v : internal variable
     */
    start: function( name, v ) {
        name = name || this.name;
        this._start( v );
        if( ! this.marks[ name ] ) {
            this.times[ name ] = this.marks[ name ] = 0;
        }
        this.bench.mark( name + _s );
        return this;
    },

    /**
     * Makes sure that the main test have started
     *
     * @param v : internal variable, avoids an infinite loop
     */
    _start: function( v ) {
        if( !v && typeof this.marks[ this.name ] !== "number" ) {
            this.start(this.name, true);
        }
        return this;
    },

    /**
     * Start a sub-test
     *
     * @param name : Name
     */
    end: function( name ) {
        name = name || this.name;
        this.times[ name ] = this.times[ name ] + 1;
        this.marks[ name ] += this._result = this.bench.mark( name + _e, name + _s, false ).result();
        return this;
    },

    /**
     * Outputs all tests in the object
     *
     * @return self
     */
    output: function() {
        // Count the numbers of tests made
        var mark_len = (function( marks ) {
            var i = 0, n;
            for( n in marks ) {
                if( marks.hasOwnProperty( n ) ) {
                    i = i + 1;
                }
            }
            return i;
        }( this.marks )),

        // Show some extra test details if
        // there have been more than 1 sub-test made
        more_detail = mark_len > 2,

        numberOfTests = 0, name, time;

        if( more_detail) {
            // Output a extra line space to make the test more
            // readable and the first line to note that the result have began
            if ( use_console ) {
                output();
            }
            this.message = output("Report for test->> '" + this.name + "' :");
        }

        for( name in this.marks ) {
            // Don't output the Main test here
            if( this.marks.hasOwnProperty( name ) && name !== this.name ) {
                // Increese the number of runned test to the main test
                numberOfTests += this._outputTest( name, "end", (function() {
                    return function( times, time ) {
                        // If only one test have been runned, there isn't any reason to show this info
                        return times > 1 ? ", Runned->> " + times + " times, Average->> " + B.round( time / times ) + " ms" : " ";
                    };
                }()) );
            }
        }

        // If we only have made one sub-test there is no
        // need for the this output to show
        if ( mark_len !== 2 ) {
            this._outputTest(this.name, (mark_len > 2 ? "endTest" : "end"), function() {
                // Output the test result
                return more_detail ? ", Total Tests->> " + numberOfTests : " ";
            });
        }

        this.reset();
        return this;
    },

    result: function() {
        return this._result;
    },

    _outputTest: function( name, fn, callback ) {
        // Get the number of times runned
        var times = this.times[ name ],
        // Get the time
        time = this.marks[ name ];
        // Make the output
        this.message = output(fn + "('" + name + "') :: Runtime->> " + time + " ms" +
            ( callback( times, time ) || "{error}:_outputTest('" + name + "','" + fn + "')->> " + error_messages.callback ) );
        this._result = time;
        return times;
    },

    /**
     * Resets the objects tests
     */
    reset: function() {
        // Reset the benchmark instance
        this.bench.reset();
        this.marks = {};
        this.times = {};
        return this;
    }

};

// Join the tester with the benchmarker
B.tester = Test;

tests[ DF ] = new Test( DF );

})( jQuery );
