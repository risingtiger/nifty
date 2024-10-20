
use anyhow::Result;
use std::path::{Path, PathBuf};
use std::process::Command;



pub enum FileActionE {
    None,
    Core,
    ThirdParty,
}

pub struct GetFileMetaResultT {
    pub action: FileActionE,
}

pub fn file_changed(relative_file_path_str: &str) -> Result<GetFileMetaResultT> {

    let swcrc_path_str         = crate::MAIN_PATH.clone() + ".swcrc";
    let main_path_str          = crate::MAIN_PATH.clone();
    let instance_client_prefix = get_instance_prefix(true)?;
    let instance_server_prefix = get_instance_prefix(false)?;

    let extension              = Path::new(relative_file_path_str).extension().unwrap().to_str().unwrap().to_string();
    let in_path                = Path::new(&(main_path_str.clone() + relative_file_path_str)).to_path_buf();

    let in_path_str            = main_path_str.clone() + relative_file_path_str;


    if  relative_file_path_str.starts_with("client/thirdparty/") || relative_file_path_str.starts_with(&(instance_client_prefix.clone() + "thirdparty/")) {
        return Ok(GetFileMetaResultT { action: FileActionE::ThirdParty });
    }

    else if 
        relative_file_path_str.starts_with("client/alwaysload/") || 
        relative_file_path_str.starts_with(&(instance_client_prefix.clone() + "alwaysload/")) ||
        relative_file_path_str.starts_with("main.ts") ||
        relative_file_path_str.starts_with(&(instance_client_prefix.clone() + "main_instance.ts")) ||
        relative_file_path_str.starts_with("sw.ts") ||
        relative_file_path_str.starts_with("main.css") ||
        relative_file_path_str.starts_with("index.css") {

        return Ok(GetFileMetaResultT { action: FileActionE::Core });
    }

    else if  
        relative_file_path_str.starts_with("client/lazy/") ||  
        relative_file_path_str.starts_with(&(instance_client_prefix.clone() + "lazy/")) {

        let client_out_path = get_client_out_path(true, &relative_file_path_str, &instance_client_prefix, &instance_server_prefix)?;

        if extension == "ts" {
            let js_out    = client_out_path.with_extension("js");
            let js_out    = js_out.to_str().unwrap();
            let _swc_cmd = Command::new("npx").args(["swc", &in_path_str, "-o", &js_out, "--config-file", &swcrc_path_str]).output().expect("swc chucked an error at update_file");

        } else if extension == "css" || extension == "html" {
            std::fs::copy(&in_path, &client_out_path)?;
        }

        return Ok(GetFileMetaResultT { action: FileActionE::None })
    }

    else if
        relative_file_path_str.starts_with("server/src/") || 
        relative_file_path_str.starts_with(&instance_server_prefix) {

        let server_out_path = get_client_out_path(false, &relative_file_path_str, &instance_client_prefix, &instance_server_prefix)?;

        if extension == "ts" {
            let js_out    = server_out_path.with_extension("js");
            let js_out    = js_out.to_str().unwrap();
            let _swc_cmd = Command::new("npx").args(["swc",&in_path_str, "-o", &js_out, "--config-file", &swcrc_path_str]).output().expect("swc chucked an error at update_file");

        } else if extension == "css" || extension == "html" {
            std::fs::copy(&in_path, &server_out_path).unwrap();
        }

        return Ok(GetFileMetaResultT { action: FileActionE::None })
    }





    Ok(GetFileMetaResultT { action: FileActionE::None })
}




fn get_instance_prefix(client:bool) -> Result<String> {

    let main_path = crate::MAIN_PATH.clone();
    let instance_path = if client { crate::INSTANCE_CLIENT_PATH.clone() } else { crate::INSTANCE_SERVER_PATH.clone() };

    let main_path     = Path::new(&main_path);
    let instance_path = Path::new(&instance_path);

    let stripped_prefix = instance_path.strip_prefix(main_path).unwrap().to_str().unwrap().to_string();

    Ok(stripped_prefix.clone() + "/")
}




fn get_client_out_path(is_client:bool, relative_file_path_str:&str, instance_client_prefix:&String, instance_server_prefix:&String) -> Result<PathBuf> {

    let out_path = if is_client && relative_file_path_str.starts_with(instance_client_prefix) {  
        let str = "instance/".to_string() + relative_file_path_str.trim_start_matches(instance_client_prefix) ;
        crate::CLIENT_OUTPUT_DEV_PATH.clone() + &str

    } else if is_client && !relative_file_path_str.starts_with(instance_client_prefix) {
        let str = relative_file_path_str.trim_start_matches("client").to_string();
        crate::CLIENT_OUTPUT_DEV_PATH.clone() + &str

    } else if !is_client && relative_file_path_str.starts_with(instance_server_prefix) {
        let str = "instance/".to_string() + relative_file_path_str.trim_start_matches(instance_server_prefix);
        crate::SERVER_BUILD_PATH.clone() + &str

    } else if !is_client && !relative_file_path_str.starts_with(instance_server_prefix) {
        let str = relative_file_path_str.trim_start_matches("server/src").to_string() + "/instance/";
        crate::SERVER_BUILD_PATH.clone() + &str

    } else {
        "".to_string()
    };

    Ok(Path::new(&out_path).to_path_buf())
}




