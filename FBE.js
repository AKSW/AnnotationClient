var FBE_Factory = {
  listEntry: function(id, subject, predicate, object, hint) {
    var html = '<div id="feedbackListEntry' + id + '" data_id="' + id + '">' +
      ' <div class="form-group">' +
      '   <input type="text" class="form-control" name="predicate" data_id="' + id + '" data_original="' + predicate + '" value="' + predicate + '" readonly size="37>' +
      ' </div>' +
      ' <div class="form-group">' +
      '   <input type="text" class="form-control" name="object" data_id="' + id + '" data_original="' + object.replace("\"", "") + '" value="' + object.replace("\"", "") + '" title="' + hint + '"  readonly size="50">' +
      ' </div>' +
      ' <button class="btn btn-info feedbackEdit"><i class="fa fa-edit"></i></button>' +
      ' <button class="btn btn-danger feedbackRemove"><i class="fa fa-remove"></i></button>' +
      '</div>';

    return html;
  },

  listEntryFromRDF: function(i, element, hint) {
    return FBE_Factory.listEntry(i, element.subject, element.predicate, element.object, hint);
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
      '        <div class="progress progress-striped active" id="feedbackModal_progressbar">' +
      '         <div class="progress-bar" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>' +
      '        </div>' +
      '        <form id="feedbackEntryList" class="form-inline"></form>' +
      '        <hr>' +
      '        <form id="feedbackForm">' +
      '         <p class="help-block">Please leave us a comment and your identity.</p>' +
      '         <div class="form-group">' +
      '           <input id="feedbackFormAuthor" type="email" class="form-control" placeholder="Your e-mail address">' +
      '         </div>' +
      '         <div class="form-group">' +
      '         <textarea id="feedbackFormMessage" rows="2" form="feedbackForm" class="form-control" placeholder="Your message..."></textarea>' +
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

  sendFeedback: function(event) {
    event.preventDefault();
    FBE.createCommit();
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
    var id = parseInt($("#feedbackEntryList > div:last").attr("data_id"))+1;
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

  addFeedbackButton: function() {
    $("body").append('<button id="feedbackButton" type="button" class="btn btn-primary">Give Feedback</button>');
    $("#feedbackButton").click(FBE_Handler.openFeedbackModal);
  },

  createFeedbackModal: function() {
    $("body").append(FBE_Factory.getModal());
    $("#feedbackEntryList").on("click", "button.feedbackEdit", FBE_Handler.activateEditMode);
    $("#feedbackEntryList").on("click", "button.feedbackRemove", FBE_Handler.removeTriple);
    $("#feedbackForm").submit(FBE_Handler.sendFeedback);
    FBE.fillFeedbackModal();
  },

  fillFeedbackModal: function() {
    FBE.ressourceName = $(document).find("title").text();
    //TODO get correct ressource namespace automaticallygit
    FBE.ressourceNamespace = "http://de.wikipedia.org/wiki/";
    $("#feedbackModal").find('.modal-title').text('Feedback on Ressource ' + FBE.ressourceName);
    FBE.getTriples();
  },

  getTriples: function() {
    //debug
    if (location.toString().startsWith("file://") || location.toString().startsWith("http://kdi-student.de") || location.toString().startsWith("http://localhost")) {
      FBE.getTriplesFromFile();
      return;
    }

    //prepare url for GET
    var url = location.toString();
    if (url.substring(url.length - 1, url.length) !== "?")
      url += "?";

    $.get(url + "output=application%2Frdf%2Bjson")
      .done(function(data, text, jqxhr) {
        console.log(data);
        FBE.parseAndUseNewTriples(data);
      })
      .fail(function(jqxhr, textStatus, error) {
        console.log(textStatus + " " + error);

        //TODO have to be removed
        FBE.getTriplesFromFile();
      });
  },

  //function for debugging file requests
  getTriplesFromFile: function() {
    $.get("Gegenteil.json")
      .done(function(data, text, jqxhr) {
        console.log(data);
        FBE.parseAndUseNewTriples(data);
      })
      .fail(function(jqxhr, textStatus, error) {
        console.log(textStatus + " " + error);
        //TODO has to be removed
        //FBE.parseNewTriples(myn3___);
        //TODO show error message
        //TODO hide progress bar
        //$("#feedbackModal_progressbar").hide();
      });
  },

  //use RDF JSON object from DBPedia to create HTML for the list
  parseAndUseNewTriples: function(data) {
    FBE.RDFJSONObject = data;

    var firstKey = Object.keys(data)[0];
    var triples = data[firstKey];

    var listEntries = "";
    var counter = 1;

    for (var key in triples) {
      var value = triples[key];

      listEntries = value.map((element, i) => FBE_Factory.listEntry(i + counter, firstKey, key, element.value, element.type + ((element.datatype) ? ": " + element.datatype : "")) + "<br>")
        .reduce((prev, curr) => prev + curr, listEntries);

      counter += Object.keys(value).length;
    }

    $("#feedbackEntryList").append(listEntries);
    $("#feedbackEntryList").append('<button class="btn btn-success feedbackAdd"><i class="fa fa-plus"></i> Add Element</button>');
    $("#feedbackEntryList").find(".feedbackAdd").click(FBE_Handler.addTriple);
    $("#feedbackModal_progressbar").hide();
  },

  createCommit: function() {
    FBE.updateChanges();
    //TODO Look for naming and hashing
    var insertRevision = deleteRevision = patchRevision = revisionRevision = SHA256_hash(new Date().toISOString());

    var del = 'ex:delete-' + deleteRevision + FBE.getDeletes();
    var insert = 'ex:insert-' + insertRevision + FBE.getInserts();
    var trig = '@prefix ex: <http://example.org/feedback#>.\n' +
      '@prefix eccrev: <https://vocab.eccenca.com/revision/>.\n' +
      '@prefix prov: <http://www.w3.org/ns/prov#>.\n' +
      '@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.\n' +
      '@prefix rdfs: <http://www.w3.org/2001/XMLSchema#>.\n' +
      '@prefix owl: <http://www.w3.org/2002/07/owl#>.\n' +
      '@prefix sioc: <http://rdfs.org/sioc/ns#>.\n' +
      '{ ex:patch-' + patchRevision + ' a eccrev:Commit;\n' +
      '    eccrev:commitAuthor <mailto:' + $("#feedbackFormAuthor").val() + '>;\n' +
      '    eccrev:commitMessage "' + $("#feedbackFormMessage").val() + '";\n' +
      '    prov:atTime "' + new Date().toISOString() + '"^^xsd:dateTime;\n' + //Format: 2015-12-17T13:37:00+01:00
      '    sioc:reply_of ' + FBE.checkForAngleBrackets(FBE.ressourceNamespace + FBE.ressourceName) + ';\n' +
      '    eccrev:sha256 "' + SHA256_hash(del + insert) + '"^^xsd:base64Binary.\n' +
      '  eccrev:revision-' + revisionRevision + ' a eccrev:Revision;\n' +
      '    sioc:reply_of ' + FBE.checkForAngleBrackets(FBE.ressourceNamespace + FBE.ressourceName) + ';\n' +
      '    eccrev:deltaDelete ex:delete-' + deleteRevision + ';\n' +
      '    eccrev:deltaInsert ex:insert-' + insertRevision + '\n' +
      '}\n';

    FBE.sendFeedback(trig + del + insert);
  },

  getInserts: function() {
    var inserts = "";
    if (FBE.Inserts.length !== 0) {
      inserts = FBE.Inserts
        .map(obj => FBE.checkForAngleBrackets(obj.subject) + ' ' + FBE.checkForAngleBrackets(obj.predicate) + ' ' + FBE.checkForAngleBrackets(obj.object) + '.\n')
        .reduce((prev, curr, _) => prev + curr).slice(0, -2);
    }
    return (' { ' + inserts + ' }');
  },

  getDeletes: function() {
    var deletions = "";
    if (FBE.Deletions.length !== 0) {
      deletions = FBE.Deletions
        .map(obj => FBE.checkForAngleBrackets(obj.subject) + ' ' + FBE.checkForAngleBrackets(obj.predicate) + ' ' + FBE.checkForAngleBrackets(obj.object) + '.\n')
        .reduce((prev, curr, _) => prev + curr).slice(0, -2);
    }
    return ('{ ' + deletions + ' }\n');
  },

  checkForAngleBrackets: function(str) {
    if (str.startsWith("http"))
      return "<" + str + ">";
    else
      return str;
  },

  sendFeedback: function(trig) {
    console.log(trig);
    // TODO Post to Resource Hosting Service
    /*
    $.post(url, trig, null, "application/trig")
      .done(function() {})
      .fail(function() {});
    // TODO Post to Pingback
    $.post(url, {}, null, "application/trig")
      .done(function() {})
      .fail(function() {});
    */
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
    //FIXME very annoying, because JS got Maps and this is not such a map. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

    var changes = {};
    filteredInputs.forEach(function(input) {
      if (changes[input.attributes["data_id"].value] === undefined) {
        changes[input.attributes["data_id"].value] = {
          old: {
            subject: FBE.ressourceNamespace + FBE.ressourceName,
            key: input.attributes["data_id"].value,
            saveThis: true
          },
          new: {
            subject: FBE.ressourceNamespace + FBE.ressourceName,
            key: input.attributes["data_id"].value,
            saveThis: true
          }
        };
      }
      if (input.name == "predicate") {
        changes[input.attributes["data_id"].value].old.predicate = input.attributes["data_original"].value;
        changes[input.attributes["data_id"].value].new.predicate = input.value;
      } else {
        changes[input.attributes["data_id"].value].old.object = input.attributes["data_original"].value;
        changes[input.attributes["data_id"].value].new.object = input.value;
      }
      if ($(input).hasClass("new")) {
        changes[input.attributes["data_id"].value].old.saveThis = false;
      }
      if ($(input).hasClass("remove")) {
        changes[input.attributes["data_id"].value].new.saveThis = false;
      }
    });

    //transform map
    console.log(changes);
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
  if (FBE.arrowFunctionsAvaiable())
    FBE.addFeedbackButton();
});
