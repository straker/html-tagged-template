describe('HTML parser', function() {

  it('should create a text node', function() {
    var el = html`foobar`;

    // correct node
    expect(el.nodeType).to.equal(3);
    expect(el.nodeValue).to.equal('foobar');

    // no extraneous side-effects
    expect(el.parentElement).to.be.null;
  });

  it('should create a single node', function() {
    var el = html`<span></span>`;

    // correct node
    expect(el.nodeName).to.equal('SPAN');

    // no extraneous side-effects
    expect(el.attributes.length, 'more than 1 attribute').to.equal(0);
    expect(el.children.length, 'more than 1 child').to.equal(0);
    expect(el.parentElement).to.be.null;
    expect(el.textContent).to.be.empty;
  });

  it('should create a single node when no closing tag is provided', function() {
    var el = html`<span>`;

    // correct node
    expect(el.nodeName).to.equal('SPAN');

    // no extraneous side-effects
    expect(el.attributes.length, 'more than 1 attribute').to.equal(0);
    expect(el.children.length, 'more than 1 child').to.equal(0);
    expect(el.parentElement).to.be.null;
    expect(el.textContent).to.be.empty;
  });

  it('should create a single node with attributes', function() {
    var el = html`<input type="number" min="0" max="99" name="number" id="number" class="number-input" disabled />`;

    // correct node
    expect(el.nodeName).to.equal('INPUT');

    // correct attributes
    expect(el.attributes.length).to.equal(7);
    expect(el.type).to.equal('number');
    expect(el.min).to.equal('0');
    expect(el.max).to.equal('99');
    expect(el.name).to.equal('number');
    expect(el.id).to.equal('number');
    expect(el.className).to.equal('number-input');
    expect(el.disabled).to.equal(true);

    // no extraneous side-effects
    expect(el.children.length).to.equal(0);
    expect(el.parentElement).to.be.null;
    expect(el.textContent).to.be.empty;
  });

  it('should create a single node with children', function() {
    var el = html`<div class="container"><div class="row"><div class="col"><div>Hello</div></div></div></div>`;

    // correct container node
    expect(el.nodeName).to.equal('DIV');
    expect(el.attributes.length).to.equal(1);
    expect(el.className).to.equal('container');
    expect(el.children.length).to.equal(1);
    expect(el.parentElement).to.be.null;
    expect(el.textContent).to.equal('Hello');

    // correct row node
    var row = el.firstChild;
    expect(row.nodeName).to.equal('DIV');
    expect(row.attributes.length).to.equal(1);
    expect(row.className).to.equal('row');
    expect(row.children.length).to.equal(1);
    expect(row.parentElement).to.equal(el);
    expect(row.textContent).to.equal('Hello');

    // correct col node
    var col = row.firstChild;
    expect(col.nodeName).to.equal('DIV');
    expect(col.attributes.length).to.equal(1);
    expect(col.className).to.equal('col');
    expect(col.children.length).to.equal(1);
    expect(col.parentElement).to.equal(row);
    expect(col.textContent).to.equal('Hello');

    // correct leaf node
    var leaf = col.firstChild;
    expect(leaf.nodeName).to.equal('DIV');
    expect(leaf.attributes.length).to.equal(0);
    expect(leaf.children.length).to.equal(0);
    expect(leaf.parentElement).to.equal(col);
    expect(leaf.textContent).to.equal('Hello');
  });

  it('should create sibling nodes', function() {
    var nodes = html`<tr></tr><tr></tr>`;

    // correct node
    expect(nodes).to.be.instanceof(Array);
    expect(nodes.length).to.equal(2);

    // correct first child
    var tr = nodes[0];
    expect(tr.nodeName).to.equal('TR');
    expect(tr.attributes.length, 'more than 1 attribute').to.equal(0);
    expect(tr.children.length, 'more than 1 child').to.equal(0);
    expect(tr.parentElement).to.be.null;
    expect(tr.textContent).to.be.empty;

    // correct second child
    var tr2 = nodes[0];
    expect(tr2.nodeName).to.equal('TR');
    expect(tr2.attributes.length, 'more than 1 attribute').to.equal(0);
    expect(tr2.children.length, 'more than 1 child').to.equal(0);
    expect(tr2.parentElement).to.be.null;
    expect(tr2.textContent).to.be.empty;
  });

  it('should execute a script tag', function() {
    var el = html`<script>foo = "bar";</script>`;
    document.body.appendChild(el);

    // correct node
    expect(el.nodeName).to.equal('SCRIPT');
    expect(el.attributes.length).to.equal(0);
    expect(el.children.length).to.equal(0);
    expect(el.textContent).to.equal('foo = "bar";');

    // script was executed
    expect(foo).to.equal('bar');
  });
});