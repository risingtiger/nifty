
use anyhow::Result;
//use std::env;
use std::process::Command;
//use glob::glob;
use std::path::Path;
use std::fs;
use walkdir::WalkDir;

use crate::common_helperfuncs;




pub fn runit() -> Result<()> {

    let a = crate::CLIENT_MAIN_SRC_PATH.clone() + "media/";
    let b = crate::CLIENT_OUTPUT_DEV_PATH.clone() + "media/";
    let client_deep_copy_media = std::thread::spawn(move || crate::common_helperfuncs::copy_deep(&a, &b, "icons/**/*"));

    let d = crate::INSTANCE_CLIENT_PATH.clone() + "media/";
    let e = crate::INSTANCE_CLIENT_OUTPUT_DEV_PATH.clone() + "media/";
    let instance_deep_copy_media = std::thread::spawn(move || crate::common_helperfuncs::copy_deep(&d, &e, "icons/**/*"));

    //let iconsfont_thread = std::thread::spawn(move || iconsfont());

    client_deep_copy_media.join().map_err(|e| anyhow::anyhow!("Lazy deep copy media panicked: {:?}", e))??;
    instance_deep_copy_media.join().map_err(|e| anyhow::anyhow!("Lazy deep copy media panicked: {:?}", e))??;
    //iconsfont_thread.join().map_err(|e| anyhow::anyhow!("Iconsfont media panicked: {:?}", e))??;

    //let _ = iconsfont();

    Ok(())
}




pub fn iconsfont() -> Result<()> {

    let media_in_path              = format!("{}{}", crate::CLIENT_MAIN_SRC_PATH.clone(), "media/");
    let icons_in_path              = format!("{}{}", media_in_path, "icons/");
    let icons_out_path             = format!("{}{}", media_in_path, "iconsfont/");

    fs::create_dir_all(&icons_out_path)?;

    let fantasticonargs = ["fantasticon", &icons_in_path, "-n", "icons", "-t", "woff2", "-o", &icons_out_path];
    let _fantasticon    = Command::new("npx").args(fantasticonargs).output().expect("iconsfont fantasticon chucked an error on main media");


    Ok(())
}




/* replaced by common_helperfuncs::copy_deep

fn copy_deep(src_path:&str, dest_path:&str) -> Result<()> {

    let source_folder = Path::new(src_path);
    let destination_folder = Path::new(dest_path);

    fs::create_dir_all(&destination_folder)?;

    for entry in WalkDir::new(&source_folder) {
        let entry = entry?;
        let path = entry.path();

        if path.is_dir() {
            if path.file_name().map(|name| name == "icons").unwrap_or(false) 
               && path.parent() == Some(source_folder) {
                continue; // Skip the "icons" directory only if it's at the top level
            }
        } else if path.is_file() {
            if let Some(_ext) = path.extension().and_then(|e| e.to_str()) {

                if path.parent().unwrap().file_name().map(|p| p == "icons").unwrap_or(false)  
                    && path.parent().unwrap().parent() == Some(source_folder) {
                    continue; // Skip files in the top level icons directory
                }

                let relative_path = path.strip_prefix(&source_folder).unwrap();

                let destination_path = destination_folder.join(relative_path);

                if let Some(parent) = destination_path.parent() {
                    fs::create_dir_all(parent)?;
                }

                fs::copy(&path, &destination_path)?;
            }
        }
    }

    Ok(())
}
*/



