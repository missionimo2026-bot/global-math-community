*{
margin:0;
padding:0;
box-sizing:border-box;
}

html{
scroll-behavior:smooth;
}

body{
font-family:Arial,Helvetica,sans-serif;
background:#070b16;
color:white;
line-height:1.6;
}

a{
text-decoration:none;
color:inherit;
}

button,input,textarea,select{
font:inherit;
}

.navbar{
position:sticky;
top:0;
z-index:1000;
display:flex;
justify-content:space-between;
align-items:center;
padding:18px 7%;
background:rgba(7,11,22,.97);
border-bottom:1px solid #20283f;
}

.logo{
font-size:22px;
font-weight:bold;
}

.logo span{
color:#8995ff;
}

nav{
display:flex;
gap:20px;
}

nav a{
color:#aeb7d1;
font-size:14px;
}

.menu-btn{
display:none;
background:none;
border:none;
color:white;
font-size:25px;
}

.hero{
min-height:85vh;
display:flex;
align-items:center;
padding:80px 8%;
background:
radial-gradient(circle at 75% 30%,#242f70,transparent 35%),
#070b16;
}

.hero-content{
max-width:800px;
}

.tag,
.section-label{
color:#8995ff;
font-size:12px;
font-weight:bold;
letter-spacing:2px;
}

.hero h1{
margin-top:20px;
font-size:clamp(60px,10vw,105px);
line-height:.93;
}

.hero h1 span{
color:#8995ff;
}

.hero-text{
max-width:650px;
margin-top:30px;
color:#aeb7d1;
font-size:18px;
}

.buttons{
display:flex;
gap:15px;
margin-top:35px;
}

.button{
display:inline-block;
padding:13px 22px;
border:none;
border-radius:9px;
cursor:pointer;
font-weight:bold;
}

.primary{
background:white;
color:#070b16;
}

.secondary{
border:1px solid #414b69;
color:white;
background:transparent;
}

.stats{
display:grid;
grid-template-columns:repeat(4,1fr);
border-top:1px solid #20283f;
border-bottom:1px solid #20283f;
}

.stats div{
padding:30px;
text-align:center;
border-right:1px solid #20283f;
}

.stats strong{
font-size:25px;
}

.stats p{
color:#9da7c3;
}

.section{
padding:100px 8%;
}

.section h2{
margin-top:15px;
font-size:clamp(42px,7vw,72px);
line-height:1.05;
}

.section-description{
max-width:650px;
margin-top:25px;
color:#aeb7d1;
font-size:17px;
}

.cards,
.challenge-grid,
.member-list{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:20px;
margin-top:50px;
}

.card,
.challenge,
.member,
.post{
padding:28px;
background:#10172c;
border:1px solid #242d49;
border-radius:15px;
}

.card h3,
.challenge h3{
margin-top:18px;
font-size:24px;
}

.card p,
.challenge p,
.member p,
.post p{
margin-top:10px;
color:#9da7c3;
}

.icon{
font-size:35px;
}

.problem-section{
padding:100px 8%;
background:#0d1325;
}

.problem-box{
max-width:800px;
margin:auto;
padding:50px;
text-align:center;
background:#111a34;
border:1px solid #293456;
border-radius:20px;
}

.problem-box h2{
margin-top:15px;
font-size:50px;
}

.difficulty{
display:inline-block;
margin-top:20px;
padding:5px 12px;
border-radius:20px;
background:#162d23;
color:#6ee7a3;
font-size:12px;
}

.problem{
margin-top:30px;
padding:25px;
background:#080d1c;
border-radius:12px;
font-size:18px;
}

.solve-button{
margin-top:25px;
padding:12px 22px;
border:none;
border-radius:8px;
background:white;
cursor:pointer;
font-weight:bold;
}

.answer{
margin-top:20px;
color:#7ee7a5;
font-weight:bold;
}

.community{
background:#0a0f1e;
}

.member-list{
margin-top:40px;
}

.member-avatar{
font-size:30px;
}

.empty{
padding:30px;
color:#9da7c3;
border:1px dashed #414b69;
border-radius:12px;
}

.post-list{
display:grid;
gap:18px;
margin-top:40px;
}

.new-post{
max-width:700px;
margin-top:35px;
}

input,
textarea,
select{
display:block;
width:100%;
margin:12px 0;
padding:14px;
border:1px solid #303b5c;
border-radius:8px;
background:#10172c;
color:white;
outline:none;
}

textarea{
min-height:130px;
resize:vertical;
}

select{
margin-bottom:20px;
}

.auth-section{
background:#0a0f1e;
}

.auth-section input,
.auth-section textarea{
max-width:650px;
}

.auth-buttons{
display:flex;
gap:12px;
margin-top:20px;
}

.form-message{
margin-top:20px;
color:#7ee7a5;
font-weight:bold;
}

.table-wrapper{
overflow-x:auto;
margin-top:45px;
}

table{
width:100%;
border-collapse:collapse;
background:#10172c;
}

th,
td{
padding:18px;
border-bottom:1px solid #242d49;
text-align:left;
}

th{
color:#8995ff;
}

.global{
padding:130px 8%;
text-align:center;
background:
radial-gradient(circle,#202b60,transparent 45%),
#070b16;
}

.global h2{
margin-top:15px;
font-size:clamp(48px,8vw,85px);
line-height:1;
}

.global p{
max-width:650px;
margin:25px auto;
color:#aeb7d1;
}

.world{
margin:40px 0;
font-size:70px;
}

.rules-box{
max-width:700px;
margin-top:40px;
padding:30px;
background:#10172c;
border-radius:12px;
}

.rules-box p{
margin:12px 0;
color:#c4cbe0;
}

.about{
max-width:950px;
margin:auto;
}

.about>p:not(.section-label){
margin-top:20px;
color:#aeb7d1;
font-size:18px;
}

.mission-box{
margin-top:40px;
padding:30px;
background:#10172c;
border-left:4px solid #8995ff;
border-radius:10px;
}

.mission-box p{
margin-top:8px;
color:#aeb7d1;
}

footer{
padding:50px 8%;
border-top:1px solid #20283f;
color:#8992ad;
}

.footer-logo{
color:white;
font-size:20px;
font-weight:bold;
}

footer p{
margin-top:10px;
}

.hidden{
display:none!important;
}

@media(max-width:750px){

.navbar{
flex-wrap:wrap;
}

nav{
display:none;
width:100%;
flex-direction:column;
padding-top:15px;
text-align:center;
}

nav.open{
display:flex;
}

.menu-btn{
display:block;
}

.hero{
padding:70px 6%;
}

.hero h1{
font-size:60px;
}

.buttons{
flex-direction:column;
}

.button{
text-align:center;
}

.stats{
grid-template-columns:repeat(2,1fr);
}

.stats div{
border-bottom:1px solid #20283f;
}

.cards,
.challenge-grid,
.member-list{
grid-template-columns:1fr;
}

.section{
padding:75px 6%;
}

.problem-section{
padding:70px 6%;
}

.problem-box{
padding:30px 20px;
}

.problem-box h2{
font-size:40px;
}

.world{
font-size:50px;
}

.auth-buttons{
flex-direction:column;
}

}
