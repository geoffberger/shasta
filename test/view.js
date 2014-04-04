/* globals Shasta, sinon */

/**
 * @venus-library mocha
 * @venus-include-group main
 */
describe('Shasta.View', function() {
  beforeEach(function() {
    this.view = new Backbone.View();
  });

  it('should have a dispatcher property', function() {
    expect(this.view.dispatcher).to.exist;
  });

  it('should exist as a stand alone view', function() {
    expect(Shasta.View).to.exist;
  });

  it('should a redirect property', function() {
    expect(this.view.redirect).to.exist;
    expect(this.view.redirect).to.be.a('function');
  });

  it('should notify subscribers that a redirect will occur', sinon.test(function() {
    var name = 'foo', params = {name: 'fiona'},
    routeSpy = sinon.spy();

    Shasta.Dispatcher.on('route-to:' + name, routeSpy);
    this.view.redirect(name, params);
    sinon.assert.called(routeSpy);
    sinon.assert.calledOnce(routeSpy);
    sinon.assert.calledWith(routeSpy, params);
  }));
});