/* =====================================================
   MISSION IMO V1
   SUPABASE CONNECTION
   ===================================================== */


/* =====================================================
   SUPABASE CONFIG
   =====================================================

   Replace ONLY these two values.

   Get them from:
   Supabase → Project Settings → API

   Use the project URL and PUBLIC/PUBLISHABLE key.

   NEVER use the service-role/secret key here.
*/

const SUPABASE_URL =
"https://pizpxdjeccykzjqrccyq.supabase.co";

const SUPABASE_KEY =
"sb_publishable_OCkcysCFZT8ostIe78wFZQ_McPcgAH_";


const db =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);


/* =====================================================
   MENU
   ===================================================== */

function toggleMenu(){

const nav =
document.getElementById("nav");

nav.classList.toggle("open");

}


/* =====================================================
   PROBLEM OF THE DAY
   ===================================================== */

function showAnswer(){

document.getElementById("answer")
.textContent =
"Answer: 8 🎉";

}


/* =====================================================
   AUTH MESSAGE
   ===================================================== */

function authMessage(message){

document.getElementById("authMessage")
.textContent = message;

}


/* =====================================================
   SIGN UP
   ===================================================== */

async function signUp(){

const email =
document.getElementById("email").value.trim();

const password =
document.getElementById("password").value;

const username =
document.getElementById("username").value.trim();

const country =
document.getElementById("country").value.trim();

const interests =
document.getElementById("interests").value.trim();

const bio =
document.getElementById("bio").value.trim();


if(!email || !password || !username){

authMessage(
"Please enter email, password and username."
);

return;

}


if(password.length < 6){

authMessage(
"Password must be at least 6 characters."
);

return;

}


authMessage("Creating your account...");


const result =
await db.auth.signUp({

email:email,
password:password

});


if(result.error){

authMessage(
result.error.message
);

return;

}


const user =
result.data.user;


if(!user){

authMessage(
"Account created. Please check your email."
);

return;

}


/*
The database trigger creates the profile automatically.
We then update the profile with the information entered.
*/

const profileUpdate =
await db
.from("profiles")
.update({

username:username,
country:country,
interests:interests,
bio:bio

})
.eq("id",user.id);


if(profileUpdate.error){

authMessage(
"Account created, but profile setup needs another try."
);

return;

}


authMessage(
"Account created successfully! 🚀"
);

await refreshUser();

}


/* =====================================================
   LOGIN
   ===================================================== */

async function signIn(){

const email =
document.getElementById("email").value.trim();

const password =
document.getElementById("password").value;


if(!email || !password){

authMessage(
"Enter your email and password."
);

return;

}


authMessage("Logging in...");


const result =
await db.auth.signInWithPassword({

email:email,
password:password

});


if(result.error){

authMessage(
result.error.message
);

return;

}


authMessage(
"Welcome back! 🚀"
);

await refreshUser();

}


/* =====================================================
   LOGOUT
   ===================================================== */

async function signOut(){

await db.auth.signOut();

document
.getElementById("authBox")
.classList.remove("hidden");

document
.getElementById("loggedInBox")
.classList.add("hidden");

document
.getElementById("newPostArea")
.classList.add("hidden");

document
.getElementById("postList")
.innerHTML =
'<div class="empty">Login to see community discussions.</div>';

}


/* =====================================================
   CURRENT USER
   ===================================================== */

async function getUser(){

const result =
await db.auth.getUser();

return result.data.user;

}


/* =====================================================
   REFRESH USER UI
   ===================================================== */

async function refreshUser(){

const user =
await getUser();


if(!user){

return;

}


document
.getElementById("authBox")
.classList.add("hidden");

document
.getElementById("loggedInBox")
.classList.remove("hidden");

document
.getElementById("newPostArea")
.classList.remove("hidden");


document
.getElementById("userInfo")
.textContent =
"Logged in as " + user.email;


await loadMembers();
await loadPosts();
await loadLeaderboard();
await loadChallenges();

}


/* =====================================================
   LOAD MEMBERS
   ===================================================== */

async function loadMembers(){

const container =
document.getElementById("memberList");


const result =
await db
.from("profiles")
.select(
"username,country,interests,bio"
)
.order(
"created_at",
{ascending:false}
);


if(result.error){

container.innerHTML =
'<div class="empty">Unable to load community.</div>';

return;

}


const members =
result.data;


if(!members.length){

container.innerHTML =
'<div class="empty">No members yet.</div>';

return;

}


container.innerHTML = "";


members.forEach(member => {

const card =
document.createElement("div");

card.className = "member";


const username =
escapeHTML(
member.username
);

const country =
escapeHTML(
member.country || ""
);

const interests =
escapeHTML(
member.interests || "Mathematics"
);


card.innerHTML =

'<div class="member-avatar">🧑‍🎓</div>' +

'<h3>' +
username +
'</h3>' +

'<p>🌍 ' +
country +
'</p>' +

'<p>🧠 ' +
interests +
'</p>';


container.appendChild(card);

});

}


/* =====================================================
   CREATE POST
   ===================================================== */

async function createPost(){

const user =
await getUser();


if(!user){

alert("Please login first.");

return;

}


const title =
document
.getElementById("postTitle")
.value
.trim();

const content =
document
.getElementById("postContent")
.value
.trim();


if(!title || !content){

alert("Write a title and message.");

return;

}


const result =
await db
.from("posts")
.insert({

user_id:user.id,
title:title,
content:content

});


if(result.error){

alert(result.error.message);

return;

}


document
.getElementById("postTitle")
.value = "";

document
.getElementById("postContent")
.value = "";


await loadPosts();

}


/* =====================================================
   LOAD POSTS
   ===================================================== */

async function loadPosts(){

const container =
document.getElementById("postList");


const result =
await db
.from("posts")
.select(
"id,title,content,user_id,created_at"
)
.order(
"created_at",
{ascending:false}
)
.limit(50);


if(result.error){

container.innerHTML =
'<div class="empty">Unable to load discussions.</div>';

return;

}


const posts =
result.data;


if(!posts.length){

container.innerHTML =
'<div class="empty">No discussions yet. Start the first one!</div>';

return;

}


container.innerHTML = "";


posts.forEach(post => {

const card =
document.createElement("article");

card.className = "post";


card.innerHTML =

'<h3>' +
escapeHTML(post.title) +
'</h3>' +

'<p>' +
escapeHTML(post.content) +
'</p>' +

'<button class="button secondary" ' +
'onclick="reportPost(' +
post.id +
')">' +
"🚩 Report" +
"</button>";


container.appendChild(card);

});

}


/* =====================================================
   REPORT POST
   ===================================================== */

async function reportPost(postId){

const user =
await getUser();


if(!user){

alert("Please login first.");

return;

}


const reason =
prompt(
"Why are you reporting this post?"
);


if(!reason){

return;

}


const result =
await db
.from("reports")
.insert({

reporter_id:user.id,
post_id:postId,
reason:reason

});


if(result.error){

alert(result.error.message);

return;

}


alert(
"Report submitted. Thank you."
);

}


/* =====================================================
   SUBMIT PROBLEM
   ===================================================== */

async function submitProblem(){

const user =
await getUser();


if(!user){

document
.getElementById("problemMessage")
.textContent =
"Please login before submitting a problem.";

return;

}


const problem =
document
.getElementById("problemInput")
.value
.trim();


const difficulty =
document
.getElementById("problemDifficulty")
.value;


if(!problem){

document
.getElementById("problemMessage")
.textContent =
"Write a problem first.";

return;

}


const result =
await db
.from("problems")
.insert({

user_id:user.id,
problem:problem,
difficulty:difficulty

});


if(result.error){

document
.getElementById("problemMessage")
.textContent =
result.error.message;

return;

}


document
.getElementById("problemInput")
.value = "";


document
.getElementById("problemMessage")
.textContent =
"Problem submitted successfully! 🧩";

}


/* =====================================================
   LOAD CHALLENGES
   ===================================================== */

async function loadChallenges(){

const container =
document.getElementById("challengeList");


const result =
await db
.from("challenges")
.select("*")
.order("id");


if(result.error){

container.innerHTML =
'<div class="empty">Unable to load challenges.</div>';

return;

}


container.innerHTML = "";


result.data.forEach(challenge => {

const card =
document.createElement("div");

card.className = "challenge";


card.innerHTML =

'<span>🏆</span>' +

'<h3>' +
escapeHTML(challenge.title) +
'</h3>' +

'<p>' +
escapeHTML(
challenge.description || ""
) +
'</p>' +

'<p>⭐ ' +
challenge.points +
" points</p>";


container.appendChild(card);

});

}


/* =====================================================
   LEADERBOARD
   ===================================================== */

async function loadLeaderboard(){

const table =
document.getElementById("leaderboard");


const result =
await db
.from("user_points")
.select(
"points,user_id,profiles(username)"
)
.order(
"points",
{ascending:false}
)
.limit(20);


if(result.error){

table.innerHTML =
'<tr><td>—</td><td>Unable to load</td><td>0</td></tr>';

return;

}


if(!result.data.length){

table.innerHTML =
'<tr><td>—</td><td>No participants</td><td>0</td></tr>';

return;

}


table.innerHTML = "";


result.data.forEach(
(item,index) => {

const row =
document.createElement("tr");


const username =
item.profiles
? item.profiles.username
: "Student";


row.innerHTML =

"<td>" +
(index + 1) +
"</td>" +

"<td>" +
escapeHTML(username) +
"</td>" +

"<td>" +
item.points +
"</td>";


table.appendChild(row);

});

}


/* =====================================================
   SECURITY
   ===================================================== */

function escapeHTML(text){

const div =
document.createElement("div");

div.textContent =
text || "";

return div.innerHTML;

}


/* =====================================================
   STARTUP
   ===================================================== */

async function startup(){

const result =
await db.auth.getSession();

if(result.data.session){

await refreshUser();

}

}


startup();
