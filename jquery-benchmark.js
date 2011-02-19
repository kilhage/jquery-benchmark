/****************************
 * jQuery Benchmark Plugin
 * https://github.com/kilhage/jquery-benchmark
 *
 * MIT Licensed
 * @author Emil Kilhage
 * Version: 0.9.0
 * Last updated: 2011-02-19 02:54:00
 */
(function( $ ) {

// Assign some private variables used in the scope

// Used in the output function
var error_preg = /(\{error\}\:)/,

error_messages = {
    callback: " Callback didn't return a value!"
},

// Controlls the output
enabled = true,

// All output will be stored here
bufferd_output = "",

// Name of the plugin, used in outputs
name = "jQuery.benchmark :: ",

// suffixes used in the Tester
_s = "_start", _e = "_end",

// Default test name
DF = "Default",

// currentTest
curTest = DF,

// Contains test instances
tests = {};

/**
 * The Base benchmarker that do the actual benchmarking
 *
 * @param avoidMarkStart
 */
$.benchmark = function Benchmarker( avoidMarkStart ) {
    if( ! ( this instanceof $.benchmark ) ) {
        return new $.benchmark( avoidMarkStart );
    }
    this.reset();
    this.result._ = 0;
    if( ! avoidMarkStart ) {
        this.start();
    }
};

// Build the Benchmarker Class

$.extend($.benchmark, {
    
    __is_rewritten__: true,

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
        bench = new $.benchmark(),
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
            c.apply( this, args );
        }
        return bench.end(function( time ) {
            return " Function tester :: Runtime->> " + time + " ms Runned->> " + len +
            " times, Average->> " + ($.benchmark.round((time / len))) + " ms";
        });
    },
    
    // Checks if a function already have been rewritten
    isRewritten: function(fn) {
        return fn.__is_rewritten__ === true;
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
    setup: function( prefix, object, recursive, tester ) {
        var new_object = {}, fn, prop, is_fn;

        // Switch the arguments if the first parameter isn't a string
        if ( typeof prefix === "string" ) {
            prefix = prefix.replace(/\.$/, "");
        } else {
            tester = recursive;
            recursive = object;
            object = prefix;
            prefix = "";
        }
    
        tester = tester instanceof $.benchmark.Test ? tester : $.benchmark;

        is_fn = $.isFunction(object);

        if ( is_fn || (typeof object === "object" && object) ) {

            // If the object param is a function, rewrite it
            if ( is_fn ) {
                new_object = rewrite("", object, prefix, tester);
            }
            // Rewrite all sub functions
            for ( prop in object ) {
                // Filter away evil properties on from the prototype
                if ( object.hasOwnProperty( prop ) ) {
                    // Transfer the properties to the new, modified object
                    new_object[ prop ] = (function( prop, fn ) {
                        var name = prefix ? prefix + "." + prop : prop;
                        // Rewrite the property
                        if ( $.isFunction(fn) ) {
                            return recursive === true ? $.benchmark.setup(name, fn, true, tester) : rewrite(prop, fn, prefix, tester);
                        }
                        // Call the setup function recursively
                        else if ( typeof fn === "object" && fn !== null && recursive === true ) {
                            return $.benchmark.setup(name, fn, true, tester);
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
    },

    // Methods to handel tests
    
    getTest: function(name) {
        name = name || curTest || DF ;
        return name in tests ? tests[name] : tests[name] = new $.benchmark.Test( name );
    },

    /**
     * Starts a new test
     *
     * @param name : test-name
     */
    startTest: function( name ) {
        curTest = name = name || DF;
        tests[ name ] = new $.benchmark.Test( name ).start();
        return this;
    },

    /**
     * Ends and outputs a test
     *
     * @param name : test-name
     */
    endTest: function( name, avoidReset, testHandler ) {
        if( ! tests[ (curTest = name = name || curTest || DF) ] ) {
            return this;
        } else {
            tests[ name ].end().output(avoidReset, testHandler);
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
    },
    
    prototype: {

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
            this.marks[ name ] = $.benchmark.now();
            if( start ) {
                this.elapsedTime( start, name, doOutput );
            }
            return this;
        },

        /**
         * Outputs the elapsed time
         *
         * @param m1: Mark 1
         * @param m2: Mark 2
         * @param doOutput:  Output
         */
        elapsedTime: function( m1, m2, doOutput ) {
            var time = this.result._= this.marks[ m2 ] - this.marks[ m1 ];
            if( doOutput ) {
                // Make the output
                this.message = output(typeof doOutput === "function" ?
                    // If a function is passed as the output param,
                    // run it and pass the values
                    // I the function don't returns a valid value, throw an error
                    // this makes it possible to build custom messages
                    ( doOutput.call( this, time, m1, m2 ) || "{error}:elapsedTime->>" + error_messages.callback ) :
                    // else, output the std message
                    "start(" + m1 + ")->> end('" + m2 + "') :: Runtime->> " + time + " ms" + (typeof doOutput === "string" ? doOutput : ""));
            }
            return this;
        },

        count: function(prev) {
            var prop = prev ? this.prev.marks : this.marks, i = 0, n;
            for( n in prop ) {
                if( prop.hasOwnProperty( n ) ) {
                    i = i + 1;
                }
            }
            return i / 2;
        },

        result: function() {
            return this.result._;
        },

        /**
         * Resets the objects tests
         */
        reset: function() {
            return reset(this, ["marks"]);
        },

        prev: function(item, sub) {
            var ret;
            if (typeof item === "string") {
                ret = typeof sub === "string" && this.prev[item] ? this.prev[item][sub] : this.prev[item];
            } else {
                $.extend(true, ret = {}, this.prev);
            }
            return ret;
        }

    }

});

// Handels tests
$.benchmark.Test = function( name ) {
    if( ! ( this instanceof $.benchmark.Test ) ) {
        return new $.benchmark.Test( name );
    }
    this.bench = new $.benchmark();
    this.reset();
    this.name = name || DF;
    this.result._ = 0;
};

$.benchmark.Test.prototype = {
    
    ntests: 0,

    /**
     * Start a sub-test
     *
     * @param name : Name
     * @param v : internal variable
     */
    start: function( name, v ) {
        name = typeof name === "string" ? name : this.name;
        this._start( v );
        if( this.marks[ name ] == null ) {
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
        name = typeof name === "string" ? name : this.name;
        this.times[ name ]++;
        this.marks[ name ] += this.result._ = this.bench.mark( name + _e, name + _s, false ).result();
        return this;
    },
    
    count: function(prev) {
        return this.bench.count(prev)-1;
    },

    /**
     * Outputs all tests in the object
     *
     * @return self
     */
    output: function(avoidReset, testHandler) { 
        // Count the numbers of tests made
        this.ntests = this.count();
        
        // Show some extra test details if
        // there have been more than 1 sub-test made
        var more_detail = this.ntests > 2,

        numberOfTests = 0, name;
        
        if ( typeof avoidReset !== "boolean" ) {
            testHandler = avoidReset;
        }
        
        testHandler = $.isFunction(testHandler) ? testHandler : this._testHandler;

        if( more_detail) {
            // Output a extra line space to make the test more
            // readable and the first line to note that the result have began
            output();
            this.message = output("Report for test->> '" + this.name + "' :");
        }

        for( name in this.marks ) {
            // Don't output the Main test here
            if( this.marks.hasOwnProperty( name ) && name !== this.name ) {
                // Increese the number of runned test to the main test
                numberOfTests += this._outputTest( name, "end", testHandler);
            }
        }

        // If we only have made one sub-test there is no
        // need for the this output to show
        if ( this.ntests !== 2 ) {
            this._outputTest(this.name, (this.ntests > 2 ? "endTest" : "end"), function() {
                // Output the test result
                return more_detail ? ", Total Tests->> " + numberOfTests : " ";
            });
        }
        
        if ( avoidReset !== true ) {
            this.reset();
        }
        
        return this;
    },

    _outputTest: function( name, fn, callback ) {
        // Get the number of times runned
        var times = this.times[ name ],
        // Get the time
        time = this.marks[ name ];
        // Make the output
        this.message = output(fn + "('" + name + "') :: Runtime->> " + time + " ms" +
            ( callback.call( this, times, time, name ) || "{error}:_outputTest('" + name + "','" + fn + "')->> " + error_messages.callback ) );
        this.result._ = time;
        return times;
    },
    
    _testHandler: function(times, time) {
        // If only one test have been runned, there isn't any reason to show this info
        return times > 1 ? ", Runned->> " + times + " times, Average->> " + $.benchmark.round( time / times ) + " ms" : " ";
    },

    /**
     * Resets the objects tests
     */
    reset: function() {
        // Reset the benchmark instance
        this.bench.reset();
        return reset(this, ["marks", "times"]);
    },
    
    setup: function(name, object, recursive) {
        if ( typeof name !== "string" ) {
            recursive = object;
            object = name;
            name = "";
        }
        return $.benchmark.setup(name, object, recursive, this);
    }

};

$.each(["prev", "result"], function(i, name){
    $.benchmark.Test.prototype[name] = $.benchmark.prototype[name];
});

function reset(self, items) {
    for(var l = items.length, i = 0, name; i < l; i++) {
        name = items[i];
        self.prev[name] = {};
        $.extend(true, self.prev[name], self[ name] || {});
        self[name] = {};
    }
    return self;
}

function rewrite( name, fn, prefix, tester ) {
    // Don't rewrite the function twice
    if ( $.benchmark.isRewritten(fn) ) {
        return fn;
    }

    name = prefix ? (name ? prefix + "." + name : prefix) : name;

    var ret = function() {
        //Start the function-test
        tester.start(name);
        // Call the actual function
        var r = fn.apply(this, arguments);
        // End the test
        tester.end(name);
        // Return the return value from the function
        return r;
    };
    ret.__is_rewritten__ = true;
    return ret;
}

// Internal output function
function output( message ) {
    message = message !== undefined ? message : "";
    // Test if an error have accoured
    if( error_preg.test( message ) ) {
        // Build the error message and throw an error
        $.error(name + ((message.split( error_preg ))[ 2 ]));
    }

    // Buffer the output wich make it possible
    // to the the messages using $.benchmark.output();
    bufferd_output += message + "<br>";

    // Output the message
    if( enabled && window.console && console.log ) {
        console.log( typeof message === "string" && message ? name + message : "" );
    }

    return message;
}

tests[ DF ] = new $.benchmark.Test( DF );

})( jQuery );
