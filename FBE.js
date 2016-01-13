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
      '    <div class="modal-content">' +
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
      '             <input type="email" class="form-control" placeholder="Your email" required>' +
      '         </div>' +
      '         <div class="form-group">' +
      '             <input type="text" class="form-control" placeholder="Your Message" required>' +
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
    $("feedbackModalSave").submit(FBE.sendFeedback);
    $("#feedbackModal").on('show.bs.modal', FBE.fillFeedbackModal);
  },

  fillFeedbackModal: function() {
    // TODO fill modal
    var modal = $(this);
    /*var url = document.URL;
    console.log(url);*/
    var resource = $(document).find("title").text();
    FBE.getTriples(resource);
    modal.find('.modal-title').text('Feedback on Resource ' + $(document).find("title").text());
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
    console.log("submitted");
  },

  getDiff: function() {},

};

$(document).ready(function() {
  FBE.addFeedbackButton();
});
