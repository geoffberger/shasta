/* globals Shasta */

var ManagerFactories = (function() {
  function createManager(fn) {
    var manager = new Shasta.Manager();
    fn(manager);
    return manager.run();
  }

  function pageManager(view) {
    createManager(function(manager) {
      manager.addUrl('page', 'some-page', view, {
        region: 'content'
      });
      manager.addRegion('content', '#content');
    });
  }

  function outOfOrderManager(view) {
    createManager(function(manager) {
      manager.addUrl('bb', 'bobby', view, {
        region: 'content'
      });
      manager.addRegion('content', '#content');
    });
  }

  function multiPageManager(homeView, aboutView) {
    createManager(function(manager) {
      manager.addRegion('content', '#content');

      manager.addUrl('home', 'homepage', homeView, {
        region: 'content'
      });

      manager.addUrl('about', 'about', aboutView, {
        region: 'content'
      });
    });
  }

  return {
    createManager: createManager,
    pageManager: pageManager,
    outOfOrderManager: outOfOrderManager,
    multiPageManager: multiPageManager
  };
}());