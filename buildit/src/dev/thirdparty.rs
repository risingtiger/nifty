
use std::process::Command;
use anyhow::Result;




pub fn runit() -> Result<()> {

    let i = crate::CLIENT_MAIN_SRC_PATH.clone() + "thirdparty/";
    let j = crate::CLIENT_OUTPUT_DEV_PATH.clone() + "thirdparty/";
    let client_js = std::thread::spawn(move || handle_thirdparty_js(&i, &j));

    let k = crate::INSTANCE_CLIENT_PATH.clone() + "thirdparty/";
    let l = crate::INSTANCE_CLIENT_OUTPUT_DEV_PATH.clone() + "thirdparty/";
    let instance_js = std::thread::spawn(move || handle_thirdparty_js(&k, &l));

    client_js.join().map_err(|e| anyhow::anyhow!("Thirdparty JS thread panicked: {:?}", e))??;
    instance_js.join().map_err(|e| anyhow::anyhow!("Thirdparty JS thread panicked: {:?}", e))??;

    Ok(())
}




pub fn handle_thirdparty_js(src_path_str:&str, dest_path_str:&str) -> Result<()> {

    let dest_path_trimmed      = dest_path_str.trim_end_matches('/').to_string();

    let src_str    = format!("{}{}", src_path_str, "*");
    let outdir_str = format!("{}{}", "--outdir=", dest_path_trimmed);

    let args = ["esbuild", &src_str, "--bundle", &outdir_str];

    let _cmd = Command::new("npx").args(args).output().expect("ebuild chucked an error on handle_thirdparty_js");

    Ok(())
}

