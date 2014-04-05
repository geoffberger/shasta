/* globals Shasta, ManagerFactories, ViewFactories, sinon */

/**
 * @venus-library mocha-chai
 * @venus-fixture fixtures/layout.html
 * @venus-include-group main
 */
describe('Shasta.Manager', function() {
  function viewFactory(tagName, text, attrs) {
    var View = Backbone.View.extend(_.extend({
      render: function() {
        this.el.innerHTML = '<' + tagName + '>' + text + '</' + tagName + '>';
        return this;
      }
    }, attrs));

    return View;
  }

  function createManager(fn) {
    var manager = new Shasta.Manager();
    fn(manager);
    return manager.run();
  }

  afterEach(function() {
    if (Backbone.History.started) {
      Backbone.history.stop();
    }
  });

  it('should be able to take in an optional Router', function() {
    var customRouter = Shasta.Router.extend({}),
        manager = new Shasta.Manager(customRouter);
    expect(manager.router).to.exist;
  });

  it('should add a region when the route-to trigger occurs', function() {
    var view = ViewFactories.pageView();
    ManagerFactories.pageManager(view.View);
    Shasta.Dispatcher.trigger('route-to:page');

    var el = $('#content > div');
    expect(el).to.have.id(view.attrs.id);
    expect(el.find(view.tagName)).to.exist;
    expect(el.find(view.tagName)).to.have.text(view.text);
  });

  it('should add a region when adding a url is out of order with region', function() {
    var view = ViewFactories.pageView();
    ManagerFactories.outOfOrderManager(view.View);
    Shasta.Dispatcher.trigger('route-to:bb');

    var el = $('#content > div');
    expect(el.find(view.tagName)).to.have.text(view.text);
  });

  it('should trigger between two different regions', sinon.test(function() {
    var el,
        homeView = ViewFactories.homeView(),
        aboutView = ViewFactories.aboutView(),
        homeRemoveSpy = this.spy(homeView.View.prototype, 'remove');

    ManagerFactories.multiPageManager(homeView.View, aboutView.View);

    Shasta.Dispatcher.trigger('route-to:home');
    el = $('#content > div');
    expect(el).to.have.id(homeView.attrs.id);
    expect(el.find(homeView.tagName)).to.exist;
    expect(el.find(homeView.tagName)).to.have.text(homeView.text);

    Shasta.Dispatcher.trigger('route-to:about');

    sinon.assert.called(homeRemoveSpy);

    el = $('#content > ' + aboutView.attrs.tagName);
    expect(el).to.have.class(aboutView.attrs.className);
    expect(el.find(aboutView.tagName)).to.exist;
    expect(el.find(aboutView.tagName)).to.have.text(aboutView.text);
  }));
});
