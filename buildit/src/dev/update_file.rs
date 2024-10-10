
use anyhow::Result;
use std::env;
use std::fs;
use std::path::Path;
use std::process::{Command, Stdio};



enum FileType {
    ClientTs,
    ServerTs,
    Css,
    Html,
    WebManifest,
    Media,
}

pub fn runit(filepath: &str) -> Result<()> {

    if filepath == "" {
        let _ = println!("missing arguments to file");   
        return Ok(());
    }    

    let client_path_str              = crate::CLIENT_MAIN_SRC_PATH.clone();
    let instance_client_path_str     = crate::INSTANCE_CLIENT_PATH.clone();
    let server_path_str              = crate::SERVER_MAIN_SRC_PATH.clone();
    let instance_server_path_str     = crate::INSTANCE_SERVER_PATH.clone();


    let file_path                    = Path::new(filepath);

    let client_path                  = Path::new(&client_path_str);
    let instance_client_path         = Path::new(&instance_client_path_str);
    let server_path                  = Path::new(&server_path_str);
    let instance_server_path         = Path::new(&instance_server_path_str);

    let client_path_dirname          = client_path.file_name().unwrap().to_str().expect("Unable to get client path dirname");
    let instance_client_path_dirname = instance_client_path.file_name().unwrap().to_str().expect("Unable to get instance client path dirname");
    let server_path_dirname          = server_path.file_name().unwrap().to_str().expect("Unable to get server path dirname");
    let instance_server_path_dirname = instance_server_path.file_name().unwrap().to_str().expect("Unable to get instance server path dirname");

    let mut _is_instance   = false;
    let mut full_in_path  = String::new();
    let mut full_out_path = String::new();

    let file_extension = file_path.extension().unwrap().to_str().unwrap();

    if file_path.starts_with(client_path_dirname) {
        _is_instance = false;
        full_in_path = format!("{}{}", crate::CLIENT_MAIN_SRC_PATH.clone(), file_path.strip_prefix(client_path_dirname).unwrap().to_str().unwrap());
        full_out_path = format!("{}{}", crate::CLIENT_OUTPUT_DEV_PATH.clone(), file_path.strip_prefix(client_path_dirname).unwrap().to_str().unwrap());

    } else if file_path.starts_with(instance_client_path_dirname) {
        _is_instance = true;
        full_in_path = format!("{}{}", crate::INSTANCE_CLIENT_PATH.clone(), file_path.strip_prefix(instance_client_path_dirname).unwrap().to_str().unwrap());
        full_out_path = format!("{}{}", crate::INSTANCE_CLIENT_OUTPUT_DEV_PATH.clone(), file_path.strip_prefix(instance_client_path_dirname).unwrap().to_str().unwrap());

    } else if file_path.starts_with(server_path_dirname) {
        _is_instance = false;
        full_in_path = format!("{}{}", crate::SERVER_MAIN_SRC_PATH.clone(), file_path.strip_prefix(server_path_dirname).unwrap().to_str().unwrap());
        full_out_path = format!("{}{}", crate::SERVER_BUILD_PATH.clone(), file_path.strip_prefix(server_path_dirname).unwrap().to_str().unwrap());

    } else if file_path.starts_with(instance_server_path_dirname) {
        _is_instance = true;
        full_in_path = format!("{}{}", crate::INSTANCE_SERVER_PATH.clone(), file_path.strip_prefix(instance_server_path_dirname).unwrap().to_str().unwrap());
        full_out_path = format!("{}{}", crate::INSTANCE_SERVER_OUTPUT_DEV_PATH.clone(), file_path.strip_prefix(instance_server_path_dirname).unwrap().to_str().unwrap());

    } else {
        let _ = println!("invalid argument to file");
    }



    let file_type: FileType = match file_extension {

        "ts"   => {
            if file_path.starts_with(server_path_dirname) || file_path.starts_with(instance_server_path_dirname) {
                FileType::ServerTs
            } else if file_path.starts_with(client_path_dirname) || file_path.starts_with(instance_client_path_dirname) {
                FileType::ClientTs
            } else {
                println!("invalid argument to file");
                return Ok(());
            }
        },
        "css"         => FileType::Css,
        "html"        => FileType::Html,
        "webmanifest" => FileType::WebManifest,
        _             => FileType::Media,
    };


    let full_out_path_parent = Path::new(&full_out_path).parent().unwrap();
    std::fs::create_dir_all(full_out_path_parent)?;


    if matches!(file_type, FileType::ClientTs) {
        let _ = handle_client_single_js(&full_in_path, &full_out_path);

    } else if matches!(file_type, FileType::ServerTs) {
        //let _ = update_file_ts(&full_in_path, &full_out_path);

    } else if matches!(file_type, FileType::Css) {
        let _ = handle_client_single_gen_file(&full_in_path, &full_out_path);

    } else if matches!(file_type, FileType::Html) {
        let _ = handle_client_single_gen_file(&full_in_path, &full_out_path);

    } else if matches!(file_type, FileType::Media) {
        let _ = handle_client_single_gen_file(&full_in_path, &full_out_path);

    } else if matches!(file_type, FileType::WebManifest) {
        let _ = println!("Doing nothing with webmanifest");

    } else {
        let _ = println!("invalid argument to file");
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




fn handle_client_single_js(src_file:&str, dest_file:&str) -> Result<()> {
    let _swc = Command::new("npx").arg("swc").args([src_file, "-o", dest_file]).stdout(Stdio::piped()).output().expect("swc chucked an error");
    Ok(())
}




fn handle_client_single_gen_file(src_file:&str, dest_file:&str) -> Result<()> {
    fs::copy(&src_file, &dest_file)?;
    Ok(())
}




/*
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

*/








