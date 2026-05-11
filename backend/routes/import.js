const express = require("express");
const router = express.Router();

const Event = require("../models/Event");
const Org = require("../models/Org");

function mapTowsonCategory(localistEvent) {
  const eventTypes =
    localistEvent.filters && localistEvent.filters.event_types
      ? localistEvent.filters.event_types
      : [];

  const typeText = eventTypes
    .map(function(type) {
      return type.name.toLowerCase();
    })
    .join(" ");

  if (typeText.includes("career") || typeText.includes("professional")) {
    return "career";
  }

  if (
    typeText.includes("workshop") ||
    typeText.includes("tutoring") ||
    typeText.includes("learning center")
  ) {
    return "workshop";
  }

  if (
    typeText.includes("academic") ||
    typeText.includes("academics") ||
    typeText.includes("seminar") ||
    typeText.includes("study abroad")
  ) {
    return "academic";
  }

  return "social";
}

function getTowsonOrgName(localistEvent) {
  const departments =
    localistEvent.filters && localistEvent.filters.departments
      ? localistEvent.filters.departments
      : [];

  if (departments.length > 0) {
    return departments[departments.length - 1].name;
  }

  return "Towson University";
}

function getTowsonLocation(localistEvent, firstInstance) {
  const parts = [];

  if (localistEvent.location_name) {
    parts.push(localistEvent.location_name);
  }

  if (localistEvent.room_number) {
    parts.push(localistEvent.room_number);
  }

  if (parts.length > 0) {
    return parts.join(", ");
  }

  if (firstInstance && firstInstance.address) {
    return firstInstance.address;
  }

  if (localistEvent.experience === "virtual") {
    return "Virtual";
  }

  return "Towson University";
}

function convertTowsonEvent(localistWrapper, orgId) {
  const localistEvent = localistWrapper.event;

  const firstInstance =
    localistEvent.event_instances &&
    localistEvent.event_instances[0] &&
    localistEvent.event_instances[0].event_instance;

  return {
    name: localistEvent.title,
    org: orgId,
    date: firstInstance ? firstInstance.start : localistEvent.first_date,
    location: getTowsonLocation(localistEvent, firstInstance),
    category: mapTowsonCategory(localistEvent),
    capacity: undefined,
    about: localistEvent.description_text || "Imported from Towson Events.",
    externalId: "localist-" + localistEvent.id,
    sourceUrl: localistEvent.localist_url
  };
}

router.post("/towson", async function(req, res) {
  try {
    const towsonUrl = "https://events.towson.edu/api/2/events?days=30&pp=10";

    const response = await fetch(towsonUrl);

    if (!response.ok) {
      return res.status(500).json({
        error: "Could not fetch Towson events.",
        status: response.status
      });
    }

    const data = await response.json();
    const towsonEvents = data.events || [];

    let importedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < towsonEvents.length; i++) {
      const wrapper = towsonEvents[i];
      const localistEvent = wrapper.event;

      if (!localistEvent || !localistEvent.id) {
        skippedCount++;
        continue;
      }

      const externalId = "localist-" + localistEvent.id;

      const existingEvent = await Event.findOne({
        externalId: externalId
      });

      if (existingEvent) {
        skippedCount++;
        continue;
      }

      const orgName = getTowsonOrgName(localistEvent);
      const category = mapTowsonCategory(localistEvent);

      let org = await Org.findOne({
        name: orgName
      });

      if (!org) {
        org = await Org.create({
          name: orgName,
          description: "Imported from Towson University Events.",
          category: category,
          ownerId: req.body.ownerId
        });
      }

      const newEventData = convertTowsonEvent(wrapper, org._id);

      await Event.create(newEventData);

      importedCount++;
    }

    res.json({
      message: "Towson events import complete.",
      imported: importedCount,
      skipped: skippedCount
    });
  } catch (error) {
    console.log("Towson import error:", error);

    res.status(500).json({
      error: "Could not import Towson events."
    });
  }
});

module.exports = router;