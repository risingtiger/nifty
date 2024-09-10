
use anyhow::Result;
use std::env;
use std::process::Command;


use crate::helperutils::instance_ignores;



pub fn serverfiles(instance:&str) -> Result<()> {

    let dir = env::var("NIFTY_DIR").expect("Unable to get NIFTY_DIR environment variable");

    let sd = format!("{}{}", dir, crate::SERVER_MAIN_SRC_PATH);
    let od = format!("{}{}", dir, crate::SERVER_BUILD_PATH);
    let od = od.trim_end_matches('/').to_string();

    let mut commandargs:Vec<String> = vec![
        String::from("swc"), 
        String::from(&sd), 
        String::from("-d"), 
        String::from(&od), 
        String::from("--strip-leading-paths")
    ];

    let ignores = instance_ignores(&instance, &sd, "ignore", crate::SERVER_PREFIX, false)?;

    commandargs.extend(ignores);

    let mut swc = Command::new("npx").args(commandargs).current_dir(format!("{}{}", dir, crate::SERVER_MAIN_PATH)).spawn().expect("swc chucked an error");
    swc.wait().expect("swc chucked an error");

    Ok(())
}

