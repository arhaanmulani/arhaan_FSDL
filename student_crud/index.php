<!DOCTYPE html>
<html>
<head>
<title>Student Registration</title>

<script>

function validate(){

var pass=document.forms["form"]["password"].value;
var cpass=document.forms["form"]["cpassword"].value;

if(pass!=cpass){
alert("Passwords do not match");
return false;
}

}

</script>

</head>

<body>

<h2>Student Registration</h2>

<form name="form" action="insert.php" method="POST" onsubmit="return validate()">

First Name:
<input type="text" name="firstname" required><br><br>

Last Name:
<input type="text" name="lastname" required><br><br>

Roll No:
<input type="number" name="rollno" required><br><br>

Password:
<input type="password" name="password" required><br><br>

Confirm Password:
<input type="password" name="cpassword" required><br><br>

Contact Number:
<input type="text" name="contact" required><br><br>

<input type="submit" value="Register">

</form>

<br>

<a href="view.php">View Students</a>

</body>
</html>