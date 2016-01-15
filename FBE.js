var FBE_Factory = {
  listEntry: function(id, subject, predicate, object) {
    var html = '<div>' +
      '  <form class="form-inline feedbackModal_list_entry_TYPE" id="feedbackModal_list_entry' + id + '" style="display: inline-block; width: 92%">' +
      /*'         <div class="form-group" style="width: 39%">' +
      '             <input type="text" class="form-control pred-value" value="' + subject + '" readonly>' +
      '         </div>' +
      '         &nbsp;&nbsp;' + //*/
      '   <div class="form-group" style="width: 40%">' +
      '     <input type="text" class="form-control pred-value" name="predicate" data_original="' + predicate + '" data_index="' + id + '" value="' + predicate + '" readonly>' +
      '   </div>' +
      '   &nbsp;&nbsp;' +
      '   <div class="form-group" style="width: 58%">' +
      '     <input type="text" class="form-control pred-value" name="object" data_original="' + object.replace("\"", "") + '" data_index="' + id + '" value="' + object.replace("\"", "") + '" readonly>' +
      '   </div>' +
      '  </form>' +
      '  &nbsp;&nbsp;' +
      '  <button id="feedbackModal_list_entry_changeBtn' + id + '" onclick="FBE_Handler.onButtonClicked_ChangeTriple(' + id + ')" class="btn btn-default dropdown-toggle feedbackbtn" style="display: inline-block;">&Auml;ndern</button>' +
      '</div>';

    return html;
  },
  listEntryFromRDF: function(i, element) {
    return FBE_Factory.listEntry(i, element.subject, element.predicate, element.object);
  }
};

var FBE_Handler = {
  onButtonClicked_ChangeTriple: function(id) {
    console.log("clicked on changing triple" + id);

    $("#feedbackModal_list_entry" + id + " > div > input").prop("readonly", false);
    $("#feedbackModal_list_entry_changeBtn" + id).hide();
  }
};

var FBE = {

  ressourceNamespace: "",
  ressourceName: "",

  //Arrays with objects: {subject, predicate, object, key}
  Deletions: [],
  Inserts: [],
  RessourceTuples: [],

  addFeedbackButton: function() {
    var button = '<button id="feedbackButton" type="button" class="btn btn-primary">Give Feedback</button>';
    $("body").append(button);
    $("#feedbackButton").click(FBE.openFeedbackModal);
  },

  openFeedbackModal: function() {
    var modal = $("#feedbackModal");
    if (modal.size() !== 0)
      $("#feedbackModal").modal();
    else {
      FBE.createFeedbackModal();
      FBE.openFeedbackModal();
    }
  },

  createFeedbackModal: function() {
    var modal = '<div id="feedbackModal" class="modal fade" tabindex="-1" role="dialog">' +
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
      '        <div id="feedbackModal_list"></div>' +
      '        <hr>' +
      '        <form id="feedbackForm" class="">' +
      '         <p class="help-block rdf-prefix feedbacklabeltext">Please leave us a comment and your identity.</p>' +
      '         <div class="form-group">' +
      '           <input id="feedbackFormAuthor" type="email" class="form-control" placeholder="Your e-mail address">' +
      '         </div>' +
      '         <div class="form-group">' +
      '         <textarea id="feedbackFormMessage" rows="2" form="feedbackForm" class="form-control" placeholder="Your message..."></textarea>' +
      '         </div>' +
      '        </form>' +
      '      </div>' +
      '      <div class="modal-footer">' +
      '       <button type="button" class="btn btn-primary feedbackbtn" data-dismiss="modal">Close</button>' +
      '       <button id="feedbackModalSave" type="submit" form="feedbackForm" class="btn btn-success feedbackbtn">Save changes</button>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '</div>';
    $("body").append(modal);

    $("#feedbackForm").submit(FBE.createCommit);
    FBE.fillFeedbackModal();
  },

  fillFeedbackModal: function() {
    FBE.ressourceName = $(document).find("title").text();
    //TODO get correct ressource namespace automaticallygit
    FBE.ressourceNamespace = "http://de.wikipedia.org/wiki/";
    $(this).find('.modal-title').text('Feedback on Ressource ' + FBE.ressourceName);
    FBE.getTriples();
  },

  getTriples: function() {
    //"http://de.dbpedia.org/data/" + FBE.ressourceName + ".n3"
    $.get("./" + FBE.ressourceName + ".n3")
      .done(function(data, text, jqxhr) {
        console.log(data);
        FBE.parseNewTriples(data);
      })
      .fail(function(jqxhr, textStatus, error) {
        console.log(textStatus + " " + error);
        //TODO has to be removed
        FBE.parseNewTriples(myn3___);
        //TODO show error message
        //TODO hide progress bar
        //$("#feedbackModal_progressbar").hide();
      });
  },

  //Transforms RDF JSON from DBPedia to an object for the list view
  parseNewTriples: function(data) {
    var parser = N3.Parser({
      format: 'turtle'
    });

    parser.parse(data, function(error, triple, prefixes) {
      //console.log(triple, prefixes, error);
      if (triple)
        FBE.RessourceTuples.push(triple);
      else {
        FBE.cleanupNewTriples();
      }
    });
  },

  //remove unnecessary elements from RessourceTuples
  cleanupNewTriples: function() {
    var namespace = FBE.RessourceTuples
      .filter(tuple => tuple.subject == FBE.ressourceNamespace + FBE.ressourceName)[0]
      .object;

    if (namespace !== "") {
      FBE.RessourceTuples = FBE.RessourceTuples.filter(tuple => tuple.subject == namespace);
      FBE.showNewTriples();
    }
  },

  showNewTriples: function() {
    var listEntries = FBE.RessourceTuples
      .map((element, i) => FBE_Factory.listEntryFromRDF(i + 1, element) + "<br>")
      .reduce((prev, curr) => prev + curr);

    $("#feedbackModal_list").append(listEntries);
    $("#feedbackModal_progressbar").hide();
  },

  createCommit: function(event) {
    event.preventDefault();
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
      '    sioc:reply_of ' + FBE.ressourceNamespace + FBE.ressourceName + ';\n' +
      '    eccrev:sha256 "' + SHA256_hash(del + insert) + '"^^xsd:base64Binary.\n' +
      '  eccrev:revision-' + revisionRevision + ' a eccrev:Revision;\n' +
      '    sioc:reply_of ' + FBE.ressourceNamespace + FBE.ressourceName + ';\n' +
      '    eccrev:deltaDelete ex:delete-' + deleteRevision + ';\n' +
      '    eccrev:deltaInsert ex:insert-' + insertRevision + '\n' +
      '}\n';

    FBE.sendFeedback(trig + del + insert);
  },

  getInserts: function() {
    var inserts = FBE.Inserts
      .map(obj => obj.subject + ' ' + obj.predicate + ' ' + obj.object + ';\n')
      .reduce((prev, curr, _) => prev + curr).slice(0, -2);
    return (' { ' + inserts + ' }');
  },

  getDeletes: function() {
    var deletions = FBE.Deletions
      .map(obj => obj.subject + ' ' + obj.predicate + ' ' + obj.object + ';\n')
      .reduce((prev, curr, _) => prev + curr).slice(0, -2);
    return ('{ ' + deletions + ' }\n');
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

    var inputs = $(".feedbackModal_list_entry_TYPE").find("input");
    var filteredInputs = inputs.toArray().filter(input => input.attributes.readonly === undefined);

    if (filteredInputs.length === 0)
      return;

    //fill Deletions and Inserts
    //FIXME very annoying, because JS got Maps and this is not such a map. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
    var map = {};
    filteredInputs.forEach(function(input) {
      //init map
      if (map[input.attributes["data_index"].value] === undefined)
        map[input.attributes["data_index"].value] = {
          old: {
            subject: FBE.ressourceNamespace + FBE.ressourceName,
            key: input.attributes["data_index"].value
          },
          new: {
            subject: FBE.ressourceNamespace + FBE.ressourceName,
            key: input.attributes["data_index"].value
          }
        };

      //fill map
      if (input.name == "predicate") {
        map[input.attributes["data_index"].value].old.predicate = input.attributes["data_original"].value;
        map[input.attributes["data_index"].value].new.predicate = input.value;
      } else {
        map[input.attributes["data_index"].value].old.object = input.attributes["data_original"].value;
        map[input.attributes["data_index"].value].new.object = input.value;
      }
    });

    //transform map
    for (var key in map) {
      FBE.Deletions.push(map[key].old);
      FBE.Inserts.push(map[key].new);
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
