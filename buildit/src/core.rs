
use std::process::Command;
use std::fs;
use std::env;
use anyhow::Result;
use serde::{Deserialize, Serialize};

use crate::helperutils;


#[derive(Serialize, Deserialize, Debug)]
struct ManifestIconT {   src: String, sizes: String  }
#[derive(Serialize, Deserialize, Debug)]
struct ManifestT {   
    name: String, 
    short_name: String, 
    description: String, 
    theme_color: String, 
    background_color: String, 
    icons: Vec<ManifestIconT>, 
    scope: String, 
    start_url: String, 
    version: String, 
    display: String,   
}




pub fn runit(instance:&str) -> Result<()> {

    let manifest = manifest(instance)?;
    html_and_css(&instance, &manifest.short_name)?;
    js(&instance)?;

    //sw(&instance)?;

    Ok(())
}




fn manifest(instance:&str) -> Result<ManifestT> {

    let dir = env::var("NIFTY_DIR").expect("Unable to get NIFTY_DIR environment variable");
    let instance_server_dir = env::var("NIFTY_DIR").expect("Unable to get NIFTY_DIR environment variable");
    let instance_server_dir = env::var("NIFTY_DIR").expect("Unable to get NIFTY_DIR environment variable");

    let manifest_in = dir.clone() + crate::CLIENT_MAIN_SRC_PATH + "app.webmanifest";
    let manifest_instance_in = dir.clone() + crate::CLIENT_INSTANCE_SRC_PREFIX + instance + "/app_xtend.webmanifest";
    let manifest_out = dir.clone() + crate::CLIENT_OUTPUT_DEV_PATH + "app.webmanifest";

    let manifest_main     = fs::read_to_string(manifest_in).expect("read error manifest file");
    let manifest_instance = fs::read_to_string(manifest_instance_in).expect("read error instance manifest file");

    let mut manifest_main: ManifestT = serde_json::from_str(&manifest_main).expect("main json error");
    let manifest_instance: ManifestT = serde_json::from_str(&manifest_instance).expect("instance json error");

    manifest_main.name = manifest_instance.name;
    manifest_main.short_name = manifest_instance.short_name;
    manifest_main.description = format!("App Version: {}", manifest_instance.description);
    manifest_main.icons = manifest_instance.icons;
    manifest_main.theme_color = manifest_instance.theme_color;
    manifest_main.background_color = manifest_instance.background_color;
    manifest_main.version = manifest_instance.version;

    let manifest_main_updated = serde_json::to_string(&manifest_main).expect("app manifest to string error");
    fs::write(manifest_out, manifest_main_updated).expect("write error");

    Ok(manifest_main)
}




fn html_and_css(instance:&str, manifestname:&str) -> Result<()> {

    let dir = env::var("NIFTY_DIR").expect("Unable to get NIFTY_DIR environment variable");

    let index_in_path           = format!("{}{}{}", dir, crate::CLIENT_MAIN_SRC_PATH, "index.html");
    let index_out_path          = format!("{}{}{}", dir, crate::CLIENT_OUTPUT_DEV_PATH, "index.html");
    let css_index_in_path       = format!("{}{}{}", dir, crate::CLIENT_MAIN_SRC_PATH, "index.css");
    let css_index_out_path      = format!("{}{}{}", dir, crate::CLIENT_OUTPUT_DEV_PATH, "index.css");
    let css_main_in_path        = format!("{}{}{}", dir, crate::CLIENT_MAIN_SRC_PATH, "main.css");
    let css_main_out_path       = format!("{}{}{}", dir, crate::CLIENT_OUTPUT_DEV_PATH, "main.css");
    let css_instance_in_path    = format!("{}{}{}{}{}", dir, crate::CLIENT_MAIN_SRC_PATH, "client_", instance, "/main_xtend.css");
    let css_instance_out_path   = format!("{}{}{}{}{}", dir, crate::CLIENT_OUTPUT_DEV_PATH, "client_", instance, "/main_xtend.css");
    let entry_in_path           = format!("{}{}{}", dir, crate::CLIENT_MAIN_SRC_PATH, "entry/");
    let entry_out_path          = format!("{}{}{}", dir, crate::CLIENT_OUTPUT_DEV_PATH, "entry/");
    let entry_instance_in_path  = format!("{}{}{}{}{}", dir, crate::CLIENT_MAIN_SRC_PATH, "client_", instance, "/entry/");
    let entry_instance_out_path = format!("{}{}{}{}{}", dir, crate::CLIENT_OUTPUT_DEV_PATH, "client_", instance, "/entry/");

    let index_outfilestr        = format!("{}{}","--outfile=", &css_index_out_path);

    let css_index_args = ["esbuild", "--bundle", &css_index_in_path, "--loader:.woff2=dataurl", &index_outfilestr];
    Command::new("npx").args(&css_index_args).output().expect("css index esbuild chucked an error");
    Command::new("cp").args([&css_main_in_path, &css_main_out_path]).output().expect("css main cp chucked an error");
    Command::new("cp").args([&css_instance_in_path, &css_instance_out_path]).output().expect("css instance cp chucked an error");

    let index    = fs::read_to_string(index_in_path).expect("read error");
    let index = index.replace("<title></title>", &format!("<title>{}</title>", manifestname));
    let index = index.replace("APPINSTANCE=''", &format!("APPINSTANCE='{}'", &instance));
    fs::write(index_out_path, index).expect("write error");

    Command::new("mkdir").args(["-p", &entry_out_path]).output().expect("unable to make entry directory");
    Command::new("mkdir").args(["-p", &entry_instance_out_path]).output().expect("unable to make entry instance directory");

    let entry_files_cp_args          = [entry_in_path.clone() + "entry.html", entry_in_path.clone() + "entry.css", entry_out_path.clone() + "."];
    let entry_instance_files_cp_args = [entry_instance_in_path.clone() + "entry.html", entry_instance_in_path.clone() + "entry.css", entry_instance_out_path.clone() + "."];
    Command::new("cp").args(entry_files_cp_args).output().expect("unable to copy entry.html");
    Command::new("cp").args(entry_instance_files_cp_args).output().expect("unable to copy entry.html");

    Ok(())
}




fn js(instance:&str) -> Result<()> {

    let dir = env::var("NIFTY_DIR").expect("Unable to get NIFTY_DIR environment variable");

    let jc = format!("{}{}", dir, crate::CLIENT_MAIN_SRC_PATH);
    let jo = format!("{}{}", dir, crate::CLIENT_OUTPUT_DEV_PATH);
    let jo = jo.trim_end_matches('/').to_string();

    let mut commandargs:Vec<String> = vec![
        String::from("swc"), 
        String::from(&jc), 
        String::from("-d"), 
        String::from(&jo), 
        String::from("--strip-leading-paths"),
        String::from("--ignore"),
        String::from(format!("{}{}", jc, "lazy")),
        String::from("--ignore"),
        String::from(format!("{}{}", jc, "thirdparty")),
        String::from("--ignore"),
        String::from(format!("{}{}", jc, "media")),
        String::from("--ignore"),
        String::from(format!("{}{}{}{}", jc, crate::CLIENT_PREFIX, instance, "/lazy")),
        String::from("--ignore"),
        String::from(format!("{}{}{}{}", jc, crate::CLIENT_PREFIX, instance, "/thirdparty")),
    ];

    let ignores = helperutils::instance_ignores(&instance, &jc, "ignore", crate::CLIENT_PREFIX, false)?;
    commandargs.extend(ignores);

    let _swc_cmd = Command::new("npx").args(commandargs).current_dir(dir).output().expect("swc chucked an error");

    Ok(())
}




