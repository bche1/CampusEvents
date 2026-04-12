// Called when any RSVP button is clicked
function rsvp(button) {
  button.textContent = "Going";
  button.className = "rsvpBtn going";
  button.onclick = null;

  var notice = document.getElementById("rsvpNotice");
  notice.style.display = "block";

  setTimeout(function() {
    notice.style.display = "none";
  }, 4000);
}

// Removes active class from all pills, adds it to clicked pill
function setPill(clickedPill, filter) {
  var pills = document.getElementsByClassName("filterPill");
  for (var i = 0; i < pills.length; i++) {
    pills[i].className = "filterPill";
  }
  clickedPill.className = "filterPill active";
  filterEvents();
}

// Hides cards that don't match the search text or selected category
function filterEvents() {
  var searchVal = document.getElementById("searchInput").value.toLowerCase();
  var categoryVal = document.getElementById("categorySelect").value;
  var cards = document.getElementsByClassName("eventCard");

  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    var name = card.getAttribute("data-name").toLowerCase();
    var cat = card.getAttribute("data-category");

    var matchSearch = name.indexOf(searchVal) !== -1;
    var matchCategory = categoryVal === "all" || cat === categoryVal;

    if (matchSearch && matchCategory) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  }
}
