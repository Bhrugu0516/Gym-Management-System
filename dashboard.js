
// FitTrack Dashboard

let revenueChartInstance = null;
let membershipChartInstance = null;

// Display current date
function displayCurrentDate() {
    const dateElement = document.getElementById("currentDate");

    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }
}

// Update recent members table
function updateRecentMembers() {
    const tableBody = document.getElementById("recentMembersTable");

    if (!tableBody) return;

    if (!Array.isArray(members) || members.length === 0) {
        tableBody.innerHTML =
            '<tr><td colspan="4">No members registered yet.</td></tr>';
        return;
    }

    const recentMembers = [...members].slice(-5).reverse();

    tableBody.innerHTML = recentMembers.map(member => {
        const status = member.active ? "Active" : "Inactive";
        const statusClass = member.active ? "status-active" : "status-inactive";

        return `
            <tr>
                <td>${escapeHTML(member.id)}</td>
                <td>${escapeHTML(member.name)}</td>
                <td>${escapeHTML(member.membershipType)}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
            </tr>
        `;
    }).join("");
}

// Create membership status chart
function createMembershipChart() {
    const canvas = document.getElementById("membershipChart");

    if (!canvas || typeof Chart === "undefined") return;

    const activeCount = members.filter(member => member.active).length;
    const inactiveCount = members.length - activeCount;

    if (membershipChartInstance) {
        membershipChartInstance.destroy();
    }

    membershipChartInstance = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: ["Active Members", "Inactive Members"],
            datasets: [{
                data: [activeCount, inactiveCount],
                backgroundColor: ["#4169e1", "#e6eaf2"],
                borderWidth: 0,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: "72%",
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { family: "Inter", size: 11 }
                    }
                }
            }
        }
    });
}

// Create revenue chart
// Revenue will remain zero until the Payments module is implemented.
function createRevenueChart() {
    const canvas = document.getElementById("revenueChart");

    if (!canvas || typeof Chart === "undefined") return;

    if (revenueChartInstance) {
        revenueChartInstance.destroy();
    }

    revenueChartInstance = new Chart(canvas, {
        type: "bar",
        data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            datasets: [{
                label: "Revenue",
                data: Array(12).fill(0),
                backgroundColor: "#4169e1",
                borderRadius: 6,
                maxBarThickness: 25
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 },
                    grid: { color: "#edf0f5" }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

// Refresh all dashboard components
function refreshDashboard() {
    displayCurrentDate();
    updateRecentMembers();
    createMembershipChart();
    createRevenueChart();
}

// Connect dashboard refresh to existing dashboard updates
const originalUpdateDashboard = updateDashboard;

updateDashboard = function () {
    originalUpdateDashboard();

    if (document.getElementById("recentMembersTable")) {
        refreshDashboard();
    }
};

// Initial dashboard setup
refreshDashboard();

// Dynamic page heading and sidebar navigation

const pageDetails = {
    dashboard: ["Dashboard", "Welcome back! Here's what's happening at your gym."],
    members: ["Member Management", "Register and manage gym members."],
    trainers: ["Trainer Management", "Manage your gym's trainers."],
    memberships: ["Membership Plans", "Manage subscription plans and pricing."],
    workouts: ["Workout Management", "Create and assign workout plans."],
    sessions: ["Training Sessions", "Schedule personal training sessions."],
    payments: ["Payments", "Track membership payments and transactions."],
    reports: ["Reports & Analytics", "Understand your gym's performance."]
};

function updatePageNavigation() {
    const page = window.location.hash.replace("#", "") || "dashboard";
    const details = pageDetails[page] || pageDetails.dashboard;

    document.getElementById("pageTitle").textContent = details[0];
    document.getElementById("pageSubtitle").textContent = details[1];

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${page}`
        );
    });
}

window.addEventListener("hashchange", updatePageNavigation);
updatePageNavigation();
