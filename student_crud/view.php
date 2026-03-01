<?php
include "db.php";

$result=mysqli_query($conn,"SELECT * FROM students");
?>

<h2>Student Records</h2>

<table border="1">

<tr>
<th>Roll No</th>
<th>First Name</th>
<th>Last Name</th>
<th>Contact</th>
<th>Delete</th>
<th>Update</th>
</tr>

<?php

while($row=mysqli_fetch_assoc($result)){

echo "<tr>";

echo "<td>".$row['rollno']."</td>";
echo "<td>".$row['firstname']."</td>";
echo "<td>".$row['lastname']."</td>";
echo "<td>".$row['contact']."</td>";

echo "<td><a href='delete.php?id=".$row['rollno']."'>Delete</a></td>";

echo "<td><a href='update.php?id=".$row['rollno']."'>Update</a></td>";

echo "</tr>";

}

?>

</table>