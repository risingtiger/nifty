
use std::io::Result;
use regex::Regex;
//use std::env;
use std::fs;
//use std::path::Path;
use std::process::Command;




pub fn setinstance(set_instance_to:&str) -> Result<()> {


    // ZPROFILE ENVIRONMENT VARIABLE

    let zprofilepath = "/Users/dave/.zprofile";

    let x = fs::read_to_string(&zprofilepath).unwrap();

    let re = Regex::new(r#"NIFTY_INSTANCE="[a-z]+""#).unwrap();
    let y = re.replace(&x, format!("NIFTY_INSTANCE=\"{}\"", set_instance_to).as_str()).to_string();

    fs::write(&zprofilepath, y).unwrap();


    // END ZPROFILE ENVIRONMENT VARIABLE



    // SERVER INDEX

    let serverindexpath = format!("{}{}{}", crate::ABSOLUTE_PATH, crate::SERVER_MAIN_SRC_PATH, "index.ts");

    let x = fs::read_to_string(&serverindexpath).unwrap();

    let re = Regex::new(r#"./server_[a-z]+/index_extend.js"#).unwrap();
    let y = re.replace(&x, format!("./server_{}/index_extend.js", set_instance_to).as_str()).to_string();

    fs::write(&serverindexpath, y).unwrap();

    // END SERVER INDEX



    // CLIENT MAIN

    let clientmainpath = format!("{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_MAIN_SRC_PATH, "main.ts");

    let x = fs::read_to_string(&clientmainpath).unwrap();

    let re = Regex::new(r#"./client_[a-z]+/main_xtend.js"#).unwrap();
    let y = re.replace(&x, format!("./client_{}/main_xtend.js", set_instance_to).as_str()).to_string();

    fs::write(&clientmainpath, y).unwrap();

    // END SERVER INDEX


    println!("Remember to run 'source ~/.zprofile' to update the environment variable.");


    Ok(())
}








