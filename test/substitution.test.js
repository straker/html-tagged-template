describe('Substitution expressions', function() {
  var min = 0, max = 99, disabled = true, heading = 1, tag = 'span';

  it('should create a text node from a variable', function() {
    var el = html`${tag}`;

    // correct node
    expect(el.nodeType).to.equal(3);
    expect(el.nodeValue).to.equal('span');

    // no extraneous side-effects
    expect(el.parentElement).to.be.null;
  });

  it('should create a node from a variable', function() {
    var el = html`<${tag}></${tag}>`;

    // correct node
    expect(el.nodeName).to.equal('SPAN');

    // no extraneous side-effects
    expect(el.attributes.length, 'more than 1 attribute').to.equal(0);
    expect(el.children.length, 'more than 1 child').to.equal(0);
    expect(el.parentElement).to.be.null;
    expect(el.textContent).to.be.empty;
  });

  it('should add attribute names or values from variables', function() {
    var el = html`<input type="number" min="${min}" name="number" id="number" class="number-input" max="${max}" ${ (disabled ? 'disabled' : '') }/>`;

    // correct node
    expect(el.nodeName).to.equal('INPUT');

    // correct attributes
    expect(el.attributes.length).to.equal(7);
    expect(el.type).to.equal('number');
    expect(el.min).to.equal('0');
    expect(el.name).to.equal('number');
    expect(el.id).to.equal('number');
    expect(el.className).to.equal('number-input');
    expect(el.disabled).to.equal(true);

    // no extraneous side-effects
    expect(el.children.length).to.equal(0);
    expect(el.parentElement).to.be.null;
    expect(el.textContent).to.be.empty;
  });

  it('should skip empty attributes', function() {
    var emptyDisabled = false;
    var el = html`<input type="number" min="${min}" name="number" id="number" class="number-input" max="${max}" ${ (emptyDisabled ? 'disabled' : '') }/>`;

    // correct node
    expect(el.nodeName).to.equal('INPUT');

    // correct attributes
    expect(el.attributes.length).to.equal(6);
    expect(el.type).to.equal('number');
    expect(el.min).to.equal('0');
    expect(el.name).to.equal('number');
    expect(el.id).to.equal('number');
    expect(el.className).to.equal('number-input');
    expect(el.disabled).to.equal(false);

    // no extraneous side-effects
    expect(el.children.length).to.equal(0);
    expect(el.parentElement).to.be.null;
    expect(el.textContent).to.be.empty;
  });

  it('should skip non-valid attribute substituted names', function() {
    var nonValidAttrName = [];
    var el = html`<div ${nonValidAttrName}="hello"/>`;

    // correct node
    expect(el.nodeName).to.equal('DIV');

    // correct attributes
    expect(el.attributes.length).to.equal(0);

    // no extraneous side-effects
    expect(el.children.length).to.equal(0);
    expect(el.parentElement).to.be.null;
    expect(el.textContent).to.be.empty;
  });

  it('should move any children from a substituted node to the new node', function() {
    var el = html`<h${heading}><span>Hello</span></h${heading}>`;

    // correct heading node
    expect(el.nodeName).to.equal('H1');
    expect(el.attributes.length).to.equal(0);
    expect(el.children.length).to.equal(1);
    expect(el.parentElement).to.be.null;
    expect(el.textContent).to.equal('Hello');

    // correct span node
    var span = el.firstChild;
    expect(span.nodeName).to.equal('SPAN');
    expect(span.attributes.length, 'more than 1 attribute').to.equal(0);
    expect(span.children.length, 'more than 1 child').to.equal(0);
    expect(span.parentElement).to.equal(el);
    expect(span.textContent).to.equal('Hello');
  });

  it('should substitute in script tags', function() {
    var el = html`<script>x = ${max}</script>`;

    // correct script node
    expect(el.nodeName).to.equal('SCRIPT');
    expect(el.attributes.length).to.equal(0);
    expect(el.children.length).to.equal(0);
    expect(el.parentElement).to.be.null;
    expect(el.textContent).to.equal('x = 99');
  });

  it('should substitute from a variable that is a node', function() {
  	var node = html`<p>test</p>`;
    var el = html`<div>test${node}</div>`;

    // correct node
    expect(el.nodeName).to.equal('DIV');

    expect(el.innerHTML.toLowerString()).to.equal('test<p>test</p>');
  });
});
