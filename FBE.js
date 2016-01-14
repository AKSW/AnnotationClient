var FBE_Factory = {
  listEntry: function(id, subject, predicate, object) {
    var html = '        <div>' +
      '        <form class="form-inline feedbackModal_list_entry_TYPE" id="feedbackModal_list_entry' + id + '" style="display: inline-block; width: 92%">' +
      /*'         <div class="form-group" style="width: 39%">' +
      '             <input type="text" class="form-control pred-value" value="' + subject + '" readonly>' +
      '         </div>' +
      '         &nbsp;&nbsp;' + //*/
      '         <div class="form-group" style="width: 40%">' +
      '             <input type="text" class="form-control pred-value" name="predicate" data_original="' + predicate + '" data_index="'+id+'" value="' + predicate + '" readonly>' +
      '         </div>' +
      '         &nbsp;&nbsp;' +
      '         <div class="form-group" style="width: 58%">' +
      '             <input type="text" class="form-control pred-value" name="object" data_original="' + object.replace("\"", "") + '" data_index="'+id+'" value="' + object.replace("\"", "") + '" readonly>' +
      '         </div>' +
      '        </form>' +
      '         &nbsp;&nbsp;' +
      '        <button id="feedbackModal_list_entry_changeBtn' + id + '" onclick="FBE_Handler.onButtonClicked_ChangeTriple(' + id + ')" class="btn btn-default dropdown-toggle feedbackbtn" style="display: inline-block;">&Auml;ndern</button>'+
      '        </div>';

    return html;
  },
  listEntryFromRDF: function(i, element) {
    return FBE_Factory.listEntry(i, element.subject, element.predicate, element["object"]);
  }
};

var FBE_Handler = {
  onButtonClicked_ChangeTriple: function(id) {
    console.log("clicked on changing triple" + id);

    //change hidden and readonly attributes
    $("#feedbackModal_list_entry"+id+" > div > input").prop("readonly", false);
    $("#feedbackModal_list_entry_changeBtn"+id).hide();
  }
};

var FBE = {
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

    //Restart AngularJS
    angular.element(document).ready(function() {
      angular.bootstrap(document);
    });

    $("#feedbackForm").submit(FBE.createCommit);
    $("#feedbackModal").on('show.bs.modal', FBE.fillFeedbackModal);
  },

  fillFeedbackModal: function() {
    // TODO fill modal
    var modal = $(this);
    /*var url = document.URL;
    console.log(url);*/

    var resource = $(document).find("title").text();
    FBE.getTriples(resource);

    modal.find('.modal-title').text('Feedback on Ressource ' + $(document).find("title").text());
  },

  getTriples: function(resource) {
    //"http://de.dbpedia.org/data/" + resource + ".n3"
    $.get("./" + resource + ".n3")
      .done(function(data, text, jqxhr) {
        console.log(data);

        FBE.parseNewTriples(data, resource);
      })
      .fail(function(jqxhr, textStatus, error) {
        console.log(textStatus + " " + error);

        //has to be removed - show error
        FBE.parseNewTriples(Gegenteil_JSON, "Gegenteil");

        //hide progress bar
        //$("#feedbackModal_progressbar").hide();
      });
  },

  showNewTriples: function() {
    var newListEntrys = "";
    var i = 1;
    FBE.RessourceTuples.forEach(function(element) {
      newListEntrys += FBE_Factory.listEntryFromRDF(i, element) + "<br>";
      i++;
    });

    $("#feedbackModal_list").append(newListEntrys);

    //hide progress bar
    $("#feedbackModal_progressbar").hide();
  },

  //remove unnecessary elements from RessourceTuples
  cleanupNewTriples: function(ressourceName) {
    var i = 0;
    var namespace = "";
    for (; i < FBE.RessourceTuples.length; i++){
      var subject = FBE.RessourceTuples[i].subject;

      if (subject == "http://de.wikipedia.org/wiki/"+ressourceName) {
        namespace = FBE.RessourceTuples[i]["object"];
        break;
      }
    }

    if (namespace !== "") {
      var result = [];
      FBE.RessourceTuples.forEach(function(element) {
        if (element.subject == namespace)
          result.push(element);
      });

      console.log("Cleanup from ", FBE.RessourceTuples, " to ", result);

      FBE.RessourceTuples = result;

      FBE.showNewTriples();
    }
  },

  //Transforms RDF JSON from DBPedia to an object for the list view
  parseNewTriples: function(data, ressourceName) {
    var parser = N3.Parser({ format: 'turtle' });

    parser.parse(myn3___, function (error, triple, prefixes) {
       //console.log(triple, prefixes, error);

       if (triple)
         FBE.RessourceTuples.push(triple);
       else {
         FBE.cleanupNewTriples(ressourceName);
       }
     });
  },

  createCommit: function(event) {
    event.preventDefault();
    //TODO Look for naming and hashing
    var hash = SHA256_hash(new Date().toISOString());
    var insertRevision = hash,
      deleteRevision = hash,
      patchRevision = hash,
      revisionRevision = hash;

    var del = 'ex:delete-' + deleteRevision + getDeletes();
    var insert = 'ex:insert-' + insertRevision + getInserts();
    var trig = '@prefix ex: <http://example.org/feedback#>.\n' +
      '@prefix eccrev: <https://vocab.eccenca.com/revision/>.\n' +
      '@prefix prov: <http://www.w3.org/ns/prov#>.\n' +
      '@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.\n' +
      '@prefix rdfs: <http://www.w3.org/2001/XMLSchema#>.\n' +
      '@prefix owl: <http://www.w3.org/2002/07/owl#>.\n' +
      '{ ex:patch-' + patchRevision + ' a eccrev:Commit;\n' +
      '    eccrev:commitAuthor ex:' + $("#feedbackFormAuthor").val() + ';\n' +
      '    eccrev:commitMessage "' + $("#feedbackFormMessage").val() + '";\n' +
      '    prov:atTime "' + new Date().toISOString() + '"^^xsd:dateTime;\n' + //Format: 2015-12-17T13:37:00+01:00
      '    eccrev:sha256 "' + SHA256_hash(del + insert) + '"^^xsd:base64Binary.\n' +
      '  eccrev:revision-' + revisionRevision + ' a eccrev:Revision;\n' +
      '    eccrev:hasRevisionGraph ex:TargetGraph;\n' +
      '    eccrev:deltaDelete ex:delete-' + deleteRevision + ';\n' +
      '    eccrev:deltaInsert ex:insert-' + insertRevision + '\n' +
      '}\n';
    FBE.sendFeedback(trig + del + insert);
  },

  getInserts: function() {
    var inserts = ' {  }\n'; //TODO insert inserts from Kurt
    return inserts;
  },
  getDeletes: function() {
    var dels = '{  }'; //TODO insert deletes from Kurt
    return dels;
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

  getDiff: function() {
    //TODO Build var diffs like: [{s,p,o},{s,p,o},...]
    return diffs;
  },

  RessourceTuples: [],

  //update FBE.Deletions and FBE.Inserts
  updateChanges: function(ressourceName) {
    FBE.Deletions = [];
    FBE.Inserts = [];

    //get all inputs
    var inputs = $(".feedbackModal_list_entry_TYPE").find("input");

    //filter inputs
    var filteredInputs = [];
    inputs.toArray().forEach(function(input) {
      if (input.attributes["readonly"] === undefined)
      {
        filteredInputs.push(input);
      }
    });

    if (filteredInputs.length < 1)
      return;

    //fill Deletions and Inserts
    var map = {};
    filteredInputs.forEach(function(input) {
      //init map
      if (map[input.attributes["data_index"].value] === undefined)
        map[input.attributes["data_index"].value] = {
          old: {
            subject: "http://de.wikipedia.org/wiki/"+ressourceName,
            key: input.attributes["data_index"].value
          },
          new: {
            subject: "http://de.wikipedia.org/wiki/"+ressourceName,
            key: input.attributes["data_index"].value
          }
        };

      //fill map
      if (input.name == "predicate") {
        map[input.attributes["data_index"].value].old.predicate = input.attributes["data_original"].value;
        map[input.attributes["data_index"].value].new.predicate = input.value;
      }
      else {
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

  //Arrays with objects: {subject, predicate, object, key}
  Deletions: [],
  Inserts: []
};

$(document).ready(function() {
  FBE.addFeedbackButton();
});
