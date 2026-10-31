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
        "totalTrainers"
    ];

    ids.forEach(id => {
        elements[id] = {
            value: "",
            innerHTML: "",
            textContent: ""
        };
    });

    const alerts = [];
    const confirmations = [];

    const context = {
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

    vm.runInContext("addTrainer()", app.context);

    assert.equal(vm.runInContext("trainers.length", app.context), 1);
    assert.equal(vm.runInContext("trainers[0].name", app.context), "Arjun");
    assert.equal(app.elements.totalTrainers.textContent, 1);
});