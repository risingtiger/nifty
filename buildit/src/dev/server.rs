
use anyhow::Result;
use std::env;
use std::path::Path;
use std::process::Command;




pub fn runit() -> Result<()> {

    let a = crate::SERVER_MAIN_SRC_PATH.clone();
    let b = crate::SERVER_BUILD_PATH.clone();
    let js_server_thread = std::thread::spawn(move || handle_server_js(&a, &b));

    let c = crate::INSTANCE_SERVER_PATH.clone();
    let d = crate::INSTANCE_SERVER_OUTPUT_DEV_PATH.clone();
    let js_instance_server_thread = std::thread::spawn(move || handle_server_js(&c, &d));

    js_server_thread.join().map_err(|e| anyhow::anyhow!("JS thread panicked: {:?}", e))??;
    js_instance_server_thread.join().map_err(|e| anyhow::anyhow!("JS thread panicked: {:?}", e))??;

    Ok(())
}




pub fn handle_server_js(src_path_str:&str, dest_path_str:&str) -> Result<()> {

    let src_path               = Path::new(src_path_str);
    let src_folder_name        = src_path.file_name().expect("file name error").to_str().expect("to str error");
    let src_parent_folder_str  = src_path.parent().expect("parent error").to_str().expect("to str error");
    let dest_path_trimmed      = dest_path_str.trim_end_matches('/').to_string();

    let commandargs:Vec<String> = vec![
        String::from("swc"), 
        String::from(src_folder_name), 
        String::from("-d"), 
        String::from(dest_path_trimmed), 
        String::from("--strip-leading-paths"),
        String::from("--ignore"),
        String::from("**/media/**/*"),
        String::from("--ignore"),
        String::from("**/thirdparty/**/*"),
    ];

    let _swc_cmd = Command::new("npx").args(commandargs).current_dir(src_parent_folder_str).output().expect("swc chucked an error");

    Ok(())
}
