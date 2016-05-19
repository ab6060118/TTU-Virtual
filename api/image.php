<?php
require_once 'ImageService.php';
require_once 'Config.php';
require_once '../config.php';

if (!isset($_POST["fn"])) {
    return false;
}
else {
    if (!in_array($_POST["fn"], ImageService::$allowFuntcion)) {
        return false;
    }

    Config::init($CONFIG);

    $request = $_POST;
}

call_user_func("ImageService::" . $request["fn"], $request["params"]);
