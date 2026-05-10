var API_BASE_URL = "http://localhost:3000/api";

// Replace this later with a real logged-in user from backend auth.

var currentUser = {
  id: null,
  name: "Demo Student",
  role: "student"
};

var allEvents = [];

function rsvp(clickEvent, button) {
  if (clickEvent) {
    clickEvent.stopPropagation();
  }

  var eventCard = button.closest(".eventCard");

  if (!eventCard) {
    return;
  }

  var eventId = eventCard.getAttribute("data-event-id");

  button.textContent = "Going";
  button.className = "rsvpBtn going";
  button.onclick = null;

  var notice = document.getElementById("rsvpNotice");

  if (notice) {
    notice.style.display = "block";

    setTimeout(function() {
      notice.style.display = "none";
    }, 4000);
  }

  if (!currentUser.id) {
    console.log("RSVP UI updated, but no real user ID is set yet.");
    return;
  }

  fetch(API_BASE_URL + "/rsvp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      eventId: eventId,
      userId: currentUser.id
    })
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(result) {
      console.log("RSVP saved:", result);
    })
    .catch(function(error) {
      console.log("Could not save RSVP:", error);
    });
}

var activeFilters = {
  today: false,
  free: false,
  virtual: false
};

function setPill(clickedPill, filter) {
  activeFilters[filter] = !activeFilters[filter];
  clickedPill.classList.toggle("active");
  filterEvents();
}


// Hides cards that do not match search, category, and pill filter
function filterEvents() {
  var searchInput = document.getElementById("searchInput");
  var categorySelect = document.getElementById("categorySelect");

  if (!searchInput || !categorySelect) {
    return;
  }

  var searchVal = searchInput.value.toLowerCase().trim();
  var categoryVal = categorySelect.value;

  var filteredEvents = allEvents.filter(function(event) {
    var searchableText = (
      (event.name || "") + " " +
      (event.org || "") + " " +
      (event.location || "") + " " +
      (event.category || "") + " " +
      (event.about || "")
    ).toLowerCase();

    var matchSearch = searchableText.indexOf(searchVal) !== -1;
    var matchCategory = categoryVal === "all" || event.category === categoryVal;

    var matchPill = true;

    if (activeFilters.today && !isToday(event.date)) {
      matchPill = false;
    }

    if (activeFilters.virtual && !isVirtualEvent(event)) {
      matchPill = false;
    }

    return matchSearch && matchCategory && matchPill;
  });

  renderEvents(filteredEvents);
}

function isToday(dateValue) {
  var eventDate = new Date(dateValue);
  var today = new Date();

  return (
    eventDate.getFullYear() === today.getFullYear() &&
    eventDate.getMonth() === today.getMonth() &&
    eventDate.getDate() === today.getDate()
  );
}

function isVirtualEvent(event) {
  var location = (event.location || "").toLowerCase();

  return (
    location.indexOf("online") !== -1 ||
    location.indexOf("virtual") !== -1 ||
    location.indexOf("zoom") !== -1
  );
}

function formatEventDate(dateValue) {
  var date = new Date(dateValue);

  if (isNaN(date.getTime())) {
    return "Date TBD";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function formatEventTime(dateValue) {
  var date = new Date(dateValue);

  if (isNaN(date.getTime())) {
    return "Time TBD";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
}

function getBadgeClass(category) {
  if (category === "academic") return "badgeBlue";
  if (category === "social") return "badgeGreen";
  if (category === "career") return "badgeAmber";
  if (category === "workshop") return "badgeRed";

  return "badgeBlue";
}

function getBannerColor(category) {
  if (category === "academic") return "#ddeaff";
  if (category === "social") return "#d4edda";
  if (category === "career") return "#fff3cd";
  if (category === "workshop") return "#fde8e8";

  return "#ddeaff";
}
// Rotates the campus hero images
var currentSlide = 0;

function rotateHeroImages() {
  var slides = document.getElementsByClassName("heroSlide");

  if (slides.length === 0) {
    return;
  }

  slides[currentSlide].classList.remove("active");

  currentSlide++;

  if (currentSlide >= slides.length) {
    currentSlide = 0;
  }

  slides[currentSlide].classList.add("active");
}

setInterval(rotateHeroImages, 8000);

function toggleDarkMode() {
  var toggle = document.getElementById("darkModeToggle");

  if (toggle.checked) {
    document.body.classList.add("darkMode");
    localStorage.setItem("darkMode", "on");
  } else {
    document.body.classList.remove("darkMode");
    localStorage.setItem("darkMode", "off");
  }
}

window.onload = function() {
  var savedMode = localStorage.getItem("darkMode");
  var toggle = document.getElementById("darkModeToggle");

  if (savedMode === "on") {
    document.body.classList.add("darkMode");

    if (toggle) {
      toggle.checked = true;
    }
  }
};

function loadEventsFromBackend() {
  fetch(API_BASE_URL + "/events")
    .then(function(response) {
      return response.json();
    })
    .then(function(events) {
      backendEvents = events;
      console.log("Loaded events from backend:", backendEvents);

      // Later we will turn this on:
      // renderEvents(backendEvents);
    })
    .catch(function(error) {
      console.log("Could not load events:", error);
    });
}

function loadOrgsFromBackend() {
  fetch(API_BASE_URL + "/orgs")
    .then(function(response) {
      return response.json();
    })
    .then(function(orgs) {
      backendOrgs = orgs;
      console.log("Loaded orgs from backend:", backendOrgs);
    })
    .catch(function(error) {
      console.log("Could not load orgs:", error);
    });
}

function loadRsvpsForEvent(eventId) {
  fetch(API_BASE_URL + "/rsvp/" + eventId)
    .then(function(response) {
      return response.json();
    })
    .then(function(rsvps) {
      backendRsvps = rsvps;
      console.log("Loaded RSVPs for event:", eventId, rsvps);
    })
    .catch(function(error) {
      console.log("Could not load RSVPs:", error);
    });
}

function createRsvpInBackend(eventId) {
  if (!currentUser.id) {
    console.log("Cannot RSVP yet: no real currentUser.id is set.");
    return;
  }

  var rsvpData = {
    eventId: eventId,
    userId: currentUser.id
  };

  fetch(API_BASE_URL + "/rsvp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(rsvpData)
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(savedRsvp) {
      console.log("RSVP saved:", savedRsvp);
    })
    .catch(function(error) {
      console.log("Could not save RSVP:", error);
    });
}

function deleteRsvpInBackend(eventId) {
  if (!currentUser.id) {
    console.log("Cannot delete RSVP yet: no real currentUser.id is set.");
    return;
  }

  var rsvpData = {
    eventId: eventId,
    userId: currentUser.id
  };

  fetch(API_BASE_URL + "/rsvp", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(rsvpData)
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(result) {
      console.log("RSVP removed:", result);
    })
    .catch(function(error) {
      console.log("Could not delete RSVP:", error);
    });
}