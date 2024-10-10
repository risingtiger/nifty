
use anyhow::Result;
//use std::env;
use std::process::Command;
//use glob::glob;
use std::path::Path;
use std::fs;
use walkdir::WalkDir;





pub fn runit() -> Result<()> {

    println!("Media runit");

    let a = crate::CLIENT_MAIN_SRC_PATH.clone() + "media/";
    let b = crate::CLIENT_OUTPUT_DEV_PATH.clone() + "media/";
    let client_deep_copy_media = std::thread::spawn(move || copy_deep(&a, &b));

    let d = crate::INSTANCE_CLIENT_PATH.clone() + "media/";
    let e = crate::INSTANCE_CLIENT_OUTPUT_DEV_PATH.clone() + "media/";
    let instance_deep_copy_media = std::thread::spawn(move || copy_deep(&d, &e));

    client_deep_copy_media.join().map_err(|e| anyhow::anyhow!("Lazy deep copy media panicked: {:?}", e))??;
    instance_deep_copy_media.join().map_err(|e| anyhow::anyhow!("Lazy deep copy media panicked: {:?}", e))??;

    Ok(())
}




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



/*
pub fn _copy_deep(src_glob_str:&str, src_path:&str, dest_path:&str) -> Result<()> {

    let full_glob_pattern = Path::new(src_path).join(src_glob_str);

    for entry in glob(full_glob_pattern.to_str().unwrap()).expect("Failed to read glob pattern") {

        if let Ok(src_path) = entry {
            let dest = Path::new(dest_path).join(src_path.strip_prefix(Path::new(src_glob_str).parent().unwrap())?);
            
            if let Some(parent) = dest.parent() {
                fs::create_dir_all(parent)?;
            }
            fs::copy(&src_path, &dest)?;
        }
    }
    Ok(())
}
*/




pub fn iconsfont() -> Result<()> {

    let media_in_path              = format!("{}{}", crate::CLIENT_MAIN_SRC_PATH.clone(), "media/");
    let media_out_path             = format!("{}{}", crate::CLIENT_OUTPUT_DEV_PATH.clone(), "media/");
    let icons_in_path              = format!("{}{}", media_in_path, "/icons/");
    let css_index_in_path          = crate::CLIENT_MAIN_SRC_PATH.clone() + "index.css";
    let css_index_out_path         = crate::CLIENT_OUTPUT_DEV_PATH.clone() + "index.css";

    std::fs::create_dir_all(&media_out_path)?;

    let fantasticonargs = ["fantasticon", &icons_in_path, "-n", "icons", "-t", "woff2", "-o", &icons_in_path];
    let _fantasticon    = Command::new("npx").args(fantasticonargs).output().expect("iconsfont fantasticon chucked an error on main media");

    let outfile_str    = format!("--outfile={}", &css_index_out_path);
    let css_index_args = ["esbuild", "--bundle", &css_index_in_path, "--loader:.woff2=dataurl", &outfile_str];
    Command::new("npx").args(&css_index_args).output().expect("css index esbuild chucked an error");

    Ok(())
}



