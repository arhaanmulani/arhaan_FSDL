<?php

include "db.php";

$id=$_GET['id'];

if(isset($_POST['update'])){

$contact=$_POST['contact'];

mysqli_query($conn,"UPDATE students SET contact='$contact' WHERE rollno=$id");

header("Location:view.php");

}

?>

<form method="POST">

New Contact Number:

<input type="text" name="contact">

<input type="submit" name="update" value="Update">

</form>