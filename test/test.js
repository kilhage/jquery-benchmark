
function log(m){
    console.log(m);
}

function t(){
    $("<div />").hide().show();
};

var tests = $.extend(function(){t();t();t();t();}, {
    a: function(){
        t();t();t();t();
    },
    reg: /vcdf/,
    c: {
        r: /de/
    },
    b: function(){
        t();t();
    }
});

$.benchmark.disable();

test("$.benchmark.setup()", function(){
    
    
    var ob = function() {
        t();
    }, valid = true, rxp = /hehe/;
    
    $.extend(ob, {
        
        a: function(){
            t();t();t();t();
        },
        
        c: null,
        u: undefined,
        f: false,
        t: true,
        s: "hehehe",
        n: 2,
        r: rxp,
        
        b: {
            a: function(){
                t();t();
            },
            
            b: {
                a: $.extend(function(){t();t();t();t();}, {
                    a: function(){
                        t();t();t();t();t();
                    },
        
                    c: null,
                    u: undefined,
                    f: false,
                    t: true,
                    s: "hehehe",
                    n: 2,
                    r: rxp
                })
            }
        }
        
    });
    
    try {
        ob = $.benchmark.setup("ob", ob, true);
        $.benchmark.startTest("Test1");
        var i = 1000;
        while(i--) {
            ob();
            ob.a();
            ob.b.a();
            ob.b.b.a();
            ob.b.b.a.a();
        }
        var tester = $.benchmark.endTest("Test1").getTest("Test1");
    } catch(e) {
        log(e);
        valid = false;
    }
    
    ok(valid, "no errors");
    ok(tester.ntests === 5, "number of tests("+tester.ntests+" == 5)");
    
    ok(ob.b.b.a.c === null);
    ok(ob.b.b.a.u === undefined);
    ok(ob.b.b.a.f === false);
    ok(ob.b.b.a.t === true);
    ok(ob.b.b.a.s === "hehehe");
    ok(ob.b.b.a.n === 2);
    ok(ob.b.b.a.r === rxp);
    
    ok(ob.c === null);
    ok(ob.u === undefined);
    ok(ob.f === false);
    ok(ob.t === true);
    ok(ob.s === "hehehe");
    ok(ob.r === rxp);
    
    function Class(prop){
        this.prop = prop;
    }
    
    Class.prototype = {
        fn: function(arg){
            return arg;
        },
        get: function(){
            return this.prop;
        }
    };
    
    var _Class = $.benchmark.setup("Class", Class);
    
    var instance = new _Class("prop");
    
    ok($.isFunction(instance.get));
    
    if ( $.isFunction(instance.get) ) {
    
        equals(instance.get(), "prop");
        equals(instance.fn(true), true);
        
    }
    
    ok(Class.prototype.isPrototypeOf(instance));
    ok(instance instanceof Class);
    ok(instance instanceof _Class);
    
});

test("$.benchmark.Test -> setup()", function(){

    var tester = new $.benchmark.Test("Test"), valid = true;
    
    try {
        var _tests = tester.setup(tests, true);

        tester.start();

        var i = 1000,o = i;
        while(i--) {
            _tests();
            _tests.a();
            _tests.b();
        }

        tester.end();

        ok(tester.count() === 3);

        tester.output(function(times, time, name) {
            ok(times === o, "Check " + name);
        });
    
    } catch(e) {
        log(e);
        valid = false;
    }
    
    ok(valid);

});

test("$.benchmark.Test -> add() -> run()", function(){
    
    var valid = true, o = 100;
    
    try {
        var tester = $.test().add("tests", tests).run(o);

        ok(tester.count() === 3);
        
        tester.output(function(times, time, name) {
            ok(times === o, "Check " + name);
        });
    
    } catch(e) {
        log(e);
        valid = false;
    }
    
    ok(valid);
    
});

test("$.benchmark.Test -> test", function() {
    
    var t = new $.test();
    
    try {
    
        var fn = function() {
            ok(this == window);
            equals(arguments.length, 0);
            return true;
        };

        var fn2 = function(c) {
            ok(this == t);
            return c;
        };

        equals(t.test("test", fn), true);

        equals(t.test("test2", fn2, [true], t), true, "unnamed");
    
    } catch(e) {
        ok(false);
    }
    
});
