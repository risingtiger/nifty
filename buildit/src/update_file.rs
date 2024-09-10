
use anyhow::Result;
use std::env;
use std::path::Path;
use std::process::{Command, Stdio};

use crate::core;


pub fn runit(instance:&str, filepath: &str) -> Result<()> {

    if filepath == "" {

        let _ = println!("missing arguments to file");   

    } else { 
        
        let instance_client_lazy_path = format!("{}{}{}{}", "client/", crate::CLIENT_PREFIX, instance, "/lazy/");
        
        let mut filetype = "";
        let mut fpath = "";

        if filepath.starts_with("server/src/") {
            filetype = "server";
            fpath = &filepath[11..]

        } else if filepath.starts_with("client/lazy/") || filepath.starts_with(&instance_client_lazy_path) {
            filetype = "lazy";
            fpath = &filepath[7..]

        } else if filepath.starts_with("client/") && (filepath.contains(".ts") || filepath.contains(".css") || filepath.contains(".html")) {
            filetype = "main";
            fpath = "dummypath/dummy.ts"

        } else {
            let _ = println!("invalid argument to file");
        }

        let p = Path::new(fpath);
        println!("p {:?}", p);

        let directory = p.parent().unwrap().to_str().unwrap();
        let stem = p.file_stem().unwrap().to_str().unwrap();
        let extension = p.extension().unwrap().to_str().unwrap();

        match filetype {
            "main" => { let _ = core::runit(instance); },
            "lazy" => { let _ = lazy(&directory, &stem, &extension); },
            "server" => { let _ = server(&directory, &stem, &extension); },
            _ => { let _ = println!("invalid argument to file"); }
        }
    }

    Ok(())
}

/*
pub fn _runit(instance:&str, filetype: &str, filepath: &str) -> Result<()> {

    if filetype == "" || filepath == "" {

        let _ = println!("missing arguments to file");   

    } else { 

        let splitstr = match filetype {
            "main" => format!("{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_MAIN_SRC_PATH),
            "lazy" => format!("{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_MAIN_SRC_PATH),
            "server" => format!("{}{}", crate::ABSOLUTE_PATH, crate::SERVER_MAIN_SRC_PATH),
            _ => { let _ = println!("invalid argument to file"); "".to_string() }
        };

        let f = filepath.split(&splitstr).last().unwrap();

        let p = Path::new(f);

        let directory = p.parent().unwrap().to_str().unwrap();
        let stem = p.file_stem().unwrap().to_str().unwrap();
        let extension = p.extension().unwrap().to_str().unwrap();

        match filetype {
            "main" => { let _ = core::runit(instance); },
            "lazy" => { let _ = lazy(&directory, &stem, &extension); },
            "server" => { let _ = server(&directory, &stem, &extension); },
            _ => { let _ = println!("invalid argument to file"); }
        }
    }

    Ok(())
}
*/




/*
pub fn main(directory:&str, stem: &str, extension: &str, instance:&str) -> Result<()> {

    let output_file_extension = if extension == "ts" { "js" } else { extension };

    let client_file_path = format!("{}{}{}{}{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_MAIN_SRC_PATH, directory, "/", stem, ".", extension);
    let output_file_path = format!("{}{}{}{}{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DEV_PATH, directory, "/", stem, ".", output_file_extension);

    if (directory == "" && stem.contains("index") && extension == "html") || extension == "webmanifest" {
        //let _ =  index_and_manifest::index_and_manifest(&instance, 0);

    } else {

        match extension {
            "ts" => { let _ = update_file_ts(&client_file_path, &output_file_path); },
            "css" =>  { let _ = update_file_css(&client_file_path, &output_file_path); },
            "html" => { let _ = update_file_html(&client_file_path, &output_file_path); },
            _ => { println!("invalid extension"); }
        }
    }

    Ok(())
}
*/




pub fn lazy(directory:&str, stem: &str, extension: &str) -> Result<()> {

    let dir = env::var("NIFTY_DIR").expect("Unable to get NIFTY_DIR environment variable");

    let output_file_extension = if extension == "ts" { "js" } else { extension };

    let client_file_path = format!("{}{}{}{}{}{}{}", dir, crate::CLIENT_MAIN_SRC_PATH, directory, "/", stem, ".", extension);
    let output_file_path = format!("{}{}{}{}{}{}{}", dir, crate::CLIENT_OUTPUT_DEV_PATH, directory, "/", stem, ".", output_file_extension);

    println!("client_file_path {}", client_file_path);
    println!("output_file_path {}", output_file_path);

    match extension {
        "ts" => { let _ = update_file_ts(&client_file_path, &output_file_path); },
        "css" =>  { let _ = update_file_css(&client_file_path, &output_file_path); },
        "html" => { let _ = update_file_html(&client_file_path, &output_file_path); },
        _ => { println!("invalid extension"); }
    }

    Ok(())
}




pub fn server(directory:&str, stem: &str, extension: &str) -> Result<()> {

    let dir = env::var("NIFTY_DIR").expect("Unable to get NIFTY_DIR environment variable");

    let output_file_extension = if extension == "ts" { "js" } else { extension };

    let server_file_path = format!("{}{}{}{}{}{}{}", dir, crate::SERVER_MAIN_SRC_PATH, directory, "/", stem, ".", extension);
    let output_file_path = format!("{}{}{}{}{}{}{}", dir, crate::SERVER_BUILD_PATH, directory, "/", stem, ".", output_file_extension);

    println!("server_file_path {}", server_file_path);
    println!("output_file_path {}", output_file_path);

    match extension {
        "ts" => { let _ = update_file_ts(&server_file_path, &output_file_path); },
        _ => { println!("Server update file only TS files "); }
    }

    Ok(())
}









fn update_file_ts(cp: &str, op: &str) -> Result<()> {

    let dir = env::var("NIFTY_DIR").expect("Unable to get NIFTY_DIR environment variable");

    let _swc = Command::new("npx").arg("swc").args([&cp, "-o", &op]).current_dir(dir).stdout(Stdio::piped()).output().expect("swc chucked an error");
    Ok(())
}




fn update_file_css(cp: &str, op: &str) -> Result<()> {

    let dir = env::var("NIFTY_DIR").expect("Unable to get NIFTY_DIR environment variable");

    let _swc = Command::new("cp").arg(&cp).arg(&op).current_dir(dir).output().expect("cp on css chucked an error");
    Ok(())
}




fn update_file_html(cp: &str, op: &str) -> Result<()> {

    let dir = env::var("NIFTY_DIR").expect("Unable to get NIFTY_DIR environment variable");

    let _swc = Command::new("cp").arg(&cp).arg(&op).current_dir(dir).output().expect("cp on html chucked an error");
    Ok(())
}










