var API_BASE_URL = "https://campusevents-olmp.onrender.com/api";


// Replace this later with a real logged-in user from backend auth.

var currentUser = {
  id: localStorage.getItem("currentUserId"),
  username: localStorage.getItem("currentUsername"),
  email: localStorage.getItem("currentUserEmail")
};
var myEventIds = [];
var allEvents = [];


var activeFilters = {
  today: false,
  free: false,
  virtual: false
};

var currentView = "myEvents";

var browseCurrentPage = 1;
var browseEventsPerPage = 2; // temp set to to 2

var authMode = "login";
var logoutConfirmActive = false;

function normalizeId(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (value._id) {
    return String(value._id);
  }

  return String(value);
}

function userHasRsvped(eventId) {
  var cleanEventId = normalizeId(eventId);

  return myEventIds.some(function(savedEventId) {
    return normalizeId(savedEventId) === cleanEventId;
  });
}

function showView(viewName) {
  currentView = viewName;

  var myEventsView = document.getElementById("myEventsView");
  var browseView = document.getElementById("browseView");

  var myEventsNav = document.getElementById("myEventsNav");
  var browseNav = document.getElementById("browseNav");

  if (viewName === "browse") {
    myEventsView.classList.add("hiddenView");
    browseView.classList.remove("hiddenView");

    myEventsNav.classList.remove("active");
    browseNav.classList.add("active");

    browseCurrentPage = 1;
    restartViewAnimation(browseView);
  } else {
    myEventsView.classList.remove("hiddenView");
    browseView.classList.add("hiddenView");

    myEventsNav.classList.add("active");
    browseNav.classList.remove("active");

    restartViewAnimation(myEventsView);
  }

  filterEvents();
}

function goToBrowseView() {
  showView("browse");

  setTimeout(function() {
    var browseView = document.getElementById("browseView");

    if (browseView) {
      browseView.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }, 80);
}

function restartViewAnimation(viewElement) {
  if (!viewElement) {
    return;
  }

  viewElement.classList.remove("viewPanel");

  void viewElement.offsetWidth;

  viewElement.classList.add("viewPanel");
}

function registerUser() {
  var usernameInput = document.getElementById("authUsername");
  var emailInput = document.getElementById("authEmail");
  var passwordInput = document.getElementById("authPassword");
  var statusMessage = document.getElementById("authStatusMessage");

  var username = usernameInput.value.trim();
  var email = emailInput.value.trim();
  var password = passwordInput.value.trim();

  statusMessage.textContent = "";
  statusMessage.className = "";

  if (!username || !email || !password) {
    statusMessage.textContent = "Registration failed: please enter username, email, and password.";
    statusMessage.className = "error";
    return;
  }

  fetch(API_BASE_URL + "/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: username,
      email: email,
      password: password
    })
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(result) {
      console.log("Register result:", result);

      if (result.user) {
        statusMessage.textContent = "Account created. You can now log in.";
        statusMessage.className = "success";
      } else {
        statusMessage.textContent = result.message || "Registration failed: could not create account.";
        statusMessage.className = "error";
      }
    })
    .catch(function(error) {
      console.log("Register error:", error);

      statusMessage.textContent = "Registration failed: could not connect to the server.";
      statusMessage.className = "error";
    });
}

function loginUser() {
  var email = document.getElementById("authEmail").value.trim();
  var password = document.getElementById("authPassword").value.trim();
  var statusMessage = document.getElementById("authStatusMessage");

  if (statusMessage) {
    statusMessage.textContent = "";
    statusMessage.className = "";
  }

  if (!email || !password) {
    if (statusMessage) {
      statusMessage.textContent = "Login failed: please enter email and password.";
      statusMessage.className = "error";
    }

    return;
  }

  fetch(API_BASE_URL + "/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(result) {
      console.log("Login result:", result);

      if (result.user) {
        currentUser.id = result.user.id;
        currentUser.username = result.user.username;
        currentUser.email = result.user.email;

        localStorage.setItem("currentUserId", currentUser.id);
        localStorage.setItem("currentUsername", currentUser.username);
        localStorage.setItem("currentUserEmail", currentUser.email);

        if (statusMessage) {
          statusMessage.textContent = "Login successful. Logged in as " + currentUser.username + ".";
          statusMessage.className = "success";
        }

        updateAuthStatus();
        filterEvents();
        loadMyRsvpsFromBackend();

        setTimeout(function() {
          closeAuthModal();
        }, 900);
      } else {
        if (statusMessage) {
          statusMessage.textContent = result.message || "Login failed: incorrect email or password.";
          statusMessage.className = "error";
        }
      }
    })
    .catch(function(error) {
      console.log("Login error:", error);

      if (statusMessage) {
        statusMessage.textContent = "Login failed: could not connect to the server.";
        statusMessage.className = "error";
      }
    });
}

function logoutUser() {
  var logoutBtn = document.getElementById("logoutNavBtn");

  if (!logoutConfirmActive) {
    logoutConfirmActive = true;

    if (logoutBtn) {
      logoutBtn.textContent = "You sure?";
      logoutBtn.classList.add("confirmingLogout");
    }

    setTimeout(function() {
      document.addEventListener("click", cancelLogoutConfirm);
    }, 0);

    return;
  }

  logoutConfirmActive = false;

  currentUser.id = null;
  currentUser.username = null;
  currentUser.email = null;

  localStorage.removeItem("currentUserId");
  localStorage.removeItem("currentUsername");
  localStorage.removeItem("currentUserEmail");

  document.removeEventListener("click", cancelLogoutConfirm);

  updateAuthStatus();
  myEventIds = [];
  filterEvents();
}

function cancelLogoutConfirm(event) {
  var logoutBtn = document.getElementById("logoutNavBtn");

  if (logoutBtn && logoutBtn.contains(event.target)) {
    return;
  }

  logoutConfirmActive = false;

  if (logoutBtn) {
    logoutBtn.textContent = "Logout";
    logoutBtn.classList.remove("confirmingLogout");
  }

  document.removeEventListener("click", cancelLogoutConfirm);
}

function updateAuthStatus() {
  var navUserStatus = document.getElementById("navUserStatus");
  var loginNavBtn = document.getElementById("loginNavBtn");
  var registerNavBtn = document.getElementById("registerNavBtn");
  var logoutNavBtn = document.getElementById("logoutNavBtn");

  if (!navUserStatus) {
    return;
  }

  if (currentUser.id) {
    navUserStatus.textContent = currentUser.username;

    if (loginNavBtn) {
      loginNavBtn.classList.add("hiddenView");
    }

    if (registerNavBtn) {
      registerNavBtn.classList.add("hiddenView");
    }

    if (logoutNavBtn) {
      logoutNavBtn.classList.remove("hiddenView");
    }

    if (logoutNavBtn) {
      logoutNavBtn.classList.remove("hiddenView");
      logoutNavBtn.textContent = "Logout";
      logoutNavBtn.classList.remove("confirmingLogout");
    }
  } else {
    navUserStatus.textContent = "Not logged in";

    if (loginNavBtn) {
      loginNavBtn.classList.remove("hiddenView");
    }

    if (registerNavBtn) {
      registerNavBtn.classList.remove("hiddenView");
    }

    if (logoutNavBtn) {
      logoutNavBtn.classList.add("hiddenView");
    }
  }
}

function rsvp(clickEvent, button, eventIdOverride) {
  if (clickEvent) {
    clickEvent.stopPropagation();
  }

  var eventId = eventIdOverride;

  if (!eventId && button) {
    var eventCard = button.closest(".eventCard");

    if (eventCard) {
      eventId = eventCard.getAttribute("data-event-id");
    }
  }

  if (!eventId) {
    console.log("No event ID found for RSVP.");
    return;
  }

  if (!currentUser.id) {
    alert("Please log in before RSVPing.");
    openAuthModal("login");
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
      return response.json().then(function(data) {
        if (!response.ok) {
          throw data;
        }

        return data;
      });
    })
    .then(function(result) {
      console.log("RSVP saved:", result);

      saveMyEventId(eventId);
      loadMyRsvpsFromBackend();

      if (button) {
        button.textContent = "Going";
        button.className = "rsvpBtn going";
        button.onclick = null;
      }

      var notice = document.getElementById("rsvpNotice");

      if (notice) {
        notice.style.display = "block";

        setTimeout(function() {
          notice.style.display = "none";
        }, 4000);
      }

      if (currentView === "myEvents") {
        filterEvents();
      }
    })
    .catch(function(error) {
      console.log("Could not save RSVP:", error);

      if (error && error.error === "Already registered") {
        saveMyEventId(eventId);
        loadMyRsvpsFromBackend();

        if (button) {
          button.textContent = "Going";
          button.className = "rsvpBtn going";
          button.onclick = null;
        }

        alert("You already RSVP’d to this event.");
      } else {
        alert("Could not save RSVP.");
      }
    });
}

function loadMyRsvpsFromBackend() {
  if (!currentUser.id) {
    myEventIds = [];
    filterEvents();
    return;
  }

  fetch(API_BASE_URL + "/rsvp/user/" + currentUser.id)
    .then(function(response) {
      if (!response.ok) {
        throw new Error("RSVP route not available yet. Status: " + response.status);
      }

      return response.json();
    })
    .then(function(rsvps) {
      console.log("Loaded my RSVPs:", rsvps);

      if (!Array.isArray(rsvps)) {
        console.log("RSVP response was not an array:", rsvps);
        myEventIds = [];
        filterEvents();
        return;
      }

      myEventIds = rsvps.map(function(rsvp) {
        return normalizeId(rsvp.eventId);
      });

      console.log("My RSVP event IDs:", myEventIds);

      filterEvents();
    })
    .catch(function(error) {
      console.log("Could not load user RSVPs:", error);

      myEventIds = [];
      filterEvents();
    });
}

function saveMyEventId(eventId) {
  var cleanEventId = normalizeId(eventId);

  if (!userHasRsvped(cleanEventId)) {
    myEventIds.push(cleanEventId);
  }
}

function getMyEvents() {
  return allEvents.filter(function(eventItem) {
    return userHasRsvped(eventItem._id);
  });
}

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

  if (currentView === "browse") {
    browseCurrentPage = 1;
  }

  var searchVal = searchInput.value.toLowerCase().trim();
  var categoryVal = categorySelect.value;

  var startingEvents = allEvents;
  if (currentView === "myEvents") {
    startingEvents = getMyEvents();
  }

  var filteredEvents = startingEvents.filter(function(eventItem) {
    var searchableText = (
      (eventItem.name || "") + " " +
      (eventItem.org || "") + " " +
      (eventItem.location || "") + " " +
      (eventItem.category || "") + " " +
      (eventItem.about || "")
    ).toLowerCase();

    var matchSearch = searchableText.indexOf(searchVal) !== -1;
    var matchCategory = categoryVal === "all" || eventItem.category === categoryVal;

    var matchPill = true;

    if (activeFilters.today && !isToday(eventItem.date)) {
      matchPill = false;
    }

    if (activeFilters.virtual && !isVirtualEvent(eventItem)) {
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

function isVirtualEvent(eventItem) {
  var location = (eventItem.location || "").toLowerCase();

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

  updateAuthStatus();
  loadEventsFromBackend();

};

function loadEventsFromBackend() {
  fetch(API_BASE_URL + "/events")
    .then(function(response) {
      return response.json();
    })
    .then(function(events) {
      allEvents = events;
      filterEvents();
      updateHeroStats();

      if (currentUser.id) {
        loadMyRsvpsFromBackend();
      }

    })
    .catch(function(error) {
      console.log("Could not load events:", error);

      var eventGrid = document.getElementById("eventGrid");

      if (eventGrid) {
        eventGrid.innerHTML = "<p>Could not load events. Please try again later.</p>";
      }
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

function renderEvents(events) {
  var eventGrid;

  if (currentView === "browse") {
    eventGrid = document.getElementById("browseEventGrid");
  } else {
    eventGrid = document.getElementById("eventGrid");
  }

  if (!eventGrid) {
    return;
  }

  if (!eventGrid) {
    return;
  }

  eventGrid.innerHTML = "";

  var eventsToRender = events;
  
  if (currentView === "browse") {
    var startIndex = (browseCurrentPage - 1) * browseEventsPerPage;
    var endIndex = startIndex + browseEventsPerPage;

    eventsToRender = events.slice(startIndex, endIndex);
  }

  for (var i = 0; i < eventsToRender.length; i++) {
    var eventItem = eventsToRender[i];

    var card = document.createElement("div");
    card.className = "eventCard";

    card.setAttribute("data-event-id", eventItem._id);
    card.setAttribute("data-category", eventItem.category || "");
    card.setAttribute("data-name", eventItem.name || "");

    card.onclick = function() {
      var eventId = this.getAttribute("data-event-id");
      showEventDetails(eventId);
    };

    var category = eventItem.category || "academic";
    var badgeClass = getBadgeClass(category);
    var bannerColor = getBannerColor(category);
    var dateText = formatEventDate(eventItem.date);

    var alreadyGoing = userHasRsvped(eventItem._id);
    var rsvpButtonHtml = "";

    if (alreadyGoing) {
      rsvpButtonHtml = '<button class="rsvpBtn going" disabled>Going</button>';
    } else {
      rsvpButtonHtml = '<button class="rsvpBtn" onclick="rsvp(event, this)">RSVP</button>';
    }

    card.innerHTML =
      '<div class="eventCardBanner" style="background-color: ' + bannerColor + ';">' +
        '<div class="eventDateChip">' + dateText + '</div>' +
      '</div>' +
      '<div class="eventCardBody">' +
        '<div class="eventOrg">' + (eventItem.org || "Campus Organization") + '</div>' +
        '<div class="eventName">' + (eventItem.name || "Untitled Event") + '</div>' +
        '<div class="eventMeta">' + dateText + '<br>' + (eventItem.location || "Location TBD") + '</div>' +
        '<div class="eventFooter">' +
          '<span class="categoryBadge ' + badgeClass + '">' + category + '</span>' +
          rsvpButtonHtml +
        '</div>' +
      '</div>';

    eventGrid.appendChild(card);
  }

  updateNoResultsMessage(events.length);
  renderBrowsePagination(events.length);

  if (events.length > 0) {
    showEventDetails(events[0]._id);
  }
}

function renderBrowsePagination(totalEvents) {
  var pagination = document.getElementById("browsePagination");

  if (!pagination) {
    return;
  }

  if (currentView !== "browse") {
    pagination.innerHTML = "";
    return;
  }

  var totalPages = Math.ceil(totalEvents / browseEventsPerPage);

  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  var html = "";

  html += '<button class="pageBtn" onclick="changeBrowsePage(' + (browseCurrentPage - 1) + ')">Previous</button>';

  for (var i = 1; i <= totalPages; i++) {
    var activeClass = "";

    if (i === browseCurrentPage) {
      activeClass = " active";
    }

    html += '<button class="pageBtn' + activeClass + '" onclick="changeBrowsePage(' + i + ')">' + i + '</button>';
  }

  html += '<button class="pageBtn" onclick="changeBrowsePage(' + (browseCurrentPage + 1) + ')">Next</button>';

  pagination.innerHTML = html;
}

function changeBrowsePage(pageNumber) {
  var searchInput = document.getElementById("searchInput");
  var categorySelect = document.getElementById("categorySelect");

  var searchVal = "";
  var categoryVal = "all";

  if (searchInput) {
    searchVal = searchInput.value.toLowerCase().trim();
  }

  if (categorySelect) {
    categoryVal = categorySelect.value;
  }

  var matchingEvents = allEvents.filter(function(eventItem) {
    var searchableText = (
      (eventItem.name || "") + " " +
      (eventItem.org || "") + " " +
      (eventItem.location || "") + " " +
      (eventItem.category || "") + " " +
      (eventItem.about || "")
    ).toLowerCase();

    var matchSearch = searchableText.indexOf(searchVal) !== -1;
    var matchCategory = categoryVal === "all" || eventItem.category === categoryVal;

    var matchPill = true;

    if (activeFilters.today && !isToday(eventItem.date)) {
      matchPill = false;
    }

    if (activeFilters.virtual && !isVirtualEvent(eventItem)) {
      matchPill = false;
    }

    return matchSearch && matchCategory && matchPill;
  });

  var totalPages = Math.ceil(matchingEvents.length / browseEventsPerPage);

  if (pageNumber < 1 || pageNumber > totalPages) {
    return;
  }

  browseCurrentPage = pageNumber;
  renderEvents(matchingEvents);
}

function showEventDetails(eventId) {
  var eventItem = allEvents.find(function(item) {
    return item._id === eventId;
  });

  if (!eventItem) {
    return;
  }

  var detailEyebrow = document.querySelector(".detailEyebrow");
  var detailTitle = document.querySelector(".detailTitle");
  var detailOrg = document.querySelector(".detailOrg");
  var detailInfoVals = document.querySelectorAll(".detailInfoVal");
  var detailAboutText = document.querySelector(".detailAboutText");
  var bigRsvpBtn = document.querySelector(".bigRsvpBtn");

  var dateText = formatEventDate(eventItem.date);

  if (detailEyebrow) {
    detailEyebrow.textContent = (eventItem.category || "event") + " · Campus Event";
  }

  if (detailTitle) {
    detailTitle.textContent = eventItem.name || "Untitled Event";
  }

  if (detailOrg) {
    detailOrg.textContent = "Hosted by " + (eventItem.org || "Campus Organization");
  }

  if (detailInfoVals.length >= 4) {
    detailInfoVals[0].textContent = dateText;
    detailInfoVals[1].textContent = eventItem.location || "Location TBD";
    detailInfoVals[2].textContent = eventItem.org || "Campus Organization";
    detailInfoVals[3].textContent = (eventItem.capacity || "No") + " total";
  }

  if (detailAboutText) {
    detailAboutText.textContent = eventItem.about || "No description has been added for this event yet.";
  }

  if (bigRsvpBtn) {
    if (userHasRsvped(eventItem._id)) {
      bigRsvpBtn.textContent = "You’re going";
      bigRsvpBtn.className = "bigRsvpBtn going";
      bigRsvpBtn.onclick = null;
    } else {
      bigRsvpBtn.textContent = "RSVP for this event";
      bigRsvpBtn.className = "bigRsvpBtn";
      bigRsvpBtn.onclick = function() {
        rsvp(null, bigRsvpBtn, eventItem._id);
      };
    }
  }
}


function updateNoResultsMessage(count) {
  var noResultsMessage;

  if (currentView === "browse") {
    noResultsMessage = document.getElementById("browseNoResultsMessage");
  } else {
    noResultsMessage = document.getElementById("noResultsMessage");
  }

  if (!noResultsMessage) {
    return;
  }

  if (count === 0) {
    if (currentView === "myEvents") {
      noResultsMessage.textContent = "You have not RSVP’d to any events yet.";
    } else {
      noResultsMessage.textContent = "No events match your search.";
    }

    noResultsMessage.style.display = "block";
  } else {
    noResultsMessage.style.display = "none";
  }
}

function updateHeroStats() {
  var statNums = document.getElementsByClassName("statNum");

  if (statNums.length >= 1) {
    statNums[0].textContent = allEvents.length;
  }
}

function openAuthModal(mode) {
  authMode = mode;

  var overlay = document.getElementById("authOverlay");
  var title = document.getElementById("authModalTitle");
  var text = document.getElementById("authModalText");
  var usernameInput = document.getElementById("authUsername");
  var submitBtn = document.getElementById("authSubmitBtn");
  var switchText = document.getElementById("authSwitchText");

  if (!overlay) {
    return;
  }

  overlay.classList.remove("hiddenView");

  if (mode === "register") {
    title.textContent = "Register";
    text.textContent = "Create an account to RSVP and manage your campus events.";
    usernameInput.style.display = "block";
    submitBtn.textContent = "Create account";
    switchText.innerHTML = 'Already have an account? <button onclick="openAuthModal(\'login\')">Login</button>';
  } else {
    title.textContent = "Login";
    text.textContent = "Access your saved events and RSVP history.";
    usernameInput.style.display = "none";
    submitBtn.textContent = "Login";
    switchText.innerHTML = 'Need an account? <button onclick="openAuthModal(\'register\')">Register</button>';
  }
}

function closeAuthModal() {
  var overlay = document.getElementById("authOverlay");

  if (overlay) {
    overlay.classList.add("hiddenView");
  }
}

function submitAuthForm() {
  if (authMode === "register") {
    registerUser();
  } else {
    loginUser();
  }
}