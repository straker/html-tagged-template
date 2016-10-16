[![Build Status](https://travis-ci.org/straker/html-tagged-template.svg?branch=master)](https://travis-ci.org/straker/html-tagged-template)
[![Coverage Status](https://coveralls.io/repos/github/straker/html-tagged-template/badge.svg?branch=master)](https://coveralls.io/github/straker/html-tagged-template?branch=master)

# Proposal

Improve the DOM creation API so developers have a cleaner, simpler interface to DOM creation and manipulation.

## Installing

`npm install html-tagged-template`

or with Bower

`bower install html-tagged-template`

## Usage

```js
let min = 0, max = 99, disabled = true;

// returns an <input> tag with all attributes set
let el = html`<input type="number" min="${min}" max="${max}" name="number" id="number" class="number-input" ${ (disabled ? 'disabled' : '') }/>`;
document.body.appendChild(el);

// returns a DocumentFragment with two <tr> elements as children
let el = html`<tr></tr><tr></tr>`
document.body.appendChild(el);
```

## Contributing

The only way this proposal will continue forward is with help from the community. If you would like to see the `html` function in the web, please upvote the [proposal on the W3C DOM repo](https://github.com/whatwg/dom/issues/150).

If you find a bug or an XSS case that should to be handled, please submit an issue, or even better a PR with the relevant code to reproduce the error in the [xss test](test/xss.test.js).

## Problem Space

The DOM creation API is a bit cumbersome to work with. To create a single element with several attributes requires several lines of code that repeat the same thing. The DOM selection API has received needed features that allow developers to do most DOM manipulation without needing a library. However, the DOM creation API still leaves something to be desired which sways developers from using it.

Below are just a few examples of how DOM creation requires multiple lines of code to accomplish simple tasks and how developers tend to work around the API to gain access to a much simpler interface.

```js
/*
  Create a single element with attributes:
  <input type="number" min="0" max="99" name="number" id="number" class="number-input" disabled/>
*/
let input = document.createElement('input');
input.type = "number";
input.min = 0;
input.max = 99;
input.name = 'number';
input.id = 'number';
input.classList.add('number-input');
input.disabled = true;
document.body.appendChild(input);

// or the hacky way - create a throwaway parent node just to use innerHTML
let div = document.createElement('div');
div.innerHTML = '<input type="number" min="0" max="99" name="number" id="number" class="number-input" disabled/>';
document.body.appendChild(div.firstChild);


/*
   Create an element with child elements:
   <div class="container">
     <div class="row">
       <div class="col">
         <div>Hello</div>
       </div>
     </div>
   </div>
 */
// use document fragment to batch appendChild calls for good performance
let frag = document.createDocumentFragment();
let div = document.createElement('div');
div.classList.add('container');
frag.appendChild(div);

let row = document.createElement('div');
row.classList.add('row');
div.appendChild(row);

let col = document.createElement('div');
col.classList.add('col');
row.appendChild(col);

let child = document.createElement('div');
child.appendChild(document.createTextNode('Hello'));  // or child.textContext = 'Hello';
col.appendChild(child);
document.body.appendChild(frag);

// or the convenient way using innerHTML
let div = document.createElement('div');
div.classList.add('container');
div.innerHTML = '<div class="row"><div class="col"><div>Hello</div></div></div>';
document.body.appendChild(div);


/*
   Create sibling elements to be added to a parent element:
   <!-- before -->
   <ul id="list">
     <li>Car</li>
   </ul>

   <!-- after -->
   <ul id="list">
     <li>Car</li>
     <li>Plane</li>
     <li>Boat</li>
     <li>Bike</li>
   </ul>
 */
let frag = document.createDocumentFragment();
let li = document.createElement('li');
li.textContent = 'Plane';
frag.appendChild(li);

li = document.createElement('li');
li.textContent = 'Boat';
frag.appendChild(li);

li = document.createElement('li');
li.textContent = 'Bike';
frag.appendChild(li);
document.querySelector('#list').appendChild(frag);

// or if you have the ability to create it through a loop
let frag = document.createDocumentFragment();
['Plane', 'Boat', 'Bike'].forEach(function(item) {
  let li = document.createElement('li');
  li.textContent = item;
  frag.appendChild(li);
});
document.querySelector('#list').appendChild(frag);
```

## Proposed Solution

We propose that a global tagged template string function called `html` provide the interface to accept template strings as input and return the parsed DOM elements.

```js
let min = 0, max = 99, disabled = true, text = 'Hello';

// single element with attributes
html`<input type="number" min="${min}" max="${max}" name="number" id="number" class="number-input" ${ (disabled ? 'disabled' : '') }/>`;

// single element with child elements
html`<div class="container">
  <div class="row">
    <div class="col">
      <div>${text}</div>
    </div>
  </div>
</div>`;

// sibling elements
html`<li>Plane</li>
     <li>Boat</li>
     <li>Bike</li>`;
```

## Goals

1. [Easy to Use](#easy-to-use)
1. [Secure](#secure)

### Easy to Use

This proposal wouldn't exist if creating the DOM was easy. Any improvement to the DOM creation API would essentially need to replace `innerHTML` with something better and just as easy (if not easier), otherwise developers will continue to use it to work around the API.

#### Proposed Solution

To solve this problem, we propose a new API that will allow developers to create single, sibling, or nested child nodes with a single function call. With the addition of template strings to ECMAScript 2015, [we and others](https://lists.w3.org/Archives/Public/www-dom/2011OctDec/0170.html) feel that they are the cleanest, simplest, and most intuitive interface for DOM creation.

ECMAScript 2015 also introduced [tagged template strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/template_strings#Tagged_template_strings) which would allow a function to accept a template string as input and return DOM. Tagged template strings also have the advantage that they can understand where variables were used in the string and be able to apply security measures to prevent XSS.

#### Other Solutions

##### Object-like notation

Object-like notation applies object literals to DOM creation. Instead of using a string of HTML, object-like notation uses property names and values to construct a DOM object.

```js
createElement('input', {type: 'number', min: 0, max: 99, name: 'number', id: 'number', className: 'number-input', disabled: true, inside: document.body});
```

However, this solution suffers from a few problems. First, it tends to combine content attributes (HTML attributes such as `id` or `name`) with IDL attributes (JavaScript properties such as `textContent` or `className`) which can lead to developer confusion as they don't know which attribute to use or how. For example, `class` is a reserved word in JavaScript and couldn't be used as a property name, even though it is a content attribute, unless it was always quoted. It also tends to add helper attributes (such as `contents`) which add to the confusion.

Second, it adds verbosity and complexity to the creation of nested nodes that provide only a slightly better interface to DOM creation than the standard `createElement` and `appendChild` methods. Since developers already use `innerHTML` to avoid these methods, it would seem unlikely that they would give up the convenience of `innerHTML` for a something more complex and verbose.

```js
createElement('div', {className: 'container', inside: document.body, contents: [
  {tag: 'div', className: 'row', contents: [
    {tag: 'div', className: 'col', contents: [
      {tag: 'div', contents: ['Hello']}
    ]}
  ]}
]});
```

### Secure

XSS attacks via string concatenation are among the most prevalent types of security threats the web development world faces. Tagged template strings provide a unique opportunity to make creating DOM much more secure than string concatenation ever could. Tagged template strings know exactly where the user substitution expressions are located in the string, enabling us to apply preventative measures to help ensure the resulting DOM is safe from XSS attacks.

#### Proposed Solution

There have been two proposed solutions for making template strings secure against XSS: [E4H](http://www.hixie.ch/specs/e4h/strawman), championed by Ian Hixie, and [contextual auto escaping](https://js-quasis-libraries-and-repl.googlecode.com/svn/trunk/safetemplate.html#security_under_maintenance), championed by Mike Samuel.

E4H uses an AST to construct the DOM, ensuring that substitutions are made safe against element and attribute injection. Contextual auto escaping tries to understand the context of the attribute or element in the DOM and correctly escape the substitution based on it's context.

We propose combining the best ideas from both E4H and contextual auto escaping and avoiding the problems that both encountered. First, the template string is sanitized by removing all substitution expressions (and all XSS attack vectors with them), while leaving placeholders in the resulting string that identify the substitution that belonged there. Next, the string is passed to an HTML `template` tag using `innerHTML`, which runs the string through the HTML parser and properly creates elements out of context (such as `<tr>` elements). Finally, all placeholders are identified and replaced with their substitution expression using the DOM APIs `createElement`, `createTextNode`, and `setAttribute`, and then using contextual auto escaping to prevent further XSS attack vectors.