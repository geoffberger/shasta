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
    var el, view = ViewFactories.pageView();
    ManagerFactories.pageManager(view.View);
    Shasta.Dispatcher.trigger('route-to:page');

    el = $('#content > div');
    expect(el).to.have.id(view.attrs.id);
    expect(el.find(view.tagName)).to.exist;
    expect(el.find(view.tagName)).to.have.text(view.text);
  });

  it('should add a region when adding a url is out of order with region', function() {
    var el, view = ViewFactories.pageView();
    ManagerFactories.outOfOrderManager(view.View);
    Shasta.Dispatcher.trigger('route-to:bb');

    el = $('#content > div');
    expect(el.find(view.tagName)).to.have.text(view.text);
  });

  it('should trigger between two different regions', sinon.test(function() {
    var el,
        homeView = ViewFactories.homeView(),
        aboutView = ViewFactories.aboutView(),
        homeRemoveSpy = this.spy(homeView.View.prototype, 'remove');

    ManagerFactories.multiPageManager(homeView.View, aboutView.View);

    // trigger the route and verify that things are appearing in the dom as expected
    Shasta.Dispatcher.trigger('route-to:home');
    el = $('#content > div');
    expect(el).to.have.id(homeView.attrs.id);
    expect(el.find(homeView.tagName)).to.exist;
    expect(el.find(homeView.tagName)).to.have.text(homeView.text);

    // trigger the second route to make sure that the what appears is what is epxcted
    Shasta.Dispatcher.trigger('route-to:about');

    // we want to make sure that the previous view has been removed. to do so, we make sure that remove is called in
    // some capacity, which indicates that Backbone will do whatever it does so that all the remaining pieces have been
    // properly garbage collected and what not.
    sinon.assert.called(homeRemoveSpy);

    // do the usual assertions to make sure we are expecting the new view
    el = $('#content > ' + aboutView.attrs.tagName);
    expect(el).to.have.class(aboutView.attrs.className);
    expect(el.find(aboutView.tagName)).to.exist;
    expect(el.find(aboutView.tagName)).to.have.text(aboutView.text);
  }));

  it('should be sending a teardown event to the current view', sinon.test(function() {
    var el,
        view = ViewFactories.pageView(),
        triggerSpy = this.spy(view.View.prototype, 'trigger');

    ManagerFactories.pageManager(view.View);
    Shasta.Dispatcher.trigger('route-to:page');
    sinon.assert.called(triggerSpy);
    sinon.assert.calledWithExactly(triggerSpy, 'teardown');
  }));
});
