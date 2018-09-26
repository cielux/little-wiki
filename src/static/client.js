(function() {

  const URL_COPY = new URL(window.location);
  URL_COPY.port = 8081;
  const API_URL = URL_COPY.origin + '/api';

  function transformLinks(wikiMarkup) {
    let idx = 0;
    let rest = wikiMarkup;
    let result = '';
    let next = rest.indexOf('[[');
    while (next !== -1) {
      result += rest.slice(0, next);
      rest = rest.slice(next + 2);
      let end = rest.indexOf(']]');
      let content = rest.slice(0, end);
      result += `<a href="?${encodeURIComponent(content)}">${content}</a>`;
      rest = rest.slice(end + 2);
      next = rest.indexOf('[[');
    }
    result += rest;
    return result;
  }

  function render(wikiMarkup) {
    let paragraphs = wikiMarkup.split('\n\n');
    return $(paragraphs.map(p => `<p>${transformLinks(p)}</p>`).join(''));
  }

  let articleName = window.location.search.slice(1);
  if (articleName !== '') {
    fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'READ',
        articleName
      }),
      credentials: 'include'
    }).then(result => result.json()).then(response => {
      $('#articleName').html(articleName);
      $('#content').html(render(response.content));
    });
  }

})();
