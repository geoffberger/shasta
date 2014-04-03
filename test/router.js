/* globals Shasta, sinon */

/**
 * @venus-library mocha
 * @venus-include-group main
 */
describe('Shasta.Router', function() {
  function run(sandbox, route, callback, options) {
    route = route || 'some-path';
    callback = callback || Backbone.View;
    options = options || {};
    _.defaults(options || {}, {name: 'foo'});

    sandbox.manager.addUrl(route, callback, options);
    sandbox.manager.run();
  }

  beforeEach(function() {
    this.router = new Shasta.Router();
    this.manager = new Shasta.Manager(this.router);
  });

  afterEach(function() {
    Backbone.history.stop();
  });

  it('should add a url', sinon.test(function() {
    var addUrlSpy = this.spy(this.router, 'addUrl');
    run(this);

    sinon.assert.called(addUrlSpy);
    sinon.assert.calledWith(addUrlSpy, 'some-path', 'foo', sinon.match.any);
  }));

  it('should trigger a route with no parameters', sinon.test(function() {
    var viewSpy = this.spy(Backbone, 'View');
    run(this, 'some-path', viewSpy);

    this.router.dispatcher.trigger('route:foo');
    sinon.assert.called(viewSpy);
    sinon.assert.calledWith(viewSpy)
  }));

  it('should trigger a route-to with one parameter', sinon.test(function() {
    var callbackSpy = this.spy(),
        navigateSpy = this.spy(this.router, 'navigate');

    this.router.dispatcher.on('route:foo', callbackSpy);
    run(this, 'some-path/:name');

    this.router.dispatcher.trigger('route-to:foo', {name: 'leland'});
    sinon.assert.called(navigateSpy);
    sinon.assert.calledWith(navigateSpy, 'some-path/leland');
    sinon.assert.calledWith(callbackSpy, 'leland');
  }));

  it('should create a url with no parameters', function() {
    var route = 'some-path',
        url = this.router.reverseLookup(route, {});
    expect(url).to.equal(route);
  });

  it('should create a url with one required parameter', function() {
    var route = 'some-path/:id',
        id = 12345,
        url = this.router.reverseLookup(route, {id: id});

    expect(url).to.equal('some-path/' + id);
  });

  it('should create a url with two required parameters', function() {
    var route = 'some-path/:id/name/:name',
        id = 12345, name = 'leland',
        url = this.router.reverseLookup(route, {id: id, name: name});

    expect(url).to.equal('some-path/' + id + '/name/' + name);
  });

  it('should create a url with one required parameter and one optional parameter', function() {
    var route = 'some-path/:id(/:name)',
        id = 12345, name = 'leland',
        url = this.router.reverseLookup(route, {id: id, name: name});

    expect(url).to.equal('some-path/' + id + '/' + name);
  });

  it('should create a url with one required parameter and one optional parameter not provided', function() {
    var route = 'some-path/:id(/:name)',
        id = 12345,
        url = this.router.reverseLookup(route, {id: id});

    expect(url).to.equal('some-path/' + id);
  });

  it('should create a url where the required parameter has not been supplied', function() {
    var route = 'some-path/:id(/:name)',
        url = this.router.reverseLookup(route, {id: null});

    expect(url).to.equal('some-path/');
  });
});
