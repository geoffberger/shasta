/* globals Shasta, sinon */

/**
 * @venus-library mocha
 * @venus-include-group main
 */
describe('Shasta.Router', function() {
  function run(sandbox, args) {
    args = args || {};
    _.defaults(args, {
      name: 'foo',
      route: 'some-path',
      callback: function() {},
      options: {}
    });

    sandbox.manager.addUrl(args.name, args.route, args.callback, args.options);
    sandbox.manager.run();
  }

  beforeEach(function() {
    this.router = new Shasta.Router();
    this.manager = new Shasta.Manager(this.router);
  });

  afterEach(function() {
    if (Backbone.History.started) {
      Backbone.history.stop();
    }
  });

  it('should add a url', sinon.test(function() {
    var addUrlSpy = this.spy(this.router, 'addUrl');
    run(this);

    sinon.assert.called(addUrlSpy);
    sinon.assert.calledWith(addUrlSpy, 'some-path', 'foo', sinon.match.any);
  }));

  it('should trigger a route with no parameters', sinon.test(function() {
    var viewSpy = this.spy(Backbone, 'View');

    run(this, {
      callback: viewSpy
    });

    this.router.dispatcher.trigger('route:foo');
    sinon.assert.called(viewSpy);
    sinon.assert.calledWith(viewSpy)
  }));

  it('should trigger a route-to with one parameter', sinon.test(function() {
    var renderSpy = this.spy(Backbone.View.prototype, 'render'),
        name = 'leland', callbackSpy = this.spy();

    this.router.dispatcher.on('route:foo', callbackSpy);

    run(this, {
      route: 'some-path/:name',
      callback: Backbone.View
    });

    this.router.dispatcher.trigger('route-to:foo', {name: name});

    // Make sure our subscriber to route:foo is being fired off from route-to:foo
    sinon.assert.called(callbackSpy);
    sinon.assert.calledWith(callbackSpy, name);
    // Make sure that our render method is getting called. This might make more sense in Manager, it helps enforce that
    // Router is working as intended.
    sinon.assert.called(Backbone.View.prototype.render);
    sinon.assert.calledWithExactly(Backbone.View.prototype.render, name);
  }));

  it('should trigger a route-to with two parameter', sinon.test(function() {
    var name = 'leland', color = 'brown-cow',
        renderSpy = this.spy(Backbone.View.prototype, 'render');

    run(this, {
      name: 'elliott',
      route: 'animal/:name/color/:color',
      callback: Backbone.View
    });

    this.router.dispatcher.trigger('route-to:elliott', {name: name, color: color});

    sinon.assert.called(renderSpy);
    sinon.assert.calledWithExactly(renderSpy, name, color);
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
