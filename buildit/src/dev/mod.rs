
use std::fs;
use anyhow::Result;
use serde::{Deserialize, Serialize};

use crate::common_helperfuncs;

pub mod media;
pub mod thirdparty;
pub mod handlefile;
pub mod server;




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



pub fn alldev() -> Result<()> {
     
    reset_dev_dirs()?;

    let _  = handle_core();

    let lazy_thread            = std::thread::spawn(|| handle_lazy());
    let thirdparty_thread      = std::thread::spawn(|| thirdparty::runit());
    let media_thread           = std::thread::spawn(|| media::runit());
    let server_thread          = std::thread::spawn(|| server::runit());
    let instance_entry_thread  = std::thread::spawn(|| handle_instance_entry());
    let symlinks_thread        = std::thread::spawn(|| handle_symlinks());

    lazy_thread.join().map_err(|e| anyhow::anyhow!("Dev Lazy thread panicked: {:?}", e))??;
    thirdparty_thread.join().map_err(|e| anyhow::anyhow!("Dev Thirdparty thread panicked: {:?}", e))??;
    media_thread.join().map_err(|e| anyhow::anyhow!("Dev Media thread panicked: {:?}", e))??;
    server_thread.join().map_err(|e| anyhow::anyhow!("Dev Server thread panicked: {:?}", e))??;
    instance_entry_thread.join().map_err(|e| anyhow::anyhow!("Dev Entry thread panicked: {:?}", e))??;
    symlinks_thread.join().map_err(|e| anyhow::anyhow!("Dev Symlinks thread panicked: {:?}", e))??;

    Ok(())
}




pub fn handle_core() -> Result<()> {

    let _ = handle_symlinks();
    let manifest = handle_manifest()?;

    let a =  crate::CLIENT_MAIN_SRC_PATH.clone();
    let b =  crate::CLIENT_OUTPUT_DEV_PATH.clone();
    let glob_files = vec!["sw.ts", "main.ts", "alwaysload/**/*", "defs_client.ts", "defs_server_symlink.ts"];
    let js_client_thread = std::thread::spawn(move || common_helperfuncs::run_swc(&a, &b, glob_files));

    let c = crate::INSTANCE_CLIENT_PATH.clone();
    let d = crate::INSTANCE_CLIENT_OUTPUT_DEV_PATH.clone();
    let glob_files = vec!["main_instance.ts", "alwaysload/**/*", "defs_instance_client.ts", "defs_instance_server_symlink.ts"];
    let js_instance_thread = std::thread::spawn(move || common_helperfuncs::run_swc(&c, &d, glob_files));

    let handle_primary_css_files_thread = std::thread::spawn(move || handle_primary_css_files());

    js_client_thread.join().map_err(|e| anyhow::anyhow!("JS thread panicked: {:?}", e))??;
    js_instance_thread.join().map_err(|e| anyhow::anyhow!("JS thread panicked: {:?}", e))??;
    handle_primary_css_files_thread.join().map_err(|e| anyhow::anyhow!("Primary css files thread panicked: {:?}", e))??;

    let _ = handle_indexhtml(&manifest.short_name); // does write over index.html that happens to get created by client_deep_copy_html_css
    let _ = handle_mainjs();

    Ok(())
}




pub fn handle_lazy() -> Result<()> {

    let a =  crate::CLIENT_MAIN_SRC_PATH.clone();
    let b =  crate::CLIENT_OUTPUT_DEV_PATH.clone();
    let glob_files = vec!["lazy/**/*"];
    let js_client_thread = std::thread::spawn(move || common_helperfuncs::run_swc(&a, &b, glob_files));

    let c = crate::INSTANCE_CLIENT_PATH.clone();
    let d = crate::INSTANCE_CLIENT_OUTPUT_DEV_PATH.clone();
    let glob_files = vec!["lazy/**/*"];
    let js_instance_thread = std::thread::spawn(move || common_helperfuncs::run_swc(&c, &d, glob_files));

    let e = crate::CLIENT_MAIN_SRC_PATH.clone() + "lazy/";
    let f = crate::CLIENT_OUTPUT_DEV_PATH.clone() + "lazy/";
    let client_deep_copy_html_css = std::thread::spawn(move || common_helperfuncs::copy_deep(&e, &f, "**/*", "**/*.ts"));

    let g = crate::INSTANCE_CLIENT_PATH.clone() + "lazy/";
    let h = crate::INSTANCE_CLIENT_OUTPUT_DEV_PATH.clone() + "lazy/";
    let instance_deep_copy_html_css = std::thread::spawn(move || common_helperfuncs::copy_deep(&g, &h, "**/*", "**/*.ts"));

    js_client_thread.join().map_err(|e| anyhow::anyhow!("JS thread panicked: {:?}", e))??;
    js_instance_thread.join().map_err(|e| anyhow::anyhow!("JS thread panicked: {:?}", e))??;
    client_deep_copy_html_css.join().map_err(|e| anyhow::anyhow!("Lazy deep copy html and css panicked: {:?}", e))??;
    instance_deep_copy_html_css.join().map_err(|e| anyhow::anyhow!("Lazy deep copy html and css panicked: {:?}", e))??;

    Ok(())
}




pub fn handle_corelazy() -> Result<()> {

    let _ = handle_core();
    let _ = handle_lazy();

    Ok(())
}



fn handle_symlinks() -> Result<()> {

    let defs_server         = crate::SERVER_MAIN_SRC_PATH.clone() + "defs_server.ts";
    let defs_server_symlink = crate::CLIENT_MAIN_SRC_PATH.clone() + "defs_server_symlink.ts";
    match std::os::unix::fs::symlink(&defs_server, &defs_server_symlink) {
        Ok(_) => (), Err(_) => (),
    }

    let defs_instance_server = crate::INSTANCE_SERVER_PATH.clone() + "defs_instance_server.ts";
    let defs_instance_server_symlink = crate::INSTANCE_CLIENT_PATH.clone() + "defs_instance_server_symlink.ts";
    match std::os::unix::fs::symlink(&defs_instance_server, &defs_instance_server_symlink) {
        Ok(_) => (), Err(_) => (),
    }

    Ok(())
}




fn handle_manifest() -> Result<ManifestT> {

    let manifest_in_path          = crate::CLIENT_MAIN_SRC_PATH.clone() + "app.webmanifest";
    let manifest_instance_in_path = crate::INSTANCE_CLIENT_PATH.clone() + "app_instance.webmanifest";
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




fn handle_indexhtml(manifestname:&str) -> Result<()> {

    let index_in_path           = crate::CLIENT_MAIN_SRC_PATH.clone() + "index.html";
    let index_out_path          = crate::CLIENT_OUTPUT_DEV_PATH.clone() + "index.html";

    let index    = fs::read_to_string(index_in_path).expect("read error");
    let index = index.replace("<title></title>", &format!("<title>{}</title>", manifestname));
    fs::write(index_out_path, index).expect("write error");

    Ok(())
}




fn handle_mainjs() -> Result<()> {

    let mainjs_in_path           = crate::CLIENT_OUTPUT_DEV_PATH.clone() + "main.js";

    let mainjs = fs::read_to_string(&mainjs_in_path).expect("read error");
    let mainjs = mainjs.replace("//{--main_instance.js--}", "import INSTANCE from './instance/main_instance.js';");
    fs::write(&mainjs_in_path, mainjs).expect("mainjs write error");

    Ok(())
}




fn handle_primary_css_files() -> Result<()> {

    // may do more with css, like parsing for specific things (like fonts and sprite sheets and sucking in instance css in the furture

    let index_in_path           = crate::CLIENT_MAIN_SRC_PATH.clone() + "index.css";
    let index_out_path          = crate::CLIENT_OUTPUT_DEV_PATH.clone() + "index.css";
    let main_in_path            = crate::CLIENT_MAIN_SRC_PATH.clone() + "main.css";
    let main_out_path           = crate::CLIENT_OUTPUT_DEV_PATH.clone() + "main.css";

    fs::copy(&index_in_path, &index_out_path)?;
    fs::copy(&main_in_path, &main_out_path)?;

    Ok(())
}




fn handle_instance_entry() -> Result<()> {

    let entry_in                = crate::INSTANCE_CLIENT_PATH.clone() + "entry/";
    let entry_out               = crate::INSTANCE_CLIENT_OUTPUT_DEV_PATH.clone() + "entry/";

    std::fs::create_dir_all(entry_out.clone())?;
    std::fs::copy(entry_in.clone() + "index.html", entry_out.clone() + "index.html")?;
    std::fs::copy(entry_in.clone() + "index.css", entry_out.clone() + "index.css")?;

    common_helperfuncs::run_swc(&entry_in, &entry_out, vec!["*.ts"])?;

    Ok(())
}




pub fn handle_file_changed(changed_file:&str) -> Result<()> {

    let file_meta = handlefile::file_changed(changed_file)?;

    if matches!(file_meta.action, handlefile::FileActionE::Core)  {
        let _ = handle_core();
    } else if matches!(file_meta.action, handlefile::FileActionE::ThirdParty) {
        let _ = thirdparty::runit();
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




