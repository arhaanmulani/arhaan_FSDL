function validateForm(){
let username=document.getElementById("username").value.trim();
let email=document.getElementById("email").value.trim();
let phone=document.getElementById("phone").value.trim();
let password=document.getElementById("password").value.trim();
let confirmPassword=document.getElementById("confirmPassword").value.trim();
let msg=document.getElementById("message");

if(!username||!email||!phone||!password||!confirmPassword){
msg.style.color="red";
msg.innerHTML="Fields cannot be empty";
return false;
}

let phoneRegex=/^[0-9]{10}$/;
if(!phoneRegex.test(phone)){
msg.innerHTML="Phone must be 10 digits";
return false;
}

let passRegex=/^(?=.*[A-Z])(?=.*[0-9])(?=.*[&,$,#@]).{7,}$/;
if(!passRegex.test(password)){
msg.innerHTML="Weak Password";
return false;
}
if(password!==confirmPassword){
msg.innerHTML="Passwords do not match";
return false;
}

let emailRegex=/^[a-zA-Z]+@[a-zA-Z]{3}\.[a-zA-Z]{2,3}$/;
if(!emailRegex.test(email)){
msg.innerHTML="Invalid Email";
return false;
}

msg.style.color="lime";
msg.innerHTML="Registration Successful";
return false;
}

function changeImage(){
document.getElementById("img").src="https://via.placeholder.com/150/0000FF";
}

function addText(){
let parent=document.getElementById("parent");
let text=document.createTextNode("Text Node Added");
parent.appendChild(text);
}

function deleteNode(){
let parent=document.getElementById("parent");
if(parent.firstChild) parent.removeChild(parent.firstChild);
}

let inputs=document.getElementsByTagName("input");
for(let i=0;i<inputs.length;i++) inputs[i].style.border="1px solid #ccc";

$(document).ready(function(){
$("#jqText").click(function(){ $(this).text("Text Changed"); });

$("#jqBg").click(function(){
$("body").css("background-image","url('https://via.placeholder.com/900')");
});
$("#jqForm").click(function(){
alert("Username: "+$("#username").val());
});

$("#jqAttr").click(function(){
$("#img").attr("title","Attribute Added");
});
});