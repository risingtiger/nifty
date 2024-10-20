
use std::env;
use std::sync::LazyLock;


//mod setinstance;
//mod lazy;

mod dev;
mod dist;
mod common_helperfuncs;
 





static MAIN_PATH: LazyLock<String> = LazyLock::new(|| env::var("NIFTY_DIR").expect("NIFTY_DIR env var not set"));
static INSTANCE_SERVER_PATH: LazyLock<String> = LazyLock::new(|| env::var("NIFTY_INSTANCE_SERVER_DIR").expect("NIFTY_INSTANCE_SERVER_DIR env var not set"));
static INSTANCE_CLIENT_PATH: LazyLock<String> = LazyLock::new(|| env::var("NIFTY_INSTANCE_CLIENT_DIR").expect("NIFTY_INSTANCE_CLIENT_DIR env var not set"));

static CLIENT_MAIN_SRC_PATH: LazyLock<String> = LazyLock::new(|| MAIN_PATH.clone() + "client/");
static CLIENT_OUTPUT_DEV_PATH: LazyLock<String> = LazyLock::new(|| MAIN_PATH.clone() + "server/static_dev/");
static CLIENT_OUTPUT_DIST_PATH: LazyLock<String> = LazyLock::new(|| MAIN_PATH.clone() + "server/static_dist/");
 
static SERVER_MAIN_SRC_PATH: LazyLock<String> = LazyLock::new(|| MAIN_PATH.clone() + "server/src/");
static SERVER_BUILD_PATH: LazyLock<String> = LazyLock::new(|| MAIN_PATH.clone() + "server/build/");

static INSTANCE_CLIENT_OUTPUT_DEV_PATH: LazyLock<String> = LazyLock::new(|| CLIENT_OUTPUT_DEV_PATH.clone() +  "instance/");
static INSTANCE_CLIENT_OUTPUT_DIST_PATH: LazyLock<String> = LazyLock::new(|| CLIENT_OUTPUT_DIST_PATH.clone() +  "instance/");
static INSTANCE_DIR_NAME: LazyLock<String> = LazyLock::new(|| "instance/".to_string());
static INSTANCE_SERVER_OUTPUT_DEV_PATH: LazyLock<String> = LazyLock::new(|| SERVER_BUILD_PATH.clone() +  "instance/");

static TMP_PATH: LazyLock<String> = LazyLock::new(|| "/tmp/niftybuildit/".to_string());




fn main() {

    let args: Vec<String> = env::args().collect();

    if args.len() < 2 {
        println!("No arguments provided");
        return;
    }

    let primary_action = &args[1];
    let primary_action_aux  = if args.len() >= 3 { &args[2] } else { "" };

    match primary_action.as_str() {

        "alldev" =>     { let _ = dev::alldev();   },

        "core" =>       { let _ = dev::handle_core();   },

        "corelazy" =>   { let _ = dev::handle_corelazy();   },

        "thirdparty" => { let _ = dev::thirdparty::runit();   },

        "media" =>      { let _ = dev::media::runit();   },

        "iconsfont" =>  { let _ = dev::media::iconsfont();   },

        "server" =>     { let _ = dev::server::runit();   },

        "dist" =>       { let _ = dist::runit();   },

        "file" =>       { let _ = dev::handle_file_changed(&primary_action_aux);   },

        _ =>            {   println!("Invalid command line argument");   }
    }
}

