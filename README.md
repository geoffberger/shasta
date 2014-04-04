#Shasta

A small utility library built on top of Backbone that handles routing and rendering. More specifically, provides the
ability to define routes to a view, while properly cleaning up left over views.

##Example

Here's the simplest example usage:

    // Create a manager
    var manager = new Shasta.Manager();
    // This is saying we are registering a region with the name content that lives in the DOM as #content
    manager.addRegion('content', '#content');
    // This is saying we have a url with the name item that routes to #item/:id that uses Backbone.View as its view.
    // Its also specifying that this route, when called, will be injected in content
    manager.addUrl('item', 'item/:id', Backbone.View, {
      region: 'content'
    });
    // This executes all the supplied routes and listens. All its really doing is calling Backbone.history.start().
    manager.run();

The above example contains 1 region and 1 route. Although a very simple example, it could be used when provided a list
of items, each with a unique id. When selecting each item, the content area that contains the item, will properly be
removed and the new item will be appended.

##Installation

Make sure node is installed. Got it? Good. Install bower and run both an npm and bower install:

    npm install -g bower; npm install; bower install

To run tests, do the following:

    npm test

This will start venus (a test runner) with phantomjs. If you want to run the tests in the browser, do the following:

    node node_modules/venus/bin/venus run -t test

The basic tests are in place now and more need to be written.

##API

Coming soon.
