
$.benchmark.disable();

plugin("jQuery - Benchmark");

module("$.benchmark", 10000);

test("new $.benchmark()", function(i){
    var test;
    while(i--){
        test = new $.benchmark();
    }
});

test("$.benchmark()", function(i){
    var test;
    while(i--){
        test = $.benchmark();
    }
});

test("bench.start() -> bench.end()", function(i){
    var test = new $.benchmark();
    while(i--){
        test.start().end();
    }
});

test("bench.mark(i)", function(i){
    var test = new $.benchmark(true);
    while(i--){
        test.mark(i).mark(i+"_", i);
    }
});

test("bench.reset()", function(i){
    var test = new $.benchmark(true);
    while(i--){
        test.reset();
    }
});

module("$.benchmark.Test", 10000);

test("new $.benchmark.Test()", function(i){
    var test;
    while(i--){
        test = new $.benchmark.Test();
    }
});

test("$.benchmark.Test()", function(i){
    var test;
    while(i--){
        test = $.benchmark.Test();
    }
});

test("test.start() -> test.end()", function(i){
    var test = new $.benchmark.Test();
    while(i--){
        test.start().end();
    }
});

test("test.start(i) -> test.end(i)", function(i){
    var test = new $.benchmark.Test();
    while(i--){
        test.start(i).end(i);
    }
});

test("test.reset()", function(i){
    var test = new $.benchmark.Test();
    while(i--){
        test.reset();
    }
});

(function(){
    
var tests = [], o = 10, r = o, _test = new $.test();

while(o--) {
    tests.push(function(){});
}

test("test.setup(), "+r+" functions", function(i) {
    var test = new $.test();
    
    while(i--) {
        test.setup(tests);
    }
});

test("test.add() without setup, "+r+" functions", function(i) {
    var test = new $.test();
    
    while(i--) {
        test.add(tests, false);
    }
});

_test.add(tests, false);

test("test.run() without setting up or starting any tests, "+r+" functions", function(i) {
    while(i--) {
        _test.run(false);
    }
});

}());
