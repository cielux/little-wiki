(function() {

  const URL_COPY = new URL(window.location);
  URL_COPY.port = 8081;
  const API_URL = URL_COPY.origin + '/api';

  $('#submit').click(() => {
    let articleName = $('#title').val();
    fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'CREATE',
        content: $('#text').val(),
        articleName
      }),
      credentials: 'include'
    }).then(() => {
      window.location.href = `/?${encodeURIComponent(articleName)}`;
    });
  });

})();
