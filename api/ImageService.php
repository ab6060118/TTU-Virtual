<?php
/**
 * Class ImageService
 * @author Dauba
 */
class ImageService {
    public static $allowFuntcion = array("getList", 
                                         "getDownloadLink",
                                         "remove",
                                         "upload",);

    /**
     * Get virtualbox ova file
     *
     * @param array
     * @return json response
     */
    public static function getList($param = null) {
        $result = array();
        $ovaList = glob($param["path"]. '/*.ova', GLOB_BRACE);

        if (count($ovaList)) {
            foreach ($ovaList as $ova) {
                $pathinfo = pathinfo($ova);
                $pathinfo["fullPath"] = realpath($pathinfo["dirname"]) . "/" . $pathinfo["basename"];
                $pathinfo["relativePath"] = $pathinfo["dirname"] . "/" . $pathinfo["basename"];
                $result[] = $pathinfo;
            }
        }
        echo json_encode($result);
    }

    /**
     * Remove the image
     *
     * @param array
     * @return void
     */
    public static function remove($param = null) {
    echo 123;
    echo $param;
        print_r($param["name"]);
    }
}
