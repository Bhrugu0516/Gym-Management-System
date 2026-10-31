
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
    const specialization =
        document.getElementById("specialization").value.trim();

    if (!id || !name || !specialization) {
        alert("Please enter all trainer details.");
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
        specialization
    });

    saveData("gym_trainers", trainers);

    document.getElementById("trainerId").value = "";
    document.getElementById("trainerName").value = "";
    document.getElementById("specialization").value = "";

    displayTrainers();
    updateDashboard();
}

function displayTrainers() {
    const list = document.getElementById("trainerList");
    list.innerHTML = "";

    trainers.forEach((trainer, index) => {
        list.innerHTML += `
            <div class="trainer-card">
                <h3>${escapeHTML(trainer.name)}</h3>

                <p><strong>Trainer ID:</strong>
                    ${escapeHTML(trainer.id)}</p>

                <p><strong>Specialization:</strong>
                    ${escapeHTML(trainer.specialization)}</p>

                <br>

                <button class="delete-btn"
                    onclick="deleteTrainer(${index})">
                    Delete
                </button>
            </div>
        `;
    });
}

function deleteTrainer(index) {
    if (!trainers[index]) return;

    if (confirm("Are you sure you want to delete this trainer?")) {
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
