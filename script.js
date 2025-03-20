// Initialisiere die Benutzerliste mit einem Admin-Account, wenn sie nicht im localStorage vorhanden ist
let users = JSON.parse(localStorage.getItem("users")) || {
    "admin": { password: "passwort123", isAdmin: true },  // Admin-Benutzer
    "mitarbeiter": { password: "secure123", isAdmin: false }
};

// Aktueller Benutzer
let currentUser = null;

// Initialer Materialbestand
let filament = localStorage.getItem("filament") ? parseInt(localStorage.getItem("filament")) : 10;
document.getElementById("filamentBestand").textContent = filament;

// Notfall-Login-Daten
const emergencyUser = "emergency";
const emergencyPassword = "emergencyPass";

// Funktion zum Anzeigen der gewünschten Sektion
function showSection(sectionId) {
    const sections = ["auftraege", "material", "todo", "mitarbeiterverwaltung", "benutzerverwaltung", "hintergrundaenderung"];
    sections.forEach((section) => {
        document.getElementById(section).style.display = section === sectionId ? "block" : "none";
    });

    // Setze die Hintergrundfarbe der Sektionen
    if (sectionId === "benutzerverwaltung" || sectionId === "hintergrundaenderung") {
        document.getElementById(sectionId).style.backgroundColor = "rgba(255, 255, 255, 0.8)";
    }
}

// Login-Funktion
function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    // Notfall-Login überprüfen
    if (username === emergencyUser && password === emergencyPassword) {
        alert("Notfall-Login erfolgreich!");
        currentUser = emergencyUser; // Setze den aktuellen Benutzer auf den Notfall-Benutzer
        localStorage.setItem("loggedIn", "true");
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        loadData(); // Lade Daten
        alleMitarbeiterLaden(); // Lade die Mitarbeiter
        showSection("auftraege"); // Zeige die Aufträge an
        loadBackgrounds(); // Lade die Hintergründe
        return;
    }

    // Reguläre Benutzeranmeldung überprüfen
    if (users[username] && users[username].password === password) {
        localStorage.setItem("loggedIn", "true");
        currentUser = username; // Setze den aktuellen Benutzer
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        loadData(); // Lade Daten, wenn der Benutzer sich einloggt
        alleMitarbeiterLaden(); // Lade die Mitarbeiter
        showSection("auftraege"); // Zeige die Aufträge an
        loadBackgrounds(); // Lade die Hintergründe
        return;
    } else {
        document.getElementById("errorMessage").textContent = "Falscher Benutzername oder Passwort!";
    }
}

// Logout-Funktion
function logout() {
    localStorage.removeItem("loggedIn");
    currentUser = null; // Setze den aktuellen Benutzer zurück
    location.reload();
}

// Prüfen, ob jemand eingeloggt ist
window.onload = function() {
    if (localStorage.getItem("loggedIn") === "true") {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        loadData(); // Lade Daten beim Laden der Seite
        alleMitarbeiterLaden(); // Lade die Mitarbeiter
        showSection("auftraege"); // Zeige die Aufträge an
        loadBackgrounds(); // Lade die Hintergründe
    }
}

// Funktion zum Aktualisieren des Dashboard-Hintergrunds
function updateDashboardBackground() {
    if (!users[currentUser].isAdmin) {
        alert("Nur Admins können den Dashboard-Hintergrund ändern.");
        return;
    }

    const fileInput = document.getElementById("dashboardBackgroundFile");
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("dashboard").style.backgroundImage = `url(${e.target.result})`; // Setze den Hintergrundbild für das Dashboard
            localStorage.setItem("dashboardBackgroundImage", e.target.result); // Speichere das Hintergrundbild
            document.getElementById("dashboardUploadMessage").textContent = "Dashboard-Hintergrund erfolgreich aktualisiert!";
        };
        reader.readAsDataURL(file);
    } else {
        document.getElementById("dashboardUploadMessage").textContent = "Bitte wähle eine Bilddatei aus.";
    }
}

// Funktion zum Laden der Hintergründe
function loadBackgrounds() {
    const dashboardBackgroundImage = localStorage.getItem("dashboardBackgroundImage");

    if (dashboardBackgroundImage) {
        document.getElementById("dashboard").style.backgroundImage = `url(${dashboardBackgroundImage})`; // Setze das gespeicherte Hintergrundbild für das Dashboard
    }
}

// Aufträge hinzufügen
function auftragHinzufuegen() {
    let input = document.getElementById("auftragInput").value;
    if (input.trim() !== "") {
        let liste = document.getElementById("auftragsListe");
        let neuerEintrag = document.createElement("li");
        neuerEintrag.textContent = input;

        // Setze die Hintergrundfarbe für den neuen Auftrag
        neuerEintrag.style.backgroundColor = "rgba(255, 255, 255, 0.8)"; // Gleiche Hintergrundfarbe wie die anderen Texte
        neuerEintrag.style.padding = "10px"; // Padding für besseren Abstand
        neuerEintrag.style.borderRadius = "4px"; // Runde Ecken

        // Button zum Löschen des Auftrags
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Löschen";
        deleteButton.onclick = function() {
            liste.removeChild(neuerEintrag); // Lösche den Auftrag
            saveData(); // Speichere die Daten nach dem Löschen
        };

        neuerEintrag.appendChild(deleteButton); // Füge den Button zum Auftrag hinzu
        liste.appendChild(neuerEintrag);
        document.getElementById("auftragInput").value = "";
        saveData(); // Speichere Daten nach Hinzufügen eines Auftrags
    }
}

// To-Do-Liste hinzufügen
function todoHinzufuegen() {
    let input = document.getElementById("todoInput").value;
    if (input.trim() !== "") {
        let liste = document.getElementById("todoListe");
        let neuerEintrag = document.createElement("li");
        neuerEintrag.textContent = input;

        // Setze die Hintergrundfarbe für den neuen To-Do
        neuerEintrag.style.backgroundColor = "rgba(255, 255, 255, 0.8)"; // Gleiche Hintergrundfarbe wie die anderen Texte
        neuerEintrag.style.padding = "10px"; // Padding für besseren Abstand
        neuerEintrag.style.borderRadius = "4px"; // Runde Ecken

        // Button zum Löschen der To-Do
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Löschen";
        deleteButton.onclick = function() {
            liste.removeChild(neuerEintrag); // Lösche das To-Do
            saveData(); // Speichere die Daten nach dem Löschen
        };

        neuerEintrag.appendChild(deleteButton); // Füge den Button zum To-Do hinzu
        liste.appendChild(neuerEintrag);
        document.getElementById("todoInput").value = "";
        saveData(); // Speichere Daten nach Hinzufügen eines To-Do
    }
}

// Daten speichern
function saveData() {
    // Speichere Aufträge
    const auftraege = [];
    const auftragsListe = document.getElementById("auftragsListe").getElementsByTagName("li");
    for (let item of auftragsListe) {
        auftraege.push(item.textContent.replace("Löschen", "").trim()); // Entferne den "Löschen"-Button
    }
    localStorage.setItem("auftraege", JSON.stringify(auftraege));

    // Speichere To-Do-Elemente
    const todos = [];
    const todoListe = document.getElementById("todoListe").getElementsByTagName("li");
    for (let item of todoListe) {
        todos.push(item.textContent.replace("Löschen", "").trim()); // Entferne den "Löschen"-Button
    }
    localStorage.setItem("todos", JSON.stringify(todos));

    // Speichere die Benutzer im localStorage
    localStorage.setItem("users", JSON.stringify(users));
}

// Daten laden
function loadData() {
    // Lade Aufträge
    const auftraege = JSON.parse(localStorage.getItem("auftraege")) || [];
    const auftragsListe = document.getElementById("auftragsListe");
    auftragsListe.innerHTML = ""; // Leere die Liste
    for (let auftrag of auftraege) {
        const li = document.createElement("li");
        li.textContent = auftrag;

        // Setze die Hintergrundfarbe für den neuen Auftrag
        li.style.backgroundColor = "rgba(255, 255, 255, 0.8)"; // Gleiche Hintergrundfarbe wie die anderen Texte
        li.style.padding = "10px"; // Padding für besseren Abstand
        li.style.borderRadius = "4px"; // Runde Ecken

        // Button zum Löschen des Auftrags
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Löschen";
        deleteButton.onclick = function() {
            auftragsListe.removeChild(li); // Lösche den Auftrag
            saveData(); // Speichere die Daten nach dem Löschen
        };

        li.appendChild(deleteButton); // Füge den Button zum Auftrag hinzu
        auftragsListe.appendChild(li);
    }

    // Lade To-Do-Elemente
    const todos = JSON.parse(localStorage.getItem("todos")) || [];
    const todoListe = document.getElementById("todoListe");
    todoListe.innerHTML = ""; // Leere die Liste
    for (let todo of todos) {
        const li = document.createElement("li");
        li.textContent = todo;

        // Setze die Hintergrundfarbe für den neuen To-Do
        li.style.backgroundColor = "rgba(255, 255, 255, 0.8)"; // Gleiche Hintergrundfarbe wie die anderen Texte
        li.style.padding = "10px"; // Padding für besseren Abstand
        li.style.borderRadius = "4px"; // Runde Ecken

        // Button zum Löschen der To-Do
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Löschen";
        deleteButton.onclick = function() {
            todoListe.removeChild(li); // Lösche das To-Do
            saveData(); // Speichere die Daten nach dem Löschen
        };

        li.appendChild(deleteButton); // Füge den Button zum To-Do hinzu
        todoListe.appendChild(li);
    }
}

// Alle Mitarbeiter laden
function alleMitarbeiterLaden() {
    const mitarbeiterListe = document.getElementById("mitarbeiterListe");
    mitarbeiterListe.innerHTML = ""; // Leere die Liste
    for (let username in users) {
        const li = document.createElement("li");
        li.textContent = username + (users[username].isAdmin ? " (Admin)" : " (Mitarbeiter)"); // Zeige Admin-Status an

        // Setze die Hintergrundfarbe für den neuen Mitarbeiter
        li.style.backgroundColor = "rgba(255, 255, 255, 0.8)"; // Gleiche Hintergrundfarbe wie die anderen Texte
        li.style.padding = "10px"; // Padding für besseren Abstand
        li.style.borderRadius = "4px"; // Runde Ecken

        // Button zum Löschen des Benutzers
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Entfernen";
        deleteButton.onclick = function() {
            if (!users[currentUser].isAdmin) {
                alert("Nur Admins können Mitarbeiter entfernen.");
                return;
            }
            delete users[username]; // Entferne den Benutzer aus dem Objekt
            localStorage.setItem("users", JSON.stringify(users)); // Aktualisiere den localStorage
            alleMitarbeiterLaden(); // Lade die Mitarbeiterliste neu
        };

        li.appendChild(deleteButton); // Füge den Button zum Benutzer hinzu

        // Button zum Festlegen als Admin
        if (users[currentUser].isAdmin) { // Nur Admins können Admins festlegen
            let adminButton = document.createElement("button");
            adminButton.textContent = "Als Admin festlegen";
            adminButton.onclick = function() {
                users[username].isAdmin = true; // Setze den Benutzer als Admin
                localStorage.setItem("users", JSON.stringify(users)); // Aktualisiere den localStorage
                alert(username + " wurde als Admin festgelegt.");
                alleMitarbeiterLaden(); // Lade die Mitarbeiterliste neu
            };

            li.appendChild(adminButton); // Füge den Admin-Button zum Benutzer hinzu

            // Button zum Entfernen der Admin-Rechte
            let removeAdminButton = document.createElement("button");
            removeAdminButton.textContent = "Admin entfernen";
            removeAdminButton.onclick = function() {
                if (users[username].isAdmin) {
                    users[username].isAdmin = false; // Entferne Admin-Rechte
                    localStorage.setItem("users", JSON.stringify(users)); // Aktualisiere den localStorage
                    alert(username + " hat keine Admin-Rechte mehr.");
                    alleMitarbeiterLaden(); // Lade die Mitarbeiterliste neu
                }
            };

            li.appendChild(removeAdminButton); // Füge den Button zum Entfernen von Admin-Rechten hinzu
        }

        mitarbeiterListe.appendChild(li); // Füge den Mitarbeiter zur Liste hinzu
    }
}

// Benutzer hinzufügen
function benutzerHinzufuegen() {
    if (!users[currentUser].isAdmin) {
        alert("Nur Admins können Benutzer hinzufügen.");
        return;
    }

    let newUsername = document.getElementById("newUsername").value;
    let newPassword = document.getElementById("newPassword").value;

    if (newUsername && newPassword) {
        users[newUsername] = { password: newPassword, isAdmin: false }; // Neuer Benutzer hinzufügen
        localStorage.setItem("users", JSON.stringify(users)); // Speichere die Benutzer im localStorage
        alert("Benutzer erfolgreich hinzugefügt.");
        document.getElementById("newUsername").value = "";
        document.getElementById("newPassword").value = "";
        alleMitarbeiterLaden(); // Lade die Mitarbeiterliste neu
    } else {
        alert("Bitte fülle alle Felder aus.");
    }
}

// Passwort ändern
function passwortAendern() {
    let changeUsername = document.getElementById("changeUsername").value;
    let changePassword = document.getElementById("changePassword").value;

    if (currentUser && changeUsername === currentUser && changePassword) {
        users[currentUser].password = changePassword; // Passwort des eingeloggten Benutzers ändern
        localStorage.setItem("users", JSON.stringify(users)); // Speichere die Benutzer im localStorage
        alert("Passwort erfolgreich geändert.");
        document.getElementById("changePassword").value = "";
    } else {
        alert("Bitte den richtigen Benutzernamen eingeben oder das Passwort ausfüllen.");
    }
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('service-worker.js')
            .then(function(registration) {
                console.log('Service Worker registriert mit der folgenden Scope:', registration.scope);
            })
            .catch(function(error) {
                console.log('Service Worker Registrierung fehlgeschlagen:', error);
            });
    });
}
