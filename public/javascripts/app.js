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
  this.resource('testSession', { path: '/test-session/:testSession_id' });
});

App.ApplicationAdapter = DS.RESTAdapter.extend({
  namespace: 'api'
});

// ---------------------------------- Routes ----------------------------------

App.TestRoute = Ember.Route.extend({
  model: function(params) {
    return $.getJSON('/api/test-info/' + params.test_id);
  }
});

App.TestSessionRoute = Ember.Route.extend({
  model: function(params) {
    return $.getJSON('/api/test-session/' + params.testSession_id);
  },
  serialize: function(model) {
    return { testSession_id: model._id };
  }
});

// ------------------------------- Controllers --------------------------------

App.TestIndexController = Ember.Controller.extend({
  duration: function() {
    var duration = this.get('model.duration');
    return moment.duration(duration[0], duration[1]).format('h:mm');
  }.property('model.duration')
});

App.TestStartController = Ember.Controller.extend({
  firstName: null,
  lastName: null,
  email: null,
  actions: {
    start: function() {
      $.post('/api/start-test', {
        firstName: this.get('firstName'),
        lastName: this.get('lastName'),
        email: this.get('email'),
        testInfo: this.get('model'),
        testId: this.get('model.testId'),
        startTime: moment().format()
      }, function(data, status) {
        this.transitionTo('testSession', data);
      }.bind(this)).fail(function(err) {
        // TODO
      }.bind(this));
    }
  }
});

// -------------------------------- Components --------------------------------
App.MarkdownComponentComponent = Ember.Component.extend({
  markdown: '',
  didInsertElement: function() {
    var markdown = this.get('markdown')
    var html = marked(markdown);
    this.$().html(html);
  }
});