window.App = Ember.Application.create({
  LOG_TRANSITIONS: true,
  LOG_ACTIVE_GENERATION: true,
  LOG_VIEW_LOOKUPS: true,
  rootElement: '#ember-app',
  // LOG_TRANSITIONS_INTERNAL: true,
  // LOG_RESOLVER: true
});

App.Router.reopen({
  location: 'history'
});

App.Router.map(function() {
  this.route('test', { path: '/test/:test_id' });
});

App.ApplicationAdapter = DS.RESTAdapter.extend({
  namespace: 'api'
});


App.TestRoute = Ember.Route.extend({
  model: function(params) {
    return {id: params.test_id};
  }
});