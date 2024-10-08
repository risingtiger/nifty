
use anyhow::Result;
use std::env;
use std::fs;
use lazy_static::lazy_static;


mod setinstance;
mod lazy;
mod thirdpartyfiles;
mod mediafiles;
mod serverfiles;
mod dist;
mod dist2;
mod update_file;
mod core;
mod helperutils;


lazy_static! {
    static ref CLIENT_PREFIX: String = env::var("CLIENT_PREFIX").unwrap_or_else(|_| "client_".to_string());
    static ref SERVER_PREFIX: String = env::var("SERVER_PREFIX").unwrap_or_else(|_| "server_".to_string());
}

const CLIENT_PREFIX: &str = "client_";
const SERVER_PREFIX: &str = "server_";

const CLIENT_MAIN_SRC_PATH: &str = "client/";
const CLIENT_INSTANCE_SRC_PREFIX: &str = "client/client_";
const CLIENT_OUTPUT_DEV_PATH: &str = "server/static_dev/";
const CLIENT_OUTPUT_DIST_PATH: &str = "server/static_dist/";

const SERVER_MAIN_PATH: &str = "server/";
const SERVER_MAIN_SRC_PATH: &str = "server/src/";
const SERVER_BUILD_PATH: &str = "server/build/";

//const IGNORE_ON_RSYNC_MAIN:[&str; 8] = [".*", "**/*.ts", "**/CHANGELOG.md", "**/alwaysload", "app_xtend.webmanifest", "app.webmanifest", "**/media", "index.html"];





fn main() {

    let instance = env::var("NIFTY_INSTANCE").unwrap_or("".to_string());

    let args: Vec<String> = env::args().collect();
    let primary_action = &args[1];
    let primary_action_aux  = if args.len() >= 3 { &args[2] } else { "" };

    match primary_action.as_str() {

        "instance" => { let _ = setinstance::setinstance();   },

        "alldev" => {    let _ = all(&instance);   },

        "core" => {   let _ = core::runit(&instance);   },

        "lazy" => {   let _ = lazy::runit(&instance);   },

        "corelazy" => {   let _ = core::runit(&instance);   let _ = lazy::runit(&instance);   },

        "thirdparty" => {   let _ = thirdpartyfiles::thirdpartyfiles(&instance);   },

        "mediafiles" => {  let _ = mediafiles::files(&instance);   },

        "mediaiconsfont" => {  let _ = mediafiles::iconsfont(&instance);   },

        "server" => { let _ = serverfiles::serverfiles(&instance);   },

        "dist" => { let _ = dist::dist(&instance);   },

        "file" => { let _ = update_file::runit(&instance, &primary_action_aux);   },

        _ => {   println!("Invalid argument");   }
    }
}




fn all(instance:&str) -> Result<()> {

    let dir = env::var("NIFTY_DIR").expect("Unable to get NIFTY_DIR environment variable");

    let x = format!("{}{}", dir, CLIENT_OUTPUT_DEV_PATH);
    let y = format!("{}{}", dir, SERVER_BUILD_PATH);

    let xx = std::fs::remove_dir_all(&x);
    if xx.is_err() {   println!("output dev folder is already removed.");   }

    let yy = std::fs::remove_dir_all(&y);
    if yy.is_err() {   println!("output build folder is already removed.");   }

    std::fs::create_dir_all(&x)?;
    std::fs::create_dir_all(&y)?;


    mediafiles::files(&instance)?;
    mediafiles::iconsfont(&instance)?;
    core::runit(&instance)?;
    thirdpartyfiles::thirdpartyfiles(&instance)?;
    lazy::runit(&instance)?;
    serverfiles::serverfiles(&instance)?;

    Ok(())
}

