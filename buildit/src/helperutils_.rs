
use std::fs;
use regex::Regex;
use std::path::Path;
use std::io::Result;
use std::process::Command;




fn esbuild_uglify_brotli_css_or_js(path:&Path) -> Result<()> {

    let pathstr = path.to_str().unwrap().to_string();
    let dir_splitstr = format!("{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_MAIN_SRC_PATH);
    let relative_dir = pathstr.split(&dir_splitstr).last().unwrap().to_string();

    let p = Path::new(&relative_dir);

    let dir = p.parent().unwrap().to_str().unwrap().to_string();
    let dir = format!("{}{}", dir, "/");
    let filestem = p.file_stem().unwrap().to_str().unwrap();
    let extension = p.extension().unwrap().to_str().unwrap();

    let out_extension = if extension == "ts" { "js" } else { extension };

    let infile = format!("{}{}{}{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_MAIN_SRC_PATH, dir, filestem, ".", extension);
    let outdir = format!("{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DIST_PATH, dir);
    let outfile = format!("{}{}{}{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DIST_PATH, dir, filestem, ".", out_extension);
    let outfile_min = format!("{}{}{}{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DIST_PATH, dir, filestem, "_min.", out_extension);

    let filestr = Command::new("npx").args(["esbuild", &infile, "--bundle"]).output().expect("esbuild chucked an error");
    let filestr = String::from_utf8(filestr.stdout).expect("ts stdout error");
    let filestr = replace_links_with_appversion(1, &filestr)?;


    let minargs:Vec<&str> = if extension == "ts" { 
        vec!["uglifyjs", &outfile, "--compress", "--mangle", "--toplevel", "--module", "-o", &outfile_min] 
    } else { 
        vec!["uglifycss", &outfile] 
    };

    fs::create_dir_all(outdir).expect("create dir error");

    fs::write(&outfile, &filestr).expect("write error");

    Command::new("npx").args(minargs).output().expect("uglifyjs chucked an error");

    let brotliargs = ["brotli-cli", "compress", &outfile_min];
    Command::new("npx").args(brotliargs).output().expect("uglifyjs chucked an error");

    Ok(())
}




fn replace_links_with_appversion(appversion:u16, filestr:&str) -> Result<String> {

    let re = Regex::new(r#"(\"|\'|\`)\/assets\/([^"'`]+)\.([_a-z0-9]+)(\"|\'|\`)"#).unwrap();
    let y = re.replace(filestr, format!("{}------{}", "farkyaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", appversion).as_str()).to_string();

    Ok(y)
}
