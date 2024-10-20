
use std::time::{SystemTime, UNIX_EPOCH};
use anyhow::Result;
use regex::Regex;
use std::fs::{self}; 
use std::process::Command;

use crate::common_helperfuncs;





pub fn runit(appversion:u32) -> Result<u32> {

    let _          = process_manifest(appversion)?;
    let _          = process_indexhtml(appversion)?;
    let _          = process_sw(appversion)?;
    let _          = process_css()?;
    let _          = process_media()?;
    let _          = process_server(appversion)?;

    Ok(appversion)
}




fn process_manifest(appversion:u32) -> Result<()> {

    let manifest_in_path           = crate::CLIENT_OUTPUT_DEV_PATH.clone() + "app.webmanifest";
    let manifest_out_path          = crate::CLIENT_OUTPUT_DIST_PATH.clone() + "app.webmanifest";
    let manifest_in_content        = fs::read_to_string(&manifest_in_path)?;

    let version_regex       = Regex::new(r#""version":\s*"(\d+)""#)?;
    let manifest_in_content = version_regex.replace(&manifest_in_content, format!(r#""version": "{}""#, appversion));

    fs::write(&manifest_out_path, manifest_in_content.as_bytes())?;

    Ok(())
}



fn process_indexhtml(appversion:u32) -> Result<()> {

    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();

    let html_in_str   = crate::CLIENT_OUTPUT_DEV_PATH.clone() + "index.html";
    let html_out_str  = crate::CLIENT_OUTPUT_DIST_PATH.clone() + "index.html";
    let html_content  = fs::read_to_string(&html_in_str)?;

    let html_str = html_content.replace("APPVERSION=0", format!("APPVERSION={}", appversion).as_str());
    let html_str = html_str.replace("APPUPDATE_TS=0", format!("APPUPDATE_TS={}", now).as_str());

    fs::write(&html_out_str, &html_str)?;

    Ok(())
}




fn process_sw(appversion:u32) -> Result<()> {

    let sw_in_str   = crate::CLIENT_OUTPUT_DEV_PATH.clone() + "sw.js";
    let sw_out_str  = crate::CLIENT_OUTPUT_DIST_PATH.clone() + "sw.js";
    let sw_content  = fs::read_to_string(&sw_in_str)?;

    let sw_str       = sw_content.replace("cacheV__0__", format!("cacheV__{}__", appversion).as_str());

    fs::write(&sw_out_str, &sw_str)?;

    Ok(())
}




fn process_css() -> Result<()> {

    let main_path_str     = crate::MAIN_PATH.clone();
    let cssindex_in_str   = crate::CLIENT_OUTPUT_DEV_PATH.clone() + "index.css";
    let cssindex_out_str  = crate::CLIENT_OUTPUT_DIST_PATH.clone() + "index.css";
    let cssmain_in_str    = crate::CLIENT_OUTPUT_DEV_PATH.clone() + "main.css";
    let cssmain_out_str   = crate::CLIENT_OUTPUT_DIST_PATH.clone() + "main.css";

    let cssindex_cmd      = Command::new("npx").args(["esbuild", &cssindex_in_str, "--bundle", "--loader:.woff2=dataurl"]).current_dir(main_path_str).output().expect("esbuild chucked an error");
    let cssindex_content  = String::from_utf8(cssindex_cmd.stdout).expect("css stdout error");
    let _                 = fs::write(&cssindex_out_str, &cssindex_content);

    fs::copy(&cssmain_in_str, &cssmain_out_str)?;

    Ok(())
}




fn process_media() -> Result<()> {

    let media_in_str             = crate::CLIENT_OUTPUT_DEV_PATH.clone() + "media/";
    let media_out_str            = crate::CLIENT_OUTPUT_DIST_PATH.clone() + "media/";
    let media_instance_in_str    = crate::INSTANCE_CLIENT_OUTPUT_DEV_PATH.clone() + "media/";
    let media_instance_out_str   = crate::INSTANCE_CLIENT_OUTPUT_DIST_PATH.clone() + "media/";

    common_helperfuncs::copy_deep(&media_in_str, &media_out_str, "**/*", "_____").unwrap();
    common_helperfuncs::copy_deep(&media_instance_in_str, &media_instance_out_str, "**/*", "_____").unwrap();

    Ok(())
}




fn process_server(appversion:u32) -> Result<()> {

    let server_in_path             = crate::SERVER_BUILD_PATH.clone() + "index.js";

    let server_content      = fs::read_to_string(&server_in_path)?;
    let server_regex        = Regex::new(r#"APPVERSION = \d+"#).unwrap();
    let server_content      = server_regex.replace_all(&server_content, format!("APPVERSION = {}", appversion).as_str()).to_string();

    fs::write(&server_in_path, &server_content)?;

    Ok(())
}





