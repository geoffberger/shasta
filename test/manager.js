/* globals Shasta, sinon */

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
    var tagName = 'h1', text = 'What up!', id = 'iono',
        view = viewFactory(tagName, text, {id: id});

    createManager(function(manager) {
      manager.addUrl('nuts', 'peanuts', view, {
        region: 'content'
      });
      manager.addRegion('content', '#content');
    });

    Shasta.Dispatcher.trigger('route-to:nuts');

    var el = $('#content > div');
    expect(el).to.have.id(id);
    expect(el.find(tagName)).to.exist;
    expect(el.find(tagName)).to.have.text(text);
  });

  it('should add a region when adding a url is out of order with region', function() {
    var tagName = 'h1', text = 'Dolphinately', view = viewFactory(tagName, text);

    createManager(function(manager) {
      manager.addUrl('bb', 'bobby', view, {
        region: 'content'
      });
      manager.addRegion('content', '#content');
    });

    Shasta.Dispatcher.trigger('route-to:bb');

    var el = $('#content > div');
    expect(el.find(tagName)).to.have.text(text);
  });

  it('should trigger between two different regions', sinon.test(function() {
    var home, homeView, about, aboutView, el;

    home = {
      tagName: 'h1',
      text: 'Bobby Bottleservice',
      attrs: {
        id: 'home'
      }
    };

    homeView = viewFactory(home.tagName, home.text, home.attrs);

    var removeSpy = this.spy(homeView.prototype, 'remove');

    about = {
      tagName: 'h2',
      text: 'About Bobby',
      attrs: {
        tagName: 'section',
        className: 'about'
      }
    };

    aboutView = viewFactory(about.tagName, about.text, about.attrs);

    var manager = createManager(function(manager) {
      manager.addRegion('content', '#content');

      manager.addUrl('home', 'homepage', homeView, {
        region: 'content'
      });

      manager.addUrl('about', 'about', aboutView, {
        region: 'content'
      });
    });

    Shasta.Dispatcher.trigger('route-to:home');
    el = $('#content > div');
    expect(el).to.have.id(home.attrs.id);
    expect(el.find(home.tagName)).to.exist;
    expect(el.find(home.tagName)).to.have.text(home.text);

    Shasta.Dispatcher.trigger('route-to:about');
    el = $('#content > ' + about.attrs.tagName);
    expect(el).to.have.class(about.attrs.className);
    expect(el.find(about.tagName)).to.exist;
    expect(el.find(about.tagName)).to.have.text(about.text);
  }));
});
