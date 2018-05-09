<?php
$dir = "C:\Users\Daniel\Dropbox\Apps\updog\wisedove";
chdir($dir); 
$files = array_filter(glob("*",GLOB_ONLYDIR));

$dir = json_encode(glob("[0-9]. *",GLOB_ONLYDIR));


$name = substr(print_r($dir[0],true),3); 

preg_match('/^\d\. (.*)$/', $dir[0], $matches, PREG_OFFSET_CAPTURE);
print_r($matches);


echo json_encode(glob("$dir[0]/*",GLOB_ONLYDIR));



?>