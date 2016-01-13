var FBE = {
  addFeedbackButton: function() {
    // TODO change this button to a hover button that resides at the left edge of the screen
    var button = '<button id="feedbackButton" type="button" class="btn btn-primary">Feedback</button>';
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
      '    <div class="modal-content" ng-controller="ModalController">{{dummy}}' +
      '      <div class="modal-header">' +
      '        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
      '        <h4 class="modal-title">Modal Title</h4>' +
      '      </div>' +
      '      <div class="modal-body">' +
      '        <p>Content</p>' +
      '        <hr>' +
      '        <form id="feedbackForm" class="form-inline">' +
      '         <p class="help-block">Please input your Credentials.</p>' +
      '         <div class="form-group">' +
      '             <input id="feedbackFormAuthor" type="email" class="form-control" placeholder="Your E-Mail" >' +
      '         </div>' +
      '         <div class="form-group">' +
      '             <input id="feedbackFormMessage" type="text" class="form-control" placeholder="Your Message" >' +
      '         </div>' +
      '        </form>' +
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
    //FBE.getTriples(resource);
    modal.find('.modal-title').text('Feedback on Ressource ' + $(document).find("title").text());
    //TODO fill in rdf content
  },

  getTriples: function(resource) {
    //"http://de.dbpedia.org/data/" + resource + ".n3"
    $.get("./" + resource + ".n3")
      .done(function(data, text, jqxhr) {
        console.log(data);
      })
      .fail(function(jqxhr, textStatus, error) {
        console.log(textStatus + " " + error);
      });
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


var FBE_A = angular.module("LDOW2016PF", []);
FBE_A.run(function($rootScope) {
  $rootScope.dummy = "";
});

function ModalController($scope) {
  $scope.dummy = "myDummy";
}
