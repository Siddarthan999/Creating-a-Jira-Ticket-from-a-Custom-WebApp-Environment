let users = {
    "Siddarthan": { username: "Siddarthan Natarajan", password: "root", email: "siddarthan@gmail.com", dob: "2004-05-26", address: "Chennai, Tamil Nadu", phone: "1234567890", country: "India" },
    "Sudharshna": { username: "Sudharshna Lakshmi", password: "root", email: "sudharshna@gmail.com", dob: "2000-01-01", address: "Chennai, Tamil Nadu", phone: "0987654321", country: "India" }
};

let sessionTimer, startTime, loginTimestamp;
let visitedRoutes = [];

function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let errorMessage = document.getElementById("errorMessage");

    if (users[username]) {
        if (users[username].password === password) {
            document.querySelector(".container").style.display = "none";
            document.getElementById("welcomeContainer").style.display = "block";
            document.getElementById("userDisplay").innerText = users[username].username;
            errorMessage.innerText = "";

            startTime = Date.now();
            loginTimestamp = new Date().toLocaleString();
            visitedRoutes = [];
            sessionTimer = setInterval(() => {
                document.getElementById("sessionTime").innerText = Math.floor((Date.now() - startTime) / 1000);
            }, 1000);

            visitRoute("home");
            
            let user = users[username];
            let description = `Username: ${user.username}\nEmail: ${user.email}\nLogin Time: ${loginTimestamp} IST`;
            createJiraTicket("Authentication Successful", description, "Incident");
        } else {
            errorMessage.innerText = "Incorrect password. Please try again.";
            let user = users[username];
            let description = `Username: ${user.username}\nEmail: ${user.email}\nDOB: ${user.dob}\nAddress: ${user.address}\nPhone: ${user.phone}\nCountry: ${user.country}`;
            createJiraTicket("Failed Login Attempt", description, "[System] Incident");
        }
    } else {
        errorMessage.innerText = "User not found!";
    }
}

function visitRoute(route) {
    if (!visitedRoutes.includes(route)) {
        visitedRoutes.push(`/${route}`);
    }
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    document.getElementById(route).style.display = 'block';
}

function logout() {
    clearInterval(sessionTimer);
    let sessionDuration = Math.floor((Date.now() - startTime) / 1000);
    let logoutTimestamp = new Date().toLocaleString();

    showToast("Logged out successfully!");

    let username = document.getElementById("userDisplay").innerText;
    let user = Object.values(users).find(u => u.username === username);

    let visitedPages = visitedRoutes.length > 0 ? visitedRoutes.join(", ") : "None";
    let description = `Username: ${user.username}\nEmail: ${user.email}\nSession Duration: ${sessionDuration} seconds\nLogin Time: ${loginTimestamp} IST\nLogout Time: ${logoutTimestamp} IST\nVisited Routes: ${visitedPages}`;

    createJiraTicket("User Logged Out", description, "Session Timings");
    // location.reload();

    setTimeout(() => {
        location.reload();
    }, 1500);
    
}

function showToast(message) {
    let toast = document.getElementById("toast");
    toast.innerText = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

async function createJiraTicket(summary, description, issueType) {
    await fetch("http://localhost:3000/create-jira", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary, description, issueType })
    });
}
