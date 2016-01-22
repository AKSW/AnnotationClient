(function() {
  "use strict";

  var FBE_Factory = {
    listEntry: function(id, subject, predicate, object) {
      var html = '<div id="feedbackListEntry' + id + '" data-id="' + id + '">' +
        ' <div class="form-group">' +
        '   <input type="text" class="form-control" name="predicate" data_id="' + id + '" data_original="' + predicate + '" value="' + predicate + '" readonly size="37>' +
        ' </div>' +
        ' <div class="form-group">' +
        '   <input type="text" class="form-control" name="object" data_id="' + id + '" data_original="' + object.replace('"', "&quot;") + '" value="' + object.replace('"', "&quot;") + '" readonly size="50">' +
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
      return '<div id="feedbackModal" class="modal fade" tabindex="-1" role="dialog">' +
        '  <div class="modal-dialog modal-lg">' +
        '    <div class="modal-content">' +
        '      <div class="modal-header">' +
        '        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
        '        <h4 class="modal-title">Modal Title</h4>' +
        '      </div>' +
        '      <div class="modal-body">' +
        '       <div>' +
        '         <h4>Do you want to edit Resources on this Page?</h4><br>' +
        '         <button type="button" id="feddbackEditResources" class="btn btn-info">Edit Resources</button>' +
        '       </div>' +
        '        <hr>' +
        '        <form id="feedbackForm">' +
        '         <p class="help-block">Please leave us a comment and your identity.</p>' +
        '         <div class="form-group">' +
        '           <input id="feedbackFormAuthor" type="url" class="form-control" placeholder="Your Homepage" required>' +
        '         </div>' +
        '         <div class="form-group">' +
        '         <textarea id="feedbackFormMessage" rows="2" form="feedbackForm" class="form-control" placeholder="Your message..." required></textarea>' +
        '         </div>' +
        '        </form>' +
        '      </div>' +
        '      <div class="modal-footer">' +
        '       <button type="button" class="btn btn-primary feedbackbtn" data-dismiss="modal"><i class="fa fa-close"></i> Close</button>' +
        '       <button id="feedbackModalSave" type="submit" form="feedbackForm" class="btn btn-success feedbackbtn"><i class="fa fa-download"></i> Save changes</button>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>';
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
      var modal = $("#feedbackModal");
      if (modal.size() !== 0)
        $("#feedbackModal").modal();
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
        .done(function(data, text, jqxhr) {
          hash = data.hash;
        })
        .always(function() {
          if (FBE.Deletions.length === 0 && FBE.Inserts.length === 0)
            FBE.createComment(hash);
          else
            FBE.createCommit(hash);
        });
    },

    activateEditMode: function(event) {
      event.preventDefault();
      var id = $(event.target).closest("div").attr("id");
      $("#" + id + " > div > input").prop("readonly", false);
      $("#" + id).find(".feedbackEdit").hide();
    },

    removeTriple: function(event) {
      event.preventDefault();
      var id = $(event.target).closest("div").attr("id");
      $("#" + id + " > div > input").prop("readonly", false);
      $("#" + id + " > div > input").addClass("remove");
      $("#" + id).hide();
      $("#" + id).next().hide();
    },

    addTriple: function(event) {
      event.preventDefault();
      var id = parseInt($("#feedbackEntryList > div:last").attr("data_id")) + 1;
      var entry = FBE_Factory.listEntry(id, "namespace", "", "") + '<br>';
      $("#feedbackEntryList").find(".feedbackAdd").before(entry);
      $("#feedbackEntryList #feedbackListEntry" + id + " > button.feedbackEdit").click();
      $("#feedbackEntryList #feedbackListEntry" + id + " input").addClass("new");
    }
  };

  var FBE = {

    ressourceNamespace: "",
    ressourceName: "",
    //Arrays with objects: {subject, predicate, object, key}
    Deletions: [],
    Inserts: [],
    RessourceTuples: [],
    RDFJSONObject: "",
    URL_RHS: "",
    available_URI: "",
    URL_SPE: "",

    addFeedbackButton: function() {
      $("body").append('<button id="feedbackButton" type="button" class="btn btn-primary">Give Feedback</button>');
      $("#feedbackButton").click(FBE_Handler.openFeedbackModal);
    },

    createFeedbackModal: function() {
      $("body").append(FBE_Factory.getModal());
      $("#feddbackEditResources").click(FBE_Handler.loadResources);
      $("#feedbackForm").submit(FBE_Handler.sendFeedback);
      FBE.ressourceName = $(document).find("title").text();
      FBE.ressourceNamespace = "http://de.wikipedia.org/wiki/";
      $("#feedbackModal").find('.modal-title').text('Feedback on Ressource ' + FBE.ressourceName);
      FBE.getTriples((false));
    },

    fillFeedbackModal: function() {
      var modal = $("#feedbackModal");
      modal.find("#feddbackEditResources").closest("div").remove();
      modal.find("hr:first").before(FBE_Factory.getListTemplate);
      modal.find("#feedbackEntryList").on("click", "button.feedbackEdit", FBE_Handler.activateEditMode);
      modal.find("#feedbackEntryList").on("click", "button.feedbackRemove", FBE_Handler.removeTriple);
      FBE.getTriples(true);
    },

    getTriples: function(toInsert) {
      //debug
      if (location.toString().startsWith("file://") || location.toString().startsWith("http://kdi-student.de") || location.toString().startsWith("http://localhost")) {
        FBE.getTriplesFromFile(toInsert);
        return;
      }

      //prepare url for GET
      var url = location.toString();
      if (url.substring(url.length - 1, url.length) !== "?")
        url += "?";

      $.get(url + "output=application%2Frdf%2Bjson")
        .done(function(data, text, jqxhr) {
          FBE.parseAndUseNewTriples(data, toInsert);
        })
        .fail(function(jqxhr, textStatus, error) {
          console.log(textStatus + " " + error);
        });
    },

    //function for debugging file requests
    getTriplesFromFile: function(toInsert) {
      $.get("Gegenteil.json")
        .done(function(data, text, jqxhr) {
          FBE.parseAndUseNewTriples(data, toInsert);
        })
        .fail(function(jqxhr, textStatus, error) {
          console.log(textStatus + " " + error);
        });
    },

    //use RDF JSON object from DBPedia to create HTML for the list
    parseAndUseNewTriples: function(data, toInsert) {
      FBE.RDFJSONObject = data;

      var firstKey = Object.keys(data)[0];
      var triples = data[firstKey];

      //update namespace and name
      var namespaceParts = firstKey.split("/");
      FBE.ressourceName = namespaceParts[namespaceParts.length - 1];
      FBE.ressourceNamespace = firstKey.substring(0, firstKey.length - FBE.ressourceName.length);
      console.log("Namespace: " + FBE.ressourceNamespace + "\n Resource: " + FBE.ressourceName);

      var listEntries = "";
      var counter = 1;

      for (var key in triples) {
        var value = triples[key];

        listEntries = value.map((element, i) => {
            var obj = element.value;
            if (element.datatype !== undefined && element.datatype !== null)
              obj = '&quot;' + element.value + '&quot;^^<' + element.datatype + ">";

            return FBE_Factory.listEntry(i + counter,
              firstKey,
              key,
              obj) + "<br>";
          })
          .reduce((prev, curr) => prev + curr, listEntries);

        counter += Object.keys(value).length;
      }
      if (toInsert == true) {
        var list = $("#feedbackEntryList");
        list.append(listEntries); // FIXME around 155ms for Leipzig
        list.append('<button class="btn btn-success feedbackAdd"><i class="fa fa-plus"></i> Add Element</button>');
        list.find(".feedbackAdd").click(FBE_Handler.addTriple);
        $("#feedbackModal_progressbar").remove();
      }
    },

    createComment: function(hash) {
      var subject = '<feedback:resource-' + hash + '>';
      var nquads = subject + ' <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://rdfs.org/sioc/ns#Post>.\n' +
        subject + ' <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://rdfs.org/sioc/types#Comment>.\n' +
        subject + ' <http://rdfs.org/sioc/ns#reply_of> <' + FBE.ressourceNamespace + FBE.ressourceName + '>.\n' +
        subject + ' <http://xmlns.com/foaf/maker> <' + $("#feedbackFormAuthor").val() + '>.\n' +
        subject + ' <http://rdfs.org/sioc/ns#content> "' + $("#feedbackFormMessage").val() + '".\n' +
        subject + ' <http://www.w3.org/ns/prov#atTime> "' + new Date().toISOString() + '"^^<http://www.w3.org/2001/XMLSchema#dateTime>.\n';

      FBE.sendFeedback(nquads);
    },

    createCommit: function(hash) {
      var subject = '<feedback:patch-' + hash + '>';
      var revision = '<feedback:revision-' + hash + '>';
      var delGraph = '<feedback:delete-' + hash + '>';
      var insGraph = '<feedback:insert-' + hash + '>';

      var deletes = FBE.getDeletes(delGraph);
      var inserts = FBE.getInserts(insGraph);
      var nquads = subject + ' <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://vocab.eccenca.com/revision/Commit>.\n' +
        subject + ' <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://rdfs.org/sioc/ns#Item>.\n' +
        subject + ' <http://xmlns.com/foaf/maker> <' + $("#feedbackFormAuthor").val() + '>.\n' +
        subject + ' <https://vocab.eccenca.com/revision/commitMessage> "' + $("#feedbackFormMessage").val() + '".\n' +
        subject + ' <http://www.w3.org/ns/prov#atTime> "' + new Date().toISOString() + '"^^<http://www.w3.org/2001/XMLSchema#dateTime>.\n' +
        subject + ' <http://rdfs.org/sioc/ns#reply_of> <' + FBE.ressourceNamespace + FBE.ressourceName + '>.\n' +
        subject + ' <https://vocab.eccenca.com/revision/hasRevision> ' + revision + '.\n' +
        revision + ' <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://vocab.eccenca.com/revision/Revision>.\n' +
        revision + ' <https://vocab.eccenca.com/revision/deltaDelete> ' + delGraph + '.\n' +
        revision + ' <https://vocab.eccenca.com/revision/deltaInsert> ' + insGraph + '.\n';

      FBE.sendFeedback(nquads + deletes + inserts);
    },

    getInserts: function(graph) {
      var inserts = "";
      if (FBE.Inserts.length !== 0) {
        inserts = FBE.Inserts
          .map(obj => FBE.checkForAngleBrackets(obj.subject) + ' ' + FBE.checkForAngleBrackets(obj.predicate) + ' ' + FBE.checkForAngleBrackets(obj.object) + ' ' + graph + '.\n')
          .reduce((prev, curr, _) => prev + curr);
      }
      return inserts;
    },

    getDeletes: function(graph) {
      var deletions = "";
      if (FBE.Deletions.length !== 0) {
        deletions = FBE.Deletions
          .map(obj => FBE.checkForAngleBrackets(obj.subject) + ' ' + FBE.checkForAngleBrackets(obj.predicate) + ' ' + FBE.checkForAngleBrackets(obj.object) + ' ' + graph + '.\n')
          .reduce((prev, curr, _) => prev + curr);
      }
      return deletions;
    },

    checkForAngleBrackets: function(str) {
      if (str.startsWith("http"))
        return "<" + str + ">";
      else
        return str;
    },

    //publish the new ressource like descripted in the paper of Natanael
    sendFeedback: function(tosend) {
      console.log(tosend);

      $.ajax({
          url: FBE.available_URI,
          method: "PUT",
          data: tosend,
          dataType: "application/n-quads",
          cache: false
        })
        .done(function(data, text, jqxhr) {
          console.log(data);

          FBE.pingSemanticPingbackEndpoint();
        })
        .fail(function(jqxhr, textStatus, error) {
          console.log(textStatus + " " + error);
        });

      // TODO Post to Resource Hosting Service
      /*
      $.post(url, tosend, null, "application/n-quads")
        .done(function() {})
        .fail(function() {});
      // TODO Post to Pingback
      $.post(url, {}, null, "application/n-quads")
        .done(function() {})
        .fail(function() {});
      */
    },

    pingSemanticPingbackEndpoint: function() {
      $.get(FBE.URL_SPE + FBE.available_URI)
        .done(function(data, text, jqxhr) {
          console.log(data);
        })
        .fail(function(jqxhr, textStatus, error) {
          console.log(textStatus + " " + error);
        });
    },

    //update FBE.Deletions and FBE.Inserts
    updateChanges: function() {
      FBE.Deletions = [];
      FBE.Inserts = [];

      var inputs = $("#feedbackEntryList").find("input");
      var filteredInputs = inputs.toArray().filter(input => input.attributes.readonly === undefined);

      if (filteredInputs.length === 0)
        return;

      //fill Deletions and Inserts
      var changes = {};
      filteredInputs.forEach(function(input) {
        if (changes[input.attributes.data_id.value] === undefined) {
          changes[input.attributes.data_id.value] = {
            old: {
              subject: FBE.ressourceNamespace + FBE.ressourceName,
              key: input.attributes.data_id.value,
              saveThis: true
            },
            new: {
              subject: FBE.ressourceNamespace + FBE.ressourceName,
              key: input.attributes.data_id.value,
              saveThis: true
            }
          };
        }
        if (input.name == "predicate") {
          changes[input.attributes.data_id.value].old.predicate = input.attributes.data_original.value;
          changes[input.attributes.data_id.value].new.predicate = input.value;
        } else {
          changes[input.attributes.data_id.value].old.object = input.attributes.data_original.value;
          changes[input.attributes.data_id.value].new.object = input.value;
        }
        if ($(input).hasClass("new")) {
          changes[input.attributes.data_id.value].old.saveThis = false;
        }
        if ($(input).hasClass("remove")) {
          changes[input.attributes.data_id.value].new.saveThis = false;
        }
      });

      //transform map
      for (var key in changes) {
        if (changes[key].old.saveThis === true) FBE.Deletions.push(changes[key].old);
        if (changes[key].new.saveThis === true) FBE.Inserts.push(changes[key].new);
      }
    },

    arrowFunctionsAvaiable: function() {
      var toEval = "function X(){var test = [1,2,3]; test.map(x => x*2);}";
      try {
        eval(toEval);
        return true;
      } catch (e) {
        return false;
      }
    }
  };

  $(document).ready(function() {
    if (FBE.arrowFunctionsAvaiable()) {
      var styles = '<link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">' +
        '<link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">';
      $('head').append(styles);
      //TODO validate for success
      $.getScript("https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js");
      $.getScript("http://point-at-infinity.org/jssha256/jssha256.js");
      FBE.addFeedbackButton();
    }
  });
}());
