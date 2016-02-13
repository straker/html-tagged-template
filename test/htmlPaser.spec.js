// var webdriver = require("selenium-webdriver");

// set up selenium server
// before(function() {
//   if (process.env.SAUCE_USERNAME != undefined) {
//     this.browser = new webdriver.Builder()
//     .usingServer('http://'+ process.env.SAUCE_USERNAME+':'+process.env.SAUCE_ACCESS_KEY+'@ondemand.saucelabs.com:80/wd/hub')
//     .withCapabilities({
//       'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
//       build: process.env.TRAVIS_BUILD_NUMBER,
//       username: process.env.SAUCE_USERNAME,
//       accessKey: process.env.SAUCE_ACCESS_KEY,
//       browserName: "chrome"
//     }).build();
//   } else {
//     this.browser = new webdriver.Builder()
//     .withCapabilities({
//       browserName: "chrome"
//     }).build();
//   }
// });

// after(function() {
//   // return this.browser.quit();
// });

describe('HTML parser', function() {

  // beforeEach(function() {
  //   return this.browser.get("http://localhost:8080/page/index.html");
  // });

  it('should create a single node with attributes', function(done) {
    // this.browser.executeScript('return html`<input>`').then(function() {
    //   console.log('arguments:', arguments);

    //   var el = arguments[0];

    //   done();
    // });


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

    done();
  });

  it('should create a single node with children', function(done) {
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

    done();
  });

});