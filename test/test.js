
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
        $.benchmark.startTest();
        var i = 1000;
        while(i--) {
            ob();
            ob.a();
            ob.b.a();
            ob.b.b.a();
            ob.b.b.a.a();
        }
        var tester = $.benchmark.endTest().getTest();
    } catch(e) {
        log(e);
        valid = false;
    }
    
    ok(valid);
    ok(tester.ntests === 5);
    
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
    
    $.benchmark.enable();
    
    var valid = true, o = 100;
    
    try {
        var tester = $.benchmark.Test().add("tests", tests).run(o);

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
