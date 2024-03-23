
use std::time::{SystemTime, UNIX_EPOCH};
use rayon::prelude::*;
use std::fs;
use regex::Regex;
use std::io::Result;
use std::process::Command;

mod yads;
mod yims;
mod thirdpartydist;




pub fn dist(instance:&str) -> Result<()> {

    let sd = format!("{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DIST_PATH);

    let x = fs::remove_dir_all(&sd);

    if x.is_err() {   println!("output dist folder is already removed.");   }

    fs::create_dir_all(&sd)?;

    let appversion = increment_and_get_appversion_and_write_manifest_to_dist_and_original_and_serverindex(instance)?;

    distcore(appversion)?;

    [0, 1, 2, 3].into_par_iter().for_each(|p| {
        if p == 0 {
            yads::yadit(instance).unwrap();
        } else if p == 1 {
            yims::yimit(instance).unwrap();
        } else if p == 2 {
            media(instance).unwrap();
        } else if p == 3 {
            thirdpartydist::distthirdparty(instance).unwrap();
        }
    });

    Ok(())
}




fn distcore(appversion:u16) -> Result<()> {

    
    // set now to seconds since epoch
    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();

    let in_path = format!("{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DEV_PATH);
    let out_path = format!("{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DIST_PATH);

    let index_in_path = format!("{}{}", in_path, "index.html");
    let js_in_path = format!("{}{}", in_path, "main.js");
    let css_index_in_path = format!("{}{}", in_path, "index.css");
    let css_main_in_path = format!("{}{}", in_path, "main.css");
    let sw_in_path = format!("{}{}", in_path, "sw.js");

    let index_out_path = format!("{}{}", out_path, "index.html");
    let sw_out_path = format!("{}{}", out_path, "sw.min.js");

    let index_str = fs::read_to_string(&index_in_path)?;

    let js_cmd = Command::new("npx").args(["esbuild", &js_in_path, "--bundle", "--minify"]).current_dir(crate::ABSOLUTE_PATH).output().expect("esbuild chucked an error");
    let js_str = String::from_utf8(js_cmd.stdout).expect("js stdout error");

    let css_index_cmd = Command::new("npx").args(["esbuild", &css_index_in_path, "--bundle", "--loader:.woff2=dataurl"]).current_dir(crate::ABSOLUTE_PATH).output().expect("esbuild chucked an error");
    let css_index_str = String::from_utf8(css_index_cmd.stdout).expect("css stdout error");

    let css_main_cmd = Command::new("npx").args(["esbuild", &css_main_in_path, "--bundle", "--loader:.woff2=dataurl"]).current_dir(crate::ABSOLUTE_PATH).output().expect("esbuild chucked an error");
    let css_main_str = String::from_utf8(css_main_cmd.stdout).expect("css stdout error");
    let css_main_str = css_main_str.replace(r#"\f"#, "\\\\f").to_string();

    let index_str = index_str.replace("/*{--maincss--}*/", &css_main_str);
    let index_str = index_str.replace(r#"<script type="module" src="/assets/main.js"></script>"#, format!("<script type='module'>{}</script>", &js_str).as_str());
    let index_str = index_str.replace(r#"<link rel="stylesheet" href="/assets/index.css">"#, format!("<style>{}</style>", css_index_str).as_str());

    let index_str = index_str.replace("APPVERSION=0", format!("APPVERSION={}", appversion).as_str());
    let index_str = index_str.replace("APPUPDATE_TS=0", format!("APPUPDATE_TS={}", now).as_str());

    let index_str = crate::helperutils::replace_links_with_appversion(appversion, &index_str)?;
    let index_str = index_str.replace("/app.webmanifest", format!("/app_v{}.webmanifest", appversion).as_str());

    fs::write(&index_out_path, &index_str)?;

    let brotliargs = ["brotli-cli", "compress", &index_out_path];
    let _brotli = Command::new("npx").args(brotliargs).output().expect("brotli chucked an error");

    let sw_cmd = Command::new("npx").args(["esbuild", &sw_in_path, "--bundle"]).output().expect("esbuild chucked an error");
    let sw_str = String::from_utf8(sw_cmd.stdout).expect("js stdout error");

    let sw_str = sw_str.replace("cacheV__0__", format!("cacheV__{}__", appversion).as_str());

    fs::write(&sw_out_path, &sw_str)?;

    let brotliargs = ["brotli-cli", "compress", &sw_out_path];
    let _brotli = Command::new("npx").args(brotliargs).output().expect("brotli chucked an error");

    Ok(())
}




fn increment_and_get_appversion_and_write_manifest_to_dist_and_original_and_serverindex(instance:&str) -> Result<u16> {

    let manifest_original_path = format!("{}{}{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_MAIN_SRC_PATH, crate::CLIENT_PREFIX, instance, "/app_xtend.webmanifest");
    let manifest_dev_path = format!("{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DEV_PATH, "/app.webmanifest");
    let manifest_dist_path = format!("{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DIST_PATH, "/app.webmanifest");
    let serverindex_path = format!("{}{}{}", crate::ABSOLUTE_PATH, crate::SERVER_BUILD_PATH, "/index.js");

    let manifest_original_str = fs::read_to_string(&manifest_original_path)?;
    let manifest_dev_str = fs::read_to_string(&manifest_dev_path)?;
    let serverindex_str = fs::read_to_string(&serverindex_path)?;

    let re_client = Regex::new(r#""version":\s*"(\d+)""#).unwrap();
    let re_server = Regex::new(r#"APPVERSION = \d+"#).unwrap();

    // find the version number in manifest_str
    let caps = re_client.captures(&manifest_original_str).unwrap();
    let version = caps.get(1).unwrap().as_str().parse::<u16>().unwrap();
    let next_version = version + 1;

    let manifest_original_str = re_client.replace_all(&manifest_original_str, format!("\"version\":\"{}\"", next_version).as_str()).to_string();
    let manifest_dist_str = re_client.replace_all(&manifest_dev_str, format!("\"version\":\"{}\"", next_version).as_str()).to_string();

    let serverindex_new_str = re_server.replace_all(&serverindex_str, format!("APPVERSION = {}", next_version).as_str()).to_string();

    fs::write(&manifest_original_path, &manifest_original_str)?;
    fs::write(&manifest_dist_path, &manifest_dist_str)?;
    fs::write(&serverindex_path, &serverindex_new_str)?;

    Ok(next_version)
}




fn media(instance:&str) -> Result<()> {

    let cc = format!("{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_MAIN_SRC_PATH, "media/");
    let ic = format!("{}{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_INSTANCE_SRC_PREFIX, &instance, "/media/");

    let co = format!("{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DIST_PATH, "media");
    let io = format!("{}{}{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DIST_PATH, "client_", &instance, "/media");

    [0, 1].into_par_iter().for_each(|p| {
        if p == 0 {
            let _rsync = Command::new("rsync").args(["-r", &cc, &co]).output().expect("rsync chucked an error on main media");
        } else {
            let _rsync = Command::new("rsync").args(["-r", &ic, &io]).output().expect("rsync chucked an error on instance media");
        }
    });

    Ok(())
}




