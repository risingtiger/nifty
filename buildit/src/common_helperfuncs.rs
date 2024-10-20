
use anyhow::Result;
use std::path::Path;
use std::fs;
use glob::glob;
use glob_match::glob_match;
use std::process::Command;



pub fn copy_deep(src_path:&str, dest_path: &str, glob_str: &str, glob_skip_str: &str) -> Result<()> {
    
    let destination_folder = Path::new(dest_path);
    let src_glob_str = format!("{}{}", src_path, glob_str);

    for entry in glob(&src_glob_str)? {
        let path = entry.unwrap();

        if path.is_file() {
            if glob_match(glob_skip_str, path.to_str().unwrap()) {
                continue;
            }

            let relative_path = path.strip_prefix(Path::new(&src_path)).unwrap();
            let destination_path = destination_folder.join(relative_path);

            if let Some(parent) = destination_path.parent() {
                fs::create_dir_all(parent)?;
            }

            fs::create_dir_all(&destination_folder).unwrap();
            fs::copy(&path, &destination_path).unwrap();
        }
    }

    Ok(())
}




pub fn run_swc(src: &str, dest: &str, glob_files: Vec<&str>) -> Result<()> {

    let src_path               = Path::new(src);
    let src_folder_name         = src_path.file_name().expect("file name error").to_str().expect("to str error");
    let src_parent_folder_str   = src_path.parent().expect("parent error").to_str().expect("to str error");
    let dest_path_trimmed     = dest.trim_end_matches('/').to_string();
    let swrc_path             = crate::MAIN_PATH.clone() + ".swcrc";

    let mut commandargs:Vec<String> = vec![
        String::from("swc"), 
        String::from(src_folder_name), 
        String::from("-d"), 
        String::from(dest_path_trimmed), 
        String::from("--config-file"), 
        String::from(swrc_path), 
        String::from("--strip-leading-paths")
    ];

    for arg in glob_files {
        commandargs.push(String::from("--only"));
        commandargs.push(format!("{}/{}", &src_folder_name, arg));
    }

    let _swc_cmd = Command::new("npx").args(commandargs).current_dir(src_parent_folder_str).output().expect("swc chucked an error");

    Ok(())
}




