/****************************
 * Simple Benchmark Plugin
 * MIT Licensed
 * @author Emil Kilhage
 * Last updated: 2010-11-12 01:46:12
 */
(function( $ ) {

/**
 * The Base benchmarker that do the actual benchmarking
 *
 * @param v: void mark start
 */
var BM = function( v ) {
  this.marks = {};
  this._result = 0;
  if( ! v ) {
    this.start();
  }
},

// Join with jQuery and make it possible to initialize the class with a nicer syntax
B = $.benchmark = function( v ) {
  return new BM( v );
},

// Controlls the output
enabled = true,

// Controlls the output method
use_console = true,

// All output will be stored here
bufferd_output = "",

// Internal output function
output = function( m, c ) {
  if(!enabled){
    return m;
  }
  m =  !c ? "jQuery.benchmark :: " + m : m ;
  bufferd_output += m + "<br>";
  return use_console ? console.log( m ) : alert( m );
},

_s = "_start",

_e = "_end",

// Default test name
DF = "_Test_";

BM.prototype = {

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
    this.mark("end", "start", o == null ? true : o);
    return this;
  },

  /**
   * Mark the start / end of a test
   *
   * @param n: Name
   * @param s: Start
   * @param o: Output
   */
  mark: function( n, s, o ) {
    this.marks[ n ] = (new Date()).getTime();
    if( s ) {
      this.elapsedTime( s, n, o );
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
    var t = this._result = this.marks[ m2 ] - this.marks[ m1 ];
    if( o ) {
      output("Runtime->> " + t + " ms (" + m1 + ", " + m2 + ")" + (typeof o === "string" ? " | " + o : ""));
      if(use_console){
        output(" ", true);
      }
    }
    return this;
  },

  result: function() {
    return this._result;
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
    // If an array is passed in as the first argument, use these arguments
    args = o === 1 ? a : [],
    // Declare some variables
    d = false, g = args.length, i = args[ g ] = 0,
    // Set callback function
    c = arguments[ 0 + o ],
    // Set the length of the loop
    l = arguments[ 1 + o ] || 1000;

    // Determine if we should benchmark the test
    if( arguments[ 2 + o ] !== false ) {
      // Init the benchmarker
      d = B();
    }

    // Do the actual test
    for(; i <= l; args[ g ] = ++i ) {
      // Apply the arguments to the function and make "this" point to the DOM-Window
      c.apply( window, args );
    }
    return d !== false ? d.end("jQuery.benchmark.test :: Runned:" + l + " times") : {result: l};
  },

  // Methods to handel tests

  /**
   * Starts a new test
   *
   * @param n : Name
   */
  startTest: function( n ) {
    curTest = n = n || DF;
    tests[ n ] = new T( n );
    return this;
  },

  /**
   * Ends and outputs a test
   *
   * @param n : Name
   */
  endTest: function( n ) {
    if( ! tests[ curTest = n = n || curTest || DF ] ) {
      return this;
    }
    return tests[ n ].output();
  },

  /**
   * Start benchmarking a sub-test in a test
   *
   * @param n : Name
   */
  start: function( n ) {
    (!n) ? this.startTest() : tests[ curTest ].start( n );
    return this;
  },

  /**
   * Stops benchmarking a sub-test in a test
   *
   * @param n : Name
   * @param e : endTest
   */
  end: function( n, e ) {
    var r = ! n ? this.endTest() : tests[ curTest ].end( n );
    if( e ) {
      tests[ curTest ]._end( n );
    }
    return r;
  },

  result: function( n ) {
    return tests[ n = n || curTest ] ? tests[ n ].result() : 0;
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
   * @param vr {boolean}: voidReset
   */
  output: function( vr ) {
    var v = bufferd_output;
    if( ! vr ) {
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
  }

});

// currentTest
var curTest = DF,

// Handels tests
T = function( name ) {
  this.bench = B();
  this.name = name;
  this.marks = {};
  this._result = 0;
};

T.prototype = {

  /**
   * Start a test-period
   *
   * @param n : Name
   */
  start: function( n ) {
    if( ! this.marks[ n ] ) {
      this.marks[ "_t" + n ] = this.marks[ n ] = 0;
    }
    this.bench.mark( n + _s );
    return this;
  },

  /**
   * Start a test-period
   *
   * @param n : Name
   */
  end: function( n ) {
    this.marks[ "_t" + n ]++;
    this.marks[ n ] += this._result = this.bench.mark(n + _e, n + _s, false).result();
    return this;
  },

  /**
   * Start a test-period
   *
   * @param n : Name
   */
  _end: function( n ) {
    this._result = this.bench.elapsedTime( n + _s, n + _e, true).result();
    return this;
  },

  /**
   * Outputs all tests in the object
   *
   * @return test result
   */
  output: function() {
    output("Report for test->> '" + this.name + "'");
    var t = 0, ts, i = 0, n, _t;
    for( n in this.marks ) {
      if( ! /^_t/.test( n ) ) {
        i += ts = this.marks[ "_t" + n ];
        t += _t = this.marks[ n ];
        output("end('" + n + "') :: Runtime->> " + _t + " ms, Runned->> " + ts + " times, Average->> " + (_t / ts) + " ms");
      }
    }
    output("endTest('" + this.name + "') :: Total Runtime->> " + t + " ms, Total Tests->> " + i);
    if( use_console ) {
      output(" ", true);
    }
    this._result = t;
    return this;
  },

  result: function() {
    return this._result;
  }

};

// Join the tester with the benchmarker
B.tester = function(){
  return new T();
};

var tests = {};
tests[ DF ] = new T( DF );

}( jQuery ));
