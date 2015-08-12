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
    this.resource('editor');
  });
  this.resource('testSession', { path: '/test-session/:testSession_id' });
  this.resource('testComplete', { path: '/test-complete/:testComplete_id' });
});

App.ApplicationAdapter = DS.RESTAdapter.extend({
  namespace: 'api'
});

marked.setOptions({
  highlight: function (code) {
    return hljs.highlightAuto(code).value;
  },
  smartypants: true,
});

function sendJSON(url, obj) {
  // Wrap because jQuery's promises are weird
  return new Promise(function (resolve, reject) {
    $.ajax({
      type: "POST",
      url: url,
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(obj),
      success: function(data, status) {
        resolve(data);
      }
    }).fail(function(err) {
      reject(err);
    });
  });
}

function clearSelection() {
  if ( document.selection ) {
    document.selection.empty();
  } else if ( window.getSelection ) {
    window.getSelection().removeAllRanges();
  }
}

// ---------------------------------- Routes ----------------------------------

App.TestRoute = Ember.Route.extend({
  model: function(params) {
    return $.getJSON('/api/test-info/' + params.test_id);
  },
  renderTemplate: function(controller, model) {
    this.render();
    $(document).attr('title', "Test - " + model.name);
  }
});

App.TestSessionRoute = Ember.Route.extend({
  model: function(params) {
    return $.getJSON('/api/test-session/' + params.testSession_id);
  },
  serialize: function(model) {
    return { testSession_id: model._id };
  },
  renderTemplate: function(controller, model) {
    this.render();
    $(document).attr('title', "Test Session - " + model.testInfo.name);
  }
});

App.TestCompleteRoute = Ember.Route.extend({
  model: function(params) {
    return null;
  }
});

App.EditorRoute = Ember.Route.extend({
  model: function(params) {
    var test = this.modelFor("test");
    return $.getJSON('/api/test/' + test.testId);
  },
  renderTemplate: function(controller, model) {
    this.render();
    $(document).attr('title', "Editor - " + model.info.name);
  }
});

// ------------------------------- Controllers --------------------------------

App.TestIndexController = Ember.ObjectController.extend({
  duration: function() {
    var duration = this.get('model.duration');
    return moment.duration(duration[0], duration[1]).format('h:mm');
  }.property('model.duration')
});

App.TestStartController = Ember.ObjectController.extend({
  firstName: null,
  lastName: null,
  email: null,
  actions: {
    start: function() {
      // this.set('loading', true);
      var l = Ladda.create($('.ladda-button')[0]);
      l.start();
      sendJSON('/api/start-test', {
        firstName: this.get('firstName'),
        lastName: this.get('lastName'),
        email: this.get('email'),
        testInfo: this.get('model'),
        testId: this.get('model.testId'),
        startTime: moment().format()
      }).then(function(data) {
        l.stop();
        this.transitionToRoute('testSession', data);
      }.bind(this)).catch(function(err) {
        l.stop();
        // TODO
      }.bind(this));
    }
  }
});

App.TestSessionController = Ember.ObjectController.extend({
  autoSaveTimer: null,
  autoSaveInterval: 60*1000,
  autoSaveError: null,
  init: function() {
    this._super();
    // Register auto-save timer
    var autoSaveTimer = Ember.run.later(this, 'autoSave', null, this.get('autoSaveInterval'));
    this.set('autoSaveTimer', autoSaveTimer);
  },
  willDestroy: function() {
    Ember.run.cancel(this.get('autoSaveTimer'));
    this.set('autoSaveTimer', null);

    this._super();
  },
  autoSave: function() {
    // TODO: Only save if modified
    sendJSON('/api/save-test', this.get('model'))
      .then(function(data, status) {
        // Update revision
        this.set('model._rev', data._rev);
        this.set('autoSaveError', null);
      }.bind(this)).catch(function(err) {
        this.set('autoSaveError', 'Warning: could not auto-save.');
      }.bind(this));

    // Schedule next auto-save
    var autoSaveTimer = this.get('autoSaveTimer')
    if (autoSaveTimer) {
      autoSaveTimer = Ember.run.later(this, 'autoSave', null, this.get('autoSaveInterval'));
      this.set('autoSaveTimer', autoSaveTimer);
    }
  },

  duration: function() {
    var duration = this.get('model.testInfo.duration');
    return moment.duration(duration[0], duration[1]).format('h:mm');
  }.property('model.testInfo.duration'),

  startTime: function() {
    var startTime = this.get('model.startTime');
    return moment(startTime).format('lll');
  }.property('model.startTime'),

  actions: {
    submit: function() {
      var l = Ladda.create($('#submit-button')[0]);
      l.start();
      sendJSON('/api/submit-test', this.get('model'))
        .then(function(data, status) {
          l.stop();
          this.set('model', data);
          this.transitionToRoute('testComplete', data.testId);
        }.bind(this)).catch(function(err) {
          l.stop();
          // TODO
          console.error(err.stack);
          alert("There was a problem submitting your test. Please print to PDF and manually email to the business. We apologize for any inconvenience.")
        }.bind(this));
    },
    save: function() {
      var l = Ladda.create($('#save-button')[0]);
      l.start();
      sendJSON('/api/save-test', this.get('model'))
        .then(function(data, status) {
          this.set('model', data);
          this.set('autoSaveError', null);
          l.stop();
          location.reload();
        }.bind(this)).catch(function(err) {
          l.stop();
          alert('Error: could not save.');
        }.bind(this));
    }
  }
});

App.EditorController = Ember.ObjectController.extend({
  actions: {
    addQuestion: function() {
      var questions = this.get('questions');
      questions.push({
        question: 'new question',
        number: questions.length + 1
      });
      this.set('info.numberOfQuestions', questions.length);
      this.notifyPropertyChange('model');
    },
    cancel: function() {
      alert("Sorry, not implemented");
      // this.transitionTo('editor', this.get('_id'));
    },
    save: function() {
      sendJSON('/api/save-test', this.get('model')).then(function(updatedText) {
        this.set('model', updatedText);
      }.bind(this));
    }
  }
});

// -------------------------------- Components --------------------------------
App.MarkdownComponentComponent = Ember.Component.extend({
  markdown: '',
  timeout: null,
  runHyphenate: false,
  didInsertElement: function() {
    this.update();
  },

  willDestroyElement: function() {
    if (this.get('timeout')) {
      clearTimeout(this.get('timeout'));
    }
  },

  markdownChanged: function() {
    if (this.get('timeout')) {
      clearTimeout(this.get('timeout'));
    }
    var timeout = setTimeout(function() {
      this.update();
    }.bind(this), 0);
    this.set('timeout', timeout);
  }.observes('markdown'),

  update: function() {
    var markdown = this.get('markdown')
    var html = marked(markdown || "");
    this.$().html(html);
    if (this.get('runHyphenate')) {
      // Ember.run.once(Hyphenator, 'run');
    }
  },

});

App.MarkdownEditorComponent = Ember.Component.extend({
  value: '',
  focus: false,
  didInsertElement: function() {
    this.$().addClass('markdown-editor');
    var editor = CodeMirror(this.$()[0], {
      lineNumbers: true,
      mode: 'markdown',
      theme: 'mdn-like',
      value: this.get('value') || '',
      lineWrapping: true
    });
    this.set('editor', editor);
    editor.on('change', function() {
      var editorText = editor.getValue();
      this.set('value', editorText);
    }.bind(this));

    this.focusChanged();// Update focus

    this.$().on("focusout", function() {
      this.set('focus', false);
    }.bind(this));
  },

  valueChanged: function() {
    var editor = this.get('editor');
    var editorText = editor.getValue();
    var value = this.get('value');
    if (editorText !== value) {
      editor.setValue(value);
    }
  }.observes('value'),

  focusChanged: function () {
    if (this.get('focus')) {
      this.get('editor').focus();
    }
  }.observes('focus')
});

App.MarkdownAnswerComponent = Ember.Component.extend({
  answer: '',
  editing: false,
  editorFocus: false,

  didInsertElement: function() {
    this.set('editorFocus', true);
  },

  hasAnswer: function() {
    return this.get('answer') || this.get('editing');
  }.property('answer', 'editing'),

  focusChanged: function() {
    if (this.get('editorFocus') === false) {
      setTimeout(function() {
        this.set('editing', false);
      }.bind(this), 100);
      // this is a work-around for the fact that removing the code editor seems to cause a new selection of parts of the document
      // Ember.run.once(this, function() {
      //   clearSelection();
      // })
    }
  }.observes('editorFocus'),

  actions: {
    edit: function() {
      this.set('editing', true);
      this.set('editorFocus', true);
    }
  }
});

App.QuestionEditorComponent = Ember.Component.extend({
  editing: false,
  actions: {
    editQuestion: function() {
      this.set('editing', true);
    },
    addPart: function(question) {
      question.parts = question.parts || [];
      question.parts.push({
        question: 'new part',
        number: String.fromCharCode('A'.charCodeAt(0) + question.parts.length)
      })
      this.notifyPropertyChange('model');
    },
    doneEditing: function() {
      this.set('editing', false);
    }
  }
});