
use std::time::{SystemTime, UNIX_EPOCH};
use rayon::prelude::*;
use std::fs;
use regex::Regex;
use std::env;
use anyhow::Result;
use std::process::Command;

mod yads;
mod yims;
mod thirdpartydist;




pub fn dist(instance:&str) -> Result<()> {

    let dir = env::var("NIFTY_DIR").expect("Unable to get NIFTY_DIR environment variable");

    let sd = format!("{}{}", dir, crate::CLIENT_OUTPUT_DIST_PATH);

    let x = fs::remove_dir_all(&sd);

    if x.is_err() {   println!("output dist folder is already removed.");   }

    fs::create_dir_all(&sd)?;

    let appversion = increment_and_get_appversion_and_write_manifest_to_dist_and_original_and_serverindex(instance)?;

    distcore(appversion)?;

    entry_files(&instance)?;

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

    let dir = env::var("NIFTY_DIR").expect("Unable to get NIFTY_DIR environment variable");

    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
    
    let in_path            = format!("{}{}", dir, crate::CLIENT_OUTPUT_DEV_PATH);
    let out_path           = format!("{}{}", dir, crate::CLIENT_OUTPUT_DIST_PATH);
    let index_in_path      = format!("{}{}", in_path, "index.html");
    let index_out_path     = format!("{}{}", out_path, "index.html");
    let js_in_path         = format!("{}{}", in_path, "main.js");
    let js_out_path        = format!("{}{}", out_path, "main.min.js");
    let css_index_in_path  = format!("{}{}", in_path, "index.css");
    let css_index_out_path = format!("{}{}", out_path, "index.min.css");
    let css_main_in_path   = format!("{}{}", in_path, "main.css");
    let css_main_out_path  = format!("{}{}", out_path, "main.min.css");
    let sw_in_path         = format!("{}{}", in_path, "sw.js");
    let sw_out_path        = format!("{}{}", out_path, "sw.min.js");


    let index_str = fs::read_to_string(&index_in_path)?;

    let js_cmd = Command::new("npx").args(["esbuild", &js_in_path, "--bundle", "--minify"]).current_dir(&dir).output().expect("js esbuild chucked an error");
    let js_str = String::from_utf8(js_cmd.stdout).expect("js stdout error");

    let css_index_cmd = Command::new("npx").args(["esbuild", &css_index_in_path, "--bundle", "--loader:.woff2=dataurl"]).current_dir(&dir).output().expect("css index esbuild chucked an error");
    let css_index_str = String::from_utf8(css_index_cmd.stdout).expect("css stdout error");

    let css_main_cmd = Command::new("npx").args(["esbuild", &css_main_in_path, "--bundle"]).current_dir(&dir).output().expect("css main esbuild chucked an error");
    let css_main_str = String::from_utf8(css_main_cmd.stdout).expect("css stdout error");

    let sw_cmd = Command::new("npx").args(["esbuild", &sw_in_path, "--bundle"]).output().expect("sw esbuild chucked an error");
    let sw_str = String::from_utf8(sw_cmd.stdout).expect("sw stdout error");

    //let css_main_str = css_main_str.replace(r#"\f"#, "\\\\f").to_string();
    let sw_str       = sw_str.replace("cacheV__0__", format!("cacheV__{}__", appversion).as_str());
    let index_str    = index_str.replace("APPVERSION=0", format!("APPVERSION={}", appversion).as_str());
    let index_str    = index_str.replace("APPUPDATE_TS=0", format!("APPUPDATE_TS={}", now).as_str());


    fs::write(&index_out_path, &index_str).expect("unable to write index file out");
    fs::write(&js_out_path, &js_str).expect("unable to write js file out");
    fs::write(&sw_out_path, &sw_str)?;
    fs::write(&css_main_out_path, &css_main_str).expect("unable to write main css file");
    fs::write(&css_index_out_path, &css_index_str).expect("unable to write index css file");


    Command::new("npx").args(["brotli-cli", "compress", &index_out_path]).output().expect("index brotli chucked an error");
    Command::new("npx").args(["brotli-cli", "compress", &js_out_path]).output().expect("js brotli chucked an error");
    Command::new("npx").args(["brotli-cli", "compress", &css_index_out_path]).output().expect("css index brotli chucked an error");
    Command::new("npx").args(["brotli-cli", "compress", &css_main_out_path]).output().expect("css main brotli chucked an error");
    Command::new("npx").args(["brotli-cli", "compress", &sw_out_path]).output().expect("sw main brotli chucked an error");

    //let index_str = index_str.replace("/*{--maincss--}*/", &css_main_str);
    //let index_str = index_str.replace(r#"<script type="module" src="/assets/main.js"></script>"#, format!("<script type='module'>{}</script>", &js_str).as_str());
    //let index_str = index_str.replace(r#"<link rel="stylesheet" href="/assets/index.css">"#, format!("<style>{}</style>", css_index_str).as_str());


    //let index_str = crate::helperutils::replace_links_with_appversion(appversion, &index_str)?;
    //let index_str = index_str.replace("/app.webmanifest", format!("/app_v{}.webmanifest", appversion).as_str());



    Ok(())
}




fn entry_files(instance:&str) -> Result<()> {

    let dir = env::var("NIFTY_DIR").expect("Unable to get NIFTY_DIR environment variable");

    let in_path                = format!("{}{}{}", dir, crate::CLIENT_OUTPUT_DEV_PATH, "entry/");
    let out_path               = format!("{}{}", dir, crate::CLIENT_OUTPUT_DIST_PATH);
    let in_instance_path       = format!("{}{}{}{}{}", dir, crate::CLIENT_OUTPUT_DEV_PATH, "client_", instance, "/entry/");
    let html_in_path           = format!("{}{}", in_path, "entry.html");
    let html_out_path          = format!("{}{}", out_path, "entry.html");
    let js_in_path             = format!("{}{}", in_path, "entry.js");
    let css_in_path            = format!("{}{}", in_path, "entry.css");
    let html_instance_in_path  = format!("{}{}", in_instance_path, "entry.html");
    let css_instance_in_path   = format!("{}{}", in_instance_path, "entry.css");
    let js_instance_in_path    = format!("{}{}", in_instance_path, "entry.js");



    let html_str          = fs::read_to_string(&html_in_path)?;
    let html_instance_str = fs::read_to_string(&html_instance_in_path)?;

    let js_cmd           = Command::new("npx").args(["esbuild", &js_in_path, "--bundle", "--minify"]).current_dir(&dir).output().expect("js esbuild chucked an error");
    let css_cmd          = Command::new("npx").args(["esbuild", &css_in_path, "--bundle", "--minify"]).current_dir(&dir).output().expect("css esbuild chucked an error");
    let js_instance_cmd  = Command::new("npx").args(["esbuild", &js_instance_in_path, "--bundle", "--minify"]).current_dir(&dir).output().expect("js instance esbuild chucked an error");
    let css_instance_cmd = Command::new("npx").args(["esbuild", &css_instance_in_path, "--bundle", "--minify"]).current_dir(&dir).output().expect("css instance esbuild chucked an error");

    let js_str           = String::from_utf8(js_cmd.stdout).expect("js stdout error");
    let css_str          = String::from_utf8(css_cmd.stdout).expect("css stdout error");
    let js_instance_str  = String::from_utf8(js_instance_cmd.stdout).expect("js instance stdout error");
    let css_instance_str = String::from_utf8(css_instance_cmd.stdout).expect("css instance stdout error");

    let htmlreplacestr = html_str.replace("{--js--}", &js_str).to_string();
    let htmlreplacestr = htmlreplacestr.replace("{--instance_js--}", &js_instance_str).to_string();
    let htmlreplacestr = htmlreplacestr.replace("{--css--}", &css_str).to_string();
    let htmlreplacestr = htmlreplacestr.replace("{--instance_css--}", &css_instance_str).to_string();
    let htmlreplacestr = htmlreplacestr.replace("{--instance_html--}", &html_instance_str).to_string();

    fs::write(&html_out_path, &htmlreplacestr).expect("unable to write entry index file out");

    Command::new("npx").args(["brotli-cli", "compress", &html_out_path]).output().expect("entry index brotli chucked an error");

    Ok(())
}




fn increment_and_get_appversion_and_write_manifest_to_dist_and_original_and_serverindex(instance:&str) -> Result<u16> {

    let dir = env::var("NIFTY_DIR").expect("Unable to get NIFTY_DIR environment variable");

    let manifest_original_path = format!("{}{}{}{}{}", dir, crate::CLIENT_MAIN_SRC_PATH, crate::CLIENT_PREFIX, instance, "/app_xtend.webmanifest");
    let manifest_dev_path = format!("{}{}{}", dir, crate::CLIENT_OUTPUT_DEV_PATH, "/app.webmanifest");
    let manifest_dist_path = format!("{}{}{}", dir, crate::CLIENT_OUTPUT_DIST_PATH, "/app.webmanifest");
    let serverindex_path = format!("{}{}{}", dir, crate::SERVER_BUILD_PATH, "/index.js");

    let manifest_original_str = fs::read_to_string(&manifest_original_path)?;
    let manifest_dev_str = fs::read_to_string(&manifest_dev_path)?;
    let serverindex_str = fs::read_to_string(&serverindex_path)?;

    let manifest_regex = Regex::new(r#""version":\s*"(\d+)""#).unwrap();
    let server_regex = Regex::new(r#"APPVERSION = \d+"#).unwrap();

    let manifest_regex_captures = manifest_regex.captures(&manifest_original_str).unwrap();
    let version = manifest_regex_captures.get(1).unwrap().as_str().parse::<u16>().unwrap();
    let next_version = version + 1;

    let manifest_original_str = manifest_regex.replace_all(&manifest_original_str, format!("\"version\":\"{}\"", next_version).as_str()).to_string();
    let manifest_dist_str = manifest_regex.replace_all(&manifest_dev_str, format!("\"version\":\"{}\"", next_version).as_str()).to_string();

    let serverindex_new_str = server_regex.replace_all(&serverindex_str, format!("APPVERSION = {}", next_version).as_str()).to_string();

    fs::write(&manifest_original_path, &manifest_original_str)?;
    fs::write(&manifest_dist_path, &manifest_dist_str)?;
    fs::write(&serverindex_path, &serverindex_new_str)?;

    Ok(next_version)
}




fn media(instance:&str) -> Result<()> {

    let dir = env::var("NIFTY_DIR").expect("Unable to get NIFTY_DIR environment variable");

    let cc = format!("{}{}{}", dir, crate::CLIENT_MAIN_SRC_PATH, "media/");
    let ic = format!("{}{}{}{}", dir, crate::CLIENT_INSTANCE_SRC_PREFIX, &instance, "/media/");

    let co = format!("{}{}{}", dir, crate::CLIENT_OUTPUT_DIST_PATH, "media");
    let io = format!("{}{}{}{}{}", dir, crate::CLIENT_OUTPUT_DIST_PATH, "client_", &instance, "/media");

    [0, 1].into_par_iter().for_each(|p| {
        if p == 0 {
            let _rsync = Command::new("rsync").args(["-r", &cc, &co]).output().expect("rsync chucked an error on main media");
        } else {
            let _rsync = Command::new("rsync").args(["-r", &ic, &io]).output().expect("rsync chucked an error on instance media");
        }
    });

    Ok(())
}




