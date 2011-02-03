/**
 * 
 *
 */
(function($) {

var tests = {}, _module, plugin_name;

$.benchmark.disable();

$.fn.benchmark = function() {
    var self = this;

    $.each(tests, function(module, test){
        setTimeout(function(){
            self.append("<h2>- "+module+"</h2>");
            $.each(test.tests, function(i, ob){
                    //if ( ob.name != "Fast")return;
                    try {
                        var code = $("<code class='language-javascript'/>").html(ob.fn.toString()).hide();
                        var time = ob.test();
                        $("<li />")
                            .html(ob.name+", times("+ob.times+"') :: <b>"+time+"ms</b>")
                            .appendTo(self)
                            .click(function(){
                                code.slideToggle(50);
                            })
                            .addClass("test")
                            .append(code);
                    } catch(e) {
                        console.log(e);
                    }
            });
        }, 0.1);
    });
    return this;
};

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
var div;
$(function(){
    div = $("<div />").appendTo("body").addClass("benchmark");
    $("<h1 >").html(plugin_name).appendTo($("<center />").appendTo(div));
    div.benchmark();
});

$.getScript("http://github.com/balupton/jquery-syntaxhighlighter/raw/master/scripts/jquery.syntaxhighlighter.min.js", function(){
    $(function(){
        $.SyntaxHighlighter.init();
    });
});

}(jQuery));
