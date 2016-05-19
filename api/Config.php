<?php
/**
 * Class Config
 * @author Dauba
 */
class Config {
    public static $CONFIG;
    /**
     * init config
     *
     * @return void
     */
    public static function init($config) {
        self::$CONFIG = $config;
    }
}
