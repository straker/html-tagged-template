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
    expect(x).to.equal(xss);
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
    var el = html`<a target='_blank' href="${xss}">XSS'ed Link</a>`;
    document.body.appendChild(el);
    el.click();
  });
});