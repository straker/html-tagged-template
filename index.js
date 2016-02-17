(function(window) {
"use strict";

if (typeof window.html === 'undefined') {
  var tagNameRegex = /<([\w:-]+)/;
  var attributesRegex = /<[\w:-]+\s+([^/>]+)\/?>/;
  var whiteSpaceRegex = /\s+/;
  var attributeValueRegex = /^(?:'|")?(.+?)(?:'|")?$/;
  var childElements = /<([\w:-]+)[^>]*>([\s\S]*)(?:<\/\1>)/;

  window.html = function(strings, ...values) {
    // break early if called with empty content
    if (!strings && values.length === 0) {
      return;
    }

    // insert placeholders into the generated string so we can run it through the
    // HTML parser without any malicious content.
    // (this particular placeholder will even work when used to create a DOM element)
    var str = strings[0];
    for (var i = 0; i < values.length; i++) {
      str += 'substitutionIndex:' + i + '' + strings[i+1];
    }

    // verify that the first element is valid
    // TODO: what if the user entered html`${dom}` where dom = <div></div>?
    if (str[0] !== '<' || str[str.length -1] !== '>') {
      throw new SyntaxError('Unexpected token ' + str[0]);
    }

    // create the first tag with all it's attributes and then innerHTML it's children.
    // this avoids problems with having the HTML parser return nothing when passed
    // elements outside of a context (such as <tr>)
    var tagName = tagNameRegex.exec(str)[1].toLowerCase();
    var frag = document.createDocumentFragment();
    var root = document.createElement(tagName);

    frag.appendChild(root);

    // attributes
    if (attributesRegex.test(str)) {
      var attributes = attributesRegex.exec(str)[1].trim().split(whiteSpaceRegex);

      for (var j = 0; j < attributes.length; j++) {
        var attr = attributes[j].split('=');
        var name = attr[0];
        var value = (attr[1] ? attributeValueRegex.exec(attr[1])[1] : '');

        root.setAttribute(name, value);
      }
    }

    // children
    // TODO: this does not handle sibling nodes
    if (childElements.test(str)) {
      root.innerHTML = childElements.exec(str)[2];
    }

    // find all substitution values and safely encode them


    return frag.firstChild;
  };
}

})(window);