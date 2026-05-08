(function () {
  var input = document.getElementById("directory-search");
  var typeSelect = document.getElementById("directory-type");
  var list = document.getElementById("directory-list");
  var empty = document.getElementById("directory-empty");
  var countEl = document.getElementById("directory-count");

  if (!input || !list) return;

  var items = Array.prototype.slice.call(list.querySelectorAll(".directory__item"));

  function normalize(s) {
    return (s || "").toLowerCase().trim();
  }

  function filter() {
    var q = normalize(input.value);
    var selectedType = normalize(typeSelect && typeSelect.value);
    var shown = 0;

    items.forEach(function (li) {
      var name = normalize(li.getAttribute("data-search") || li.textContent);
      var bySearch = !q || name.indexOf(q) !== -1;
      var productType = normalize(li.getAttribute("data-type"));
      var byType = !selectedType || productType === selectedType;
      var match = bySearch && byType;
      li.hidden = !match;
      if (match) shown += 1;
    });

    if (countEl) {
      countEl.textContent =
        shown === items.length
          ? "Showing all " + items.length + " herbs (A-Z)."
          : "Showing " + shown + " of " + items.length + " herbs.";
    }

    if (empty) {
      empty.hidden = shown !== 0;
    }
  }

  input.addEventListener("input", filter);
  input.addEventListener("search", filter);
  if (typeSelect) {
    typeSelect.addEventListener("change", filter);
  }
  filter();
})();
