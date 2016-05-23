<?php
require_once 'HookService.php';
require_once 'Config.php';
require_once '../config.php';

if (!isset($_POST["fn"])) {
    return false;
}
else {
    if (!in_array($_POST["fn"], HookService::$allowFuntcion)) {
        return false;
    }

    Config::init($CONFIG);

    $request = $_POST;
}

call_user_func("HookService::callHook", $request["fn"], $request["params"]);
