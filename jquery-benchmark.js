/*-----------------------*
 * Simple Benchmark Plugin
 * MIT Licensed
 * @author Emil Kilhage
 * Last updated: 2010-11-10 01:19:58
 */
(function( $ ) {

var benchmark = function( args ) {
  this._init.apply(this, args);
};

benchmark.prototype = {

  // Constants
  START:    "Start",
  END:      "End",
  CONSOLE:  "console",
  ALERT:    "alert",
  OUTPUT_MESSAGE: "jQuery-Benchmark :: {time} ms",

  _init: function( markStart, outputMethod ) {
    this._marks = {};
    this.outputMethod = typeof outputMethod === "string" || typeof outputMethod === "boolean" 
      ? outputMethod
      : this.CONSOLE;
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
    switch( this.outputMethod ) {
      case this.CONSOLE:
        return console.log( m );
      case this.ALERT:
        return alert( m );
      default:
        return m;
    }
  }

};

$.benchmark = function(){
  return new benchmark(arguments);
};

}( jQuery ));
