# Preventative XSS measures

## XSS Prevention Rules Summary

| Data Type | Context | Code Sample | Defense |
| --------- | ------- | ----------- | ------- |
| String | HTML Body |  <pre lang="html">`<span>UNTRUSTED DATA</span>`</pre> | HTML Entity Encoding |
| String | Safe HTML Attributes | <pre lang="html">`<input type="text" name="fname" value="UNTRUSTED DATA">`</pre> | <ul><li>Aggressive HTML Entity Encoding</li><li>Only place untrusted data into a whitelist of safe attributes (listed below).</li><li>Strictly validate unsafe attributes such as background, id and name.</li></ul> |
| String | GET Parameter |  <pre lang="html">`<a href="/site/search?value=UNTRUSTED DATA">clickme</a>`</pre> | URL Encoding |
| String | Untrusted URL in a SRC or HREF attribute | <pre lang="html">`<a href="UNTRUSTED URL">clickme</a>`</pre><pre lang="html">`<iframe src="UNTRUSTED URL" />` | <ul><li>Canonicalize input</li><li>URL Validation</li><li>Safe URL verification</li><li>Whitelist http and https URL's only (Avoid the JavaScript Protocol to Open a new Window)</li><li>Attribute encoder</li></ul> |
| String | CSS Value | <pre lang="html">`<div style="width: UNTRUSTED DATA;">Selection</div>` | <ul><li>Strict structural validation</li><li>CSS Hex encoding</li><li>Good design of CSS Features |
| String | JavaScript Variable | <pre lang="html">`<script>var currentValue='UNTRUSTED DATA';</script>`</pre><pre lang="html">`<script>someFunction('UNTRUSTED DATA');</script>` | <ul><li>Ensure JavaScript variables are quoted</li><li>JavaScript Hex Encoding</li><li>JavaScript Unicode Encoding</li><li>Avoid backslash encoding (\" or \' or \\)</li></ul> |
| HTML | HTML Body | <pre lang="html">`<div>UNTRUSTED HTML</div>`</pre> | HTML Validation (JSoup, AntiSamy, HTML Sanitizer) |
| String | DOM XSS | <pre lang="html">`<script>document.write('UNTRUSTED INPUT');<script/>` | DOM based XSS Prevention Cheat Sheet |

## Output Encoding Rules Summary

| Encoding Type | Encoding Mechanism |
| ------------- | ------------------ |
|HTML Entity Encoding | Convert & to `&amp;`<br>Convert < to `&lt;`<br>Convert > to `&gt;`<br>Convert " to `&quot;`<br>Convert ' to `&#x27;`<br>Convert / to `&#x2F;`<br> |
| HTML Attribute Encoding | Except for alphanumeric characters, escape all characters with the HTML Entity &#xHH; format, including spaces. (HH = Hex Value) |
| URL Encoding | Standard percent encoding, see: http://www.w3schools.com/tags/ref_urlencode.asp. URL encoding should only be used to encode parameter values, not the entire URL or path fragments of a URL.
| JavaScript Encoding | Except for alphanumeric characters, escape all characters with the \uXXXX unicode escaping format (X = Integer). |
| CSS Hex Encoding | CSS escaping supports \XX and \XXXXXX. Using a two character escape can cause problems if the next character continues the escape sequence. There are two solutions (a) Add a space after the CSS escape (will be ignored by the CSS parser) (b) use the full amount of CSS escaping possible by zero padding the value. |

[Filter Evasion Cheat Sheet](https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet)

## As Attribute Value

```js
html`<div class="${className}">Text</div>`;
```

- if class is not quoted, need to quote className
- className cannot contain unescaped quotes (prevent XSS from creating new attributes)
- className cannot contain an equals sign (prevent XSS from creating new attributes)
- className cannot contain angle brackets (<>) (prevent XSS from creating new tags)
- className cannot contain JavaScript (prevent XSS from executing js)
- Except for alphanumeric characters, escape all characters with ASCII values less than 256 with the &#xHH; format (or a named entity if available) to prevent switching out of the attribute.

### References

1. https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet#RULE_.232_-_Attribute_Escape_Before_Inserting_Untrusted_Data_into_HTML_Common_Attributes

## As Attribute Name

```js
html`<div ${attr}="value">Text</div>`;
```

- attr cannot contain whitespace (prevent XSS from creating new attributes)
- attr cannot contain unescaped quotes (prevent XSS from creating new attributes)
- attr cannot contain an equals sign (prevent XSS from creating new attributes)
- attr cannot contain angle brackets (<>) (prevent XSS from creating new tags)
- attr cannot contain JavaScript (prevent XSS from executing js)
- attr does not have to be a valid attribute name (any are valid, even without data-)

## As Tag Name

```js
html`<${tagName}>Text</${tagName}>`;
```

- tagName cannot contain whitespace (prevent XSS from creating new attributes)
- tagName cannot contain unescaped quotes (prevent XSS from creating new attributes)
- tagName cannot contain an equals sign (prevent XSS from creating new attributes)
- tagName cannot contain angle brackets (<>) (prevent XSS from creating new tags)
- tagName cannot contain JavaScript (prevent XSS from executing js)
- tagName can contain : to define valid namespace (math, html, or svg), but none others
- tagName does not have to be a valid tag name (web components can define new ones)

## As HTML Content

```js
html`<div>${text}</div>`;
```

- text cannot contain angle brackets (<>) (prevent XSS from creating new tags)
- text cannot contain JavaScript (prevent XSS from executing js)
- escape following entities:
  + & --> `&amp;`
  + < --> `&lt;`
  + > --> `&gt;`
  + " --> `&quot;`
  + ' --> `&#x27`
  + / --> `&#x2F`
- how would we allow valid HTML that is trusted?

### References

1. https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet#RULE_.231_-_HTML_Escape_Before_Inserting_Untrusted_Data_into_HTML_Element_Content

## As JavaScript Content

```js
html`<div onmouseover="x=${value}"></div>`;
html`<script>${code}</script>`;
```

- Except for alphanumeric characters, escape all characters less than 256 with the \xHH format to prevent switching out of the data value into the script context or into another attribute. DO NOT use any escaping shortcuts like \" because the quote character may be matched by the HTML attribute parser which runs first. These escaping shortcuts are also susceptible to "escape-the-escape" attacks where the attacker sends \" and the vulnerable code turns that into \\" which enables the quote.

### References

1. https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet#RULE_.233_-_JavaScript_Escape_Before_Inserting_Untrusted_Data_into_JavaScript_Data_Values

## As CSS Content

```js
html`<style>selector { property: ${value} }</style>`;
```

- Please note there are some CSS contexts that can never safely use untrusted data as input - EVEN IF PROPERLY CSS ESCAPED! You will have to ensure that URLs only start with "http" not "javascript" and that properties never start with "expression".
- Except for alphanumeric characters, escape all characters with ASCII values less than 256 with the \HH escaping format. DO NOT use any escaping shortcuts like \" because the quote character may be matched by the HTML attribute parser which runs first. These escaping shortcuts are also susceptible to "escape-the-escape" attacks where the attacker sends \" and the vulnerable code turns that into \\" which enables the quote.
- If attribute is quoted, breaking out requires the corresponding quote. All attributes should be quoted but your encoding should be strong enough to prevent XSS when untrusted data is placed in unquoted contexts. Unquoted attributes can be broken out of with many characters including [space] % * + , - / ; < = > ^ and |. Also, the </style> tag will close the style block even though it is inside a quoted string because the HTML parser runs before the JavaScript parser. Please note that we recommend aggressive CSS encoding and validation to prevent XSS attacks for both quoted and unquoted attributes.

### References

1. https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet#RULE_.234_-_CSS_Escape_And_Strictly_Validate_Before_Inserting_Untrusted_Data_into_HTML_Style_Property_Values

## Mix

```js
html`<h${level} ${attr}=${value} ${var}>${text}</h${level}>`;
```

- ${attr}=${value} ${var} is difficult – was ${var} suppose to be part of ${attr} or it's own attribute?
  - unless the attribute was quoted, any whitespace will be treated as a new attribute, so in the example above ${var} would be a new attribute

# References

1. https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet

# Idea on how to combine E4H principles and contextual auto escaping

1. replace all substitutions with placeholder values (their index in the array)
2. create DOM as normal using HTML parser (no chance for XSS since there is no user generated expression)
  - will need to check for correct closing tags/attributes or something so the HTML parser doesn't freak out
3. with the DOM created, we can use setAttribute() for safely encoding attribute values (prevent attribution injection) and use contextual auto escaping to figure out the rest