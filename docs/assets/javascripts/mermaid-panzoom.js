document$.subscribe(() => {
  document.querySelectorAll('.mermaid svg').forEach((svg) => {
    if (svg.dataset.panzoom) return;
    svg.dataset.panzoom = 'true';

    const bbox = svg.getBoundingClientRect();
    svg.setAttribute('width', bbox.width || 600);
    svg.setAttribute('height', bbox.height || 400);

    svgPanZoom(svg, {
      zoomEnabled: true,
      controlIconsEnabled: true,
      fit: true,
      center: true,
      minZoom: 0.5,
      maxZoom: 10,
    });
  });
});