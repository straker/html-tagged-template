var counter = 0;

describe('XSS Attack Vectors', function() {
  // Modified XSS String
  // (Source: https://developers.google.com/closure/templates/docs/security#example)
  var xss = "javascript:/*</style></script>/**/ /<script>1/(assert(false))//</script>";

  afterEach(function() {
    counter++;
  });

  it('should prevent injection to element innerHTML', function() {
    var el = html`<p>${xss}</p>`;
    document.body.appendChild(el);
  });

  it('should prevent injection to non-quoted element attributes', function() {
    var el = html`<div data-xss=${xss}></div>`;
    document.body.appendChild(el);
  });

  it('should prevent injection to single quoted element attributes', function() {
    var el = html`<div data-xss='${xss}'></div>`;
    document.body.appendChild(el);
  });

  it('should prevent injection to double quoted element attributes', function() {
    var el = html`<div data-xss="${xss}"></div>`;
    document.body.appendChild(el);
  });

  it('should prevent injection as a javascript quoted string', function() {
     var el = html`<script>alert('${xss}')</script>`;
     document.body.appendChild(el);
  });

  it('should prevent injection on one side of a javascript quoted expression', function() {
    var el = html`<script>x='${xss}'</script>`;
    document.body.appendChild(el);
  });

  it('should prevent injection into inlined quoted event handler', function() {
    var el = html`<a href='#' onclick="x='${xss}'">XSS &lt;p&gt; tag</a>`;
    document.body.appendChild(el);
    el.click();
  });

  it('should prevent injection into quoted event handler', function() {
    var el = html`<a href='#' onclick="${xss}">XSS &lt;p&gt; tag</a>`;
    document.body.appendChild(el);
    el.click();
  });

  it('should prevent injection into CSS unquote property', function() {
    var el = html`<style>html { background: ${xss}; }</style>`;
    document.body.appendChild(el);
  });

  it('should prevent injection into CSS quoted property', function() {
    var el = html`<style>html { background: "${xss}"; }</style>`;
    document.body.appendChild(el);
  });

  it('should prevent injection into CSS property of HTML style attribute', function() {
    var el = html`<div style="background: ${xss}"></div>`;
    document.body.appendChild(el);
  });

  it('should prevent injection into query params of HTML urls', function() {
    var el = html`<p><a target='_blank' href="http://www.google.com?test=${xss}">XSS'ed Link</a></p>`;
    document.body.appendChild(el);
    el.click();
  });

  it('should prevent injection into HREF attribute of <a> tag', function() {
    var el = html`<a href="${xss}">XSS'ed Link</a>`;
    document.body.appendChild(el);
    el.click();
  });

  it('should prevent against clobbering of /attributes/', function() {
    var el = html`<form id="f" action="${xss}" onsubmit="return false;">
      <input type="radio" name="attributes"//>
      <input type="submit" />
    </form>`;
   document.body.appendChild(el);

   // el.submit() does not trigger a submit event, so we need to click the submit button
   // @see http://stackoverflow.com/questions/11557994/jquery-submit-vs-javascript-submit
   el.querySelector('input[type="submit"]').click();
  });

  it('should prevent injection out of a tag name by throwing an error', function() {
    var func = function() {
      var el = html`<h${xss}></h${xss}>`;
      document.body.appendChild(el);
    };

    expect(func).to.throw;
  });

  it('should prevent xss protocol URLs by rejecting them', function() {
    var el = html`<a href="${xss}"></a>`;
    document.body.appendChild(el);
    el.click();

    expect(el.getAttribute('href')[0]).to.equal('#');
  });

  it('should not prevent javascript protocol if it was a safe string', function() {
    var value = 'foo/bar&baz/boo';
    var el = html`<a href="javascript:void(0);">`;

    expect(el.getAttribute('href')).to.equal('javascript:void(0);');
  });

  it('should prevent injection into uri custom attributes', function() {
    var el = html`<a href="#" data-uri="${xss}">`
    document.body.appendChild(el);
    el.href = el.getAttribute('data-uri');
    el.click();
  });

  it('should entity escape URLs', function() {
    var value = 'foo/bar&baz/boo';
    var el = html`<a href="${value}">`;

    expect(el.getAttribute('href')).to.equal('foo/bar&amp;baz/boo');
  });

  it('should percent encode inside URL query', function() {
    var value = 'bar&baz=boo';
    var el = html`<a href="foo?q=${value}">`;

    expect(el.getAttribute('href')).to.equal('foo?q=bar%26baz%3Dboo');
  });

  it('should percent encode inside URL query and entity escape if not', function() {
    var value = 'bar&baz=boo';
    var el = html`<a href="foo/${value}/bar?q=${value}">`;

    expect(el.getAttribute('href')).to.equal('foo/bar&amp;baz=boo/bar?q=bar%26baz%3Dboo');
  });

  it('should reject a URL outright if it has the wrong protocol', function() {
    var protocol = 'javascript:alert(1337)';
    var value = '/foo&bar/bar';
    var el = html`<a href="${protocol}/bar${value}">`;

    expect(el.getAttribute('href')[0]).to.equal('#');
    expect(el.getAttribute('href').indexOf('/bar')).to.equal(-1);
  });

});
