
use std::process::Command;
use std::fs;
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::path::Path;
use walkdir::WalkDir;

pub mod entry;
pub mod media;
pub mod thirdparty;
pub mod update_file;
pub mod server;

//use crate::helperutils;

/*
static MAIN_MANIFEST_PATH: &str = concat!(
    crate::MAIN_PATH,
    crate::CLIENT_MAIN_SRC_PATH,
    "app.webmanifest"
);
*/





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




pub fn runit() -> Result<()> {

    let manifest = handle_manifest()?;

    let a = crate::CLIENT_MAIN_SRC_PATH.clone();
    let b = crate::CLIENT_OUTPUT_DEV_PATH.clone();
    let js_client_thread = std::thread::spawn(move || handle_js(&a, &b));

    let c = crate::INSTANCE_CLIENT_PATH.clone();
    let d = crate::INSTANCE_CLIENT_OUTPUT_DEV_PATH.clone();
    let js_instance_thread = std::thread::spawn(move || handle_js(&c, &d));

    let e = crate::CLIENT_MAIN_SRC_PATH.clone();
    let f = crate::CLIENT_OUTPUT_DEV_PATH.clone();
    let client_deep_copy_html_css = std::thread::spawn(move || copy_deep(vec!["html", "css"], &e, &f));

    let g = crate::INSTANCE_CLIENT_PATH.clone() + "lazy/";
    let h = crate::INSTANCE_CLIENT_OUTPUT_DEV_PATH.clone() + "lazy/";
    let instance_deep_copy_html_css = std::thread::spawn(move || copy_deep(vec!["html", "css"], &g, &h));

    js_client_thread.join().map_err(|e| anyhow::anyhow!("JS thread panicked: {:?}", e))??;
    js_instance_thread.join().map_err(|e| anyhow::anyhow!("JS thread panicked: {:?}", e))??;
    client_deep_copy_html_css.join().map_err(|e| anyhow::anyhow!("Lazy deep copy html and css panicked: {:?}", e))??;
    instance_deep_copy_html_css.join().map_err(|e| anyhow::anyhow!("Lazy deep copy html and css panicked: {:?}", e))??;

    let _ = handle_indexhtml(&manifest.short_name); // does write over index.html that happens to get created by client_deep_copy_html_css

    Ok(())
}




pub fn alldev() -> Result<()> {
     
    reset_dev_dirs()?;

    let core_thread       = std::thread::spawn(|| runit());
    let thirdparty_thread = std::thread::spawn(|| thirdparty::runit());
    let media_thread      = std::thread::spawn(|| media::runit());
    let server_thread     = std::thread::spawn(|| server::runit());
    let entry_thread      = std::thread::spawn(|| entry::runit());

    core_thread.join().map_err(|e| anyhow::anyhow!("Dev Core thread panicked: {:?}", e))??;
    thirdparty_thread.join().map_err(|e| anyhow::anyhow!("Dev Thirdparty thread panicked: {:?}", e))??;
    media_thread.join().map_err(|e| anyhow::anyhow!("Dev Media thread panicked: {:?}", e))??;
    server_thread.join().map_err(|e| anyhow::anyhow!("Dev Server thread panicked: {:?}", e))??;
    entry_thread.join().map_err(|e| anyhow::anyhow!("Dev Entry thread panicked: {:?}", e))??;

    Ok(())
}




fn handle_manifest() -> Result<ManifestT> {

    let manifest_in_path          = crate::CLIENT_MAIN_SRC_PATH.clone() + "app.webmanifest";
    let manifest_instance_in_path = crate::INSTANCE_CLIENT_PATH.clone() + "app_xtend.webmanifest";
    let manifest_out_path         = crate::CLIENT_OUTPUT_DEV_PATH.clone() + "app.webmanifest";


    let manifest_main     = fs::read_to_string(manifest_in_path).expect("read error manifest file");
    let manifest_instance = fs::read_to_string(manifest_instance_in_path).expect("read error instance manifest file");

    let mut manifest: ManifestT = serde_json::from_str(&manifest_main).expect("main json error");
    let manifest_instance: ManifestT = serde_json::from_str(&manifest_instance).expect("instance json error");

    manifest.name = manifest_instance.name;
    manifest.short_name = manifest_instance.short_name;
    manifest.description = format!("App Version: {}", manifest_instance.description);
    manifest.icons = manifest_instance.icons;
    manifest.theme_color = manifest_instance.theme_color;
    manifest.background_color = manifest_instance.background_color;
    manifest.version = manifest_instance.version;

    let manifest_str = serde_json::to_string_pretty(&manifest).expect("app manifest to string error");
    fs::write(manifest_out_path, manifest_str).expect("write error");

    Ok(manifest)
}




/*
fn handle_css() -> Result<()> {

    let css_index_in_path       = crate::CLIENT_MAIN_SRC_PATH.clone() + "index.css";
    let css_index_out_path      = crate::CLIENT_OUTPUT_DEV_PATH.clone() + "index.css";

    let css_main_in_path        = crate::CLIENT_MAIN_SRC_PATH.clone() + "main.css";
    let css_main_out_path       = crate::CLIENT_OUTPUT_DEV_PATH.clone() + "main.css";

    let css_instance_in_path    = crate::INSTANCE_CLIENT_PATH.clone() + "main_xtend.css";
    let css_instance_out_path   = crate::INSTANCE_CLIENT_OUTPUT_DEV_PATH.clone() + "main_xtend.css";

    let css_index_args_outfilestr = format!("--outfile={}", &css_index_out_path);
    
    let css_index_args = ["esbuild", "--bundle", &css_index_in_path, "--loader:.woff2=dataurl", &css_index_args_outfilestr];

    Command::new("npx").args(&css_index_args).output().expect("css index esbuild chucked an error");
    std::fs::copy(&css_main_in_path, &css_main_out_path).expect("css main cp chucked an error");
    std::fs::copy(&css_instance_in_path, &css_instance_out_path).expect("css instance cp chucked an error");

    Ok(())
}
*/




fn handle_indexhtml(manifestname:&str) -> Result<()> {

    let index_in_path           = crate::CLIENT_MAIN_SRC_PATH.clone() + "index.html";
    let index_out_path          = crate::CLIENT_OUTPUT_DEV_PATH.clone() + "index.html";

    let index    = fs::read_to_string(index_in_path).expect("read error");
    let index = index.replace("<title></title>", &format!("<title>{}</title>", manifestname));
    fs::write(index_out_path, index).expect("write error");

    Ok(())
}




fn handle_js(src_path_str:&str, dest_path_str:&str) -> Result<()> {

    let src_path               = Path::new(src_path_str);
    let src_folder_name        = src_path.file_name().expect("file name error").to_str().expect("to str error");
    let src_parent_folder_str  = src_path.parent().expect("parent error").to_str().expect("to str error");
    let dest_path_trimmed      = dest_path_str.trim_end_matches('/').to_string();
    let swrc_path              = crate::CLIENT_MAIN_SRC_PATH.clone() + ".swcrc";

    let commandargs:Vec<String> = vec![
        String::from("swc"), 
        String::from(src_folder_name), 
        String::from("-d"), 
        String::from(dest_path_trimmed), 
        String::from("--config-file"), 
        String::from(swrc_path), 
        String::from("--strip-leading-paths"),
        String::from("--ignore"),
        String::from("**/media/**/*"),
        String::from("--ignore"),
        String::from("**/thirdparty/**/*"),
    ];

    let _swc_cmd = Command::new("npx").args(commandargs).current_dir(src_parent_folder_str).output().expect("swc chucked an error");

    Ok(())
}




/*
pub fn handle_thirdparty_js(src_path_str:&str, dest_path_str:&str) -> Result<()> {

    let dest_path_trimmed      = dest_path_str.trim_end_matches('/').to_string();

    let src_str    = format!("{}{}", src_path_str, "*");
    let outdir_str = format!("{}{}", "--outdir=", dest_path_trimmed);

    let args = ["esbuild", &src_str, "--bundle", &outdir_str];

    let _cmd = Command::new("npx").args(args).spawn().expect("ebuild chucked an error on handle_thirdparty_js");

    Ok(())
}
*/



fn copy_deep(file_extensions:Vec<&str>, src_path:&str, dest_path:&str) -> Result<()> {

    let source_folder = Path::new(src_path);
    let destination_folder = Path::new(dest_path);

    fs::create_dir_all(&destination_folder)?;

    for entry in WalkDir::new(&source_folder) {
        let entry = entry?;
        let path = entry.path();

        if path.is_file() {
            if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
                if file_extensions.contains(&ext) {
                    let relative_path = path.strip_prefix(&source_folder).unwrap();

                    let destination_path = destination_folder.join(relative_path);

                    if let Some(parent) = destination_path.parent() {
                        fs::create_dir_all(parent)?;
                    }

                    fs::copy(&path, &destination_path)?;
                }
            }
        }
    }

    Ok(())
}




fn reset_dev_dirs() -> Result<()> {

    let _xx = std::fs::remove_dir_all(crate::CLIENT_OUTPUT_DEV_PATH.clone());
    let _yy = std::fs::remove_dir_all(crate::SERVER_BUILD_PATH.clone());

    std::fs::create_dir_all(crate::CLIENT_OUTPUT_DEV_PATH.clone())?;
    std::fs::create_dir_all(crate::SERVER_BUILD_PATH.clone())?;
    std::fs::create_dir_all(crate::INSTANCE_CLIENT_OUTPUT_DEV_PATH.clone())?;

    Ok(())
}

/*
fn handle_entry_csshtml() -> Result<()> {

    let entry_in_path           = crate::MAIN_PATH.clone() + &crate::CLIENT_MAIN_SRC_PATH + "entry/";
    let entry_out_path          = crate::MAIN_PATH.clone() + &crate::CLIENT_OUTPUT_DEV_PATH + "entry/";
    let entry_instance_in_path  = crate::INSTANCE_CLIENT_PATH.clone() + "entry/";
    let entry_instance_out_path = crate::MAIN_PATH.clone() + &crate::CLIENT_OUTPUT_DEV_PATH + &crate::INSTANCE_CLIENT_OUTPUT_DIST_PATH + "entry/";

    Command::new("mkdir").args(["-p", &entry_out_path]).output().expect("unable to make entry directory");
    Command::new("mkdir").args(["-p", &entry_instance_out_path]).output().expect("unable to make entry instance directory");

    let entry_files_cp_args          = [entry_in_path.clone() + "entry.html", entry_in_path.clone() + "entry.css", entry_out_path.clone() + "."];
    let entry_instance_files_cp_args = [entry_instance_in_path.clone() + "entry.html", entry_instance_in_path.clone() + "entry.css", entry_instance_out_path.clone() + "."];
    Command::new("cp").args(entry_files_cp_args).output().expect("unable to copy entry files");
    Command::new("cp").args(entry_instance_files_cp_args).output().expect("unable to copy entry instance files");

    Ok(())
}
*/




/*
pub fn instance_ignores(instance:&str, c_m:&str, excludeterm:&str, prefix:&str, should_create_relative_paths:bool) -> Result<Vec<String>> {

    let paths = fs::read_dir(c_m)?
        .filter_map(|x| {
            let p = x.unwrap().path();
            let pstr = p.to_str()?.to_string();

            if p.is_dir() && pstr.contains(prefix) && !pstr.contains(&instance){
                let spepa = if should_create_relative_paths {
                    pstr.split("/").collect::<Vec<&str>>().last().unwrap().to_string()
                } else {
                    pstr
                };
                return Some( [format!("{}{}","--", &excludeterm), spepa.clone()] );
            } else {
                return None;
            }
        })
        .collect::<Vec<_>>();

    let mut ignores: Vec<String> = vec![];

    paths.iter().for_each(|x| {
        ignores.push(x[0].clone());
        ignores.push(x[1].clone());
    });

    Ok(ignores)
}
*/



