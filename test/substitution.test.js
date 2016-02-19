describe('Substitution expressions', function() {

  /*
    different ways to substitute values:

    // as attribute value
    html`<div class="${className}">Text</div>`;

      - if class is not quoted, need to quote className
      - className cannot contain unescaped quotes (prevent XSS from creating new attributes)
      - className cannot contain an equals sign (prevent XSS from creating new attributes)
      - className cannot contain angle brackets (<>) (prevent XSS from creating new tags)
      - className cannot contain JavaScript (prevent XSS from executing js)

    // as attribute name
    html`<div ${attr}="value">Text</div>`;

      - attr cannot contain whitespace (prevent XSS from creating new attributes)
      - attr cannot contain unescaped quotes (prevent XSS from creating new attributes)
      - attr cannot contain an equals sign (prevent XSS from creating new attributes)
      - attr cannot contain angle brackets (<>) (prevent XSS from creating new tags)
      - attr cannot contain JavaScript (prevent XSS from executing js)
      - attr does not have to be a valid attribute name (any are valid, even without data-)

    // as tag name
    html`<${tagName}>Text</${tagName}>`;

      - tagName cannot contain whitespace (prevent XSS from creating new attributes)
      - tagName cannot contain unescaped quotes (prevent XSS from creating new attributes)
      - tagName cannot contain an equals sign (prevent XSS from creating new attributes)
      - tagName cannot contain angle brackets (<>) (prevent XSS from creating new tags)
      - tagName cannot contain JavaScript (prevent XSS from executing js)
      - tagName can contain : to define valid namespace (math, html, or svg), but none others
      - tagName does not have to be a valid tag name (web components can define new ones)

    // as HTML contents
    html`<div>${text}</div>

      - text cannot contain angle brackets (<>) (prevent XSS from creating new tags)
      - text cannot contain JavaScript (prevent XSS from executing js)
      - how would we allow valid HTML that is trusted?

    // mix
    html`<h${level} ${attr}=${value} ${var}>${text}</h${level}>

      - ${attr}=${value} ${var} is difficult – was ${var} suppose to be part of ${attr} or it's own attribute?
        - unless the attribute was quoted, any whitespace will be treated as a new attribute, so in the example above ${var} would be a new attribute
  */
});