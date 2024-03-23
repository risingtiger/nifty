use rayon::prelude::*;
use std::io::Result;
use std::process::Command;
use std::fs;
use std::path::Path;
use std::os::unix::fs::MetadataExt;



#[derive(Debug)]
struct ThirdPartyT { 
    dir: String, 
    stem: String,
    _ext: String
}




pub fn distthirdparty(instance:&str) -> Result<()> {

    
    let splitstr = format!("{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DEV_PATH);
    let src_prefixpath = format!("{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DEV_PATH );
    let output_prefixpath = format!("{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DIST_PATH );

    let hb = format!("{}{}", src_prefixpath, "thirdparty/");
    let hn = format!("{}{}{}{}", src_prefixpath, crate::CLIENT_PREFIX, &instance, "/thirdparty/");

    let mut files:Vec<ThirdPartyT> = vec![];

    files.extend(getfiles(&hb, &splitstr)?);
    files.extend(getfiles(&hn, &splitstr)?);

    files.into_par_iter().for_each(|p| {
        procf(&p, &src_prefixpath, &output_prefixpath).unwrap();
    });

    Ok(())
}




fn getfiles(dir:&str, splitstr:&str) -> Result<Vec<ThirdPartyT>> {

    let mut files:Vec<ThirdPartyT> = vec![];

    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();

        if path.is_file() {
            let ext = path.extension().unwrap().to_str().unwrap().to_string();
            if ext == "js" {
                let parent = path.parent().unwrap().to_str().unwrap().to_string();
                let stem = path.file_stem().unwrap().to_str().unwrap().to_string();
                let mut dir = parent.split(splitstr).last().unwrap().to_string();
                dir.push_str("/"); 
                files.push(ThirdPartyT { dir, stem, _ext:ext});
            }
        }
    }

    Ok(files)
}




fn procf(file:&ThirdPartyT, src_prefixpath:&str, output_prefixpath:&str) -> Result<()> {

    let abs_dir = format!("{}{}", src_prefixpath, file.dir);
    let output_dir = format!("{}{}", output_prefixpath, file.dir);
    let output_min_file = format!("{}{}{}", &output_dir, file.stem, ".min.js");

    let t = format!("{}{}{}", abs_dir, file.stem, ".js");

    let _ = fs::create_dir_all(&output_dir);
    let _ = Command::new("npx").args(["uglify-js", &t, "-o", &output_min_file]).current_dir(crate::ABSOLUTE_PATH).output().expect("uglifyjs chucked an error");

    let m = Path::new(&output_min_file);
    let metadata = m.metadata().expect("metadata error");
    let size = metadata.size();

    if size > 5000 {
        let brotliargs = ["brotli-cli", "compress", &output_min_file];
        let _brotli = Command::new("npx").args(brotliargs).output().expect("brotli chucked an error");
    }

    Ok(())
}



