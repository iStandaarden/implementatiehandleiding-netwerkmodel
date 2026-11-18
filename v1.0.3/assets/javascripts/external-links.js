/*
Open external links in a nieuwe tab. 
*/
function markExternalLinks() {
  document.querySelectorAll(
    'a[href^="http"]:not([href*="istandaarden.github.io/implementatiehandleiding-netwerkmodel" i], [href*="127.0.0.1:8000/implementatiehandleiding-netwerkmodel" i], [href*="github.com/istandaarden/implementatiehandleiding-netwerkmodel" i])'
  ).forEach(function (link) {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer'); /* laat staan voor veiligheid en privacy */
  });
}

if (typeof document$ !== 'undefined') {
  // Material for MkDocs (ook met instant navigation)
  document$.subscribe(markExternalLinks);
} else {
  document.addEventListener('DOMContentLoaded', markExternalLinks);
}