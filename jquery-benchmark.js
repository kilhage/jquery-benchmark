(function( $ ) {

/**
 * Simple benchmark Plugin
 * MIT Licensed
 * @author Emil Kilhage
 */
var benchmark = function( args ) {
  this._init.apply(this, args);
};

benchmark.prototype = {

  // Constants
  START:    "start",
  END:      "end",
  CONSOLE:  "console",
  ALERT:    "alert",
  OUTPUT_MESSAGE: "jQuery-Benchmark :: {time} ms",

  _init: function( markStart, outputMethod ) {
    this._marks = {};
    this.outputMethod = outputMethod || this.CONSOLE;
    if( ! markStart ) {
      this.start();
    }
  },

  start: function() {
    return this.mark(this.START);
  },

  end: function( output ) {
    return this.mark( this.END, this.START, ! output );
  },

  mark: function( name, start, output ) {
    var mark = this._marks[ name ] = this.now();
    if( start ) {
      mark = this.elapsedTime( start, name, output );
    }
    return mark;
  },

  now: function() {
    return (new Date()).getTime();
  },

  elapsedTime: function( mark1, mark2, output ) {
    var time = this._marks[ mark2 ] - this._marks[ mark1 ];
    if( output ) {
      this._output( this.OUTPUT_MESSAGE.replace( "{time}", mark2 + " - " + mark1 + " = " + time ) );
    }
    return time;
  },

  _output: function( m ) {
    var r;
    switch( this.outputMethod ) {
      case this.CONSOLE:
        r = this._log( m );
        break;
      case this.ALERT:
        r = alert( m );
        break;
      default:
        r = this._log( m );
    }
    return r;
  },

  _log: function( m ) {
    if( console.log ){
      console.log( m );
    }
    return m;
  }

};

$.benchmark = function(){
  return new benchmark(arguments);
};

}( jQuery ));
