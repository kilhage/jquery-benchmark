/*-----------------------*
 * Simple Benchmark Plugin
 * MIT Licensed
 * @author Emil Kilhage
 * Last updated: 2010-11-11 00:27:48
 */
(function( $ ) {

/**
 * @param a: arguments
 */
var BM = function( a ) {
  this._init.apply( this, a );
},

B = $.benchmark = function() {
  return new BM( arguments );
},

output_enabled = true,

NAME = "jQuery-Benchmark";

BM.prototype = {

  /**
   * @param mS: markStart
   */
  _init: function( mS ) {
    this.reset();
    if( ! mS ) {
      this.start();
    }
  },

  reset: function() {
    this._marks = {};
  },

  start: function() {
    return this.mark("start");
  },

  /**
   * @param o: Output
   */
  end: function( o ) {
    return this.mark( "end", "start", o == null ? true : o );
  },

  /**
   * @param n: Name
   * @param s: Start
   * @param o: Output
   */
  mark: function( n, s, o ) {
    var mark = this._marks[ n ] = this.now();
    if( s ) {
      mark = this.elapsedTime( s, n, o );
    }
    return mark;
  },

  now: function() {
    return (new Date()).getTime();
  },

  /**
   * @param m1: Mark 1
   * @param m2: Mark 2
   * @param o:  Output
   */
  elapsedTime: function( m1, m2, o ) {
    var t = this._marks[ m2 ] - this._marks[ m1 ];
    if( o ) {
      o = typeof output === "string" ? o : "";
      this._output( NAME + " :: Runtime: " + t + " ms (" + m1 + ", " + m2 + ") | " + o );
    }
    return t;
  },

  /**
   * @param m: Message
   */
  _output: function( m ) {
    if(output_enabled){
      console.log( m );
    }
    return m;
  }

};

$.extend(B, {
  
  test: function( a ) {
    // Set argument offset according to
    // what is passed in as the first argument
    var o = typeof a === "object" ? 1 : 0,
    // If an array is passed in as the first argument, use these arguments
    args = o === 1 ? a : [],
    // Declare some variables
    d, g = args.length, i = args[ g ] = 0,
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
    
    if( d ) {
      return d.end("jQuery.benchmark.test->> " + l + " times");
    }
    
    return l;
  },

  enable: function() {
    return output_enabled = true;
  },

  disable: function() {
    return output_enabled = false;
  }

});

}( jQuery ));
