
use anyhow::Result;
use std::process::Command;
use std::fs;





pub fn runit() -> Result<()> {

    let src = crate::CLIENT_MAIN_SRC_PATH.clone() + "media/";
    let dest = crate::CLIENT_OUTPUT_DEV_PATH.clone() + "media/";
    let ignore = src.clone() + "icons/**/*";
    let client_deep_copy_media = std::thread::spawn(move || crate::common_helperfuncs::copy_deep(&src, &dest, "**/*", &ignore));

    let src = crate::INSTANCE_CLIENT_PATH.clone() + "media/";
    let dest = crate::INSTANCE_CLIENT_OUTPUT_DEV_PATH.clone() + "media/";
    let instance_deep_copy_media = std::thread::spawn(move || crate::common_helperfuncs::copy_deep(&src, &dest, "**/*", "_____"));

    client_deep_copy_media.join().map_err(|e| anyhow::anyhow!("Lazy deep copy media panicked: {:?}", e))??;
    instance_deep_copy_media.join().map_err(|e| anyhow::anyhow!("Lazy deep copy media panicked: {:?}", e))??;

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




