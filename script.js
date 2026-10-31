
// ==============================
// DATA STORAGE
// ==============================

function loadData(key) {
    try {
        if (typeof localStorage === "undefined") return [];
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
        return [];
    }
}

function saveData(key, data) {
    if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, JSON.stringify(data));
    }
}

let members = loadData("gym_members");
let trainers = loadData("gym_trainers");


// Prevent HTML entered by users from being interpreted as markup
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}


// ==============================
// MEMBER MANAGEMENT
// ==============================

function validateMember(id, name) {
    if (!id || !name) {
        alert("Please enter Member ID and Member Name.");
        return false;
    }

    if (members.some(member =>
        member.id.toLowerCase() === id.toLowerCase()
    )) {
        alert("A member with this ID already exists.");
        return false;
    }

    return true;
}

function addMember() {
    const id = document.getElementById("memberId").value.trim();
    const name = document.getElementById("memberName").value.trim();
    const type = document.getElementById("membershipType").value;

    if (!validateMember(id, name)) return;

    members.push({
        id,
        name,
        membershipType: type,
        active: true,
        joinedOn: new Date().toISOString()
    });

    saveData("gym_members", members);

    document.getElementById("memberId").value = "";
    document.getElementById("memberName").value = "";

    displayMembers();
    updateDashboard();
}

function displayMembers() {
    const list = document.getElementById("memberList");
    list.innerHTML = "";

    members.forEach((member, index) => {
        const statusClass = member.active
            ? "status-active"
            : "status-inactive";

        const statusText = member.active ? "Active" : "Inactive";

        list.innerHTML += `
            <div class="member-card">
                <h3>${escapeHTML(member.name)}</h3>

                <p><strong>Member ID:</strong>
                    ${escapeHTML(member.id)}</p>

                <p><strong>Membership:</strong>
                    ${escapeHTML(member.membershipType)}</p>

                <p><strong>Status:</strong>
                    <span class="${statusClass}">${statusText}</span>
                </p>

                <br>

                <button onclick="toggleMembership(${index})">
                    ${member.active ? "Deactivate" : "Activate"}
                </button>

                <button class="delete-btn"
                    onclick="deleteMember(${index})">
                    Delete
                </button>
            </div>
        `;
    });
}

function toggleMembership(index) {
    if (!members[index]) return;

    members[index].active = !members[index].active;

    saveData("gym_members", members);
    displayMembers();
    updateDashboard();
}

function deleteMember(index) {
    if (!members[index]) return;

    if (confirm("Are you sure you want to delete this member?")) {
        members.splice(index, 1);

        saveData("gym_members", members);
        displayMembers();
        updateDashboard();
    }
}



// ==============================
// TRAINER MANAGEMENT
// ==============================

function addTrainer() {
    const id = document.getElementById("trainerId").value.trim();
    const name = document.getElementById("trainerName").value.trim();
    const specialization = document.getElementById("specialization").value;
    const phone = document.getElementById("trainerPhone").value.trim();
    const experience = Number(
        document.getElementById("trainerExperience").value
    );

    if (!id || !name || !specialization || !phone ||
        document.getElementById("trainerExperience").value === "") {
        alert("Please enter all trainer details.");
        return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        alert("Enter a valid 10-digit phone number.");
        return;
    }

    if (!Number.isInteger(experience) || experience < 0 || experience > 50) {
        alert("Enter experience between 0 and 50 years.");
        return;
    }

    if (trainers.some(trainer =>
        trainer.id.toLowerCase() === id.toLowerCase()
    )) {
        alert("A trainer with this ID already exists.");
        return;
    }

    trainers.push({
        id,
        name,
        specialization,
        phone,
        experience,
        assignedMembers: []
    });

    saveData("gym_trainers", trainers);

    document.getElementById("trainerId").value = "";
    document.getElementById("trainerName").value = "";
    document.getElementById("specialization").value = "";
    document.getElementById("trainerPhone").value = "";
    document.getElementById("trainerExperience").value = "";

    displayTrainers();
    updateDashboard();
}

function displayTrainers() {
    const list = document.getElementById("trainerList");

    if (!list) return;

    list.innerHTML = "";

    trainers.forEach((trainer, index) => {
        if (!Array.isArray(trainer.assignedMembers)) {
            trainer.assignedMembers = [];
        }

        const assignedNames = trainer.assignedMembers
            .map(memberId => members.find(member => member.id === memberId))
            .filter(Boolean)
            .map(member => escapeHTML(member.name));

        list.innerHTML += `
            <div class="trainer-card">
                <div class="trainer-card-header">
                    <div class="trainer-avatar">
                        ${escapeHTML(trainer.name.charAt(0).toUpperCase())}
                    </div>
                    <div>
                        <h3>${escapeHTML(trainer.name)}</h3>
                        <span class="trainer-specialization">
                            ${escapeHTML(trainer.specialization)}
                        </span>
                    </div>
                </div>

                <p><strong>Trainer ID:</strong>
                    ${escapeHTML(trainer.id)}</p>

                <p><strong>Phone:</strong>
                    ${escapeHTML(trainer.phone || "Not provided")}</p>

                <p><strong>Experience:</strong>
                    ${Number(trainer.experience) || 0} years</p>

                <p><strong>Assigned Members:</strong>
                    ${assignedNames.length}</p>

                <div class="assigned-member-list">
                    ${assignedNames.length
                        ? assignedNames.join(", ")
                        : "No members assigned"}
                </div>

                <button class="delete-btn"
                    onclick="deleteTrainer(${index})">
                    Delete Trainer
                </button>
            </div>
        `;
    });

    updateTrainerAssignmentOptions();
    updateTrainerStats();
}

function assignTrainerToMember() {
    const memberId =
        document.getElementById("assignmentMember").value;

    const trainerId =
        document.getElementById("assignmentTrainer").value;

    if (!memberId || !trainerId) {
        alert("Please select both a member and a trainer.");
        return;
    }

    const member = members.find(item => item.id === memberId);
    const trainer = trainers.find(item => item.id === trainerId);

    if (!member || !trainer) {
        alert("Selected member or trainer was not found.");
        return;
    }

    if (!Array.isArray(trainer.assignedMembers)) {
        trainer.assignedMembers = [];
    }

    // Remove the member from any previous trainer.
    trainers.forEach(item => {
        item.assignedMembers = (item.assignedMembers || [])
            .filter(id => id !== memberId);
    });

    // Assign the member to the selected trainer.
    trainer.assignedMembers.push(memberId);

    saveData("gym_trainers", trainers);

    displayTrainers();

    alert("Trainer assigned successfully.");
}

function updateTrainerAssignmentOptions() {
    const memberSelect = document.getElementById("assignmentMember");
    const trainerSelect = document.getElementById("assignmentTrainer");

    if (!memberSelect || !trainerSelect) return;

    const selectedMember = memberSelect.value;
    const selectedTrainer = trainerSelect.value;

    memberSelect.innerHTML =
        '<option value="">Select member</option>';

    members.forEach(member => {
        memberSelect.innerHTML += `
            <option value="${escapeHTML(member.id)}">
                ${escapeHTML(member.name)} (${escapeHTML(member.id)})
            </option>
        `;
    });

    trainerSelect.innerHTML =
        '<option value="">Select trainer</option>';

    trainers.forEach(trainer => {
        trainerSelect.innerHTML += `
            <option value="${escapeHTML(trainer.id)}">
                ${escapeHTML(trainer.name)} (${escapeHTML(trainer.id)})
            </option>
        `;
    });

    if (members.some(member => member.id === selectedMember)) {
        memberSelect.value = selectedMember;
    }

    if (trainers.some(trainer => trainer.id === selectedTrainer)) {
        trainerSelect.value = selectedTrainer;
    }
}

function updateTrainerStats() {
    const totalElement = document.getElementById("trainerTotalCount");
    const assignedElement = document.getElementById("assignedTrainerCount");
    const memberElement = document.getElementById("assignedMemberCount");

    if (totalElement) {
        totalElement.textContent = trainers.length;
    }

    if (assignedElement) {
        assignedElement.textContent = trainers.filter(trainer =>
            (trainer.assignedMembers || []).length > 0
        ).length;
    }

    if (memberElement) {
        const assignedCount = new Set(
            trainers.flatMap(trainer => trainer.assignedMembers || [])
        ).size;

        memberElement.textContent = assignedCount;
    }
}

function deleteTrainer(index) {
    if (!trainers[index]) return;

    if (confirm("Delete this trainer? Their member assignments will also be removed.")) {
        trainers.splice(index, 1);

        saveData("gym_trainers", trainers);
        displayTrainers();
        updateDashboard();
    }
}


// ==============================
// DASHBOARD
// ==============================

function updateDashboard() {
    document.getElementById("totalMembers").textContent =
        members.length;

    document.getElementById("activeMembers").textContent =
        members.filter(member => member.active).length;

    document.getElementById("totalTrainers").textContent =
        trainers.length;

    
}


// ==============================
// INITIALIZE APPLICATION
// ==============================

displayMembers();
displayTrainers();
updateDashboard();

// ==============================
// MEMBERSHIP MANAGEMENT
// ==============================

const membershipPlans = {
    "Monthly": { duration: 1, price: 1000 },
    "Quarterly": { duration: 3, price: 2700 },
    "Half-Yearly": { duration: 6, price: 5000 },
    "Yearly": { duration: 12, price: 9000 }
};

function addMonths(date, months) {
    const result = new Date(date);
    const originalDay = result.getDate();

    result.setDate(1);
    result.setMonth(result.getMonth() + months);

    const lastDay = new Date(
        result.getFullYear(),
        result.getMonth() + 1,
        0
    ).getDate();

    result.setDate(Math.min(originalDay, lastDay));
    return result;
}

function formatDate(date) {
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function getMembershipStatus(member) {
    if (!member.expiryDate) return "Not Started";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(member.expiryDate);
    expiry.setHours(0, 0, 0, 0);

    if (expiry < today) return "Expired";
    if (member.active === false) return "Inactive";

    const daysRemaining = Math.ceil(
        (expiry - today) / (1000 * 60 * 60 * 24)
    );

    if (daysRemaining <= 7) return "Expiring Soon";
    return "Active";
}

function startMembership(member) {
    const today = new Date();
    const plan = membershipPlans[member.membershipType];

    if (!plan) return;

    member.startDate = today.toISOString();
    member.expiryDate = addMonths(today, plan.duration).toISOString();
    member.active = true;
}

function renewMembership(index) {
    const member = members[index];

    if (!member) return;

    const plan = membershipPlans[member.membershipType];

    if (!plan) {
        alert("Invalid membership plan.");
        return;
    }

    const today = new Date();
    const currentExpiry = member.expiryDate
        ? new Date(member.expiryDate)
        : today;

    const baseDate = currentExpiry > today ? currentExpiry : today;

    member.startDate = today.toISOString();
    member.expiryDate = addMonths(baseDate, plan.duration).toISOString();
    member.active = true;

    saveData("gym_members", members);
    displayMembers();
    updateDashboard();
    displaySubscriptions();

    alert("Membership renewed successfully.");
}

function displaySubscriptions() {
    const table = document.getElementById("subscriptionsTable");

    if (!table) return;

    if (members.length === 0) {
        table.innerHTML =
            '<tr><td colspan="7">No subscriptions available.</td></tr>';
        updateMembershipStats();
        return;
    }

    table.innerHTML = members.map((member, index) => {
        const status = getMembershipStatus(member);

        const startDate = member.startDate
            ? formatDate(new Date(member.startDate))
            : "Not started";

        const expiryDate = member.expiryDate
            ? formatDate(new Date(member.expiryDate))
            : "Not set";

        const statusClass = status.toLowerCase().replaceAll(" ", "-");

        return `
            <tr>
                <td>${escapeHTML(member.id)}</td>
                <td>${escapeHTML(member.name)}</td>
                <td>${escapeHTML(member.membershipType)}</td>
                <td>${startDate}</td>
                <td>${expiryDate}</td>
                <td>
                    <span class="status-badge status-${statusClass}">
                        ${status}
                    </span>
                </td>
                <td>
                    <button class="primary-btn"
                        onclick="renewMembership(${index})">
                        Renew
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    updateMembershipStats();
}

function updateMembershipStats() {
    const statuses = members.map(getMembershipStatus);

    document.getElementById("totalSubscriptions").textContent =
        members.length;

    document.getElementById("activeSubscriptions").textContent =
        statuses.filter(status => status === "Active").length;

    document.getElementById("expiringSubscriptions").textContent =
        statuses.filter(status => status === "Expiring Soon").length;

    document.getElementById("expiredSubscriptions").textContent =
        statuses.filter(status => status === "Expired").length;
}

// Give existing members their initial membership dates.
// Existing members retain their current plan.
function initializeMembershipDates() {
    members.forEach(member => {
        if (!member.startDate || !member.expiryDate) {
            startMembership(member);
        }
    });

    saveData("gym_members", members);
}

// Initial membership setup
initializeMembershipDates();
displaySubscriptions();

// ==============================
// WORKOUT MANAGEMENT
// ==============================

let workoutPlans = loadData("gym_workout_plans");
let exerciseDraft = [];

// Add an exercise to the temporary plan
function addExerciseToDraft() {
    const name = document.getElementById("exerciseName").value.trim();
    const setsValue = document.getElementById("exerciseSets").value;
    const repsValue = document.getElementById("exerciseReps").value;
    const restValue = document.getElementById("exerciseRest").value;

    const sets = Number(setsValue);
    const reps = Number(repsValue);
    const rest = Number(restValue);

    if (!name || !setsValue || !repsValue || restValue === "") {
        alert("Enter exercise name, sets, reps and rest time.");
        return;
    }

    if (!Number.isInteger(sets) || sets < 1 || sets > 20 ||
        !Number.isInteger(reps) || reps < 1 || reps > 100 ||
        !Number.isInteger(rest) || rest < 0 || rest > 600) {
        alert("Enter valid sets, reps and rest values.");
        return;
    }

    exerciseDraft.push({ name, sets, reps, rest });

    document.getElementById("exerciseName").value = "";
    document.getElementById("exerciseSets").value = "";
    document.getElementById("exerciseReps").value = "";
    document.getElementById("exerciseRest").value = "";

    displayExerciseDraft();
}

// Display exercises before saving the plan
function displayExerciseDraft() {
    const container = document.getElementById("exerciseDraftList");

    if (!container) return;

    if (exerciseDraft.length === 0) {
        container.textContent = "No exercises added yet.";
        return;
    }

    container.innerHTML = exerciseDraft.map((exercise, index) => `
        <div class="exercise-draft-item">
            <span>
                <strong>${escapeHTML(exercise.name)}</strong>
                — ${exercise.sets} sets × ${exercise.reps} reps
                — ${exercise.rest}s rest
            </span>
            <button type="button" class="delete-btn"
                onclick="removeDraftExercise(${index})">
                Remove
            </button>
        </div>
    `).join("");
}

function removeDraftExercise(index) {
    if (index < 0 || index >= exerciseDraft.length) return;

    exerciseDraft.splice(index, 1);
    displayExerciseDraft();
}

// Create and save a workout plan
function createWorkoutPlan() {
    const name = document.getElementById("workoutName").value.trim();
    const level = document.getElementById("workoutLevel").value;
    const durationValue = document.getElementById("workoutDuration").value;
    const duration = Number(durationValue);

    if (!name || !level || !durationValue) {
        alert("Enter all workout plan details.");
        return;
    }

    if (!Number.isInteger(duration) || duration < 1 || duration > 52) {
        alert("Workout duration must be between 1 and 52 weeks.");
        return;
    }

    if (exerciseDraft.length === 0) {
        alert("Add at least one exercise before creating the plan.");
        return;
    }

    if (workoutPlans.some(plan =>
        plan.name.toLowerCase() === name.toLowerCase()
    )) {
        alert("A workout plan with this name already exists.");
        return;
    }

    const plan = {
        id: `WP${Date.now()}`,
        name,
        level,
        duration,
        exercises: [...exerciseDraft],
        createdOn: new Date().toISOString()
    };

    workoutPlans.push(plan);
    saveData("gym_workout_plans", workoutPlans);

    exerciseDraft = [];
    document.getElementById("workoutForm").reset();

    displayExerciseDraft();
    displayWorkoutPlans();

    alert("Workout plan created successfully.");
}

// Display all saved workout plans
function displayWorkoutPlans() {
    const list = document.getElementById("workoutPlanList");

    if (!list) return;

    if (workoutPlans.length === 0) {
        list.innerHTML = "<p>No workout plans created yet.</p>";
    } else {
        list.innerHTML = workoutPlans.map((plan, index) => `
            <div class="workout-card">
                <div class="workout-card-header">
                    <div>
                        <h3>${escapeHTML(plan.name)}</h3>
                        <span class="workout-level">
                            ${escapeHTML(plan.level)}
                        </span>
                    </div>
                    <span class="workout-duration">
                        ${plan.duration} weeks
                    </span>
                </div>

                <h4>Exercises (${plan.exercises.length})</h4>

                <div class="workout-exercise-list">
                    ${plan.exercises.map(exercise => `
                        <div class="workout-exercise">
                            <strong>${escapeHTML(exercise.name)}</strong>
                            <span>${exercise.sets} sets × ${exercise.reps} reps</span>
                            <small>${exercise.rest} sec rest</small>
                        </div>
                    `).join("")}
                </div>

                <button type="button" class="delete-btn"
                    onclick="deleteWorkoutPlan(${index})">
                    Delete Plan
                </button>
            </div>
        `).join("");
    }

    updateWorkoutAssignmentOptions();
    updateWorkoutStats();
    displayWorkoutAssignments();
}

// Delete a plan and remove its member assignments
function deleteWorkoutPlan(index) {
    const plan = workoutPlans[index];

    if (!plan) return;

    if (!confirm(`Delete the workout plan "${plan.name}"? Member assignments to this plan will also be removed.`)) {
        return;
    }

    members.forEach(member => {
        if (member.workoutPlanId === plan.id) {
            delete member.workoutPlanId;
        }
    });

    workoutPlans.splice(index, 1);

    saveData("gym_workout_plans", workoutPlans);
    saveData("gym_members", members);

    displayWorkoutPlans();
}

// Populate member and plan dropdowns
function updateWorkoutAssignmentOptions() {
    const memberSelect = document.getElementById("workoutMember");
    const planSelect = document.getElementById("workoutPlanSelect");

    if (!memberSelect || !planSelect) return;

    const selectedMember = memberSelect.value;
    const selectedPlan = planSelect.value;

    memberSelect.innerHTML = '<option value="">Select member</option>';

    members.forEach(member => {
        memberSelect.innerHTML += `
            <option value="${escapeHTML(member.id)}">
                ${escapeHTML(member.name)} (${escapeHTML(member.id)})
            </option>
        `;
    });

    planSelect.innerHTML = '<option value="">Select plan</option>';

    workoutPlans.forEach(plan => {
        planSelect.innerHTML += `
            <option value="${escapeHTML(plan.id)}">
                ${escapeHTML(plan.name)}
            </option>
        `;
    });

    if (members.some(member => member.id === selectedMember)) {
        memberSelect.value = selectedMember;
    }

    if (workoutPlans.some(plan => plan.id === selectedPlan)) {
        planSelect.value = selectedPlan;
    }
}

// Assign a workout plan to a member
function assignWorkoutPlan() {
    const memberId = document.getElementById("workoutMember").value;
    const planId = document.getElementById("workoutPlanSelect").value;

    if (!memberId || !planId) {
        alert("Select both a member and a workout plan.");
        return;
    }

    const member = members.find(item => item.id === memberId);
    const plan = workoutPlans.find(item => item.id === planId);

    if (!member || !plan) {
        alert("Selected member or workout plan was not found.");
        return;
    }

    member.workoutPlanId = plan.id;

    saveData("gym_members", members);

    displayWorkoutAssignments();
    updateWorkoutStats();

    alert("Workout plan assigned successfully.");
}

// Display all member workout assignments
function displayWorkoutAssignments() {
    const table = document.getElementById("workoutAssignmentsTable");

    if (!table) return;

    const assignedMembers = members.filter(member =>
        member.workoutPlanId &&
        workoutPlans.some(plan => plan.id === member.workoutPlanId)
    );

    if (assignedMembers.length === 0) {
        table.innerHTML =
            '<tr><td colspan="5">No workout assignments yet.</td></tr>';
        return;
    }

    table.innerHTML = assignedMembers.map(member => {
        const plan = workoutPlans.find(item =>
            item.id === member.workoutPlanId
        );

        return `
            <tr>
                <td>${escapeHTML(member.id)}</td>
                <td>${escapeHTML(member.name)}</td>
                <td>${escapeHTML(plan.name)}</td>
                <td>${escapeHTML(plan.level)}</td>
                <td>
                    <button class="delete-btn"
                        onclick="removeWorkoutAssignment('${encodeURIComponent(member.id)}')">
                        Remove
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

// Remove a workout assignment without deleting the member or plan
function removeWorkoutAssignment(encodedMemberId) {
    const memberId = decodeURIComponent(encodedMemberId);
    const member = members.find(item => item.id === memberId);

    if (!member || !member.workoutPlanId) return;

    if (!confirm(`Remove the workout assignment for ${member.name}?`)) {
        return;
    }

    delete member.workoutPlanId;

    saveData("gym_members", members);

    displayWorkoutAssignments();
    updateWorkoutStats();
}

// Update workout dashboard counters
function updateWorkoutStats() {
    const totalElement = document.getElementById("totalWorkoutPlans");
    const assignedElement = document.getElementById("assignedWorkoutCount");
    const membersElement = document.getElementById("membersWithWorkouts");

    const assignedMembers = members.filter(member =>
        member.workoutPlanId &&
        workoutPlans.some(plan => plan.id === member.workoutPlanId)
    );

    if (totalElement) {
        totalElement.textContent = workoutPlans.length;
    }

    if (assignedElement) {
        assignedElement.textContent = assignedMembers.length;
    }

    if (membersElement) {
        membersElement.textContent = new Set(
            assignedMembers.map(member => member.id)
        ).size;
    }
}

// Initial workout setup
displayExerciseDraft();
displayWorkoutPlans();

// ==============================
// TRAINING SESSION MANAGEMENT
// ==============================

let trainingSessions = loadData("gym_training_sessions");

// Convert date and time into a local Date object
function getSessionDateTime(date, time) {
    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);

    return new Date(year, month - 1, day, hours, minutes);
}

// Check whether two session time ranges overlap
function sessionsOverlap(startA, durationA, startB, durationB) {
    const endA = startA.getTime() + durationA * 60000;
    const endB = startB.getTime() + durationB * 60000;

    return startA.getTime() < endB &&
           startB.getTime() < endA;
}

// Populate member and trainer dropdowns
function updateSessionOptions() {
    const memberSelect = document.getElementById("sessionMember");
    const trainerSelect = document.getElementById("sessionTrainer");

    if (!memberSelect || !trainerSelect) return;

    const selectedMember = memberSelect.value;
    const selectedTrainer = trainerSelect.value;

    memberSelect.innerHTML = '<option value="">Select member</option>';

    members.forEach(member => {
        memberSelect.innerHTML += `
            <option value="${escapeHTML(member.id)}">
                ${escapeHTML(member.name)} (${escapeHTML(member.id)})
            </option>
        `;
    });

    trainerSelect.innerHTML = '<option value="">Select trainer</option>';

    trainers.forEach(trainer => {
        trainerSelect.innerHTML += `
            <option value="${escapeHTML(trainer.id)}">
                ${escapeHTML(trainer.name)} (${escapeHTML(trainer.id)})
            </option>
        `;
    });

    if (members.some(member => member.id === selectedMember)) {
        memberSelect.value = selectedMember;
    }

    if (trainers.some(trainer => trainer.id === selectedTrainer)) {
        trainerSelect.value = selectedTrainer;
    }
}

// Book a new training session
function bookTrainingSession() {
    const memberId = document.getElementById("sessionMember").value;
    const trainerId = document.getElementById("sessionTrainer").value;
    const date = document.getElementById("sessionDate").value;
    const time = document.getElementById("sessionTime").value;
    const duration = Number(document.getElementById("sessionDuration").value);
    const notes = document.getElementById("sessionNotes").value.trim();

    if (!memberId || !trainerId || !date || !time) {
        alert("Please complete all required session details.");
        return;
    }

    if (![30, 45, 60, 90].includes(duration)) {
        alert("Select a valid session duration.");
        return;
    }

    const member = members.find(item => item.id === memberId);
    const trainer = trainers.find(item => item.id === trainerId);

    if (!member || !trainer) {
        alert("Selected member or trainer was not found.");
        return;
    }

    if (member.active === false) {
        alert("This member is inactive. Activate the membership before booking.");
        return;
    }

    if (member.expiryDate && getMembershipStatus(member) === "Expired") {
        alert("This member's membership has expired.");
        return;
    }

    const startDateTime = getSessionDateTime(date, time);
    const endDateTime = new Date(
        startDateTime.getTime() + duration * 60000
    );

    const [year, month, day] = date.split("-").map(Number);

const calendarDate = new Date(year, month - 1, day);

const validDate =
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    calendarDate.getFullYear() === year &&
    calendarDate.getMonth() === month - 1 &&
    calendarDate.getDate() === day;

if (!validDate || Number.isNaN(startDateTime.getTime())) {
    alert("Invalid session date or time.");
    return;
}

    if (startDateTime <= new Date()) {
        alert("You cannot book a session in the past.");
        return;
    }

    // Check trainer availability
    const trainerConflict = trainingSessions.some(session => {
        if (session.status !== "Scheduled" ||
            session.trainerId !== trainerId ||
            session.date !== date) {
            return false;
        }

        const existingStart = getSessionDateTime(
            session.date,
            session.time
        );

        return sessionsOverlap(
            startDateTime,
            duration,
            existingStart,
            Number(session.duration)
        );
    });

    if (trainerConflict) {
        alert("This trainer already has a session during that time.");
        return;
    }

    // Prevent the same member from double-booking
    const memberConflict = trainingSessions.some(session => {
        if (session.status !== "Scheduled" ||
            session.memberId !== memberId ||
            session.date !== date) {
            return false;
        }

        const existingStart = getSessionDateTime(
            session.date,
            session.time
        );

        return sessionsOverlap(
            startDateTime,
            duration,
            existingStart,
            Number(session.duration)
        );
    });

    if (memberConflict) {
        alert("This member already has a session during that time.");
        return;
    }

    trainingSessions.push({
        id: `TS${Date.now()}${Math.floor(Math.random() * 1000)}`,
        memberId,
        trainerId,
        date,
        time,
        duration,
        notes,
        status: "Scheduled",
        createdOn: new Date().toISOString()
    });

    saveData("gym_training_sessions", trainingSessions);

    document.getElementById("sessionForm").reset();

    displayTrainingSessions();

    alert("Training session booked successfully.");
}

// Display all training sessions
function displayTrainingSessions() {
    const table = document.getElementById("sessionsTable");

    if (!table) return;

    if (trainingSessions.length === 0) {
        table.innerHTML =
            '<tr><td colspan="7">No training sessions booked yet.</td></tr>';

        updateSessionStats();
        return;
    }

    const sortedSessions = [...trainingSessions].sort((a, b) =>
        getSessionDateTime(a.date, a.time) -
        getSessionDateTime(b.date, b.time)
    );

    table.innerHTML = sortedSessions.map(session => {
        const member = members.find(item => item.id === session.memberId);
        const trainer = trainers.find(item => item.id === session.trainerId);

        const statusClass = session.status.toLowerCase();

        let actionButtons = "";

        if (session.status === "Scheduled") {
            actionButtons = `
                <button type="button" class="session-complete-btn"
                    onclick="completeTrainingSession('${encodeURIComponent(session.id)}')">
                    Complete
                </button>

                <button type="button" class="session-cancel-btn"
                    onclick="cancelTrainingSession('${encodeURIComponent(session.id)}')">
                    Cancel
                </button>
            `;
        } else {
            actionButtons = `<span class="session-finished">No action</span>`;
        }

        return `
            <tr>
                <td>${member ? escapeHTML(member.name) : "Unknown Member"}</td>
                <td>${trainer ? escapeHTML(trainer.name) : "Unknown Trainer"}</td>
                <td>${formatDate(getSessionDateTime(session.date, "00:00"))}</td>
                <td>${escapeHTML(session.time)}</td>
                <td>${Number(session.duration)} min</td>
                <td>
                    <span class="status-badge status-${statusClass}">
                        ${escapeHTML(session.status)}
                    </span>
                </td>
                <td>${actionButtons}</td>
            </tr>
        `;
    }).join("");

    updateSessionStats();
}

// Mark a scheduled session as completed
function completeTrainingSession(encodedId) {
    const id = decodeURIComponent(encodedId);

    const session = trainingSessions.find(item => item.id === id);

    if (!session || session.status !== "Scheduled") return;

    const sessionEnd = getSessionDateTime(
        session.date,
        session.time
    );

    sessionEnd.setMinutes(
        sessionEnd.getMinutes() + Number(session.duration)
    );

    if (new Date() < sessionEnd) {
        alert("This session cannot be completed before its scheduled end time.");
        return;
    }

    if (!confirm("Mark this training session as completed?")) return;

    session.status = "Completed";

    saveData("gym_training_sessions", trainingSessions);
    displayTrainingSessions();
}

// Cancel a scheduled session
function cancelTrainingSession(encodedId) {
    const id = decodeURIComponent(encodedId);

    const session = trainingSessions.find(item => item.id === id);

    if (!session || session.status !== "Scheduled") return;

    if (!confirm("Are you sure you want to cancel this session?")) return;

    session.status = "Cancelled";

    saveData("gym_training_sessions", trainingSessions);
    displayTrainingSessions();
}

// Update session dashboard statistics
function updateSessionStats() {
    const total = document.getElementById("totalSessions");
    const scheduled = document.getElementById("scheduledSessions");
    const completed = document.getElementById("completedSessions");
    const cancelled = document.getElementById("cancelledSessions");

    if (total) total.textContent = trainingSessions.length;

    if (scheduled) {
        scheduled.textContent = trainingSessions.filter(
            session => session.status === "Scheduled"
        ).length;
    }

    if (completed) {
        completed.textContent = trainingSessions.filter(
            session => session.status === "Completed"
        ).length;
    }

    if (cancelled) {
        cancelled.textContent = trainingSessions.filter(
            session => session.status === "Cancelled"
        ).length;
    }
}

// Initial session setup
updateSessionOptions();
displayTrainingSessions();

// ==============================
// PAYMENT MANAGEMENT
// ==============================

let payments = loadData("gym_payments");
function updateDashboardRevenue() {
    const now = new Date();

    const monthlyRevenue = payments
        .filter(payment => {
            const [year, month] = payment.date.split("-").map(Number);

            return year === now.getFullYear() &&
                month === now.getMonth() + 1;
        })
        .reduce((sum, payment) =>
            sum + Number(payment.amount || 0), 0
        );

    const revenueElement =
        document.getElementById("dashboardMonthlyRevenue");

    if (revenueElement) {
        revenueElement.textContent = formatCurrency(monthlyRevenue);
    }
}

// Populate the member dropdown
function updatePaymentOptions() {
    const select = document.getElementById("paymentMember");

    if (!select) return;

    const selectedMember = select.value;

    select.innerHTML = '<option value="">Select member</option>';

    members.forEach(member => {
        select.innerHTML += `
            <option value="${escapeHTML(member.id)}">
                ${escapeHTML(member.name)} (${escapeHTML(member.id)})
            </option>
        `;
    });

    if (members.some(member => member.id === selectedMember)) {
        select.value = selectedMember;
    }
}

// Record a new payment

function recordPayment() {
    const memberId = document.getElementById("paymentMember").value;
    const amountValue = document.getElementById("paymentAmount").value;
    const method = document.getElementById("paymentMethod").value;
    const date = document.getElementById("paymentDate").value;
    const notes = document.getElementById("paymentNotes").value.trim();

    const amount = Number(amountValue);

    if (!memberId || !amountValue || !method || !date) {
        alert("Please complete all required payment details.");
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) {
        alert("Enter a valid payment amount.");
        return;
    }

    const member = members.find(item => item.id === memberId);

    if (!member) {
        alert("Selected member was not found.");
        return;
    }

    const [year, month, day] = date.split("-").map(Number);
    const paymentDate = new Date(year, month - 1, day);

    if (
        Number.isNaN(paymentDate.getTime()) ||
        paymentDate.getFullYear() !== year ||
        paymentDate.getMonth() !== month - 1 ||
        paymentDate.getDate() !== day ||
        paymentDate > new Date()
    ) {
        alert("Enter a valid payment date that is not in the future.");
        return;
    }

    const isMembershipPayment = confirm(
        "Is this payment for a membership renewal?"
    );

    if (isMembershipPayment) {
        const plan = membershipPlans[member.membershipType];

        if (!plan || amount !== plan.price) {
            alert(
                `The payment must match the ${member.membershipType} plan price of ${formatCurrency(plan?.price || 0)}.`
            );
            return;
        }
    }

    // Prepare the payment record
    const payment = {
        id: `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`,
        receiptId: `RCP${Date.now()}`,
        memberId,
        memberName: member.name,
        amount: Number(amount.toFixed(2)),
        method,
        date,
        notes,
        status: "Paid",
        createdOn: new Date().toISOString()
    };

    // Renew membership before saving its payment.
    // Keep the previous membership data if saving fails.
    const oldMember = { ...member };

if (isMembershipPayment) {
    const today = new Date();
    const currentExpiry = member.expiryDate
        ? new Date(member.expiryDate)
        : today;

    const baseDate = currentExpiry > today ? currentExpiry : today;

    member.startDate = today.toISOString();
    member.expiryDate = addMonths(baseDate, membershipPlans[member.membershipType].duration).toISOString();
    member.active = true;

    try {
        saveData("gym_members", members);
    } catch (error) {
        Object.assign(member, oldMember);
        alert("Membership renewal failed. Payment was not recorded.");
        return;
    }
}

    try {
        payments.push(payment);
        saveData("gym_payments", payments);
    } catch (error) {
        payments.pop();
        if (isMembershipPayment) {
    Object.assign(member, oldMember);

    try {
        saveData("gym_members", members);
    } catch (rollbackError) {
        alert("Payment failed and membership rollback also failed. Check browser storage.");
        return;
    }
}

        if (isMembershipPayment) {
            alert("Payment could not be saved. Check browser storage.");
        } else {
            alert("Payment could not be saved.");
        }

        return;
    }

    if (isMembershipPayment) {
        displayMembers();
        updateDashboard();
        displaySubscriptions();
    }

    document.getElementById("paymentForm").reset();

    displayPayments();
    updatePaymentStats();
    updateDashboardRevenue();

    alert("Payment recorded successfully.");
}


// Format currency
function formatCurrency(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

// Format payment date
function formatPaymentDate(date) {
    const [year, month, day] = date.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

// Display payment history with filters
function displayPayments() {
    const table = document.getElementById("paymentsTable");

    if (!table) return;

    const search = (
        document.getElementById("paymentSearch")?.value || ""
    ).trim().toLowerCase();

    const method = (
        document.getElementById("paymentFilterMethod")?.value || ""
    );

    const filteredPayments = [...payments]
        .filter(payment => {
            const member = members.find(
                item => item.id === payment.memberId
            );

            const memberName = member
                ? member.name
                : payment.memberName || "";

            const matchesSearch =
                memberName.toLowerCase().includes(search) ||
                payment.memberId.toLowerCase().includes(search);

            const matchesMethod =
                !method || payment.method === method;

            return matchesSearch && matchesMethod;
        })
        .sort((a, b) =>
            b.date.localeCompare(a.date) ||
            b.createdOn.localeCompare(a.createdOn)
        );

    if (filteredPayments.length === 0) {
        table.innerHTML =
            '<tr><td colspan="7">No matching payments found.</td></tr>';
        return;
    }

    table.innerHTML = filteredPayments.map(payment => {
        const member = members.find(
            item => item.id === payment.memberId
        );

        const memberName = member
            ? member.name
            : payment.memberName || "Unknown Member";

        return `
            <tr>
                <td>${escapeHTML(payment.receiptId)}</td>
                <td>${escapeHTML(memberName)}</td>
                <td>${formatPaymentDate(payment.date)}</td>
                <td><strong>${formatCurrency(payment.amount)}</strong></td>
                <td>${escapeHTML(payment.method)}</td>
                <td>${escapeHTML(payment.notes || "-")}</td>
                <td>
                    <button type="button" class="receipt-btn"
                        onclick="printPaymentReceipt('${encodeURIComponent(payment.id)}')">
                        Receipt
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

// Calculate revenue statistics
function updatePaymentStats() {
    const totalElement = document.getElementById("totalRevenue");
    const monthlyElement = document.getElementById("paymentMonthlyRevenue");
    const transactionsElement = document.getElementById("totalTransactions");
    const averageElement = document.getElementById("averagePayment");

    const totalRevenue = payments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
    );

    const now = new Date();

    const monthlyRevenue = payments
        .filter(payment => {
            const [year, month] = payment.date.split("-").map(Number);

            return year === now.getFullYear() &&
                month === now.getMonth() + 1;
        })
        .reduce((sum, payment) =>
            sum + Number(payment.amount || 0), 0
        );

    const averagePayment = payments.length
        ? totalRevenue / payments.length
        : 0;

    if (totalElement) {
        totalElement.textContent = formatCurrency(totalRevenue);
    }

    if (monthlyElement) {
        monthlyElement.textContent = formatCurrency(monthlyRevenue);
    }

    if (transactionsElement) {
        transactionsElement.textContent = payments.length;
    }

    if (averageElement) {
        averageElement.textContent = formatCurrency(averagePayment);
    }
}

// Generate a printable payment receipt
function printPaymentReceipt(encodedId) {
    const id = decodeURIComponent(encodedId);

    const payment = payments.find(item => item.id === id);

    if (!payment) {
        alert("Payment record not found.");
        return;
    }

    const member = members.find(
        item => item.id === payment.memberId
    );

    const memberName = member
        ? member.name
        : payment.memberName || "Unknown Member";

    const receiptWindow = window.open("", "_blank", "width=600,height=700");

    if (!receiptWindow) {
        alert("Allow pop-ups to print the receipt.");
        return;
    }

    receiptWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Receipt ${escapeHTML(payment.receiptId)}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 35px;
                    color: #263247;
                }

                .receipt {
                    max-width: 440px;
                    margin: auto;
                    border: 1px solid #ddd;
                    padding: 28px;
                    border-radius: 10px;
                }

                h1 {
                    color: #4169e1;
                    margin-bottom: 5px;
                }

                .muted {
                    color: #718096;
                    font-size: 13px;
                }

                hr {
                    border: none;
                    border-top: 1px dashed #ccc;
                    margin: 20px 0;
                }

                .line {
                    display: flex;
                    justify-content: space-between;
                    gap: 15px;
                    margin: 14px 0;
                }

                .total {
                    font-size: 20px;
                    font-weight: bold;
                }

                button {
                    display: block;
                    margin: 25px auto 0;
                    padding: 10px 20px;
                    background: #4169e1;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                }

                @media print {
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="receipt">
                <h1>FitTrack</h1>
                <p class="muted">Gym Management System</p>
                <hr>

                <h2>Payment Receipt</h2>

                <div class="line">
                    <span>Receipt ID</span>
                    <strong>${escapeHTML(payment.receiptId)}</strong>
                </div>

                <div class="line">
                    <span>Member</span>
                    <strong>${escapeHTML(memberName)}</strong>
                </div>

                <div class="line">
                    <span>Member ID</span>
                    <strong>${escapeHTML(payment.memberId)}</strong>
                </div>

                <div class="line">
                    <span>Date</span>
                    <strong>${formatPaymentDate(payment.date)}</strong>
                </div>

                <div class="line">
                    <span>Payment Method</span>
                    <strong>${escapeHTML(payment.method)}</strong>
                </div>

                <div class="line">
                    <span>Status</span>
                    <strong>Paid</strong>
                </div>

                <hr>

                <div class="line total">
                    <span>Amount Paid</span>
                    <strong>${formatCurrency(payment.amount)}</strong>
                </div>

                <p class="muted">
                    ${escapeHTML(payment.notes || "Thank you for your payment.")}
                </p>

                <button onclick="window.print()">Print Receipt</button>
            </div>
        </body>
        </html>
    `);

    receiptWindow.document.close();
}

// Initial payment setup
updatePaymentOptions();
displayPayments();
updatePaymentStats();

// ==============================
// REPORTS & ANALYTICS
// ==============================

let reportRevenueChart = null;
let reportMembershipChart = null;
let dashboardRevenueChart = null;
let dashboardMembershipChart = null;
function createDashboardCharts() {
    if (typeof Chart === "undefined") {
        console.error("Chart.js is not loaded.");
        return;
    }

    const revenueCanvas = document.getElementById("revenueChart");
    if (!revenueCanvas) return;

    // Monthly revenue data
    const monthLabels = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const monthlyRevenue = Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    payments.forEach(payment => {
        const [year, month] = payment.date.split("-").map(Number);

        if (year === currentYear && month >= 1 && month <= 12) {
            monthlyRevenue[month - 1] += Number(payment.amount || 0);
        }
    });

    if (dashboardRevenueChart) {
        dashboardRevenueChart.destroy();
    }

    dashboardRevenueChart = new Chart(revenueCanvas, {
        type: "bar",
        data: {
            labels: monthLabels,
            datasets: [{
                label: "Revenue (₹)",
                data: monthlyRevenue,
                backgroundColor: "#4f6ee8",
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => "₹" + value
                    }
                }
            }
        }
    });

}
let reportPaymentChart = null;

// Safely prepare CSV values
function csvValue(value) {
    let text = String(value ?? "");

    // Prevent spreadsheet formula injection
    if (/^[=+\-@\t\r]/.test(text)) {
        text = "'" + text;
    }

    return '"' + text.replace(/"/g, '""') + '"';
}

// Refresh all report statistics and charts
function refreshReports() {
    const totalMembers = document.getElementById("reportTotalMembers");
    const activeMembers = document.getElementById("reportActiveMembers");
    const revenueElement = document.getElementById("reportRevenue");
    const sessionsElement = document.getElementById("reportSessions");

    const activeCount = members.filter(member => member.active).length;

    const totalRevenue = payments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0), 0
    );

    if (totalMembers) totalMembers.textContent = members.length;
    if (activeMembers) activeMembers.textContent = activeCount;
    if (revenueElement) revenueElement.textContent = formatCurrency(totalRevenue);
    if (sessionsElement) sessionsElement.textContent = trainingSessions.length;

    createReportCharts();
    displayTrainerPerformance();
}

// Monthly revenue chart
function createReportCharts() {
    if (typeof Chart === "undefined") {
        console.error("Chart.js is not loaded.");
        return;
    }

    const revenueCanvas = document.getElementById("reportRevenueChart");
    const membershipCanvas = document.getElementById("reportMembershipChart");
    const paymentCanvas = document.getElementById("reportPaymentChart");

    if (!revenueCanvas || !membershipCanvas || !paymentCanvas) return;

    const currentYear = new Date().getFullYear();

    const monthLabels = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const monthlyRevenue = Array(12).fill(0);

    payments.forEach(payment => {
        const [year, month] = payment.date.split("-").map(Number);

        if (year === currentYear && month >= 1 && month <= 12) {
            monthlyRevenue[month - 1] += Number(payment.amount || 0);
        }
    });

    if (reportRevenueChart) reportRevenueChart.destroy();

    reportRevenueChart = new Chart(revenueCanvas, {
        type: "bar",
        data: {
            labels: monthLabels,
            datasets: [{
                label: "Revenue (₹)",
                data: monthlyRevenue,
                backgroundColor: "#4f6ee8",
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => "₹" + value
                    }
                }
            }
        }
    });

    // Membership distribution chart
    const planCounts = {};

    members.forEach(member => {
        const plan = member.membershipType || "Unspecified";
        planCounts[plan] = (planCounts[plan] || 0) + 1;
    });

    if (reportMembershipChart) reportMembershipChart.destroy();

    reportMembershipChart = new Chart(membershipCanvas, {
        type: "doughnut",
        data: {
            labels: Object.keys(planCounts),
            datasets: [{
                data: Object.values(planCounts),
                backgroundColor: ["#4f6ee8", "#37b887", "#9870e8", "#f2a64b"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Payment method chart
    const methodCounts = {};

    payments.forEach(payment => {
        methodCounts[payment.method] =
            (methodCounts[payment.method] || 0) + 1;
    });

    if (reportPaymentChart) reportPaymentChart.destroy();

    reportPaymentChart = new Chart(paymentCanvas, {
        type: "pie",
        data: {
            labels: Object.keys(methodCounts),
            datasets: [{
                data: Object.values(methodCounts),
                backgroundColor: ["#4f6ee8", "#37b887", "#9870e8", "#f2a64b"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Trainer performance table
function displayTrainerPerformance() {
    const table = document.getElementById("trainerPerformanceTable");

    if (!table) return;

    if (trainers.length === 0) {
        table.innerHTML =
            '<tr><td colspan="3">No trainer data available.</td></tr>';
        return;
    }

    table.innerHTML = trainers.map(trainer => {
        const assignedCount = new Set(
            (trainer.assignedMembers || [])
        ).size;

        const completedCount = trainingSessions.filter(session =>
            session.trainerId === trainer.id &&
            session.status === "Completed"
        ).length;

        return `
            <tr>
                <td>${escapeHTML(trainer.name)}</td>
                <td>${assignedCount}</td>
                <td>${completedCount}</td>
            </tr>
        `;
    }).join("");
}

// Export report data to CSV
function exportGymReport() {
    const rows = [
        ["GYM MANAGEMENT SYSTEM REPORT"],
        ["Generated On", new Date().toLocaleString()],
        [],
        ["MEMBERS"],
        ["Member ID", "Name", "Membership", "Status"]
    ];

    members.forEach(member => {
        rows.push([
            member.id,
            member.name,
            member.membershipType,
            member.active ? "Active" : "Inactive"
        ]);
    });

    rows.push([]);
    rows.push(["TRAINERS"]);
    rows.push(["Trainer ID", "Name", "Specialization", "Phone", "Experience"]);

    trainers.forEach(trainer => {
        rows.push([
            trainer.id,
            trainer.name,
            trainer.specialization,
            trainer.phone || "",
            trainer.experience || 0
        ]);
    });

    rows.push([]);
    rows.push(["PAYMENTS"]);
    rows.push([
        "Receipt ID", "Member ID", "Member Name",
        "Date", "Amount", "Method", "Notes"
    ]);

    payments.forEach(payment => {
        rows.push([
            payment.receiptId,
            payment.memberId,
            payment.memberName,
            payment.date,
            payment.amount,
            payment.method,
            payment.notes
        ]);
    });

    rows.push([]);
    rows.push(["TRAINING SESSIONS"]);
    rows.push([
        "Session ID", "Member ID", "Trainer ID",
        "Date", "Time", "Duration", "Status"
    ]);

    trainingSessions.forEach(session => {
        rows.push([
            session.id,
            session.memberId,
            session.trainerId,
            session.date,
            session.time,
            session.duration,
            session.status
        ]);
    });

    const csv = rows
        .map(row => row.map(csvValue).join(","))
        .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "FitTrack_Gym_Report.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}
// ==============================
// DEFAULT DEMO DATA
// ==============================

const demoDataAlreadyExists =
    members.length > 0 ||
    trainers.length > 0 ||
    workoutPlans.length > 0 ||
    trainingSessions.length > 0 ||
    payments.length > 0;

if (!demoDataAlreadyExists && typeof __TEST__ === "undefined") {
    const today = new Date();

    const dateOffset = (days) => {
        const date = new Date(today);
        date.setDate(date.getDate() + days);
        return date.toISOString().split("T")[0];
    };

    const dateISO = (days) => {
        const date = new Date(today);
        date.setDate(date.getDate() + days);
        return date.toISOString();
    };

    // MEMBERS
    members = [
        {
            id: "M001",
            name: "Arjun Patel",
            membershipType: "Monthly",
            active: true,
            joinedOn: dateISO(-20),
            startDate: dateISO(-20),
            expiryDate: dateISO(10)
        },
        {
            id: "M002",
            name: "Priya Shah",
            membershipType: "Quarterly",
            active: true,
            joinedOn: dateISO(-50),
            startDate: dateISO(-50),
            expiryDate: dateISO(40)
        },
        {
            id: "M003",
            name: "Rahul Mehta",
            membershipType: "Yearly",
            active: true,
            joinedOn: dateISO(-100),
            startDate: dateISO(-100),
            expiryDate: dateISO(265)
        },
        {
            id: "M004",
            name: "Neha Desai",
            membershipType: "Half-Yearly",
            active: false,
            joinedOn: dateISO(-200),
            startDate: dateISO(-200),
            expiryDate: dateISO(-20)
        },
        {
            id: "M005",
            name: "Karan Joshi",
            membershipType: "Monthly",
            active: true,
            joinedOn: dateISO(-5),
            startDate: dateISO(-5),
            expiryDate: dateISO(25)
        }
    ];

    // TRAINERS
    trainers = [
        {
            id: "T001",
            name: "Alex Johnson",
            specialization: "Strength Training",
            phone: "9876543210",
            experience: 5,
            assignedMembers: ["M001", "M002"]
        },
        {
            id: "T002",
            name: "Sarah Williams",
            specialization: "Weight Loss",
            phone: "9876543211",
            experience: 4,
            assignedMembers: ["M003", "M005"]
        },
        {
            id: "T003",
            name: "David Miller",
            specialization: "Cardio",
            phone: "9876543212",
            experience: 7,
            assignedMembers: ["M004"]
        }
    ];

    // WORKOUT PLANS
    workoutPlans = [
        {
            id: "WP001",
            name: "Beginner Strength Plan",
            level: "Beginner",
            duration: 4,
            exercises: [
                { name: "Push Ups", sets: 3, reps: 12, rest: 60 },
                { name: "Squats", sets: 3, reps: 15, rest: 60 },
                { name: "Plank", sets: 3, reps: 30, rest: 45 }
            ],
            createdOn: dateISO(-15)
        },
        {
            id: "WP002",
            name: "Muscle Building Plan",
            level: "Intermediate",
            duration: 8,
            exercises: [
                { name: "Bench Press", sets: 4, reps: 10, rest: 90 },
                { name: "Lat Pulldown", sets: 3, reps: 12, rest: 60 },
                { name: "Dumbbell Rows", sets: 3, reps: 12, rest: 60 }
            ],
            createdOn: dateISO(-10)
        },
        {
            id: "WP003",
            name: "Advanced Fitness Plan",
            level: "Advanced",
            duration: 12,
            exercises: [
                { name: "Deadlift", sets: 4, reps: 8, rest: 120 },
                { name: "Shoulder Press", sets: 4, reps: 10, rest: 90 },
                { name: "Pull Ups", sets: 3, reps: 10, rest: 90 }
            ],
            createdOn: dateISO(-5)
        }
    ];

    // TRAINING SESSIONS
    trainingSessions = [
        {
            id: "TS001",
            memberId: "M001",
            trainerId: "T001",
            date: dateOffset(1),
            time: "10:00",
            duration: 60,
            status: "Scheduled"
        },
        {
            id: "TS002",
            memberId: "M002",
            trainerId: "T001",
            date: dateOffset(2),
            time: "11:00",
            duration: 45,
            status: "Scheduled"
        },
        {
            id: "TS003",
            memberId: "M003",
            trainerId: "T002",
            date: dateOffset(-2),
            time: "09:00",
            duration: 60,
            status: "Completed"
        },
        {
            id: "TS004",
            memberId: "M005",
            trainerId: "T002",
            date: dateOffset(3),
            time: "17:00",
            duration: 45,
            status: "Scheduled"
        }
    ];

    // PAYMENTS
    payments = [
        {
            id: "PAY001",
            receiptId: "RCP001",
            memberId: "M001",
            memberName: "Arjun Patel",
            amount: 1000,
            method: "UPI",
            date: dateOffset(-15),
            notes: "Monthly membership",
            status: "Paid",
            createdOn: dateISO(-15)
        },
        {
            id: "PAY002",
            receiptId: "RCP002",
            memberId: "M002",
            memberName: "Priya Shah",
            amount: 2700,
            method: "Card",
            date: dateOffset(-40),
            notes: "Quarterly membership",
            status: "Paid",
            createdOn: dateISO(-40)
        },
        {
            id: "PAY003",
            receiptId: "RCP003",
            memberId: "M003",
            memberName: "Rahul Mehta",
            amount: 9000,
            method: "Cash",
            date: dateOffset(-90),
            notes: "Yearly membership",
            status: "Paid",
            createdOn: dateISO(-90)
        },
        {
            id: "PAY004",
            receiptId: "RCP004",
            memberId: "M004",
            memberName: "Neha Desai",
            amount: 5000,
            method: "UPI",
            date: dateOffset(-200),
            notes: "Half-yearly membership",
            status: "Paid",
            createdOn: dateISO(-200)
        },
        {
            id: "PAY005",
            receiptId: "RCP005",
            memberId: "M005",
            memberName: "Karan Joshi",
            amount: 1000,
            method: "Card",
            date: dateOffset(-3),
            notes: "Monthly membership",
            status: "Paid",
            createdOn: dateISO(-3)
        }
    ];

    // SAVE ALL DEMO DATA
    saveData("gym_members", members);
    saveData("gym_trainers", trainers);
    saveData("gym_workout_plans", workoutPlans);
    saveData("gym_training_sessions", trainingSessions);
    saveData("gym_payments", payments);

    console.log("Default demo data loaded successfully.");
}

// Refresh all UI components after demo data initialization
displayMembers();
displayTrainers();
updateDashboard();
updateDashboardRevenue();

displaySubscriptions();
displayWorkoutPlans();

updateSessionOptions();
displayTrainingSessions();

updatePaymentOptions();
displayPayments();
updatePaymentStats();

// Initialize reports and charts
refreshReports();
createDashboardCharts();
