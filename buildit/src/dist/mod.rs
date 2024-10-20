
use anyhow::Result;
use std::fs;
use regex::Regex;





mod initial_js;
mod bundle_js;
mod entry;
mod gen;
mod brotli;




struct ProcessedStatsT {
    js_files_count: u32,
    html_files_count: u32,
    css_files_count: u32,
    lines_of_js: u32,
}





pub fn runit() -> Result<()> {

    reset_dist_dirs()?;

    let mut stats = ProcessedStatsT {
        js_files_count: 0,
        html_files_count: 0,
        css_files_count: 0,
        lines_of_js: 0,
    };

    let appversion = iterate_manifest_appversion()?;
    let _          = initial_js::runit(&mut stats);
    let _          = handle_defs_files();
    let _          = bundle_js::runit();
    let _          = gen::runit(appversion)?;
    let _          = entry::runit();
    let _          = brotli::runit();

    println!("APPVersion {}", appversion);
    println!("Processed {} JS files", stats.js_files_count);
    println!("Processed {} HTML files", stats.html_files_count);
    println!("Processed {} CSS files", stats.css_files_count);
    println!("Processed {} lines of JS", stats.lines_of_js);

    Ok(())
}




fn iterate_manifest_appversion() -> Result<u32> {

    let manifest_path     = crate::INSTANCE_CLIENT_PATH.clone() + "app_instance.webmanifest";
    let manifest_content  = fs::read_to_string(&manifest_path).unwrap();

    let manifest_regex          = Regex::new(r#""version":\s*"(\d+)""#).unwrap();
    let manifest_regex_captures = manifest_regex.captures(&manifest_content).unwrap();
    let version                 = manifest_regex_captures.get(1).unwrap().as_str().parse::<u32>().unwrap();
    let next_version            = version + 1;

    let manifest_content       = manifest_regex.replace_all(&manifest_content, format!("\"version\":\"{}\"", next_version).as_str()).to_string();

    fs::write(&manifest_path, &manifest_content)?;

    Ok(next_version)
}



fn reset_dist_dirs() -> Result<()> {

    let _xx = std::fs::remove_dir_all(crate::CLIENT_OUTPUT_DIST_PATH.clone());
    let _   = std::fs::remove_dir_all(crate::TMP_PATH.clone());

    std::fs::create_dir_all(crate::CLIENT_OUTPUT_DIST_PATH.clone())?;
    std::fs::create_dir_all(crate::INSTANCE_CLIENT_OUTPUT_DIST_PATH.clone())?;

    Ok(())
}




fn handle_defs_files() -> Result<()> {

    let instance_name       = crate::INSTANCE_DIR_NAME.clone();
    let client_main_in      = crate::CLIENT_MAIN_SRC_PATH.clone();
    let client_instance_in  = crate::INSTANCE_CLIENT_PATH.clone();
    let client_out          = crate::TMP_PATH.clone();
    let client_instance_out = crate::TMP_PATH.clone() + &instance_name;

    std::fs::copy(client_main_in.clone() + "defs_client.ts", client_out.clone() + "defs_client.ts").unwrap();
    std::fs::copy(client_main_in.clone() + "defs_server_symlink.ts", client_out.clone() + "defs_server_symlink.ts").unwrap();

    std::fs::copy(client_instance_in.clone() + "defs_instance_client.ts", client_instance_out.clone() + "defs_instance_client.ts").unwrap();
    std::fs::copy(client_instance_in.clone() + "defs_instance_server_symlink.ts", client_instance_out.clone() + "defs_instance_server_symlink.ts").unwrap();

    let _ = std::fs::remove_file(client_out.clone() + "defs_client.js");
    let _ = std::fs::remove_file(client_out.clone() + "defs_server_symlink.js");

    let _ = std::fs::remove_file(client_instance_out.clone() + "defs_instance_client.js");
    let _ = std::fs::remove_file(client_instance_out.clone() + "defs_instance_server_symlink.js");

    Ok(())
}




