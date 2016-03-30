<?php
/**
 * Class ImageService
 * @author Dauba
 */
class ImageService {
    public static $allowFuntcion = array("getList", 
                                         "download",
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
        $ovaList = glob(Config::$CONFIG["ova_folder"] . '*.ova', GLOB_BRACE);

        if (count($ovaList)) {
            foreach ($ovaList as $ova) {
                $pathinfo = pathinfo($ova);
                $pathinfo["fullPath"] = realpath($pathinfo["dirname"]) . "/" . $pathinfo["basename"];
                $pathinfo["relativePath"] = $pathinfo["dirname"] . "/" . $pathinfo["basename"];
                $pathinfo["status"]="";
                $result[$pathinfo["basename"]] = $pathinfo;
            }
        }
        echo json_encode($result);
    }

    /**
     * Download image
     *
     * @return void
     */
    public static function download($param) {
        $file = Config::$CONFIG["ova_folder"] . $param;

        if (file_exists($file)) {
            header('Content-Description: File Transfer');
            header('Content-Type: application/octet-stream');
            header('Content-Disposition: attachment; filename="'.basename($file).'"');
            header('Expires: 0');
            header('Cache-Control: must-revalidate');
            header('Pragma: public');
            header('Content-Length: ' . filesize($file));
            readfile($file);
        }
    }

    /**
     * Remove the image
     *
     * @param array
     * @return json response
     */
    public static function remove($param = null) {
        $response = array();

        if(unlink(Config::$CONFIG["ova_folder"] . basename($param["name"])))
            $response["success"] = true;
        else
            $response["success"] = false;

        echo json_encode($response);
    }

    /**
     * Upload image
     *
     * @return json resopnse
     */
    public static function upload($param = null) {
        $response = array();
        if ( 0 < $_FILES['file']['error'] ) {
            $response["success"] = false;
        }
        else {
            move_uploaded_file($_FILES['file']['tmp_name'], Config::$CONFIG["ova_folder"] . $_FILES['file']['name']);
            $response["success"] = true;
        }

        echo json_encode($response);
    }
}
