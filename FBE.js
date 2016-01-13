var FBE_Factory = {
  listEntry: function(id, subject, predicate, object) {
    var html = '        <form class="form-inline" id="feedbackModal_list_entry'+id+'">' +
      '         <div class="form-group">' +
      '             <input type="text" class="form-control" value="'+subject+'" readonly>' +
      '         </div>' +
      '         &nbsp;&nbsp;' +
      '         <div class="form-group">' +
      '             <input type="text" class="form-control" value="'+predicate+'" readonly>' +
      '         </div>' +
      '         &nbsp;&nbsp;' +
      '         <div class="form-group">' +
      '             <input type="text" class="form-control" value="'+object+'" readonly>' +
      '         </div>' +
      '        </form>'+
      '        <button onclick="FBE_Handler.onButtonClicked_ChangeTriple('+id+')" style="display: inline-block;">&Auml;ndern</button>';

      return html;
  }
};

var FBE_Handler = {
  onButtonClicked_ChangeTriple: function(id) {
    console.log("clocked on Changing "+id);
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
    var modal = '<div id="feedbackModal" class="modal fade" tabindex="-1" role="dialog" style="width: 100% !important;">' +
      '  <div class="modal-dialog modal-lg" style="width: 100% !important;">' +
      '    <div class="modal-content">' +
      '      <div class="modal-header">' +
      '        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
      '        <h4 class="modal-title">Modal Title</h4>' +
      '      </div>' +
      '      <div class="modal-body">' +
      '        <p>Content</p>' +
      '        <hr>' +
      '        <div id="feedbackModal_list"></div>' +
      '      </div>' +
      '      <div class="modal-footer">' +
      '       <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>' +
      '       <button id="feedbackModalSave" type="submit" form="feedbackForm" class="btn btn-success">Save changes</button>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '</div>';
    $("body").append(modal);

    //Restart AngularJS
    angular.element(document).ready(function() {
      angular.bootstrap(document);
    });

    $("#feedbackForm").submit(FBE.sendFeedback);
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
    //TODO fill in rdf content
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

        FBE.parseNewTriples(Gegenteil_JSON, resource);
      });
  },

  //Transforms RDF JSON from DBPedia to an object for the list view
  parseNewTriples: function(data, ressourceName) {
    var prepareRDFJSONForListView = function(json, ressourceName) {
        if (json === undefined || json === null || json.length < 1 || json == {})
          return [];

        var object = getNeededRessourceFromRDF(json, ressourceName);

        var result = [];
        for (var key in object){
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

    var result = prepareRDFJSONForListView(data, "Gegenteil");//ressourceName);

    console.log("parsed RDF JSON:");
    console.log(result);

    var newListEntrys = "";
    var i = 1;
    result.triples.forEach(function(element) {
      newListEntrys += FBE_Factory.listEntry(i, element.subject, element.predicate, element.object_) + "<br>";
      i++;
    });

    $("#feedbackModal_list").append(newListEntrys);
  },

  sendFeedback: function(event) {
    event.preventDefault();
    var parser = N3.Parser({
      format: 'application/trig'
    });
    parser.parse('@prefix ex: <http://example.org/feedback#>.\n' +
      '@prefix eccrev: <https://vocab.eccenca.com/revision/>.\n' +
      '@prefix prov: <http://www.w3.org/ns/prov#>.\n' +
      '@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.\n' +
      'ex:patch-9999999 a eccrev:Commit;\n' +
      'eccrev:commitAuthor ex:' + $("#feedbackFormAuthor").val() + ';\n' +
      'eccrev:commitMessage "' + $("#feedbackFormMessage").val() + '";\n' +
      'prov:atTime "' + new Date().toISOString() + '"^^xsd:dateTime;\n' + //Format: 2015-12-17T13:37:00+01:00
      'eccrev:sha256 "9999999"^^xsd:base64Binary;\n' +
      'eccrev:deltaDelete ex:delete-9999999;\n' +
      'eccrev:deltaInsert ex:insert-9999999.',
      function(error, triple, prefixes) {
        if (triple)
          console.log(triple.subject, triple.predicate, triple.object, '.');
        else
          console.log("# That's all, folks!", prefixes);
      });
    var writer = N3.Writer({
      format: 'application/trig'
    });
    /*writer.addTriples(getDiff());
    //TODO add infos
    writer.end(function(error, result) {
      console.log(result + " " + error);
    });*/
  },

  getDiff: function() {
    //TODO Build var diffs like: [{s,p,o},{s,p,o},...]
    return diffs;
  },

};

$(document).ready(function() {
  FBE.addFeedbackButton();
});
