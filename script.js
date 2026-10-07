alert("MISSION IMO JAVASCRIPT IS WORKING");
/*====================================================
   MISSION IMO — COMPLETE FIREBASE SCRIPT
   ========================================================= */

/* =========================================================
   1. FIREBASE CONFIG
   ========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyCtMvHetBaYO2QJbuIMjFka4S6H-6VIxc8",
    authDomain: "mission-imo.firebaseapp.com",
    projectId: "mission-imo",
    storageBucket: "mission-imo.firebasestorage.app",
    messagingSenderId: "926204356108",
    appId: "1:926204356108:web:12f1fa10de9e5c8e397029"
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

    if (!element) {
        return "";
    }

    return element.value.trim();
}


function message(text) {
    alert(text);
}


function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value || "";

    return div.innerHTML;
}


/* =========================================================
   6. FIREBASE ERROR HANDLER
   ========================================================= */

function firebaseError(error) {

    console.error("Firebase error:", error);

    switch (error.code) {

        case "auth/email-already-in-use":
            return "This email is already registered.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/weak-password":
            return "Password must contain at least 6 characters.";

        case "auth/invalid-credential":
            return "Incorrect email or password.";

        case "auth/user-not-found":
            return "No account was found with this email.";

        case "auth/wrong-password":
            return "Incorrect password.";

        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";

        case "auth/network-request-failed":
            return "Internet connection problem. Please try again.";

        case "auth/operation-not-allowed":
            return "Email/password login is not enabled in Firebase.";

        case "auth/api-key-not-valid":
            return "Firebase API key is not valid.";

        case "permission-denied":
            return "Firebase permission denied. Check your Firestore rules.";

        case "failed-precondition":
            return "Firebase setup is incomplete. Check Firestore.";

        default:
            return error.message || "Something went wrong.";
    }
}


/* =========================================================
   7. AUTHENTICATION STATE
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
            "Authentication state error:",
            error
        );
    }
});


/* =========================================================
   8. UPDATE LOGIN UI
   ========================================================= */

function updateAuthUI() {

    document
        .querySelectorAll(".logged-in-only")
        .forEach(element => {

            element.style.display =
                currentUser ? "block" : "none";
        });


    document
        .querySelectorAll(".logged-out-only")
        .forEach(element => {

            element.style.display =
                currentUser ? "none" : "block";
        });


    const userName = $("userName");

    if (userName) {

        if (currentUser) {

            userName.textContent =
                currentUser.displayName ||
                currentUser.email.split("@")[0];

        } else {

            userName.textContent = "";
        }
    }
}


/* =========================================================
   9. SIGN UP
   ========================================================= */

window.signup = async function () {

    const username =
        getValue("signupUsername");

    const email =
        getValue("signupEmail");

    const password =
        getValue("signupPassword");


    if (!username) {

        message("Please enter a username.");

        return;
    }


    if (!email) {

        message("Please enter your email.");

        return;
    }


    if (!password) {

        message("Please enter a password.");

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

                createdAt:
                    serverTimestamp()
            }
        );


        await setDoc(
            doc(
                db,
                "userPoints",
                user.uid
            ),
            {

                userId:
                    user.uid,

                username:
                    username,

                points:
                    0,

                createdAt:
                    serverTimestamp()
            }
        );


        message(
            "Account created successfully! Welcome to Mission IMO, " +
            username +
            "! 🚀"
        );


        const form =
            $("signupForm");

        if (form) {
            form.reset();
        }


    } catch (error) {

        message(
            firebaseError(error)
        );
    }
};


/* =========================================================
   10. LOGIN
   ========================================================= */

window.login = async function () {

    const email =
        getValue("loginEmail");

    const password =
        getValue("loginPassword");


    if (!email) {

        message(
            "Please enter your email."
        );

        return;
    }


    if (!password) {

        message(
            "Please enter your password."
        );

        return;
    }


    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );


        message(
            "Welcome back to Mission IMO! 🧠"
        );


        const form =
            $("loginForm");

        if (form) {
            form.reset();
        }


    } catch (error) {

        message(
            firebaseError(error)
        );
    }
};


/* =========================================================
   11. LOGOUT
   ========================================================= */

window.logout = async function () {

    try {

        await signOut(auth);

        message(
            "You have been logged out."
        );

    } catch (error) {

        console.error(error);

        message(
            "Logout failed."
        );
    }
};


/* =========================================================
   12. CREATE MISSING PROFILE
   ========================================================= */

async function createMissingProfile() {

    if (!currentUser) {
        return;
    }


    try {

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


    } catch (error) {

        console.error(
            "Profile creation error:",
            error
        );
    }
}


/* =========================================================
   13. LOAD PROFILE
   ========================================================= */

async function loadProfile() {

    if (!currentUser) {
        return;
    }


    try {

        const profileRef =
            doc(
                db,
                "profiles",
                currentUser.uid
            );


        const snapshot =
            await getDoc(profileRef);


        if (!snapshot.exists()) {
            return;
        }


        const profile =
            snapshot.data();


        const username =
            $("profileUsername");

        const country =
            $("profileCountry");

        const bio =
            $("profileBio");


        if (username) {

            username.value =
                profile.username || "";
        }


        if (country) {

            country.value =
                profile.country || "";
        }


        if (bio) {

            bio.value =
                profile.bio || "";
        }


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );
    }
}


/* =========================================================
   14. SAVE PROFILE
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

                username:
                    username,

                country:
                    country,

                bio:
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
                displayName:
                    username
            }
        );


        await setDoc(
            doc(
                db,
                "userPoints",
                currentUser.uid
            ),
            {

                username:
                    username

            },
            {
                merge: true
            }
        );


        updateAuthUI();


        message(
            "Profile updated successfully! ✅"
        );


        await loadLeaderboard();


    } catch (error) {

        console.error(error);

        message(
            firebaseError(error)
        );
    }
};


/* =========================================================
   15. CREATE DISCUSSION POST
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

                title:
                    title,

                content:
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

        if (form) {
            form.reset();
        }


        await loadPosts();


    } catch (error) {

        console.error(error);

        message(
            firebaseError(error)
        );
    }
};


/* =========================================================
   16. LOAD DISCUSSIONS
   ========================================================= */

async function loadPosts() {

    const container =
        $("postsContainer");


    if (!container) {
        return;
    }


    try {

        const postsQuery =
            query(
                collection(db, "posts"),
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


        snapshot.forEach(postDoc => {

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
                    ${escapeHTML(
                        post.title
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        post.content
                    )}
                </p>

                <small>
                    By
                    ${escapeHTML(
                        post.authorName ||
                        "Student"
                    )}
                </small>

            `;


            container.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Posts loading error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load discussions right now.</p>";
    }
}


/* =========================================================
   17. SUBMIT COMMUNITY PROBLEM
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


    if (!title) {

        message(
            "Please enter a problem title."
        );

        return;
    }


    if (!statement) {

        message(
            "Please enter the problem statement."
        );

        return;
    }


    try {

        await addDoc(
            collection(db, "problems"),
            {

                title:
                    title,

                statement:
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


        message(
            "Problem submitted successfully! 🧠"
        );


        const form =
            $("problemForm");

        if (form) {
            form.reset();
        }


        await loadProblems();


    } catch (error) {

        console.error(error);

        message(
            firebaseError(error)
        );
    }
};


/* =========================================================
   18. LOAD COMMUNITY PROBLEMS
   ========================================================= */

async function loadProblems() {

    const container =
        $("problemsContainer");


    if (!container) {
        return;
    }


    try {

        const problemsQuery =
            query(
                collection(db, "problems"),
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


        snapshot.forEach(problemDoc => {

            const problem =
                problemDoc.data();


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "problem-card";


            card.innerHTML = `

                <h3>
                    ${escapeHTML(
                        problem.title
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        problem.statement
                    )}
                </p>

                <strong>
                    Difficulty:
                    ${escapeHTML(
                        problem.difficulty ||
                        "Unspecified"
       
