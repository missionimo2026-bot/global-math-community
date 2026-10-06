/* ================= MENU ================= */

function toggleMenu() {

    const nav = document.querySelector("nav");

    nav.classList.toggle("open");

}


/* ================= MESSAGE ================= */

function showMessage(message) {

    alert(message);

}


/* ================= PROBLEM ================= */

function showAnswer() {

    const answer =
        document.getElementById("answer");

    answer.textContent =
        "Answer: 8 🎉";

}


/* ================= CHALLENGES ================= */

function joinChallenge(name) {

    alert(
        "You joined the " +
        name +
        " challenge! 🚀"
    );

}


/* ================= JOIN FORM ================= */

const joinForm =
    document.getElementById("joinForm");

if (joinForm) {

    joinForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            const name =
                document.getElementById("name").value;

            const country =
                document.getElementById("country").value;

            const role =
                document.getElementById("role").value;

            const interest =
                document.getElementById("interest").value;

            const bio =
                document.getElementById("bio").value;


            const member = {

                name: name,

                country: country,

                role: role,

                interest: interest,

                bio: bio

            };


            let members =
                JSON.parse(
                    localStorage.getItem("missionIMO_members")
                ) || [];


            members.push(member);


            localStorage.setItem(
                "missionIMO_members",
                JSON.stringify(members)
            );


            document.getElementById(
                "joinMessage"
            ).textContent =
                "Welcome to Mission IMO, " +
                name +
                "! 🚀";


            joinForm.reset();


            displayMembers();

        }
    );

}


/* ================= DISPLAY MEMBERS ================= */

function displayMembers() {

    const container =
        document.getElementById("memberList");

    if (!container) return;


    const members =
        JSON.parse(
            localStorage.getItem("missionIMO_members")
        ) || [];


    if (members.length === 0) {

        container.innerHTML =
            '<div class="empty">' +
            'No members yet. Be the first to join Mission IMO.' +
            '</div>';

        return;

    }


    container.innerHTML = "";


    members.forEach(function(member) {

        const card =
            document.createElement("div");

        card.className = "member";


        card.innerHTML =

            '<div class="member-avatar">🧑‍🎓</div>' +

            '<h3>' +
            escapeHTML(member.name) +
            '</h3>' +

            '<p>🌍 ' +
            escapeHTML(member.country) +
            '</p>' +

            '<p>🎓 ' +
            escapeHTML(member.role) +
            '</p>' +

            '<p>🧠 ' +
            escapeHTML(member.interest || "Mathematics") +
            '</p>';


        container.appendChild(card);

    });

}


/* ================= SAFE TEXT ================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text || "";

    return div.innerHTML;

}


/* ================= PROBLEM SUBMISSION ================= */

const problemForm =
    document.getElementById("problemForm");

if (problemForm) {

    problemForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const problem =
                document.getElementById(
                    "problemInput"
                ).value;

            const difficulty =
                document.getElementById(
                    "problemDifficulty"
                ).value;


            let problems =
                JSON.parse(
                    localStorage.getItem(
                        "missionIMO_problems"
                    )
                ) || [];


            problems.push({

                problem: problem,

                difficulty: difficulty

            });


            localStorage.setItem(
                "missionIMO_problems",
                JSON.stringify(problems)
            );


            document.getElementById(
                "problemMessage"
            ).textContent =
                "Problem submitted successfully! 🧩";


            problemForm.reset();

        }
    );

}


/* ================= STARTUP ================= */

displayMembers();
