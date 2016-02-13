(function(window) {
"use strict";

if (typeof window.html === 'undefined') {

  window.html = function(strings, ...values) {
    // very naive and simple approach, just as a proof of concept
    var match = strings[0].match(/<([^>]+?)[/]?>/);
    var rootStr = match[1].trim().split(/\s/);
    var tagName = rootStr[0];
    var root = document.createElement(tagName);

    // attributes
    for (var i = 1; i < rootStr.length; i++) {
      var attr = rootStr[i];
      var name = attr.match(/^[^=]+/)[0];
      var valueMatch = attr.match(/=(?:'|")?([^'"]+)/);
      var value;

      if (valueMatch) {
        value = valueMatch[1];
      }
      else {
        value = '';
      }

      root.setAttribute(name, value);
    }

    // children
    root.innerHTML = strings[0].replace(match[0], '');  // kinda hacky as it will ignore the orphaned closing tag

    return root;
  };
}

})(window);