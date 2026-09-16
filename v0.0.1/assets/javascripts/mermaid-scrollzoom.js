/* Zoombare mermaid-diagrammen voor Material for MkDocs.
 *
 * Achtergrond: Material rendert mermaid-fences (pre.mermaid) in een gesloten
 * shadow root, waardoor scripts niet bij de SVG kunnen en zoomen of fullscreen
 * onmogelijk is. Dit script rendert de fences daarom zelf, in de gewone DOM,
 * en koppelt svg-pan-zoom (scrollen = zoomen, slepen = verschuiven) plus een
 * fullscreen-knop aan elk diagram.
 *
 * Vereist in mkdocs.yml (zie README.md):
 *   - superfences custom fence "mermaid" met class "mermaid-zoom"
 *     (zodat Material's eigen shadow-DOM-renderer de fences niet oppakt)
 *   - dit bestand in extra_javascript
 *   - mermaid-zoom.css in extra_css
 *
 * mermaid en svg-pan-zoom worden gebruikt wanneer ze al via extra_javascript
 * geladen zijn; anders laadt dit script ze zelf van CDN.
 */
(function () {
  "use strict";

  var MERMAID_SRC = "https://unpkg.com/mermaid@11/dist/mermaid.min.js";
  var PANZOOM_SRC = "https://unpkg.com/svg-pan-zoom@3.6.2/dist/svg-pan-zoom.min.js";
  var teller = 0;

  function laadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function zorgVoorAfhankelijkheden() {
    var nodig = [];
    if (!window.mermaid) nodig.push(laadScript(MERMAID_SRC));
    if (!window.svgPanZoom) nodig.push(laadScript(PANZOOM_SRC));
    return Promise.all(nodig);
  }

  function maakFullscreenKnop(blok, herpas) {
    var knop = document.createElement("button");
    knop.type = "button";
    knop.className = "mermaid-zoom-blok__fs";
    knop.title = "Diagram op volledig scherm (sluiten met Esc)";
    knop.setAttribute("aria-label", knop.title);
    knop.textContent = "⛶";

    /* Fallback: pseudo-fullscreen via een schermvullende overlay, voor als
       de Fullscreen API ontbreekt of het verzoek wordt geweigerd. */
    function openMaxi() {
      blok.classList.add("mermaid-zoom-blok--maxi");
      document.body.style.overflow = "hidden";
      setTimeout(herpas, 150);
    }
    function sluitMaxi() {
      blok.classList.remove("mermaid-zoom-blok--maxi");
      document.body.style.overflow = "";
      setTimeout(herpas, 150);
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && blok.classList.contains("mermaid-zoom-blok--maxi")) sluitMaxi();
    });

    knop.addEventListener("click", function () {
      if (document.fullscreenElement === blok) {
        document.exitFullscreen();
        return;
      }
      if (blok.classList.contains("mermaid-zoom-blok--maxi")) {
        sluitMaxi();
        return;
      }
      var verzoek;
      try {
        verzoek = blok.requestFullscreen ? blok.requestFullscreen()
          : blok.webkitRequestFullscreen ? blok.webkitRequestFullscreen()
          : Promise.reject(new Error("Fullscreen API niet beschikbaar"));
      } catch (fout) {
        verzoek = Promise.reject(fout);
      }
      Promise.resolve(verzoek).catch(openMaxi);
    });
    return knop;
  }

  function toonDiagram(blok, svgTekst) {
    var stage = document.createElement("div");
    stage.className = "mermaid-zoom-blok__stage";
    stage.innerHTML = svgTekst;
    blok.appendChild(stage);

    var hint = document.createElement("span");
    hint.className = "mermaid-zoom-blok__hint";
    hint.textContent = "scrollen = zoomen · slepen = verschuiven";
    blok.appendChild(hint);

    var svg = stage.querySelector("svg");
    var natuurlijkeHoogte = svg.getBoundingClientRect().height || 400;
    var normaleHoogte = Math.max(180, Math.min(Math.ceil(natuurlijkeHoogte) + 32, Math.round(window.innerHeight * 0.7)));
    blok.style.height = normaleHoogte + "px";

    svg.style.maxWidth = "none";
    svg.style.width = "100%";
    svg.style.height = "100%";

    var panZoom = window.svgPanZoom(svg, {
      zoomEnabled: true,
      controlIconsEnabled: true,
      fit: true,
      center: true,
      minZoom: 0.3,
      maxZoom: 20,
      zoomScaleSensitivity: 0.4
    });

    var herpas = function () {
      panZoom.resize();
      panZoom.fit();
      panZoom.center();
    };
    blok.appendChild(maakFullscreenKnop(blok, herpas));
    document.addEventListener("fullscreenchange", function () {
      blok.style.height = document.fullscreenElement === blok ? "100%" : normaleHoogte + "px";
      setTimeout(herpas, 150);
    });
    window.addEventListener("resize", function () { setTimeout(herpas, 150); });
  }

  function renderEl(el) {
    el.dataset.mermaidZoom = "true";
    var bron = el.querySelector("code, pre") || el;
    var code = bron.textContent.trim();

    /* De bron blijft (via CSS verborgen) in de DOM staan als fallback;
       het gerenderde diagram komt er direct voor. */
    var blok = document.createElement("div");
    blok.className = "mermaid-zoom-blok";
    el.parentNode.insertBefore(blok, el);

    var id = "mermaid-zoom-" + (++teller);
    var toonFout = function (fout) {
      blok.remove();
      el.style.display = "block";
      var rest = document.getElementById(id);
      if (rest) rest.remove();
      console.error("mermaid-zoom:", fout);
    };
    try {
      var resultaat = window.mermaid.render(id, code);
      if (resultaat && typeof resultaat.then === "function") {
        resultaat.then(function (uit) { toonDiagram(blok, uit.svg); }, toonFout);
      } else if (typeof resultaat === "string") {
        toonDiagram(blok, resultaat); /* mermaid v9 */
      }
    } catch (fout) {
      toonFout(fout);
    }
  }

  function initAlle() {
    var elementen = document.querySelectorAll(
      "pre.mermaid-zoom:not([data-mermaid-zoom]), div.mermaid-zoom:not([data-mermaid-zoom])"
    );
    if (!elementen.length) return;
    zorgVoorAfhankelijkheden().then(function () {
      window.mermaid.initialize({ startOnLoad: false });
      elementen.forEach(renderEl);
    }).catch(function (fout) {
      console.error("mermaid-zoom: afhankelijkheden laden mislukt", fout);
    });
  }

  /* Eenmalig aanhaken; document$ dekt ook Material instant navigation. */
  if (!window.__mermaidZoomGestart) {
    window.__mermaidZoomGestart = true;
    if (window.document$ && typeof window.document$.subscribe === "function") {
      window.document$.subscribe(initAlle);
    } else if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initAlle);
    } else {
      initAlle();
    }
  }
})();
