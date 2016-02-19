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

        // use insertBefore() instead of replaceChild() so that the node Iterator
        // doesn't think the new tag should be the next node
        node.parentNode.insertBefore(tag, node);
      }

      // special case for script tags:
      // using innerHTML with a string that contains a script tag causes the script
      // tag to not be executed when added to the DOM. We'll need to create a script
      // tag and append it's contents which will make it execute correctly.
      // @see http://stackoverflow.com/questions/1197575/can-scripts-be-inserted-with-innerhtml
      if ((tag || node).nodeName === 'SCRIPT') {
        var script = document.createElement('script');
        node._replacedWith = script;

        (tag || node).parentNode.insertBefore(script, (tag || node));

        tag = script;
      }

      // node attributes
      var attributes;
      if (attributes = node.attributes) {
        for (var i = 0; i < attributes.length; i++) {
          var attribute = attributes[i];
          var name = attribute.name;
          var value = attribute.value;
          var hasSubstitution = false;

          // name has substitution
          if (name.indexOf(substitutionIndex) !== -1) {
            hasSubstitution = true;
            name = name.replace(substitutionRegex, replaceSubstitution);

            // remove old attribute
            node.removeAttribute(attribute.name);
          }

          // value has substitution
          if (value.indexOf(substitutionIndex) !== -1) {
            hasSubstitution = true;
            value = value.replace(substitutionRegex, replaceSubstitution);

            // contextual auto escape
            if (name === 'href') {
              // URI encode then only allow the : when used after http or https
              // (will not allow any 'javascript:' or filter evasion techniques)
              value = encodeURI(value).replace(':', function(match, index, string) {
                  var protocol = string.substring(index-5, index);
                  if (protocol.indexOf('http') !== -1) {
                    return match;
                  }

                  return '\\x' + match.charCodeAt(0).toString(16).toUpperCase();
              });
            }
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
      var parentNode;
      if (node.parentNode && node.parentNode._replacedWith) {
        parentNode = node.parentNode;
        node.parentNode._replacedWith.appendChild(node);
      }

      // remove the old node from the DOM
      if ((node._replacedWith && node.childNodes.length === 0) ||
          (parentNode && parentNode.childNodes.length === 0) ){
        (parentNode || node).remove();
      }

      // node value
      if (node.nodeType === 3 && node.nodeValue.indexOf(substitutionIndex) !== -1) {
        var nodeValue = node.nodeValue.replace(substitutionRegex, replaceSubstitution);

        // createTextNode() should not need to be escaped to prevent XSS?
        var text = document.createTextNode(nodeValue);

        // since the parent node has already gone through the iterator, we can use
        // replaceChild() here
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