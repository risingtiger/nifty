
use anyhow::Result;

use std::fs::{self}; //, File
//use std::io::Write;
use std::path::Path;//, PathBuf
use walkdir::WalkDir;
use minify_js::{Session, TopLevelMode, minify};
//use regex::Regex;




pub fn dist(_instance:&str) -> Result<()> {
    let in_dir = Path::new("/Users/dave/Code/nifty/server/static_dev/");
    let output_dir = Path::new("/Users/dave/Code/nifty/server/static_dist2/");


    for entry in WalkDir::new(in_dir).into_iter().filter_entry(|e| is_skip_entry(e)).filter_map(|e| e.ok()) {

        let path = entry.path();

        if entry.file_type().is_file() && path.extension().unwrap_or_default() == "js" {

            let is_in_views_dir = path.to_str().map_or(false, |s| s.contains("lazy/views/"));

            let js_file_str = fs::read_to_string(path).unwrap();
            let css_file_str = fs::read_to_string(path.with_extension("css")).unwrap_or_default();
            let html_file_str = fs::read_to_string(path.with_extension("html")).unwrap_or_default();

            let mut updated_js_file_str = String::with_capacity(
                js_file_str.len() + css_file_str.len() + 15 + 56 + html_file_str.len(),
            );
            
            let mut replacement_str = String::with_capacity(css_file_str.len() + 56 + 15);
            if is_in_views_dir {
                replacement_str.push_str("<link rel='stylesheet' href='/assets/main.css'>");
            }
            replacement_str.push_str("<style>");
            replacement_str.push_str(&css_file_str);
            replacement_str.push_str("</style>");
            replacement_str.push_str(&html_file_str);

            updated_js_file_str.push_str(&js_file_str.replace("{--css--}{--html--}", &replacement_str));

            let mut out = Vec::new();

            minify(
                &Session::new(),
                TopLevelMode::Global, 
                updated_js_file_str.as_bytes(),
                &mut out,
            ).unwrap();

            let minified_js_file_str = String::from_utf8(out).unwrap();

            let output_relative_path = path.strip_prefix(in_dir.as_os_str()).unwrap();
            let output_path = output_dir.join(&output_relative_path.with_extension("js"));
            let output_path_dir = output_path.parent().unwrap();

            fs::create_dir_all(&output_path_dir).unwrap();
            fs::write(&output_path, minified_js_file_str).unwrap();
        }
    }

    Ok(())
}




fn is_skip_entry( entry: &walkdir::DirEntry) -> bool {

    if entry.file_name() == "media" {
        return false;
    }

    return true;
}



