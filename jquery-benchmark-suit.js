(function($) {

var tests = {}, _module = "", plugin_name = "", div;

$.benchmark.disable();

$.fn.extend({
    
    benchmark: function() {
        var self = this,
            rows = [],
            status = div.find(".status").html("Building..");

        setTimeout(function(){
            $.each(tests, function(module, test){
                self.append("<h2>- "+module+"</h2>");
                $.each(test.tests, function(i, ob){
                    var code = $("<code class='language-javascript'/>").html(ob.fn.toString()).hide(),
                        li = $("<li />")
                        .html("<span>"+ob.name+", times("+ob.times+"')</span>")
                        .appendTo(self)
                        .click(function(){
                            code.slideToggle(50);
                        })
                        .addClass("test")
                        .append(code);
                        
                     rows.push({ob: ob, li: li});
                });
            });
            
            status.html("Running tests..");
            $.benchmark.startTest(plugin_name);
            
            $.each(rows, function(i, row) {
                setTimeout(function(){
                    $.benchmark.start(row.ob.name);
                    var time = row.ob.test();
                    
                    row.li.find("span").first().html(row.li.html()+" :: <b>"+time+"ms</b>");
                    
                    $.benchmark.end(row.ob.name);
                    
                    if (i == rows.length - 1) {
                        status.html($.benchmark.endTest(plugin_name).getTest().message);
                    }
                }, 0);
            });
        }, 0);
        
        return this;
    }
});

$.extend(window, {

    test: function(name, t, fn) {
        if ( typeof t === "function" ) {
            fn = t;
            t = tests[_module].times || 100;
        }
        tests[_module].tests.push({
            test: function(){
                var b = $.benchmark();
                fn(t, b);
                return b.end().result();
            },
            name: name,
            fn: fn,
            times: t
        });
    },

    module: function(m, t) {
        _module = m;
        tests[m] = {
            times: t,
            tests: []
        };
    },

    plugin: function(n){
        plugin_name = n;
    }

});

$(function(){
    $("head").find("title").html(plugin_name+" :: Performance");
    div = $("<div />").appendTo("body").addClass("benchmark").html("<span class='status' />");
    $("<h1 >").html(plugin_name).appendTo($("<center />").appendTo(div));
    div.benchmark();
});

$.getScript("http://github.com/balupton/jquery-syntaxhighlighter/raw/master/scripts/jquery.syntaxhighlighter.min.js", function(){
    $(function(){
        $.SyntaxHighlighter.init();
    });
});

}(jQuery));
