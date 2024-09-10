
use std::env;
use anyhow::Result;
use std::process::Command;

use crate::helperutils;




pub fn runit(instance:&str) -> Result<()> {

    let dir = env::var("NIFTY_DIR").expect("Unable to get NIFTY_DIR environment variable");

    let main_in_path_str = format!("{}{}", crate::CLIENT_MAIN_SRC_PATH, "lazy");
    let instance_in_path_str = format!("{}{}{}{}", crate::CLIENT_MAIN_SRC_PATH, crate::CLIENT_PREFIX, instance, "/lazy");

    let out_path_str = format!("{}", crate::CLIENT_OUTPUT_DEV_PATH);

    std::fs::create_dir_all(format!("{}{}", dir, out_path_str))?;
    std::fs::create_dir_all(format!("{}{}", dir, out_path_str))?;

    let swc_a_commandargs = swc_args(&instance, &main_in_path_str, &out_path_str)?;
    let swc_b_commandargs = swc_args(&instance, &instance_in_path_str, &out_path_str)?;

    let mut swc_a = Command::new("npx").args(swc_a_commandargs).current_dir(&dir).spawn().expect("swc chucked an error");
    let mut swc_b = Command::new("npx").args(swc_b_commandargs).current_dir(&dir).spawn().expect("swc chucked an error");

    let mut flg = false;

    while !flg {
        let swc_a_r = swc_a.try_wait().unwrap();
        let swc_b_r = swc_b.try_wait().unwrap();

        if swc_a_r.is_some() && swc_b_r.is_some() {
            println!("swc done");
            flg = true;
        }
    } 

    Ok(())
}




fn swc_args(instance:&str, clp:&str, clo:&str) -> Result<Vec<String>> {

    let dir = env::var("NIFTY_DIR").expect("Unable to get NIFTY_DIR environment variable");

    let o_p = clp.trim_end_matches('/').to_string();
    let o_m = clo.trim_end_matches('/').to_string();

    let mut commandargs:Vec<String> = vec![
        String::from("swc"), 
        String::from(o_p), 
        String::from("-d"), 
        String::from(&o_m), 
        String::from("-D"),
        String::from("--strip-leading-paths"),
    ];

    let y = format!("{}{}", dir, clp);
    let ignores = helperutils::instance_ignores(&instance, &y, "ignore", crate::CLIENT_PREFIX, false)?;

    commandargs.extend(ignores);

    Ok(commandargs)
}







