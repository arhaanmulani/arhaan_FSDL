<?php

include "db.php";

$id=$_GET['id'];

mysqli_query($conn,"DELETE FROM students WHERE rollno=$id");

header("Location:view.php");

?>