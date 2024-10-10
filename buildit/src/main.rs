
use anyhow::Result;
use std::env;
//use std::fs;
use std::sync::LazyLock;


//mod setinstance;
//mod lazy;

mod dev;
 





static MAIN_PATH: LazyLock<String> = LazyLock::new(|| env::var("NIFTY_DIR").expect("NIFTY_DIR env var not set"));
static INSTANCE_SERVER_PATH: LazyLock<String> = LazyLock::new(|| env::var("NIFTY_INSTANCE_SERVER_DIR").expect("NIFTY_INSTANCE_SERVER_DIR env var not set"));
static INSTANCE_CLIENT_PATH: LazyLock<String> = LazyLock::new(|| env::var("NIFTY_INSTANCE_CLIENT_DIR").expect("NIFTY_INSTANCE_CLIENT_DIR env var not set"));

static CLIENT_MAIN_SRC_PATH: LazyLock<String> = LazyLock::new(|| MAIN_PATH.clone() + "client/");
static CLIENT_OUTPUT_DEV_PATH: LazyLock<String> = LazyLock::new(|| MAIN_PATH.clone() + "server/static_dev/");
static CLIENT_OUTPUT_DIST_PATH: LazyLock<String> = LazyLock::new(|| MAIN_PATH.clone() + "server/static_dist/");
 
static SERVER_MAIN_PATH: LazyLock<String> = LazyLock::new(|| MAIN_PATH.clone() + "server/");
static SERVER_MAIN_SRC_PATH: LazyLock<String> = LazyLock::new(|| MAIN_PATH.clone() + "server/src/");
static SERVER_BUILD_PATH: LazyLock<String> = LazyLock::new(|| MAIN_PATH.clone() + "server/build/");

static INSTANCE_CLIENT_OUTPUT_DEV_PATH: LazyLock<String> = LazyLock::new(|| CLIENT_OUTPUT_DEV_PATH.clone() +  "instance/");
static INSTANCE_CLIENT_OUTPUT_DIST_PATH: LazyLock<String> = LazyLock::new(|| CLIENT_OUTPUT_DIST_PATH.clone() +  "instance/");

static INSTANCE_SERVER_OUTPUT_DEV_PATH: LazyLock<String> = LazyLock::new(|| SERVER_BUILD_PATH.clone() +  "instance/");
static INSTANCE_SERVER_OUTPUT_DIST_PATH: LazyLock<String> = LazyLock::new(|| SERVER_BUILD_PATH.clone() +  "instance/");


//const IGNORE_ON_RSYNC_MAIN:[&str; 8] = [".*", "**/*.ts", "**/CHANGELOG.md", "**/alwaysload", "app_xtend.webmanifest", "app.webmanifest", "**/media", "index.html"];





fn main() {

    let args: Vec<String> = env::args().collect();

    if args.len() < 2 {
        println!("No arguments provided");
        return;
    }

    let primary_action = &args[1];
    let primary_action_aux  = if args.len() >= 3 { &args[2] } else { "" };

    reset_dev_dirs().expect("Unable to reset directories");

    match primary_action.as_str() {

        //"alldev" => {    let _ = all(&instance);   },

        "core" => {   let _ = dev::runit();   },

        //"lazy" => {   let _ = lazy::runit(&instance);   },

        //"corelazy" => {   let _ = core::runit();   let _ = lazy::runit(&instance);   },

        "thirdparty" => {   let _ = dev::thirdparty::runit();   },

        "media" => {  let _ = dev::media::runit();   },

        "iconsfont" => {  let _ = dev::media::iconsfont();   },

        "server" => { let _ = dev::server::runit();   },

        //"dist" => { let _ = dist::dist(&instance);   },

        "file" => { let _ = dev::update_file::runit(&primary_action_aux);   },

        _ => {   println!("Invalid argument");   }
    }
}




fn reset_dev_dirs() -> Result<()> {

    let _xx = std::fs::remove_dir_all(CLIENT_OUTPUT_DEV_PATH.clone());
    let _yy = std::fs::remove_dir_all(SERVER_BUILD_PATH.clone());

    std::fs::create_dir_all(CLIENT_OUTPUT_DEV_PATH.clone())?;
    std::fs::create_dir_all(SERVER_BUILD_PATH.clone())?;
    std::fs::create_dir_all(INSTANCE_CLIENT_OUTPUT_DEV_PATH.clone())?;

    Ok(())
}


/*
fn all() -> Result<()> {

    reset_dev_dirs()?;

    mediafiles::files(&instance)?;
    mediafiles::iconsfont(&instance)?;
    core::runit()?;
    thirdpartyfiles::thirdpartyfiles(&instance)?;
    lazy::runit(&instance)?;
    serverfiles::serverfiles(&instance)?;

    Ok(())
}
*/
