const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

// Create a simple testing environment for the application
function setupApp(confirmResult = true) {
    const elements = {};

    // Create mock HTML elements used by the application
    const ids = [
        "memberId",
        "memberName",
        "membershipType",
        "memberList",
        "trainerId",
        "trainerName",
        "specialization",
        "trainerList",
        "totalMembers",
        "activeMembers",
        "totalTrainers",
        "trainerPhone",
        "trainerExperience",
        "assignmentMember",
        "assignmentTrainer",
        "trainerTotalCount",
        "assignedTrainerCount",
        "assignedMemberCount",
        "sessionMember",
        "sessionTrainer",
        "sessionDate",
        "sessionTime",
        "sessionDuration",
        "sessionNotes",
        "sessionForm",
        "sessionsTable",
        "totalSessions",
        "scheduledSessions",
        "completedSessions",
        "cancelledSessions"
    ];

    ids.forEach(id => {
       elements[id] = {
    value: "",
    innerHTML: "",
    textContent: "",
    reset() {
        this.value = "";
    }
};
    });

    const alerts = [];
    const confirmations = [];

    const context = {
        __TEST__: true,
        document: {
            getElementById(id) {
                return elements[id];
            }
        },

        alert(message) {
            alerts.push(message);
        },

        confirm(message) {
            confirmations.push(message);
            return confirmResult;
        }
    };

    vm.createContext(context);

    const source = fs.readFileSync("./script.js", "utf8");
    vm.runInContext(source, context);

    return {
        context,
        elements,
        alerts,
        confirmations
    };
}


// TEST 1: Add member with valid details
test("Should add a member successfully", () => {
    const app = setupApp();

    app.elements.memberId.value = "M001";
    app.elements.memberName.value = "Bhrugu";
    app.elements.membershipType.value = "Yearly";

    vm.runInContext("addMember()", app.context);

    assert.equal(vm.runInContext("members.length", app.context), 1);
    assert.equal(vm.runInContext("members[0].name", app.context), "Bhrugu");
    assert.equal(app.elements.totalMembers.textContent, 1);
});


// TEST 2: Reject member with empty ID
test("Should reject member with empty ID", () => {
    const app = setupApp();

    app.elements.memberId.value = "";
    app.elements.memberName.value = "Bhrugu";

    vm.runInContext("addMember()", app.context);

    assert.equal(vm.runInContext("members.length", app.context), 0);
    assert.equal(app.alerts.length, 1);
});


// TEST 3: Reject member with empty name
test("Should reject member with empty name", () => {
    const app = setupApp();

    app.elements.memberId.value = "M002";
    app.elements.memberName.value = "";

    vm.runInContext("addMember()", app.context);

    assert.equal(vm.runInContext("members.length", app.context), 0);
    assert.equal(app.alerts.length, 1);
});


// TEST 4: Deactivate a member
test("Should deactivate an active member", () => {
    const app = setupApp();

    app.elements.memberId.value = "M003";
    app.elements.memberName.value = "Rahul";

    vm.runInContext("addMember()", app.context);
    vm.runInContext("toggleMembership(0)", app.context);

    assert.equal(vm.runInContext("members[0].active", app.context), false);
    assert.equal(app.elements.activeMembers.textContent, 0);
});


// TEST 5: Delete member after confirmation
test("Should delete member when confirmed", () => {
    const app = setupApp(true);

    app.elements.memberId.value = "M004";
    app.elements.memberName.value = "Amit";

    vm.runInContext("addMember()", app.context);
    vm.runInContext("deleteMember(0)", app.context);

    assert.equal(vm.runInContext("members.length", app.context), 0);
});


// TEST 6: Keep member when deletion is cancelled
test("Should not delete member when cancelled", () => {
    const app = setupApp(false);

    app.elements.memberId.value = "M005";
    app.elements.memberName.value = "Karan";

    vm.runInContext("addMember()", app.context);
    vm.runInContext("deleteMember(0)", app.context);

    assert.equal(vm.runInContext("members.length", app.context), 1);
});


// TEST 7: Add trainer successfully
test("Should add a trainer successfully", () => {
    const app = setupApp();

    app.elements.trainerId.value = "T001";
    app.elements.trainerName.value = "Arjun";
    app.elements.specialization.value = "Strength Training";
    app.elements.trainerPhone.value = "9876543210";
    app.elements.trainerExperience.value = "3";

    vm.runInContext("addTrainer()", app.context);

    assert.equal(vm.runInContext("trainers.length", app.context), 1);
    assert.equal(vm.runInContext("trainers[0].name", app.context), "Arjun");
    assert.equal(app.elements.totalTrainers.textContent, 1);
});
// TEST 8: Reject trainer with invalid phone number
test("Should reject trainer with invalid phone number", () => {
    const app = setupApp();

    app.elements.trainerId.value = "T002";
    app.elements.trainerName.value = "Rahul";
    app.elements.specialization.value = "Cardio";
    app.elements.trainerPhone.value = "12345";
    app.elements.trainerExperience.value = "3";

    vm.runInContext("addTrainer()", app.context);

    assert.equal(vm.runInContext("trainers.length", app.context), 0);
    assert.equal(app.alerts.length, 1);
});
// TEST 9: Reject an impossible calendar date
test("Should reject an invalid session date", () => {
    const app = setupApp();

    vm.runInContext(`
        members.push({
            id: "M100",
            name: "Test Member",
            active: true,
            membershipType: "Yearly",
            expiryDate: "2099-12-31T00:00:00.000Z"
        });

        trainers.push({
            id: "T100",
            name: "Test Trainer",
            specialization: "Fitness",
            assignedMembers: []
        });
    `, app.context);

    app.elements.sessionMember.value = "M100";
    app.elements.sessionTrainer.value = "T100";
    app.elements.sessionDate.value = "2099-02-30";
    app.elements.sessionTime.value = "10:00";
    app.elements.sessionDuration.value = "60";
    app.elements.sessionNotes.value = "";

   const initialSessionCount = vm.runInContext(
    "trainingSessions.length",
    app.context
);

vm.runInContext("bookTrainingSession()", app.context);

assert.equal(
    vm.runInContext("trainingSessions.length", app.context),
    initialSessionCount
);
});