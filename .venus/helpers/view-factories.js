var ViewFactories = (function() {
  function createView(tagName, text, attrs) {
    var View = Backbone.View.extend(_.extend({
      render: function() {
        this.el.innerHTML = '<' + tagName + '>' + text + '</' + tagName + '>';
        return this;
      }
    }, attrs));

    return {
      tagName: tagName,
      text: text,
      attrs: attrs,
      View: View
    };
  }

  function pageView() {
    return createView('h1', 'What up!', {id: 'iono'});
  }

  function homeView() {
    return createView('h1', 'Bobby Bottleservice', {id: 'home'});
  }

  function aboutView(argument) {
    return createView('h2', 'About Bobby', {tagName: 'section', className: 'about'});
  }

  return {
    createView: createView,
    pageView: pageView,
    homeView: homeView,
    aboutView: aboutView
  };
}());