<?php
require_once 'ImageService.php';

if (!isset($_POST["fn"])) {
    return false;
}
else {
    if (!in_array($_POST["fn"], ImageService::$allowFuntcion)) {
        return false;
    }

    $request = $_POST;
}

call_user_func("ImageService::" . $request["fn"], $request["params"]);
