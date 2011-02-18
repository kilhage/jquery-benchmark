
function log(m){
    console.log(m);
}

test("$.benchmark.setup()", function(){
    var t = function(){
        $("<div />").hide().show();
    };
    
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
    ok(tester.ntests === 6);
    
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
