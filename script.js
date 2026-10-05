let members = [];
let trainers = [];


// ==============================
// MEMBER MANAGEMENT
// ==============================

function addMember() {

    const id = document.getElementById("memberId").value.trim();
    const name = document.getElementById("memberName").value.trim();
    const type = document.getElementById("membershipType").value;

    if (id === "" || name === "") {
        alert("Please enter Member ID and Member Name.");
        return;
    }

    const member = {
        id: id,
        name: name,
        membershipType: type,
        active: true
    };

    members.push(member);

    document.getElementById("memberId").value = "";
    document.getElementById("memberName").value = "";

    displayMembers();
    updateDashboard();
}


// Display all members

function displayMembers() {

    const list = document.getElementById("memberList");

    list.innerHTML = "";

    members.forEach((member, index) => {

        const statusClass =
            member.active
                ? "status-active"
                : "status-inactive";

        const statusText =
            member.active
                ? "Active"
                : "Inactive";

        list.innerHTML += `
            <div class="member-card">

                <h3>${member.name}</h3>

                <p>
                    <strong>Member ID:</strong>
                    ${member.id}
                </p>

                <p>
                    <strong>Membership:</strong>
                    ${member.membershipType}
                </p>

                <p>
                    <strong>Status:</strong>
                    <span class="${statusClass}">
                        ${statusText}
                    </span>
                </p>

                <br>

                <button onclick="toggleMembership(${index})">
                    ${member.active ? "Deactivate" : "Activate"}
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteMember(${index})">
                    Delete
                </button>

            </div>
        `;
    });
}


// Activate / deactivate membership

function toggleMembership(index) {

    members[index].active =
        !members[index].active;

    displayMembers();
    updateDashboard();
}


// Delete member

function deleteMember(index) {

    if (confirm("Are you sure you want to delete this member?")) {

        members.splice(index, 1);

        displayMembers();
        updateDashboard();
    }
}


// ==============================
// TRAINER MANAGEMENT
// ==============================

function addTrainer() {

    const id =
        document.getElementById("trainerId").value.trim();

    const name =
        document.getElementById("trainerName").value.trim();

    const specialization =
        document.getElementById("specialization").value.trim();

    if (id === "" || name === "" || specialization === "") {

        alert("Please enter all trainer details.");

        return;
    }

    const trainer = {

        id: id,
        name: name,
        specialization: specialization

    };

    trainers.push(trainer);

    document.getElementById("trainerId").value = "";
    document.getElementById("trainerName").value = "";
    document.getElementById("specialization").value = "";

    displayTrainers();
    updateDashboard();
}


// Display trainers

function displayTrainers() {

    const list =
        document.getElementById("trainerList");

    list.innerHTML = "";

    trainers.forEach((trainer, index) => {

        list.innerHTML += `

            <div class="trainer-card">

                <h3>${trainer.name}</h3>

                <p>
                    <strong>Trainer ID:</strong>
                    ${trainer.id}
                </p>

                <p>
                    <strong>Specialization:</strong>
                    ${trainer.specialization}
                </p>

                <br>

                <button
                    class="delete-btn"
                    onclick="deleteTrainer(${index})">
                    Delete
                </button>

            </div>
        `;
    });
}


// Delete trainer

function deleteTrainer(index) {

    if (confirm("Are you sure you want to delete this trainer?")) {

        trainers.splice(index, 1);

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

    const activeCount =
        members.filter(member => member.active).length;

    document.getElementById("activeMembers").textContent =
        activeCount;

    document.getElementById("totalTrainers").textContent =
        trainers.length;
}


// Initial dashboard

updateDashboard();
