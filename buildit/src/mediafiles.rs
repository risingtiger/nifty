
use anyhow::Result;
use std::env;
use std::process::Command;





pub fn files(instance:&str) -> Result<()> {

    let dir = env::var("NIFTY_DIR").expect("Unable to get NIFTY_DIR environment variable");

    let cc = format!("{}{}{}", dir, crate::CLIENT_MAIN_SRC_PATH, "media/");
    let ic = format!("{}{}{}{}", dir, crate::CLIENT_INSTANCE_SRC_PREFIX, &instance, "/media/");

    let co = format!("{}{}{}", dir, crate::CLIENT_OUTPUT_DEV_PATH, "media");
    let io = format!("{}{}{}{}{}", dir, crate::CLIENT_OUTPUT_DEV_PATH, "client_", &instance, "/media");

    let _rsync = Command::new("rsync").args(["-r", &cc, &co]).output().expect("rsync chucked an error on main media");
    let _rsync = Command::new("rsync").args(["-r", &ic, &io]).output().expect("rsync chucked an error on main media");

    Ok(())
}




pub fn iconsfont(_instance:&str) -> Result<()> {

    let dir = env::var("NIFTY_DIR").expect("Unable to get NIFTY_DIR environment variable");

    let ci = format!("{}{}{}", dir, crate::CLIENT_MAIN_SRC_PATH, "media/icons");
    //let oi = format!("{}{}{}", dir, crate::CLIENT_OUTPUT_DEV_PATH, "media/icons");

    let fantasticonargs = ["fantasticon", &ci, "-n", "icons", "-t", "woff2", "-o", &ci];
    let _fantasticon = Command::new("npx").args(fantasticonargs).output().expect("rsync chucked an error on main media");

    Ok(())
}
