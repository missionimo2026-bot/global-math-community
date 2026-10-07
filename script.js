/* =========================================================
   MISSION IMO — COMPLETE FIREBASE SCRIPT
   ========================================================= */

/* =========================================================
   1. FIREBASE CONFIG
   =========================================================
   REPLACE THESE VALUES WITH YOUR REAL FIREBASE CONFIG.
   Firebase Console → Project Settings → Your apps → Web app
   ========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyCtMvHetBaYOQ2JbuIMjFka4S6H-6VIxc8",
    authDomain: "mission-imo.firebaseapp.com",
    projectId: "mission-imo",
    storageBucket: "mission-imo.firebasestorage.app",
    messagingSenderId: "926204356108",
    appId: "G-QWKY6QSTTC"
};


/* =========================================================
   2. FIREBASE IMPORTS
   ========================================================= */

import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    doc,
    query,
    orderBy,
    limit,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   3. START FIREBASE
   ========================================================= */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


/* =========================================================
   4. GLOBAL USER
   ========================================================= */

let currentUser = null;


/* =========================================================
   5. HELPER FUNCTIONS
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}


function getValue(id) {
    const element = $(id);

    return element
        ? element.value.trim()
        : "";
}


function message(text) {
    alert(text);
}


function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value || "";

    return div.innerHTML;
}


function firebaseError(error) {

    switch (error.code) {

        case "auth/email-already-in-use":
            return "This email is already registered.";

        case "auth/invalid-email":
            return "Please enter a valid email.";

        case "auth/weak-password":
            return "Password must contain at least 6 characters.";

        case "auth/invalid-credential":
            return "Incorrect email or password.";

        case "auth/user-not-found":
            return "No account found with this email.";

        case "auth/wrong-password":
            return "Incorrect password.";

        case "auth/too-many-requests":
            return "Too many attempts. Try again later.";

        default:
            return error.message || "Something went wrong.";
    }
}


/* =========================================================
   6. AUTHENTICATION STATE
   ========================================================= */

onAuthStateChanged(auth, async (user) => {

    currentUser = user;

    updateAuthUI();

    if (user) {

        await createMissingProfile();

        await loadProfile();

        await loadPosts();

        await loadProblems();

        await loadLeaderboard();

        await loadChallenges();
    }
});


/* =========================================================
   7. UPDATE LOGIN UI
   ========================================================= */

function updateAuthUI() {

    document
        .querySelectorAll(".logged-in-only")
        .forEach(element => {

            element.style.display =
                currentUser ? "" : "none";
        });


    document
        .querySelectorAll(".logged-out-only")
        .forEach(element => {

            element.style.display =
                currentUser ? "none" : "";
        });


    const userName = $("userName");

    if (userName && currentUser) {

        userName.textContent =
            currentUser.displayName ||
            currentUser.email.split("@")[0];
    }
}


/* =========================================================
   8. SIGN UP
   ========================================================= */

window.signup = async function () {

    const username =
        getValue("signupUsername");

    const email =
        getValue("signupEmail");

    const password =
        getValue("signupPassword");


    if (!username || !email || !password) {

        message("Please fill in all fields.");

        return;
    }


    if (password.length < 6) {

        message(
            "Password must be at least 6 characters."
        );

        return;
    }


    try {

        const result =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user = result.user;


        await updateProfile(user, {

            displayName: username

        });


        await setDoc(
            doc(db, "profiles", user.uid),
            {

                username: username,

                email: email,

                country: "",

                bio: "",

                points: 0,

                joinedMissionIMO: true,

                createdAt: serverTimestamp()
            }
        );


        await setDoc(
            doc(db, "userPoints", user.uid),
            {

                userId: user.uid,

                username: username,

                points: 0,

                createdAt: serverTimestamp()
            }
        );


        message(
            "Welcome to Mission IMO, " +
            username +
            "! 🚀"
        );


        const form = $("signupForm");

        if (form) form.reset();


    } catch (error) {

        console.error(error);

        message(firebaseError(error));
    }
};


/* =========================================================
   9. LOGIN
   ========================================================= */

window.login = async function () {

    const email =
        getValue("loginEmail");

    const password =
        getValue("loginPassword");


    if (!email || !password) {

        message(
            "Please enter your email and password."
        );

        return;
    }


    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );


        message("Welcome back! 🧠");


        const form = $("loginForm");

        if (form) form.reset();


    } catch (error) {

        console.error(error);

        message(firebaseError(error));
    }
};


/* =========================================================
   10. LOGOUT
   ========================================================= */

window.logout = async function () {

    try {

        await signOut(auth);

        message("You have been logged out.");

    } catch (error) {

        console.error(error);

        message("Logout failed.");
    }
};


/* =========================================================
   11. CREATE PROFILE IF MISSING
   ========================================================= */

async function createMissingProfile() {

    if (!currentUser) return;


    const profileRef =
        doc(
            db,
            "profiles",
            currentUser.uid
        );


    const profile =
        await getDoc(profileRef);


    if (!profile.exists()) {

        await setDoc(
            profileRef,
            {

                username:
                    currentUser.displayName ||
                    currentUser.email.split("@")[0],

                email:
                    currentUser.email,

                country: "",

                bio: "",

                points: 0,

                joinedMissionIMO: true,

                createdAt:
                    serverTimestamp()
            }
        );
    }
}


/* =========================================================
   12. LOAD PROFILE
   ========================================================= */

async function loadProfile() {

    if (!currentUser) return;


    try {

        const profileRef =
            doc(
                db,
                "profiles",
                currentUser.uid
            );


        const snapshot =
            await getDoc(profileRef);


        if (!snapshot.exists()) return;


        const profile =
            snapshot.data();


        const username =
            $("profileUsername");

        const country =
            $("profileCountry");

        const bio =
            $("profileBio");


        if (username)
            username.value =
                profile.username || "";


        if (country)
            country.value =
                profile.country || "";


        if (bio)
            bio.value =
                profile.bio || "";


    } catch (error) {

        console.error(
            "Profile error:",
            error
        );
    }
}


/* =========================================================
   13. SAVE PROFILE
   ========================================================= */

window.saveProfile = async function () {

    if (!currentUser) {

        message(
            "Please log in first."
        );

        return;
    }


    const username =
        getValue("profileUsername");

    const country =
        getValue("profileCountry");

    const bio =
        getValue("profileBio");


    if (!username) {

        message(
            "Username cannot be empty."
        );

        return;
    }


    try {

        await setDoc(
            doc(
                db,
                "profiles",
                currentUser.uid
            ),
            {

                username,

                country,

                bio,

                email:
                    currentUser.email,

                updatedAt:
                    serverTimestamp()

            },
            {
                merge: true
            }
        );


        await updateProfile(
            currentUser,
            {
                displayName: username
            }
        );


        updateAuthUI();


        message(
            "Profile updated! ✅"
        );


    } catch (error) {

        console.error(error);

        message(
            "Could not update your profile."
        );
    }
};


/* =========================================================
   14. CREATE DISCUSSION POST
   ========================================================= */

window.createPost = async function () {

    if (!currentUser) {

        message(
            "Please log in before posting."
        );

        return;
    }


    const title =
        getValue("postTitle");

    const content =
        getValue("postContent");


    if (!title || !content) {

        message(
            "Please enter a title and message."
        );

        return;
    }


    try {

        await addDoc(
            collection(db, "posts"),
            {

                title,

                content,

                authorId:
                    currentUser.uid,

                authorName:
                    currentUser.displayName ||
                    currentUser.email.split("@")[0],

                createdAt:
                    serverTimestamp()
            }
        );


        message(
            "Discussion posted! 🎉"
        );


        const form =
            $("postForm");

        if (form) form.reset();


        await loadPosts();


    } catch (error) {

        console.error(error);

        message(
            "Could not create the discussion."
        );
    }
};


/* =========================================================
   15. LOAD DISCUSSIONS
   ========================================================= */

async function loadPosts() {

    const container =
        $("postsContainer");


    if (!container) return;


    try {

        const postsQuery =
            query(
                collection(db, "posts"),
                orderBy("createdAt", "desc"),
                limit(50)
            );


        const snapshot =
            await getDocs(postsQuery);


        container.innerHTML = "";


        if (snapshot.empty) {

            container.innerHTML =
                "<p>No discussions yet.</p>";

            return;
        }


        snapshot.forEach(postDoc => {

            const post =
                postDoc.data();


            const card =
                document.createElement("article");


            card.className =
                "post-card";


            card.innerHTML = `

                <h3>
                    ${escapeHTML(post.title)}
                </h3>

                <p>
                    ${escapeHTML(post.content)}
                </p>

                <small>
                    By
                    ${escapeHTML(
                        post.authorName || "Student"
                    )}
                </small>

            `;


            container.appendChild(card);
        });


    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>Unable to load discussions.</p>";
    }
}


/* =========================================================
   16. SUBMIT PROBLEM
   ========================================================= */

window.submitProblem = async function () {

    if (!currentUser) {

        message(
            "Please log in before submitting a problem."
        );

        return;
    }


    const title =
        getValue("problemTitle");

    const statement =
        getValue("problemStatement");

    const difficulty =
        getValue("problemDifficulty");


    if (!title || !statement) {

        message(
            "Please enter the problem title and statement."
        );

        return;
    }


    try {

        await addDoc(
            collection(db, "problems"),
            {

                title,

                statement,

                difficulty:
                    difficulty || "Unspecified",

                authorId:
                    currentUser.uid,

                authorName:
                    currentUser.displayName ||
                    currentUser.email.split("@")[0],

                createdAt:
                    serverTimestamp()
            }
        );


        message(
            "Problem submitted! 🧠"
        );


        const form =
            $("problemForm");

        if (form) form.reset();


        await loadProblems();


    } catch (error) {

        console.error(error);

        message(
            "Could not submit the problem."
        );
    }
};


/* =========================================================
   17. LOAD COMMUNITY PROBLEMS
   ========================================================= */

async function loadProblems() {

    const container =
        $("problemsContainer");


    if (!container) return;


    try {

        const problemsQuery =
            query(
                collection(db, "problems"),
                orderBy("createdAt", "desc"),
                limit(50)
            );


        const snapshot =
            await getDocs(problemsQuery);


        container.innerHTML = "";


        if (snapshot.empty) {

            container.innerHTML =
                "<p>No community problems yet.</p>";

            return;
        }


        snapshot.forEach(problemDoc => {

            const problem =
                problemDoc.data();


            const card =
                document.createElement("article");


            card.className =
                "problem-card";


            card.innerHTML = `

                <h3>
                    ${escapeHTML(problem.title)}
                </h3>

                <p>
                    ${escapeHTML(problem.statement)}
                </p>

                <strong>
                    Difficulty:
                    ${escapeHTML(
                        problem.difficulty ||
                        "Unspecified"
                    )}
                </strong>

                <br>

                <small>
                    Submitted by
                    ${escapeHTML(
                        problem.authorName ||
                        "Student"
                    )}
                </small>

            `;


            container.appendChild(card);
        });


    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>Unable to load problems.</p>";
    }
}


/* =========================================================
   18. LOAD LEADERBOARD
   ========================================================= */

async function loadLeaderboard() {

    const container =
        $("leaderboardContainer");


    if (!container) return;


    try {

        const leaderboardQuery =
            query(
                collection(db, "userPoints"),
                orderBy("points", "desc"),
                limit(50)
            );


        const snapshot =
            await getDocs(
                leaderboardQuery
            );


        container.innerHTML = "";


        if (snapshot.empty) {

            container.innerHTML =
                "<p>No leaderboard data yet.</p>";

            return;
        }


        let rank = 1;


        snapshot.forEach(userDoc => {

            const user =
                userDoc.data();


            const row =
                document.createElement("div");


            row.className =
                "leaderboard-row";


            row.innerHTML = `

                <span>
                    #${rank}
                </span>

                <strong>
                    ${escapeHTML(
                        user.username ||
                        "Student"
                    )}
                </strong>

                <span>
                    ${Number(
                        user.points || 0
                    )}
                    points
                </span>

            `;


            container.appendChild(row);


            rank++;
        });


    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>Unable to load leaderboard.</p>";
    }
}


/* =========================================================
   19. LOAD CHALLENGES
   ========================================================= */

async function loadChallenges() {

    const container =
        $("challengesContainer");


    if (!container) return;


    try {

        const challengeQuery =
            query(
                collection(db, "challenges"),
                limit(20)
            );


        const snapshot =
            await getDocs(
                challengeQuery
            );


        container.innerHTML = "";


        if (snapshot.empty) {

            container.innerHTML =
                "<p>No challenges available yet.</p>";

            return;
        }


        snapshot.forEach(challengeDoc => {

            const challenge =
                challengeDoc.data();


            const card =
                document.createElement("article");


            card.className =
                "challenge-card";


            card.innerHTML = `

                <h3>
                    ${escapeHTML(
                        challenge.title
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        challenge.description
                    )}
                </p>

                <strong>
                    ${Number(
                        challenge.poin
