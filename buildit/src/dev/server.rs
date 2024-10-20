
use std::fs;
use anyhow::Result;

use crate::common_helperfuncs;



pub fn runit() -> Result<()> {

    let a = crate::SERVER_MAIN_SRC_PATH.clone();
    let b = crate::SERVER_BUILD_PATH.clone();
    let c = vec!["*.ts"];  // only top level ts files, skipping instance files
    let js_server_thread = std::thread::spawn(move || handle_server_js(&a, &b, c));

    let d = crate::INSTANCE_SERVER_PATH.clone();
    let e = crate::INSTANCE_SERVER_OUTPUT_DEV_PATH.clone();
    let f = vec!["**/*.ts"]; 
    let js_instance_server_thread = std::thread::spawn(move || handle_server_js(&d, &e, f));

    js_server_thread.join().map_err(|e| anyhow::anyhow!("JS thread panicked: {:?}", e))??;
    js_instance_server_thread.join().map_err(|e| anyhow::anyhow!("JS thread panicked: {:?}", e))??;

    handle_indexjs()?;

    Ok(())
}




pub fn handle_server_js(src_path_str:&str, dest_path_str:&str, glob_files:Vec<&str>) -> Result<()> {

    let _ = common_helperfuncs::run_swc(src_path_str, dest_path_str, glob_files)?;

    Ok(())
}




fn handle_indexjs() -> Result<()> {

    let indexjs_in_path           = crate::SERVER_BUILD_PATH.clone() + "index.js";

    let indexjs = fs::read_to_string(&indexjs_in_path).expect("read error");
    let indexjs = indexjs.replace("//{--index_instance.js--}", "import INSTANCE from './instance/index_instance.js'");
    fs::write(&indexjs_in_path, indexjs).expect("mainjs write error");

    Ok(())
}
