# Campus Event App


> A unified, student-centered platform for discovering, tracking, and RSVPing to campus events at Towson University.



## Table of Contents


- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Database Design](#database-design)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Known Issues & Roadmap](#known-issues--roadmap)
- [Team](#team)



## Overview


Towson University's existing event services are fragmented, non-interactive, and don't encourage students to explore what's happening on campus. The **Campus Event App** solves this by giving students a single, organized place to find events tailored to their interests, whether academic, recreational, or social.

**Who it's for:**
- **Students** who want to discover and attend campus events
- **Organizations & Hosts** who want to promote and manage their events
- **Admins** who oversee the platform and its users



## Features

- **Event Discovery** - Browse all campus events in one place, organized by category
- **Search & Filter** - Filter events by date, time, organization, and category
- **RSVP System** - Register for events and track your upcoming schedule
- **Smart Notifications** - Get reminders for events you've RSVP'd to and alerts for new events matching your interests
- **Role-Based Access** - Separate experiences for Students, Event Hosts, and Admins
- **Organization Profiles** - Groups and organizations can create and manage their own events


## Tech Stack

| Category        | Technology                               |
|-----------------|------------------------------------------|
| Languages       | JavaScript, Java                         |
| Frameworks      | Node.js, Express.js                      |
| Database        | MongoDB                                  |
| Hosting         | Vercel (Frontend)                        |
| Version Control | GitHub                                   |
| Code Editor      | VScode


## Getting Started

### Prerequisites

- Node.js (v18+)
- Java (v17+)
- MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- npm or yarn

## Usage

Once the app is running:

1. **Log In** as a Student, Host, or Admin
2. **Browse events** on the home feed or use Search & Filter to narrow results
3. **RSVP** to events you want to attend 
4. **Hosts** can log in and create new events under their organization profile
5. **Notifications** when an event has been RSVP'd


## API Documentation

The backend exposes a REST API. Base URL: `http://localhost:8080/api`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/events` | Get all events |
| `GET` | `/events/:id` | Get a single event |
| `POST` | `/events` | Create a new event (Host/Admin) |
| `PUT` | `/events/:id` | Update an event (Host/Admin) |
| `DELETE` | `/events/:id` | Delete an event (Admin) |
| `POST` | `/rsvp/:eventId` | RSVP to an event |
| `DELETE` | `/rsvp/:eventId` | Cancel an RSVP |
| `GET` | `/users/:id` | Get user profile |
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and receive JWT token |



## Database Design

The app uses **MongoDB** with the following main collections:

| Collection | Description |
|---|---|
| `Users` | Account info and roles (Student, Host, Admin) |
| `Events` | Event details - title, date, location, category |
| `RSVPs` | Tracks student event registrations |
| `Organizations` | Groups that host events |
| `Notifications` | Reminders and event update messages |



## Deployment

### Frontend (Vercel)

The frontend is deployed via [Vercel](https://vercel.com/). To deploy your own instance:

1. Push your code to GitHub
2. Import the repo into Vercel
3. Set the environment variables in the Vercel dashboard
4. Deploy

### Backend 

Hosted on Render


## Known Issues & Roadmap

**Known Issues:**

**Planned Features:**
- [ ] Mobile app (React Native)
- [ ] Calendar integration (Google Calendar sync)
- [ ] Event recommendation engine based on past RSVPs
- [ ] In-app messaging between students and event hosts
- [ ] Analytics dashboard for Hosts (views, RSVP rates)


## Team


- Bin Che 
- Jake Kibunja 
- Myles Burrows 
- Oscar Ma 
- Yohannes Belai
