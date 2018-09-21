$(document).on('click', '#sync-articles', function () {
  $.ajax({
    url: '/scrape',
    type: 'GET',
    success: function (response) {
      alert("Found: " + response.found + " new article(s)!");

      for (var i = 0; i < response.articles.length; i++) {
        $("#articles").prepend('<div class="card m-3">\n' +
          '    <div class="card-body">\n' +
          '        <h5 class="card-title">' + response.articles[i].headline + '</h5>\n' +
          '        <p class="card-text">' + response.articles[i].summary + '</p>\n' +
          '        <a href="/notes/' + response.articles[i]._id + '" class="btn btn-primary">View Notes</a>\n' +
          '        <span class="btn btn-warning save-article" articleid="' + response.articles[i]._id + '">Save Article</span>\n' +
          '    </div>\n' +
          '</div>');
      }
    }
  });
});

$(document).on('click', '.save-article', function () {
  var mySpan = $(this);

  $.ajax({
    url: '/articles/' + $(this).attr('articleid') + '/save',
    type: 'POST',
    success: function (response) {
      mySpan.removeClass("save-article btn-warning").addClass("btn-danger unsave-article").html("Remove Saved");
    }
  });
});

$(document).on('click', '.unsave-article', function () {
  var mySpan = $(this);

  $.ajax({
    url: '/articles/' + $(this).attr('articleid') + '/unsave',
    type: 'POST',
    success: function (response) {
      mySpan.removeClass("unsave-article btn-danger").addClass("btn-warning save-article").html("Save Article");
    }
  });
});

$(document).on('click', '.remove-note', function () {
  var noteId = $(this).attr('noteid');

  $.ajax({
    url: '/articles/' + noteId + '/note/delete',
    type: 'POST',
    success: function (response) {
      $("#" + noteId).hide();
    }
  });
});

$(document).on('click', '#add-note', function () {
  var articleId = $(this).attr('articleid');

  $.ajax({
    url: '/articles/' + articleId + '/note',
    type: 'POST',
    data: {message: $("#note-text").val()},
    success: function (response) {
      $("#note-text").val("");


      $("#notes").append('<div id="'+ response._id +'" class="card m-3">\n' +
        '            <div class="card-body">\n' +
        '                <p class="card-text">' + response.message + '</p>\n' +
        '                <span class="btn btn-danger remove-note" noteid="'+ response._id +'">Remove Note</span>\n' +
        '            </div>\n' +
        '        </div>');
    }
  });
});
