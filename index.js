(function(window) {
"use strict";

// test for es6 support of needed functionality
try {
  // spread and template strings operator
  eval('function tag(strings, ...values) {return;}; tag`test`;');

  // template support
  if (!('content' in document.createElement('template'))) {
    throw new Error();
  }
}
catch (e) {
  // missing support;
  console.log('Your browser does not support the needed functionality to use the html tagged template');
}

if (typeof window.html === 'undefined') {

  var substitutionIndex = 'substitutionindex:';  // tag names are always all lowercase
  var substitutionRegex = new RegExp(substitutionIndex + '([0-9]+)', 'g');
  var i, j, attributes, tagName;

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
      str += substitutionIndex + i + '' + strings[i+1];
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

        // createElement() should not need to be escaped to prevent XSS (same as
        // setAttribute())?
        tag = document.createElement(tagName);

        // move all children of the node to the new tag
        var children = node.children;
        for (j = 0; j < children.length; j++) {
          tag.appendChild(children[j]);
        }

        node.parentNode.replaceChild(tag, node);

        // transfer attributes to the new tag in the attributes loop so we
        // only loop through them once
      }

      // attributes
      attributes = node.attributes;
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
    }

    // node contents

    // return an array of children instead of a HTMLCollection, compliant with
    // the new DOM spec to make collections an Array
    // @see https://dom.spec.whatwg.org/#element-collections
    if (template.content.children.length > 1) {
      return Array.from(template.content.children);
    }

    return template.content.firstChild;
  };
}

})(window);