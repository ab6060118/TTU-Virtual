<?php
/**
 * Class HookService
 * @author Dauba
 */
class HookService
{
    public static $allowFuntcion = array("createVM",
                                         "deleteVM",
                                         "createImage",
                                         "deleteImage");

    public static $createVM = array();

    private static $userInfoDir = "../.userinfo";

    /**
     * Init user info
     *
     * @return void
     */
    private static function init()
    {
        if (!file_exists(self::$userInfoDir)) {
            mkdir(self::$userInfoDir);
        }
    }
    

    public static function callHook($fn, $param) {
        self::init();
    }

    /**
     * Write user info after create VM
     *
     * @return void
     */
    public static function writeVMInfoToUserInfo($param)
    {
    }
    
}
