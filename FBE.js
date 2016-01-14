var FBE_Factory = {
  listEntry: function(id, subject, predicate, object) {
    var html = '        <div>' +
      '        <form class="form-inline" id="feedbackModal_list_entry' + id + '" style="display: inline-block; width: 92%">' +
      '         <div class="form-group" style="width: 39%">' +
      '             <input type="text" class="form-control pred-value" value="' + subject + '" readonly>' +
      '         </div>' +
      '         &nbsp;&nbsp;' +
      '         <div class="form-group" style="width: 20%">' +
      '             <input type="text" class="form-control pred-value" value="' + predicate + '" readonly>' +
      '         </div>' +
      '         &nbsp;&nbsp;' +
      '         <div class="form-group" style="width: 39%">' +
      '             <input type="text" class="form-control pred-value" value="' + object + '" readonly>' +
      '         </div>' +
      '        </form>' +
      '         &nbsp;&nbsp;' +
      '        <button id="feedbackModal_list_entry_changeBtn' + id + '" onclick="FBE_Handler.onButtonClicked_ChangeTriple(' + id + ')" class="btn btn-default dropdown-toggle feedbackbtn" style="display: inline-block;">&Auml;ndern</button>' +
      '        <button id="feedbackModal_list_entry_saveBtn' + id + '" onclick="FBE_Handler.onButtonClicked_SaveTriple(' + id + ')" class="btn btn-default dropdown-toggle feedbackbtn" style="display: none;"">Speichern</button>' +
      '        </div>';

    return html;
  }
};

var FBE_Handler = {
  onButtonClicked_ChangeTriple: function(id) {
    console.log("clicked on changing triple" + id);

    //change hidden and readonly attributes
    $("#feedbackModal_list_entry" + id + " > div > input").prop("readonly", false);
    $("#feedbackModal_list_entry_changeBtn" + id).hide();
    $("#feedbackModal_list_entry_saveBtn" + id).show();
  },

  onButtonClicked_SaveTriple: function(id) {
    console.log("clicked on saving triple " + id);

    //safe changes


    //change hidden and readonly attributes
    $("#feedbackModal_list_entry" + id + " > div > input").prop("readonly", true);
    $("#feedbackModal_list_entry_changeBtn" + id).show();
    $("#feedbackModal_list_entry_saveBtn" + id).hide();
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
        FBE.parseNewTriples(Gegenteil_JSON, resource);

        //hide progress bar
        //$("#feedbackModal_progressbar").hide();
      });
  },

  //Transforms RDF JSON from DBPedia to an object for the list view
  parseNewTriples: function(data, ressourceName) {
    var prepareRDFJSONForListView = function(json, ressourceName) {
      if (json === undefined || json === null || json.length < 1 || json == {})
        return [];

      var object = getNeededRessourceFromRDF(json, ressourceName);

      var result = [];
      for (var key in object) {
        var entryList = object[key];
        entryList.forEach(function(entry) {
          result.push({
            subject: key,
            predicate: entry.type,
            object_: entry.value
          });
        });
      }

      return {
        name: ressourceName,
        triples: result
      };
    };

    var getNeededRessourceFromRDF = function(json, ressourceName) {
      var ressource = json["http://de.wikipedia.org/wiki/" + ressourceName];
      return json[ressource["http://xmlns.com/foaf/0.1/primaryTopic"][0].value];
    };

    if (data === undefined || data === null || data == {})
      return;

    var result = prepareRDFJSONForListView(data, "Gegenteil"); //ressourceName);

    console.log("parsed RDF JSON:");
    console.log(result);

    var newListEntrys = "";
    var i = 1;
    result.triples.forEach(function(element) {
      newListEntrys += FBE_Factory.listEntry(i, element.subject, element.predicate, element.object_) + "<br>";
      i++;
    });

    $("#feedbackModal_list").append(newListEntrys);

    //hide progress bar
    $("#feedbackModal_progressbar").hide();
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

};

$(document).ready(function() {
  FBE.addFeedbackButton();
});
