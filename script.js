/* =========================================================
   MISSION IMO — COMPLETE JAVASCRIPT
   ========================================================= */

/* =========================
   FIREBASE CONFIG
========================= */

const firebaseConfig = {
    apiKey: "AIzaSyCtMvHetBaYO2QJbuIMjFka4S6H-6VIxc8",
    authDomain: "mission-imo.firebaseapp.com",
    projectId: "mission-imo",
    storageBucket: "mission-imo.firebasestorage.app",
    messagingSenderId: "926204356108",
    appId: "1:926204356108:web:12f1fa10de9e5c8e397029"
};


/* =========================
   FIREBASE IMPORTS
========================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

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


/* =========================
   START FIREBASE
========================= */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;


/* =========================
   BASIC HELPERS
========================= */

function $(id) {
    return document.getElementById(id);
}

function value(id) {
    const element = $(id);
    return element ? element.value.trim() : "";
}

function notify(text) {
    alert(text);
}

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text ?? "";
    return div.innerHTML;
}


/* =========================
   FIREBASE ERROR
========================= */

function firebaseError(error) {

    console.error("Firebase error:", error);

    const code = error?.code || "";

    if (code === "auth/email-already-in-use") {
        return "This email is already registered.";
    }

    if (code === "auth/invalid-email") {
        return "Please enter a valid email.";
    }

    if (code === "auth/weak-password") {
        return "Password must contain at least 6 characters.";
    }

    if (code === "auth/invalid-credential") {
        return "Incorrect email or password.";
    }

    if (code === "auth/user-not-found") {
        return "No account was found with this email.";
    }

    if (code === "auth/wrong-password") {
        return "Incorrect password.";
    }

    if (code === "auth/operation-not-allowed") {
        return "Email/password authentication is not enabled in Firebase.";
    }

    if (code === "permission-denied") {
        return "Firebase permission denied. Check your Firestore rules.";
    }

    if (code === "failed-precondition") {
        return "Firestore needs to be configured correctly.";
    }

    if (code === "auth/network-request-failed") {
        return "Internet connection problem.";
    }

    return error?.message || "Something went wrong.";
}


/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(auth, async (user) => {

    currentUser = user;

    updateAuthUI();

    if (!user) {
        return;
    }

    try {

        await createMissingProfile();

        await loadProfile();

        await loadPosts();

        await loadProblems();

        await loadLeaderboard();

        await loadChallenges();

    } catch (error) {

        console.error(
            "Startup error:",
            error
        );

    }

});


/* =========================================================
   AUTH UI
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

    if (userName) {

        userName.textContent =
            currentUser
                ? (
                    currentUser.displayName ||
                    currentUser.email.split("@")[0]
                )
                : "";

    }

}


/* =========================================================
   SIGN UP
========================================================= */

window.signup = async function () {

    const username =
        value("signupUsername");

    const email =
        value("signupEmail");

    const password =
        value("signupPassword");


    if (!username) {

        notify("Please enter a username.");

        return;
    }


    if (!email) {

        notify("Please enter your email.");

        return;
    }


    if (!password) {

        notify("Please enter a password.");

        return;
    }


    if (password.length < 6) {

        notify(
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


        await updateProfile(
            user,
            {
                displayName: username
            }
        );


        await setDoc(
            doc(
                db,
                "profiles",
                user.uid
            ),
            {
                username: username,
                country: "",
                bio: "",
                points: 0,
                joinedMissionIMO: true,
                createdAt: serverTimestamp()
            }
        );


        await setDoc(
            doc(
                db,
                "userPoints",
                user.uid
            ),
            {
                userId: user.uid,
                username: username,
                points: 0,
                createdAt: serverTimestamp()
            }
        );


        notify(
            "Account created successfully! Welcome to Mission IMO!"
        );


        const form =
            $("signupForm");

        if (form) {
            form.reset();
        }

    } catch (error) {

        notify(firebaseError(error));

    }

};


/* =========================================================
   LOGIN
========================================================= */

window.login = async function () {

    const email =
        value("loginEmail");

    const password =
        value("loginPassword");


    if (!email) {

        notify("Please enter your email.");

        return;
    }


    if (!password) {

        notify("Please enter your password.");

        return;
    }


    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );


        notify(
            "Welcome back to Mission IMO!"
        );


        const form =
            $("loginForm");

        if (form) {
            form.reset();
        }

    } catch (error) {

        notify(firebaseError(error));

    }

};


/* =========================================================
   LOGOUT
========================================================= */

window.logout = async function () {

    try {

        await signOut(auth);

        notify(
            "You have been logged out."
        );

    } catch (error) {

        console.error(error);

        notify(
            "Logout failed."
        );

    }

};


/* =========================================================
   PROFILE
========================================================= */

async function createMissingProfile() {

    if (!currentUser) {
        return;
    }


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

                country: "",

                bio: "",

                points: 0,

                joinedMissionIMO: true,

                createdAt:
                    serverTimestamp()
            }
        );

    }


    const pointsRef =
        doc(
            db,
            "userPoints",
            currentUser.uid
        );


    const points =
        await getDoc(pointsRef);


    if (!points.exists()) {

        await setDoc(
            pointsRef,
            {
                userId:
                    currentUser.uid,

                username:
                    currentUser.displayName ||
                    currentUser.email.split("@")[0],

                points: 0,

                createdAt:
                    serverTimestamp()
            }
        );

    }

}


async function loadProfile() {

    if (!currentUser) {
        return;
    }


    try {

        const snapshot =
            await getDoc(
                doc(
                    db,
                    "profiles",
                    currentUser.uid
                )
            );


        if (!snapshot.exists()) {
            return;
        }


        const profile =
            snapshot.data();


        if ($("profileUsername")) {

            $("profileUsername").value =
                profile.username || "";

        }


        if ($("profileCountry")) {

            $("profileCountry").value =
                profile.country || "";

        }


        if ($("profileBio")) {

            $("profileBio").value =
                profile.bio || "";

        }

    } catch (error) {

        console.error(
            "Profile error:",
            error
        );

    }

}


window.saveProfile = async function () {

    if (!currentUser) {

        notify(
            "Please log in first."
        );

        return;
    }


    const username =
        value("profileUsername");

    const country =
        value("profileCountry");

    const bio =
        value("profileBio");


    if (!username) {

        notify(
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


        await setDoc(
            doc(
                db,
                "userPoints",
                currentUser.uid
            ),
            {
                username
            },
            {
                merge: true
            }
        );


        updateAuthUI();

        await loadLeaderboard();

        notify(
            "Profile updated successfully!"
        );

    } catch (error) {

        notify(firebaseError(error));

    }

};


/* =========================================================
   DISCUSSIONS
========================================================= */

window.createPost = async function () {

    if (!currentUser) {

        notify(
            "Please log in before posting."
        );

        return;
    }


    const title =
        value("postTitle");

    const content =
        value("postContent");


    if (!title || !content) {

        notify(
            "Please enter a title and message."
        );

        return;
    }


    try {

        await addDoc(
            collection(
                db,
                "posts"
            ),
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


        const form =
            $("postForm");

        if (form) {
            form.reset();
        }


        await loadPosts();

        notify(
            "Discussion posted!"
        );

    } catch (error) {

        notify(firebaseError(error));

    }

};


async function loadPosts() {

    const container =
        $("postsContainer");


    if (!container) {
        return;
    }


    try {

        const postsQuery =
            query(
                collection(
                    db,
                    "posts"
                ),
                orderBy(
                    "createdAt",
                    "desc"
                ),
                limit(50)
            );


        const snapshot =
            await getDocs(
                postsQuery
            );


        container.innerHTML = "";


        if (snapshot.empty) {

            container.innerHTML =
                "<p>No discussions yet.</p>";

            return;
        }


        snapshot.forEach(
            postDoc => {

                const post =
                    postDoc.data();


                const card =
                    document.createElement(
                        "article"
                    );


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
                        By ${escapeHTML(
                            post.authorName || "Student"
                        )}
                    </small>
                `;


                container.appendChild(card);

            }
        );

    } catch (error) {

        console.error(
            "Posts error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load discussions.</p>";

    }

}


/* =========================================================
   COMMUNITY PROBLEMS
========================================================= */

window.submitProblem = async function () {

    if (!currentUser) {

        notify(
            "Please log in before submitting a problem."
        );

        return;
    }


    const title =
        value("problemTitle");

    const statement =
        value("problemStatement");

    const difficulty =
        value("problemDifficulty");


    if (!title || !statement) {

        notify(
            "Please enter the problem title and statement."
        );

        return;
    }


    try {

        await addDoc(
            collection(
                db,
                "problems"
            ),
            {
                title,
                statement,

                difficulty:
                    difficulty ||
                    "Unspecified",

                authorId:
                    currentUser.uid,

                authorName:
                    currentUser.displayName ||
                    currentUser.email.split("@")[0],

                createdAt:
                    serverTimestamp()
            }
        );


        const form =
            $("problemForm");

        if (form) {
            form.reset();
        }


        await loadProblems();

        notify(
            "Problem submitted successfully!"
        );

    } catch (error) {

        notify(firebaseError(error));

    }

};


async function loadProblems() {

    const container =
        $("problemsContainer");


    if (!container) {
        return;
    }


    try {

        const problemsQuery =
            query(
                collection(
                    db,
                    "problems"
                ),
                orderBy(
                    "createdAt",
                    "desc"
                ),
                limit(50)
            );


        const snapshot =
            await getDocs(
                problemsQuery
            );


        container.innerHTML = "";


        if (snapshot.empty) {

            container.innerHTML =
                "<p>No community problems yet.</p>";

            return;
        }


        snapshot.forEach(
            problemDoc => {

                const problem =
                    problemDoc.data();


                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "    
