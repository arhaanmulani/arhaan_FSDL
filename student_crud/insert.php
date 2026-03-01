<?php

include "db.php";

$fname=$_POST['firstname'];
$lname=$_POST['lastname'];
$roll=$_POST['rollno'];
$pass=$_POST['password'];
$contact=$_POST['contact'];

$sql="INSERT INTO students VALUES('$roll','$fname','$lname','$pass','$contact')";

if(mysqli_query($conn,$sql)){
echo "Student Inserted Successfully";
}

?>