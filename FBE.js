(function() {
  'use strict';

  var FBE_Factory = {
    listEntry: function(id, subject, predicate, object) {
      var html = '<div id="feedbackListEntry' + id + '" data-id="' + id + '">' +
        ' <div class="form-group">' +
        '   <input type="text" class="form-control" name="predicate" data_id="' + id + '" data_original="' + predicate + '" value="' + predicate + '" size="37" readonly>' +
        ' </div>' +
        ' <div class="form-group">' +
        '   <textarea type="text" class="form-control" name="object" data_id="' + id + '" cols="48" readonly data_original="' + object.replace('"', '&quot;').replace('<', '&#x3c;').replace('>', '&#x3e;') + '" >'+object+'</textarea>' +
        ' </div>' +
        ' <button class="btn btn-info feedbackEdit"><i class="fa fa-edit"></i></button>' +
        ' <button class="btn btn-danger feedbackRemove"><i class="fa fa-remove"></i></button>' +
        '</div>';

      return html;
    },

    listEntryFromRDF: function(i, element) {
      return FBE_Factory.listEntry(i, element.subject, element.predicate, element.object);
    },

    getModal: function() {
      return '<div class="fbe"><div id="feedbackModal" class="modal fade" tabindex="-1" role="dialog">' +
        '  <div class="modal-dialog modal-lg">' +
        '    <div class="modal-content">' +
        '      <div class="modal-header">' +
        '        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
        '        <h4 class="modal-title">Your Feedback</h4>' +
        '      </div>' +
        '      <div class="modal-body">' +
        '       <div>' +
        '         <h4>Do you want to edit Resources on this Page?</h4><br>' +
        '         <button type="button" id="feddbackEditResources" class="btn btn-info">Create Patch</button>' +
        '       </div>' +
        '        <hr>' +
        '        <form id="feedbackForm">' +
        '         <p class="help-block">Please leave us a comment and your identity.</p>' +
        '         <div class="form-group">' +
        '           <input id="feedbackFormAuthor" type="url" class="form-control" placeholder="Your WebID" required>' +
        '         </div>' +
        '         <div class="form-group">' +
        '           <input id="feedbackFormMessage" type="text" class="form-control" placeholder="Your message..." required>' +
        '         </div>' +
        '        </form>' +
        '      </div>' +
        '      <div class="modal-footer">' +
        '       <button type="button" class="btn btn-primary feedbackbtn" data-dismiss="modal"><i class="fa fa-close"></i> Close</button>' +
        '       <button id="feedbackModalSave" type="submit" form="feedbackForm" class="btn btn-success feedbackbtn"><i class="fa fa-download"></i> Submit</button>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div></div>';
    },

    getListTemplate: function() {
      return '<div class="progress progress-striped active" id="feedbackModal_progressbar">' +
        '<div class="progress-bar" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>' +
        '</div>' +
        '<form id="feedbackEntryList" class="form-inline"></form>';
    }
  };

  var FBE_Handler = {
    openFeedbackModal: function() {
      var modal = $('#feedbackModal');
      if (modal.size() !== 0)
        $('#feedbackModal').modal();
      else {
        FBE.createFeedbackModal();
        FBE_Handler.openFeedbackModal();
      }
    },

    loadResources: function(event) {
      event.preventDefault();
      FBE.fillFeedbackModal();
    },

    sendFeedback: function(event) {
      event.preventDefault();
      FBE.updateChanges();
      var hash = SHA256_hash(new Date().toISOString());
      $.get(FBE.URL_RHS)
        .done((data) => {
          hash = data.nexthash;
          console.log(hash);
          if (FBE.Deletions.length === 0 && FBE.Inserts.length === 0)
            FBE.createComment(hash);
          else
            FBE.createCommit(hash);
        })
        .fail(() => {
          FBE.userfeedback('What the ...?', 'Something went terribly wrong! I am sorry, but you can not send us feedback...', 'error', false);
        });
    },

    activateEditMode: function(event) {
      event.preventDefault();
      var id = $(event.target).closest('div').attr('id');
      $('#' + id + ' > div > input').prop('readonly', false);
      $('#' + id + ' > div > textarea').prop('readonly', false);
      $('#' + id).find('.feedbackEdit').hide();
    },

    removeTriple: function(event) {
      event.preventDefault();
      var id = $(event.target).closest('div').attr('id');
      $('#' + id + ' > div > input').prop('readonly', false);
      $('#' + id + ' > div > input').addClass('remove');
      $('#' + id + ' > div > textarea').prop('readonly', false);
      $('#' + id + ' > div > textarea').addClass('remove');
      $('#' + id).hide();
      $('#' + id).next().hide();
    },

    addTriple: function(event) {
      event.preventDefault();
      var id = parseInt($('#feedbackEntryList > div:last').attr('data_id')) + 1;
      var entry = FBE_Factory.listEntry(id, 'namespace', '', '') + '<br>';
      $('#feedbackEntryList').find('.feedbackAdd').before(entry);
      $('#feedbackEntryList #feedbackListEntry' + id + ' > button.feedbackEdit').click();
      $('#feedbackEntryList #feedbackListEntry' + id + ' input').addClass('new');
    }
  };

  var FBE = {

    ressourceNamespace: '', //like 'http://dbpedia.org/resource/''
    ressourceName: '', //like 'Taucha'
    Deletions: [], //Array like : [{subject, predicate, object, key}]
    Inserts: [], //Array like : [{subject, predicate, object, key}]
    URL_RHS: '', // RHS ^= Resource Hosting Service
    URL_SPE: '', //SPE ^= Semantic Pingback Endpoint

    addFeedbackButton: function() {
      $('body').append('<button id="feedbackButton" type="button" class="">Give Feedback</button>');
      $('#feedbackButton').click(FBE_Handler.openFeedbackModal);
    },

    createFeedbackModal: function() {
      $('body').append(FBE_Factory.getModal());
      $('#feddbackEditResources').click(FBE_Handler.loadResources);
      $('#feedbackForm').submit(FBE_Handler.sendFeedback);
      var url = window.location.href.split('/');
      FBE.ressourceName = url.pop();
      FBE.ressourceNamespace = url.join('/') + '/';
      FBE.getServiceURLs();
      FBE.getTriples((false));
    },

    fillFeedbackModal: function() {
      var modal = $('#feedbackModal');
      modal.find('#feddbackEditResources').closest('div').remove();
      modal.find('hr:first').before(FBE_Factory.getListTemplate);
      modal.find('#feedbackEntryList').on('click', 'button.feedbackEdit', FBE_Handler.activateEditMode);
      modal.find('#feedbackEntryList').on('click', 'button.feedbackRemove', FBE_Handler.removeTriple);
      FBE.getTriples(true);
    },

    getServiceURLs: function() {
      //TODO search for http://purl.org/net/pingback/service in foaf:
      FBE.URL_RHS = $('link[rel="resourcehostingservice"]').attr('href');
      if (FBE.isEmpty(FBE.URL_RHS)) {
        FBE.URL_RHS = 'http://resource.feedback.aksw.org/'; //FIXME There will be no default route?!
      }
      FBE.URL_SPE = $('link[rel="pingback"]').attr('href');
      if (FBE.isEmpty(FBE.URL_SPE)) {
        FBE.URL_SPE = $('link[rel="pingback:to"]').attr('href');
        if (FBE.isEmpty(FBE.URL_SPE)) {
          FBE.URL_SPE = 'http://pingback.feedback.aksw.org/'; //FIXME There will be no default route?!
        }
      }
    },

    getTriples: function(toInsert) {
      var jsonURL = $('link[rel="alternate"][type="application/rdf+json"]').attr('href');
      if (FBE.isEmpty(jsonURL))
        jsonURL = $('link[rel="alternate"][type="application/json"]').attr('href');
      var resourceURL = FBE.extractResourceUrl();
      if (FBE.isEmpty(resourceURL)) {
        deactivateEditButton();
        return;
      }
      //Test Environment Workaround
      if (location.toString().startsWith('file://') || location.toString().startsWith('http://kdi-student.de') || location.toString().startsWith('http://localhost')) {
        jsonURL = 'Taucha.json';
        //resourceURL = 'http://de.dbpedia.org/resource/Taucha';
      }
      if (!FBE.isEmpty(jsonURL)) {
        $.get(jsonURL)
          .done((data) => {
            FBE.parseAndUseNewTriples(data, toInsert, resourceURL);
          })
          .fail((jqxhr, textStatus, error) => {
            FBE.userfeedback('What the ...?', 'Something went terribly wrong! I am sorry, but you can not send us feedback...', 'error', false);
            deactivateEditButton();
            console.log(textStatus + ' ' + error);
          });
      } else {
        $.ajax({
            url: resourceURL,
            method: 'GET',
            headers: {
              Accept: 'application/rdf+json;q=1.0, application/json;q=0.8'
            },
            cache: false
          })
          .done((data) => {
            FBE.parseAndUseNewTriples(data, toInsert, resourceURL);
          })
          .fail((jqxhr, textStatus, error) => {
            FBE.userfeedback('What the ...?', 'Something went terribly wrong! I am sorry, but you can not send us feedback...', 'error', false);
            deactivateEditButton();
            console.log(textStatus + ' ' + error);
          });
      }
    },

    deactivateEditButton: function() {
      $('#feddbackEditResources').addClass('disabled').prop('disabled', true);
      $('#feddbackEditResources').after('<i class="help-block">We are sorry but there are no editable resources on this page.</i>');
    },

    extractResourceUrl: function() {
      var url = $('link[rel="foaf:primaryTopic"]').attr('href');
      if (FBE.isEmpty(url)) {
        url = $('link[rev="describedby"]').attr('href');
        if (FBE.isEmpty(url)) { //TODO No resource available
        }
      }
      return url;
    },

    //use RDF JSON object from DBPedia to create HTML for the list
    parseAndUseNewTriples: function(data, toInsert, firstKey) {

      //var firstKey = Object.keys(data)[0];
      var triples = data[firstKey];

      //update namespace and name
      var namespaceParts = firstKey.split('/');
      FBE.ressourceName = namespaceParts[namespaceParts.length - 1];
      FBE.ressourceNamespace = firstKey.substring(0, firstKey.length - FBE.ressourceName.length);
      console.log('Namespace: ' + FBE.ressourceNamespace + '\n Resource: ' + FBE.ressourceName);
      if (toInsert === false) //little hack to insert the modal title
        $('#feedbackModal').find('.modal-title').text('Feedback on: ' + decodeURIComponent(FBE.ressourceNamespace + FBE.ressourceName));

      var listEntries = '';
      var counter = 1;

      for (var key in triples) {
        var value = triples[key];

        listEntries = value.map((element, i) => {
            var obj = element.value;

            switch (element.type) {
              case 'uri':
                obj = FBE.checkForAngleBrackets(obj);
                break;

              case 'literal':
                obj = '&quot;' + obj + '&quot;';

                if (element.datatype)
                  obj = obj + '^^' + FBE.checkForAngleBrackets(element.datatype);
                else if (element.lang)
                  obj = obj + '@' + element.lang;
                break;
            }

            return FBE_Factory.listEntry(i + counter,
              firstKey,
              FBE.checkForAngleBrackets(key),
              obj) + '<br>';
          })
          .reduce((prev, curr) => prev + curr, listEntries);

        counter += Object.keys(value).length;
      }
      if (toInsert === true) {
        var list = $('#feedbackEntryList');
        list.append(listEntries); // FIXME around 155ms for Leipzig
        list.append('<button class="btn btn-success feedbackAdd"><i class="fa fa-plus"></i> Add Property </button>');
        list.find('.feedbackAdd').click(FBE_Handler.addTriple);
        $('#feedbackModal_progressbar').remove();
      }
    },

    createComment: function(hash) {
      var plainSubject = FBE.URL_RHS + hash + '-resource';
      var subject = '<' + plainSubject + '>';
      var nquads = //subject + ' <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://rdfs.org/sioc/ns#Post> .\n' +
        subject + ' <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://rdfs.org/sioc/types#Comment> .\n' +
        subject + ' <http://rdfs.org/sioc/ns#reply_of> <' + FBE.ressourceNamespace + FBE.ressourceName + '> .\n' +
        subject + ' <http://xmlns.com/foaf/maker> <' + $('#feedbackFormAuthor').val() + '> .\n' +
        subject + ' <http://rdfs.org/sioc/ns#content> "' + $('#feedbackFormMessage').val() + '" .\n' +
        subject + ' <http://www.w3.org/ns/prov#atTime> "' + new Date().toISOString() + '"^^<http://www.w3.org/2001/XMLSchema#dateTime> .\n';

      FBE.sendFeedback(nquads, hash, plainSubject);
    },

    createCommit: function(hash) {
      var plainSubject = FBE.URL_RHS + hash + '-patch';
      var subject = '<' + plainSubject + '>';

      var deletes = FBE.getDeletes();
      var inserts = FBE.getInserts();
      var nquads = subject + ' <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/vocab/changeset/schema#ChangeSet> .\n' +
        subject + ' <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://rdfs.org/sioc/ns#Item> .\n' +
        subject + ' <http://rdfs.org/sioc/ns#reply_of> <' + FBE.ressourceNamespace + FBE.ressourceName + '> .\n' +
        subject + ' <http://purl.org/vocab/changeset/schema#subjectOfChange> <' + FBE.ressourceNamespace + FBE.ressourceName + '> .\n' +
        subject + ' <http://xmlns.com/foaf/maker> <' + $('#feedbackFormAuthor').val() + '> .\n' +
        subject + ' <http://purl.org/vocab/changeset/schema#creatorName> <' + $('#feedbackFormAuthor').val() + '> .\n' +
        subject + ' <http://www.w3.org/ns/prov#atTime> "' + new Date().toISOString() + '"^^<http://www.w3.org/2001/XMLSchema#dateTime> .\n' +
        subject + ' <http://rdfs.org/sioc/ns#created_at> "' + new Date().toISOString() + '"^^<http://www.w3.org/2001/XMLSchema#dateTime> .\n' +
        subject + ' <http://purl.org/vocab/changeset/schema#createdDate> "' + new Date().toISOString() + '"^^<http://www.w3.org/2001/XMLSchema#dateTime> .\n' +
        subject + ' <http://purl.org/vocab/changeset/schema#changeReason> "' + $('#feedbackFormMessage').val() + '" .\n' +
        subject + ' <http://purl.org/vocab/changeset/schema#addition> _:addition .\n' +
        subject + ' <http://purl.org/vocab/changeset/schema#removal> _:removal .\n';

        /*
        subject + ' <https://vocab.eccenca.com/revision/hasRevision> ' + revision + ' .\n' +
        revision + ' <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://vocab.eccenca.com/revision/Revision> .\n' +
        */

      FBE.sendFeedback(nquads + deletes +inserts, hash, plainSubject);
    },

    getInserts: function() {
      var inserts = '';
      if (FBE.Inserts.length !== 0) {
        console.log('Inserts: ', FBE.Inserts);
        inserts = FBE.Inserts
          .map((obj) => '_:addition ' + obj.predicate + ' ' + obj.object + ' .\n')
          .reduce((prev, curr, _) => prev + curr);
      }
      return inserts;
    },

    getDeletes: function() {
      var deletions = '';
      if (FBE.Deletions.length !== 0) {
        console.log('Deletions: ', FBE.Deletions);
        deletions = FBE.Deletions
          .map((obj) => '_:removal ' + obj.predicate + ' ' + obj.object + ' ' + ' .\n')
          .reduce((prev, curr, _) => prev + curr);
      }
      return deletions;
    },

    checkForAngleBrackets: function(str) {
      if (str.startsWith('http'))
        return '<' + str + '>';
      else
        return str;
    },

    //publish the new ressource like descripted in the paper of Natanael
    sendFeedback: function(tosend, hash, subject) {
      console.log(tosend);
      $.ajax({
          url: FBE.URL_RHS + hash,
          method: 'POST',
          data: tosend,
          contentType: 'application/n-quads',
          cache: false
        })
        .done((data) => {
          console.log('Pushed the following to Norms RHS');
          console.log(data);
          FBE.pingSemanticPingbackService(hash, subject);
        })
        .fail((jqxhr, textStatus, error) => {
          FBE.userfeedback('What the ...?', 'Some strange error occured! Please revise your changes and try again', 'error', true);
          console.log(textStatus + ' ' + error);
          console.log(jqxhr);
        });
    },

    userfeedback: function(heading, text, type, showOnConfirm) {
      $('#feedbackModal').modal('hide');
      $('#feedbackModal').on('hidden.bs.modal', () => {
        swal({
          title: heading,
          text: text,
          type: type
        }, () => {
          if (showOnConfirm === true)
            $('#feedbackModal').modal('show');
        });
        $('#feedbackModal').unbind('hidden.bs.modal');
      });
    },

    pingSemanticPingbackService: function(hash, subject) {
      var ping = {
        source: encodeURI(subject),
        target: encodeURI(FBE.ressourceNamespace + FBE.ressourceName),
        comment: encodeURI(hash + ' at ' + (new Date()).toString())
      };

      //TODO show rödelndes zeichen
      $('#feedbackModalSave i').remove();
      $('#feedbackModalSave').prepend(' <i class="fa fa-spinner fa-pulse"></i>');
      $.ajax({
          url: FBE.URL_SPE,
          method: 'POST',
          data: ping,
          cache: false
        })
        .done(() => {
          FBE.userfeedback('Hell yeah!', 'You have done a great Job! We have sent your changes to our Mastermind.', 'success', false);
        })
        .fail((jqxhr, textStatus, error) => {
          console.log(textStatus + ' ' + error);
          FBE.userfeedback('What the ...?', 'Some strange error occured! We are sorry, that is our fault.... Please try again later!', 'error', true);
        })
        .always(() => {
          $('#feedbackModalSave i').remove();
          $('#feedbackModalSave').prepend(' <i class="fa fa-download"></i>');
        });
    },

    //update FBE.Deletions and FBE.Inserts
    updateChanges: function() {
      FBE.Deletions = [];
      FBE.Inserts = [];

      var inputs = $('#feedbackEntryList').find('input').toArray();
      const textareas = $('#feedbackEntryList').find('textarea').toArray();
      console.log('inputs: ', inputs);
      console.log('textareas: ', textareas);
      textareas.forEach((i) => inputs.push(i));
      var filteredInputs = inputs.filter((input) => input.attributes.readonly === undefined);
      console.log('filtered inputs: ', filteredInputs);

      if (filteredInputs.length === 0)
        return;

      //fill Deletions and Inserts
      var changes = {};
      filteredInputs.forEach((input) => {
        console.log('input with name ', input.name, input);
        if (changes[input.attributes.data_id.value] === undefined) {
          changes[input.attributes.data_id.value] = {
            old: {
              subject: FBE.ressourceNamespace + FBE.ressourceName,
              key: input.attributes.data_id.value,
              saveThis: true
            },
            newel: {
              subject: FBE.ressourceNamespace + FBE.ressourceName,
              key: input.attributes.data_id.value,
              saveThis: true
            }
          };
        }
        if (input.name === 'predicate') {
          changes[input.attributes.data_id.value].old.predicate = input.attributes.data_original.value;
          changes[input.attributes.data_id.value].newel.predicate = input.value;
        } else {
          changes[input.attributes.data_id.value].old.object = input.attributes.data_original.value;
          changes[input.attributes.data_id.value].newel.object = input.value;
        }
        if ($(input).hasClass('new')) {
          changes[input.attributes.data_id.value].old.saveThis = false;
        }
        if ($(input).hasClass('remove')) {
          changes[input.attributes.data_id.value].newel.saveThis = false;
        }
      });

      //transform map
      for (var key in changes) {
        if (changes[key].old.saveThis === true) FBE.Deletions.push(changes[key].old);
        if (changes[key].newel.saveThis === true) FBE.Inserts.push(changes[key].newel);
      }

      console.log('made from changes ', changes, ' that: ', FBE.Deletions, FBE.Inserts);
    },

    isEmpty: function(val) {
      return (val === '' ||
        val === {} ||
        val === null ||
        val === undefined ||
        (val instanceof Array && val.length === 0));
    },

    arrowFunctionsAvaiable: function() {
      var toEval = 'function X(){var test = [1,2,3]; test.map(x => x*2);}';
      try {
        eval(toEval);
        return true;
      } catch (e) {
        return false;
      }
    }
  };

  //Jquery might not be available, so we're checking this first
  document.addEventListener('DOMContentLoaded', () => {
    if (FBE.arrowFunctionsAvaiable()) {

      var waitForJQuery = function() {
        if (typeof jQuery === 'undefined')
          window.setTimeout(() => {
            console.warn('waitForJQuery');
            waitForJQuery();
          }, 100);
        else {
          if (checkJqueryVersion)
            jqueryReady();
          else
            console.log('Seems you are using a very old JQuery version. We need at least version 1.9.1 or higher!');
        }
      };

      if (typeof jQuery === 'undefined') {
        var script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.0/jquery.min.js';
        script.type = 'text/javascript';
        document.getElementsByTagName('head')[0].appendChild(script);
      }

      //Start Polling
      waitForJQuery();
    } else {
      console.log('Hey there... seems that your are using a very old browser or at least a browser that isn not supporting features that we need. I am sorry, but we disabled the feedback feature. Please use another browser!');
    }
  });

  function checkJqueryVersion() {
    var version = $.fn.jquery.split(' ')[0].split('.');
    if ((version[0] < 2 && version[1] < 9) || (version[0] === 1 && version[1] === 9 && version[2] < 1) || (version[0] > 2))
      return false;
    else
      return true;
  }

  //FIXME Adding Libs like this into global scope is a very bad practice!!!!!!!
  function jqueryReady() {
    // now we can use JQuery
    //TODO validate for success
    /*var styles = //'<link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">' +
      '<link rel="stylesheet" type="text/css" href="prefixed_bootstrap.css">' +
      '<link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">' +
      '<link rel="stylesheet" type="text/css" href="https://cdn.rawgit.com/lipis/bootstrap-sweetalert/master/lib/sweet-alert.css">';
    $('head').append(styles);
    //$.getScript("https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js");
    $.getScript("bootstrap.js");
    //$.get("./custom_bootstrap.min.js");
    $.getScript("http://point-at-infinity.org/jssha256/jssha256.js");
    $.getScript("https://cdn.rawgit.com/lipis/bootstrap-sweetalert/master/lib/sweet-alert.min.js");*/
    $('head').after('<style> #feedbackButton { position: fixed; bottom: 30px; right: 30px; z-index: 1; width: 80px; height: 80px; font-size: 1em; color: #fff; background: #2C98DE; border: none; border-radius: 50%; box-shadow: 0 3px 6px rgba(0,0,0,.275); outline: none; margin: auto;}</style>');
    FBE.addFeedbackButton();
  }
}());
