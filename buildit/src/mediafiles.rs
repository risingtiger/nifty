
use std::io::Result;
use std::process::Command;





pub fn files(instance:&str) -> Result<()> {

    let cc = format!("{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_MAIN_SRC_PATH, "media/");
    let ic = format!("{}{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_INSTANCE_SRC_PREFIX, &instance, "/media/");

    let co = format!("{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DEV_PATH, "media");
    let io = format!("{}{}{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DEV_PATH, "client_", &instance, "/media");

    let _rsync = Command::new("rsync").args(["-r", &cc, &co]).output().expect("rsync chucked an error on main media");
    let _rsync = Command::new("rsync").args(["-r", &ic, &io]).output().expect("rsync chucked an error on main media");

    Ok(())
}




pub fn iconsfont(_instance:&str) -> Result<()> {

    let ci = format!("{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_MAIN_SRC_PATH, "media/icons");
    //let oi = format!("{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DEV_PATH, "media/icons");

    let fantasticonargs = ["fantasticon", &ci, "-n", "icons", "-t", "woff2", "-o", &ci];
    let _fantasticon = Command::new("npx").args(fantasticonargs).output().expect("rsync chucked an error on main media");

    Ok(())
}
