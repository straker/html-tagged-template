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
  return;
}

if (typeof window.html === 'undefined') {

  var substitutionIndex = 'substitutionindex:';  // tag names are always all lowercase
  var substitutionRegex = new RegExp(substitutionIndex + '([0-9]+):', 'g');

  // find all attributes after the first whitespace (which would follow the tag
  // name. Only used when the DOM has been clobbered to still parse attributes
  var fallbackAttributeParserRegex = /\s(\S+)/g

  // rejection string is used to replace xss attacks that cannot be escaped either
  // because the escaped string is still executable
  // (e.g. setTimeout(/* escaped string */)) or because it produces invalid results
  // (e.g. <h${xss}> where xss='><script>alert(1337)</script')
  // @see https://developers.google.com/closure/templates/docs/security#in_tags_and_attrs
  var rejectionString = 'zSubstitutionRejectedz';

  // test if a javascript substitution is wrapped with quotes
  var wrappedWithQuotesRegex = /^('|")[\s\S]*\1$/;

  // which characters should be encoded in which contexts
  var encodings = {
    attribute: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
    }
  };

  var encodingRegexs = {
    attribute: new RegExp('[' + Object.keys(encodings.attribute).join('') + ']', 'g')
  };

  // which attributes are DOM Level 0 events
  // taken from https://en.wikipedia.org/wiki/DOM_events#DOM_Level_0
  var domEvents = ["onclick", "ondblclick", "onmousedown", "onmouseup", "onmouseover", "onmousemove", "onmouseout", "ondragstart", "ondrag", "ondragenter", "ondragleave", "ondragover", "ondrop", "ondragend", "onkeydown", "onkeypress", "onkeyup", "onload", "onunload", "onabort", "onerror", "onresize", "onscroll", "onselect", "onchange", "onsubmit", "onreset", "onfocus", "onblur", "onpointerdown", "onpointerup", "onpointercancel", "onpointermove", "onpointerover", "onpointerout", "onpointerenter", "onpointerleave", "ongotpointercapture", "onlostpointercapture", "oncut", "oncopy", "onpaste", "onbeforecut", "onbeforecopy", "onbeforepaste", "onafterupdate", "onbeforeupdate", "oncellchange", "ondataavailable", "ondatasetchanged", "ondatasetcomplete", "onerrorupdate", "onrowenter", "onrowexit", "onrowsdelete", "onrowinserted", "oncontextmenu", "ondrag", "ondragstart", "ondragenter", "ondragover", "ondragleave", "ondragend", "ondrop", "onselectstart", "help", "onbeforeunload", "onstop", "beforeeditfocus", "onstart", "onfinish", "onbounce", "onbeforeprint", "onafterprint", "onpropertychange", "onfilterchange", "onreadystatechange", "onlosecapture", "DOMMouseScroll", "ondragdrop", "ondragenter", "ondragexit", "ondraggesture", "ondragover", "onclose", "oncommand", "oninput", "DOMMenuItemActive", "DOMMenuItemInactive", "oncontextmenu", "onoverflow", "onoverflowchanged", "onunderflow", "onpopuphidden", "onpopuphiding", "onpopupshowing", "onpopupshown", "onbroadcast", "oncommandupdate"];

  // which attributes take URIs
  // taken from https://www.w3.org/TR/html4/index/attributes.html
  var uriAttributes = ["action", "background", "cite", "classid", "codebase", "data", "href", "longdesc", "profile", "src", "usemap"];

  // allow custom attribute names that start or end with url or ui to do uri escaping
  var customUriAttribute = /\bur[il]|ur[il]s?$/i;

  /**
   * Escape HTML entities in an attribute.
   * @param {string} str - String to escape.
   *
   * @returns {string}
   */
  function encodeAttributeHTMLEntities(str) {
    return str.replace(encodingRegexs.attribute, function(match) {
      return encodings.attribute[match];
    });
  }

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

        // this will throw an error if the tag name is invalid (e.g. xss tried
        // to escape out of the tag using '><script>alert(1337)</script><')
        // instead of replacing the tag name we'll just let the error be thrown
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
      else if ((tag || node).nodeName === 'SCRIPT') {
        var script = document.createElement('script');
        node._replacedWith = script;

        (tag || node).parentNode.insertBefore(script, (tag || node));

        tag = script;
      }

      // node attributes
      var attributes;
      if (node.attributes) {

        // if the attributes property is not of type NamedNodeMap then the DOM
        // has been clobbered. E.g. <form><input name="attributes"></form>.
        // We'll manually build up an array of objects that mimic the Attr
        // object so the loop will still work as expected.
        if ( !(node.attributes instanceof NamedNodeMap) ) {
          // first clone the node so we can isolate it from any children
          var temp = node.cloneNode();

          // parse the node string for all attributes
          var attributeMatches = temp.outerHTML.match(fallbackAttributeParserRegex);

          // get all attribute names and their value
          attributes = [];
          for (var i = 0; i < attributeMatches.length; i++) {
            var attributeName = attributeMatches[i].trim().split('=')[0];
            var attributeValue = node.getAttribute(attributeName);

            attributes.push({
              name: attributeName,
              value: attributeValue
            });
          }
        }
        else {
          // Windows 10 Firefox 44 will shift the attributes NamedNodeMap and push
          // the attribute to the end when using setAttribute(). We'll have to clone
          // the NamedNodeMap so the order isn't changed for setAttribute()
          attributes = Array.from(node.attributes);
        }

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
            value = value.replace(substitutionRegex, function(match, index) {
              var substitutionValue = values[parseInt(index, 10)];

              // contextual auto-escaping:
              // if attribute is a DOM Level 0 event then we need to ensure it
              // is quoted
              if (domEvents.indexOf(name) !== -1 &&
                  typeof substitutionValue === 'string' &&
                  !wrappedWithQuotesRegex.test(substitutionValue) ) {
                substitutionValue = '"' + substitutionValue + '"';
              }

              return substitutionValue;
            });

            // contextual auto-escaping:
            if (uriAttributes.indexOf(name) !== -1 || customUriAttribute.test(name)) {
              value = encodeURI(value);

              // only allow the : when used after http or https otherwise reject
              // the entire url (will not allow any 'javascript:' or filter
              // evasion techniques)
              var index = value.indexOf(':');
              if (index !== -1) {
                var protocol = value.substring(index-5, index);
                if (protocol.indexOf('http') === -1) {
                  value = '#' + rejectionString;
                }
              }
            }

            // contextual auto-escaping:
            // HTML encode attribute value if it is not a URL or URI to prevent
            // DOM Level 0 event handlers from executing xss code
            else if (typeof value === 'string') {
              value = encodeAttributeHTMLEntities(value);
            }
          }

          // add the attribute to the new tag or replace it on the current node
          // setAttribute() does not need to be escaped to prevent XSS since it does
          // all of that for us
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

    // return the documentFragment for multiple nodes
    if (template.content.childNodes.length > 1) {
      return template.content;
    }

    return template.content.firstChild;
  };
}

})(window);