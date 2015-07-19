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
  this.resource('test', { path: '/test/:test_id' }, function() {
    this.route('start');
  });
});

App.ApplicationAdapter = DS.RESTAdapter.extend({
  namespace: 'api'
});


App.TestRoute = Ember.Route.extend({
  model: function(params) {
    return $.getJSON('/api/test-info/' + params.test_id);
  }
});

App.CompanyModel = DS.Model.extend({
  name: DS.attr('string'),
  logoUrl: DS.attr('string'),
  website: DS.attr('string')
});

App.TestModel = DS.Model.extend({
  company: DS.belongsTo('company'),
  name: DS.attr('string'),
  description: DS.attr('string'),
  instructions: DS.attr('string'),
  numberOfQuestions: DS.attr('questions'),
  duration: DS.attr('duration')
});

App.TestIndexController = Ember.Controller.extend({
  duration: function() {
    var duration = this.get('model.duration');
    return moment.duration(duration[0], duration[1]).format('h:mm');
  }.property('model.duration')
});