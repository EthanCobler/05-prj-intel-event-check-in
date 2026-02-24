 // Get all needed DOM elements
const form = document.getElementById('checkInForm');
const nameInput = document.getElementById('attendeeName');
const teamSelect = document.getElementById('teamSelect');
const greetingEl = document.getElementById('greeting');
const attendeeCountEl = document.getElementById('attendeeCount');
const progressBar = document.getElementById('progressBar');

// container for attendee list (will be created dynamically)
let attendeeListEl;

// Track attendance
let count = 0;
const maxCount = 50;

// keep separate counters so we can easily save/load
const teamCounts = {
  water: 0,
  zero: 0,
  power: 0
};

// names for teams (matching select text)
const teamNames = {
  water: 'Team Water Wise',
  zero: 'Team Net Zero',
  power: 'Team Renewables'
};

// attendees list for display and storage
let attendees = [];

// load/save helpers and initialization
function loadState() {
  ensureListContainer();

  const storedCount = localStorage.getItem('attendanceCount');
  if (storedCount !== null) {
    count = parseInt(storedCount, 10) || 0;
    attendeeCountEl.textContent = count;
    progressBar.style.width = Math.round((count / maxCount) * 100) + '%';
  }

  const storedTeam = localStorage.getItem('teamCounts');
  if (storedTeam) {
    const obj = JSON.parse(storedTeam);
    Object.keys(teamCounts).forEach(function(k) {
      teamCounts[k] = obj[k] || 0;
      const el = document.getElementById(k + 'Count');
      if (el) el.textContent = teamCounts[k];
    });
  }

  const storedList = localStorage.getItem('attendees');
  if (storedList) {
    attendees = JSON.parse(storedList);
  }

  renderAttendeeList();
}

document.addEventListener('DOMContentLoaded', loadState);

// Utility functions for persistence and rendering
function saveState() {
  localStorage.setItem('attendanceCount', count);
  localStorage.setItem('teamCounts', JSON.stringify(teamCounts));
  localStorage.setItem('attendees', JSON.stringify(attendees));
}

function renderAttendeeList() {
  if (!attendeeListEl) return;
  attendeeListEl.innerHTML = '';
  attendees.forEach(function(a) {
    const li = document.createElement('li');
    li.textContent = `${a.name} (${a.teamName})`;
    attendeeListEl.appendChild(li);
  });
}

// Add an <ul> after the team grid to show attendee list
function ensureListContainer() {
  const teamStats = document.querySelector('.team-stats');
  if (!teamStats) return;
  attendeeListEl = document.getElementById('attendeeList');
  if (!attendeeListEl) {
    attendeeListEl = document.createElement('ul');
    attendeeListEl.id = 'attendeeList';
    attendeeListEl.style.listStyle = 'none';
    attendeeListEl.style.marginTop = '20px';
    attendeeListEl.style.padding = '0';
    teamStats.appendChild(attendeeListEl);
  }
}

// handle form submission
form.addEventListener('submit', function(event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text;

  if (!name || !team) {
    return; // should be prevented by HTML required attributes
  }

  // increment total count and update display
  count += 1;
  attendeeCountEl.textContent = count;

  // update individual team counter and internal state
  teamCounts[team] += 1;
  const teamCounter = document.getElementById(team + 'Count');
  teamCounter.textContent = teamCounts[team];

  // record attendee
  attendees.push({ name: name, team: team, teamName: teamName });
  renderAttendeeList();

  // update progress bar width based on goal
  const percent = Math.round((count / maxCount) * 100);
  progressBar.style.width = percent + '%';

  // show a personalized greeting or celebration if goal reached
  if (count >= maxCount) {
    // determine winning team by highest count
    let winningKey = 'water';
    Object.keys(teamCounts).forEach(function(k) {
      if (teamCounts[k] > teamCounts[winningKey]) {
        winningKey = k;
      }
    });
    const winName = teamNames[winningKey];
    greetingEl.textContent = `🎉 Goal reached! Winning team: ${winName}`;
  } else {
    greetingEl.textContent = `Welcome ${name} from ${teamName}!`;
  }

  greetingEl.classList.add('success-message');
  greetingEl.style.display = 'block';

  // hide the greeting after a few seconds
  setTimeout(function() {
    greetingEl.style.display = 'none';
  }, 4000);

  // persist state
  saveState();

  // reset form for next attendee
  form.reset();
  nameInput.focus();
});