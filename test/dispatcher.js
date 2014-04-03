/* globals Shasta */

/**
 * @venus-library mocha
 * @venus-include-group main
 */
describe('Shasta.Dispatcher', function() {
  it('should exist as Dispatcher', function() {
    expect(Shasta.Dispatcher).to.exist;
  });

  it('should extend Backbone.Events', function() {
    var dispatcherFns = _.functions(Shasta.Dispatcher),
        eventsFns = _.functions(Backbone.Events),
        fnsLength = eventsFns.length,
        intersection = _.intersection(dispatcherFns, eventsFns);

    expect(intersection.length).to.equal(fnsLength);
  });
});
