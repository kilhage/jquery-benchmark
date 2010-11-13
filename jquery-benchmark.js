/****************************
 * jQuery Benchmark Plugin
 * https://github.com/kilhage/jquery-benchmark
 *
 * MIT Licensed
 * @author Emil Kilhage
 * Version: 0.8.0
 * Last updated: 2010-11-13 17:37:56
 */
(function( $ ) {

/**
 * The Base benchmarker that do the actual benchmarking
 *
 * @param v: avoid mark start
 */
function Benchmarker( v ) {
  if( ! ( this instanceof Benchmarker ) ) {
    return new Benchmarker( v );
  }
  this.reset();
  if( ! v ) {
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
output = function( m ) {
  // don't make any output if 
  if( ! enabled ) {
    return m;
  }
  // if not an string is passed, output an empty string instead
  m = (typeof m === "string") ? name + m : "";

  // Test if an error have accoured
  if( error_preg.test( m ) ) {
    // Build the error message and throw an error
    throw name + ((m.split( error_preg ))[ 2 ]);
  }

  // Buffer the output wich make it possible
  // to the the messages using $.benchmark.output();
  bufferd_output += m + "<br>";
  
  // Output the message
  if( use_console ) {
    console.log( m );
  } else {
    alert( m );
  }
  
  return m;
},

// suffixes used in the Tester
_s = "_start",
_e = "_end",

// Default test name
DF = "Default",

// currentTest
curTest = DF,

now = function(){
  return (new Date()).getTime();
};

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
   * @param o: Output
   */
  end: function( o ) {
    this.mark("end", "start", (o == null ? true : o));
    return this;
  },

  /**
   * Mark the start / end of a test
   *
   * @param name: Name
   * @param start: Start
   * @param o: Output
   */
  mark: function( name, start, o ) {
    // Make the mark
    this.marks[ name ] = now();
    if( start ) {
      this.elapsedTime( start, name, o );
    }
    return this;
  },

  /**
   * Outputs the elapsed time and return it
   *
   * @param m1: Mark 1
   * @param m2: Mark 2
   * @param o:  Output
   */
  elapsedTime: function( m1, m2, o ) {
    var time = this._result = this.marks[ m2 ] - this.marks[ m1 ];
    if( o ) {
      // Make the output
      output(typeof o === "function" ?
        // If a function is passed as the output param,
        // run it and pass the values
        // I the function don't returns a valid value, throw an error
        // this makes it possible to build custom messages
        ( o( time, m1, m2 ) || "{error}:elapsedTime->>" + E.callback ) :
        // else, output the std message
        "start(" + m1 + ")->> end('" + m2 + "') :: Runtime->> " + time + " ms" + (typeof o === "string" ? o : ""));
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

$.extend(B, {

  /**
   * Function tester
   */
  test: function( a ) {
    // Set argument offset according to
    // what is passed in as the first argument
    var o = typeof a === "object" ? 1 : 0,
    // If an array is passed in as the first
    // argument, use these arguments
    args = o === 1 ? a : [],
    // Init the benchmarker
    d = B(), 
    // Declare some variables
    g = args.length, i = args[ g ] = 0,
    // Set callback function
    c = arguments[ 0 + o ],
    // Set the length of the loop
    l = arguments[ 1 + o ] || 1000;

    // Do the actual test
    for(; i <= l; args[ g ] = ++i ) {
      // Apply the arguments to the function
      // and make "this" point to the DOM-Window
      c.apply( window, args );
    }
    return d.end(function( r ) {
      return " Function tester :: Runtime->> " + r + " ms Runned->> " + l + " times, Average->> " + (B.round((r / l))) + " ms";
    });
  },

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
   * @param n : sub-test-name
   */
  start: function( name ) {
    if(! name) {
      this.startTest();
    } else {
      tests[ curTest ].start(name);
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
    if( ! name ) {
      this.endTest();
    } else {
      tests[ curTest ].end(name);
    }
    if( endTest ) {
      this.endTest();
    }
    return this;
  },

  /**
   * Returns the result from the previous runned test in ms,
   * is allways updated with the lastest result
   *
   * @param n : If you want to get the results of a specific test
   */
  result: function( n ) {
    return typeof tests[ (n = n || curTest || DF) ] === "object" ? tests[ n ].result() : 0;
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
    var v = bufferd_output;
    if( ! avoidReset ) {
      bufferd_output = "";
    }
    return v;
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
    this.times[ name ]++;
    this.marks[ name ] += this._result = this.bench.mark(name + _e, name + _s, false).result();
    return this;
  },

  /**
   * Outputs all tests in the object
   *
   * @return test result
   */
  output: function() {
    // Count the numbers of tests made
    var mark_len = (function( marks ) {
      var i = 0, n;
      for( n in marks ) {
        i++;
      }
      return i;
    })(this.marks),

    // Show some extra test details if
    // there have been more than 1 sub-test made
    more_detail = mark_len > 2,
    
    i = 0, name, time;
    
    if( more_detail) {
    // Output a extra line space to make the test more
    // readable and the first line to note that the result have began
      if( use_console ) {
        output();
      }
      output("Report for test->> '" + this.name + "' :");
    }
    
    for( name in this.marks ) {
      // don't output the Main test here
      if( name !== this.name ) {
        // Do output
        time = this._outputTest( name, "end", function( times, time ) {
          // Increese the number of runned test to the main test
          i += times;
          return times > 1 ? ", Runned->> " + times + " times, Average->> " + (B.round((time / times))) + " ms" : " ";
        });
      }
    }
    
    // If we only have made one sub-test there is no
    // need for the this output to show
    this._result =  (mark_len !== 2 ) ?
    // Output the test result
    this._result = this._outputTest(this.name, (mark_len > 2 ? "endTest" : "end"), function() {
      return more_detail ? ", Total Tests->> " + i : " ";
    }) : time;
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
    output(fn + "('" + name + "') :: Runtime->> " + time + " ms" + ( callback( times, time ) || "{error}:_outputTest('" + name + "','" + fn + "')->> " + error_messages.callback ) );
    return  time;
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

var tests = {};
tests[ DF ] = new Test( DF );

})( jQuery );
