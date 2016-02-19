(function(window) {
"use strict";

// test for es6 support of needed functionality
try {
  // spread operator and template strings support
  eval('function tag(strings, ...values) {return;}; tag`test`;');  // jshint ignore:line

  // template tag and Array.from support
  if (!('content' in document.createElement('template') && 'from' in Array)) {
    throw new Error();
  }
}
catch (e) {
  // missing support;
  console.log('Your browser does not support the needed functionality to use the html tagged template');
}

if (typeof window.html === 'undefined') {

  var substitutionIndex = 'substitutionindex:';  // tag names are always all lowercase
  var substitutionRegex = new RegExp(substitutionIndex + '([0-9]+):', 'g');

  window.html = function(strings, ...values) {
    // break early if called with empty content
    if (!strings[0] && values.length === 0) {
      return;
    }

    /**
     * Replace a string with substitutions with their substitution value
     */
    function replaceSubstitution(match, index) {
      return values[parseInt(index, 10)];
    }

    // insert placeholders into the generated string so we can run it through the
    // HTML parser without any malicious content.
    // (this particular placeholder will even work when used to create a DOM element)
    var str = strings[0];
    for (i = 0; i < values.length; i++) {
      str += substitutionIndex + i + ':' + strings[i+1];
    }

    // template tags allow any HTML (even <tr> elements out of context)
    // @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template
    var template = document.createElement('template');
    template.innerHTML = str;

    // find all substitution values and safely encode them using DOM APIs
    var walker = document.createNodeIterator(template.content, NodeFilter.SHOW_ALL);
    var node;
    while (node = walker.nextNode()) {
      var tag = null;

      // node name
      var nodeName = node.nodeName.toLowerCase();
      if (nodeName.indexOf(substitutionIndex) !== -1) {
        nodeName = nodeName.replace(substitutionRegex, replaceSubstitution);

        // createElement() should not need to be escaped to prevent XSS?
        tag = document.createElement(nodeName);
        node._replacedWith = tag;

        node.parentNode.replaceChild(tag, node);
      }

      // node attributes
      var attributes;
      if (attributes = node.attributes) {
        for (var i = 0; i < attributes.length; i++) {
          var attribute = attributes[i];
          var name = attribute.name;
          var value = attribute.value;
          var hasSubstitution = false;

          // attribute has substitution
          if (name.indexOf(substitutionIndex) !== -1) {
            hasSubstitution = true;
            name = name.replace(substitutionRegex, replaceSubstitution);

            // remove old attribute
            node.removeAttribute(attribute.name);
          }

          if (value.indexOf(substitutionIndex) !== -1) {
            hasSubstitution = true;
            value = value.replace(substitutionRegex, replaceSubstitution);
          }

          // add the attribute to the new tag or replace it on the current node
          // setAttribute() does not need to be escaped to prevent XSS since it does
          // all of that for use
          // @see https://www.mediawiki.org/wiki/DOM-based_XSS
          if (tag || hasSubstitution) {
            (tag || node).setAttribute(name, value);
          }
        }
      }

      // append the current node to a replaced parent
      if (node.parentNode && node.parentNode._replacedWith) {
        node.parentNode._replacedWith.appendChild(node);
      }

      // node value
      if (node.nodeType === 3 && node.nodeValue.indexOf(substitutionIndex) !== -1) {
        var nodeValue = node.nodeValue.replace(substitutionRegex, replaceSubstitution);

        // createTextNode() should not need to be escaped to prevent XSS?
        var text = document.createTextNode(nodeValue);

        node.parentNode.replaceChild(text, node);
      }
    }

    // return an array of childNodes instead of an HTMLCollection, compliant with
    // the new DOM spec to make collections an Array
    // @see https://dom.spec.whatwg.org/#element-collections
    if (template.content.childNodes.length > 1) {
      return Array.from(template.content.childNodes);
    }

    return template.content.firstChild;
  };
}

})(window);