<!DOCTYPE html> 
<html>
<head>
	<title>QUnit Test Suite</title>
	<link rel="stylesheet" href="https://github.com/jquery/qunit/raw/master/qunit/qunit.css" type="text/css" media="screen">
	<script type="text/javascript" src="https://github.com/jquery/qunit/raw/master/qunit/qunit.js"></script>
    <script src="http://code.jquery.com/jquery.js" type="text/javascript"></script>
    <script src="../jquery-benchmark<?php echo isset($_GET["a"]) ? $_GET["a"] : "" ?>.js" type="text/javascript"></script>
    <script>
        var _m = "Source::";
    </script>
	<script type="text/javascript" src="test.js"></script>
</head>
<body>
	<h1 id="qunit-header">QUnit Test Suite - jQuery.benchmark</h1>
	<h2 id="qunit-banner"></h2>
	<div id="qunit-testrunner-toolbar"></div>
	<h2 id="qunit-userAgent"></h2>
	<ol id="qunit-tests"></ol>
	<div id="qunit-fixture"></div>
</body>
</html>
