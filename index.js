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
  var i, j, childNodes;

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

    // verify that the first element is valid
    // TODO: what if the user entered html`${dom}` where dom = <div></div>?
    if (str[0] !== '<') {
      throw new SyntaxError('Unexpected token ' + str[0]);
    }
    else if (str[str.length -1] !== '>') {
      throw new SyntaxError('Unexpected end of input');
    }

    // template tags allow any HTML (even <tr> elements out of context)
    // @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template
    var template = document.createElement('template');
    template.innerHTML = str;

    // find all substitution values and safely encode them using DOM APIs
    var nodes = template.content.querySelectorAll('*');
    for (i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var tag = null;

      // node name
      var tagName = node.nodeName.toLowerCase();
      if (tagName.indexOf(substitutionIndex) !== -1) {
        tagName = tagName.replace(substitutionRegex, replaceSubstitution);

        // createElement() should not need to be escaped to prevent XSS?
        tag = document.createElement(tagName);

        node.parentNode.replaceChild(tag, node);
      }

      // attributes
      var attributes = node.attributes;
      for (j = 0; j < attributes.length; j++) {
        var attribute = attributes[j];
        var name = attribute.name;
        var value = attribute.value;
        var hasSubstitution = false;

        // attribute has substitution
        if (name.indexOf(substitutionIndex) !== -1) {
          hasSubstitution = true;
          name = name.replace(substitutionRegex, replaceSubstitution);

          // remove old tag
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

      // children
      childNodes = node.childNodes;
      for (j = 0; j < childNodes.length; j++) {
        var childNode = childNodes[j];

        // text node with substitution
        if (childNode.nodeType === 3 &&
            childNode.nodeValue.indexOf(substitutionIndex) !== -1) {
          var nodeValue = childNode.nodeValue.replace(substitutionRegex, replaceSubstitution);

          // createTextNode() should not need to be escaped to prevent XSS?
          var text = document.createTextNode(nodeValue);

          // if we have a new tag we'll append the text node to it instead of
          // replacing it on the old node
          if (!tag) {
            node.replaceChild(text, childNode);
          }
          else {
            childNode = text;
          }
        }

        if (tag) {
          tag.appendChild(childNode);
        }
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