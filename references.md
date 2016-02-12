* don't run template through HTML parser - https://lists.w3.org/Archives/Public/www-dom/2011OctDec/0170.html
* should properly create nodes that don't have context (e.g. `<td>foo</td>`) - https://lists.w3.org/Archives/Public/public-script-coord/2013JanMar/0263.html
* safe inject with `<div {foo}>` or `<div></{foo}>` - https://lists.w3.org/Archives/Public/public-script-coord/2013JanMar/0268.html
* should be able to create tag names such as `<h{...}>` - https://lists.w3.org/Archives/Public/public-script-coord/2013JanMar/0276.html
* untrusted input gets added to DOM as text nodes (prevents XSS by making the XSS code benign) - https://lists.w3.org/Archives/Public/public-script-coord/2013JanMar/0207.html
* handle XSS via CSS, URIs, and scripts - https://lists.w3.org/Archives/Public/public-script-coord/2013JanMar/0269.html
    ```js
    var data = "javascript:doEvil()";
    `<a href="${data}">Hello, World!</a>`

    var data = "expression(doEvil())";
    `<style>color: {data}</style>`

    `<style>var s = "{data}", re = /{data}/, x = {data};</style>`
    ```
* E4H goals - https://lists.w3.org/Archives/Public/public-script-coord/2013JanMar/0278.html
* examples of XSS riddled code where auto-escaping could fail - https://lists.w3.org/Archives/Public/public-script-coord/2013JanMar/0286.html
* add quotes around unquoted attributes? - https://lists.w3.org/Archives/Public/public-script-coord/2013JanMar/0289.html
* set an attribute value with having to account for whether or not the passed value included " or ' or whitespace (in case it's unquoted) -https://github.com/whatwg/dom/issues/150#issuecomment-182251393
* HTML parser corner cases that produce unexpected results - https://lists.w3.org/Archives/Public/public-script-coord/2013JanMar/0290.html
* `<example example='${...}'>` what ever `${...}` expands to should stay withing the `example` attribute value and not create more attributes or DOM (XSS) - https://lists.w3.org/Archives/Public/public-script-coord/2013JanMar/0281.html
* E4H is safe against element/attribute injection but not truly safe against all XSS, `<a href="{x}">...</a>` `${x}` is still vulnerable to javascript injection - https://lists.w3.org/Archives/Public/public-script-coord/2013JanMar/0283.html
* auto-escape corner cases and problems - https://lists.w3.org/Archives/Public/public-script-coord/2013JanMar/0318.html
* E4H implementation - https://lists.w3.org/Archives/Public/public-script-coord/2013JanMar/0297.html
* an AST implementation (such as E4H) would have to recreate an HTML parser to fully understand how incomplete tags are handled and their output such that `<b>A <span style="color:blue">B</b> C</span>` outputs `<b>A <span style="color:blue">B</span></b><span style="color:blue"> C</span>` (this may have been true in 2008, but in 2016 chrome produces `<b>A <span style="color:blue">B</span></b> C` which again, means trying to mimic an HTML parsers output would be constantly changing and difficult) - http://google-caja.googlecode.com/svn-history/r528/changes/mikesamuel/string-interpolation-29-Jan-2008/trunk/src/NOT-FOR-TRUNK/interp/index.html
* description of context-aware auto-escape - https://js-quasis-libraries-and-repl.googlecode.com/svn/trunk/safetemplate.html#security_under_maintenance
    - https://developers.google.com/closure/templates/docs/security#in_urls
    - https://googleonlinesecurity.blogspot.com/2009/03/reducing-xss-by-way-of-automatic.html