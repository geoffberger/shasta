(function (root, factory) {
  if (typeof define === 'function') {
    define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
      return factory($, _, Backbone);
    });
  } else if (typeof exports === 'object') {
    module.exports = factory($, _, Backbone);
  } else {
    root.Shasta = factory(root.jQuery, root._, root.Backbone);
  }
}(this, function ($, _, Backbone) {
  var Shasta = {}, Dispatcher = {}, Manager, Region, Assembler;

  /**
   * Specify our own events for Shasta so they can be interalized and not collide with any existing events. It also
   * allows events to be specific to this usage and not mixed up with any global Backbone events.
   * @type {Backbone.Events}
   */
  Dispatcher = Shasta.Dispatcher = _.extend({}, Backbone.Events);

  /**
   * Intended router used within Shasta. More specifically, it handles all routing events. Borrowing from a similar
   * convention in Backbone.Router, this route namespaces events with `route-to` and `route`. Both events are
   * associated to the name of the url. You can think of `route-to` as being the trigger for updating the url while
   * `route` is used for replacing the content. Here is the responsibility of both:
   *
   * - route-to: The action used as a setup of sorts. Shasta.Router listens for this event and will navigate to the
   * name of the route passed in from the trigger. The trigger can be called directly from Shasta.Dispatcher or from
   * the `redirect` method on the event.
   * - route: The action used to perform the actual in page routing. Once `route-to` has been triggered, this will then
   * be triggered. This can be used for replacing content or just in general listening.
   *
   * Here's some example usage in pseudo code of sorts:
   *
   * @example
   * dispatcher.on('route:foo', function() {
   *   console.log('at this point, the url has changed');
   * });
   *
   * dispatcher.on('route-to:foo', function() {
   *   console.log('this indicates to the us that something (probably a view), wants to go to a name of a url');
   * })
   */
  Shasta.Router = Backbone.Router.extend({
    dispatcher: Dispatcher,

    paramRE: /(\(\?)?:\w+/g,

    optionalParamRE: /\((.*?)\)/g,

    addUrl: function(url, name, callback) {
      this.route(url, name, callback);
      this.dispatcher.on('route:' + name, callback);
      this.dispatcher.on('route-to:' + name, _.bind(this.listenForRouteTo, this, url, name));
    },

    remapParts: function(parts) {
      var matchingParts = _.clone(parts);

      _.each(parts, function(value, name) {
        matchingParts[':' + name] = value;
      });

      return matchingParts;
    },

    reverseLookup: function(route, parts) {
      parts = parts || {};
      parts = this.remapParts(parts);

      var matchFound, replaceParamFn, replaceOptionalParamFn;

      replaceParamFn = function(match) {
        matchFound = false;

        var result = '';

        if (parts[match]) {
          result = parts[match];
          matchFound = true;
        }

        return result;
      };

      replaceOptionalParamFn = function(match) {
        var result = match.replace(this.paramRE, replaceParamFn);

        if (matchFound) {
          result = result.replace(/\(|\)/g, '');
        } else {
          result = '';
        }

        return result;
      };

      return route
        .replace(this.optionalParamRE, _.bind(replaceOptionalParamFn, this))
        .replace(this.paramRE, replaceParamFn);
    },

    listenForRouteTo: function(route, name, parts, options) {
      var url = this.reverseLookup(route, parts);
      // TODO: use the proper ordering based off of the URL
      this.navigate(url, options);
      this.dispatcher.trigger.apply(this.dispatcher, ['route:' + name].concat(_.values(parts)));
    }
  });

  /**
   * This create a number of properties that can be utilitized by the view to talk to the manager/router. It provides
   * a way of easy access although Shasta.Dispatcher is accessible if the usage wants to be more explicit. By default,
   * its added to Backbone.View, but this can also be added as a mixin to Backbone.View to be more explicit.
   * @type {Object}
   */
  Shasta.ViewMixin = {
    dispatcher: Dispatcher,

    redirect: function(name, parts) {
      this.dispatcher.trigger('route-to:' + name, parts);
    }
  };

  _.extend(Backbone.View.prototype, Shasta.ViewMixin);

  /**
   * Create our own version of Shasta.View in case the user wants to be more specific about what is being exposed.
   * @type {Backbone.View}
   */
  Shasta.View = Backbone.View.extend({});

  /**
   * Responsible for holding the state of the region. More specifically, it will handle the dom manipulation or any dom
   * related functionality/operations.
   * @param {string} name a unique name to identify with the region
   * @param {string} el the selector representing the region
   */
  Region = Shasta.Region = function(name, el) {
    this.name = name;
    this.el = el;
    this.$el = $(el);
  };

  Region.prototype.hasRegion = function() {
    return this.name && this.el;
  };

  Region.prototype.inject = function(el) {
    if (this.hasRegion()) {
      this.$el.html(el);
    }
  };

  /**
   * Responsible for creating the view and handing the actual building of the part of the page that is changing.
   * @param {Backbone.View} view the created that will later be injected into the region
   * @param {Shasta.Region} region used to interact with the region defined by the manager
   * @param {object} options variables used to make things more flexible
   * @param {string} options.method the method to be called on when the view is rendered. Defaults to render.
   * @param {string} region the name of region, used for instantiation - use the region object instead
   */
  Assembler = Shasta.Assembler = function(view, region, options) {
    this.view = view;
    this.region = region;
    this.options = options;
  };

  Assembler.prototype.callRender = function() {
    return _.bind(this.render, this);
  };

  Assembler.prototype.createView = function(params) {
    var renderedView,
        method = this.getMethod(),
        instance = this.createInstance();

    if (instance[method]) {
      this.addViewToRegion(instance, params, method);
      return instance;
    } else {
      throw new Error('No method with name ' + method + ' was found at ' + this.view.toString());
    }
  };

  Assembler.prototype.setRegion = function(region) {
    this.region = region;
    return this;
  };

  Assembler.prototype.getMethod = function() {
    return this.options.method || 'render';
  };

  Assembler.prototype.getRegionName = function() {
    return this.options.region;
  };

  Assembler.prototype.createInstance = function() {
    var args = this.options.constructorArgs, instance;

    if (_.isEmpty(this.view.prototype)) {
      instance = this.view.apply(this, args);
    } else {
      instance = new this.view(args);
    }

    return _.extend({}, instance, {manager: this});
  };

  Assembler.prototype.addViewToRegion = function(instance, params, method) {
    var renderedView = this.renderView(instance, params, method);

    // We would have a renderedView if the instance itself is being returned.
    // This wouldn't occur if there was some sort of async operation has to
    // happen in order for the render to occur. In that case, we let the view
    // determine when it should perform the render in the form of an event
    // called `shasta:render`.
    if (renderedView) {
      this.region.inject(renderedView.el);
    } else {
      instance.on('shasta:render', function(method) {
        var view = this.renderView(instance, params, method);
        this.region.inject(view.el);
      }, this);
    }
  };

  Assembler.prototype.renderView = function(instance, params, method) {
    method = method || 'render';
    return instance[method].apply(instance, params);
  };

  /**
   * Responsible for specifying the urls and regions within a given instance. Although they don't have to be used
   * together, the biggest benefit you get out of manager is marrying a route to a given region, such that the region
   * will be properly cleaned up and not leave around any ghost elements or whatever. The usage and implementation is
   * similar to what you may see in more traditional frameworks when specifying a url, i.e. django. A url is added like
   * so:
   *
   * @example
   * Manager.addUrl('page/:page', factoryOrView, options);
   *
   * A region is created in a very similar way:
   *
   * @example
   * Manager.addRegion('foo', '#foo');
   *
   * In case you need to extend Shasta.Router or provide your own custom router implementation, You can provide your
   * own router.
   * @param {Backbone.Router} router The router used within the manager.
   */
  Manager = Shasta.Manager = function(router) {
    this.router = router || this.createDefaultRouter();
  };

  Manager.prototype.regions = {};

  Manager.prototype.assemblers = {};

  Manager.prototype.currentViews = {};

  /**
   * Wrapper for history.start and anything else that may be added later.
   * @param  {object} options used for options passed along to history.start
   */
  Manager.prototype.run = function(options) {
    Backbone.history.start(options);
    return this;
  };

  Manager.prototype.getRegion = function(name) {
    var region = this.regions[name];

    if (!region) {
      this.addRegion(name, null).getRegion(name);
    }

    return region;
  };

  Manager.prototype.addRegion = function(name, el) {
    this.regions[name] = new Shasta.Region(name, el);
    return this;
  };

  Manager.prototype.createDefaultRouter = function(Router) {
    return new Shasta.Router();
  };

  Manager.prototype.getCallback = function(name) {
    return _.bind(this.executedCallback, this, name);
  };

  Manager.prototype.executedCallback = function(name) {
    var params, assembler, regionName, view;

    params = _.toArray(arguments).splice(1);
    assembler = this.assemblers[name];
    regionName = assembler.getRegionName();

    assembler.setRegion(this.regions[regionName]);

    this.cleanUpExistingViews(regionName);
    view = assembler.createView(params);
    this.setCurrentView(regionName, view);
  };

  Manager.prototype.cleanUpExistingViews = function(region) {
    var currentView;

    if (region && (currentView = this.currentViews[region])) {
      currentView.trigger('teardown');
      currentView.remove();
    }
  };

  Manager.prototype.setCurrentView = function(region, instance) {
    this.currentViews[region] = instance;
  };

  Manager.prototype.addAssembler = function(name, assembler) {
    this.assemblers[name] = assembler;
  };

  Manager.prototype.createAssembler = function(view, options) {
    var region = this.getRegion(options.region);
    return new Shasta.Assembler(view, region, options);
  };

  Manager.prototype.addUrl = function(name, url, view, options) {
    if (view) {
      this.addAssembler(name, this.createAssembler(view, options))
    }

    this.router.addUrl(url, name, this.getCallback(name));
  };

  return Shasta;
}));
