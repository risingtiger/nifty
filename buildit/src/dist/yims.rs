
use rayon::prelude::*;
use std::io::Result;
use std::path::Path;
use std::os::unix::fs::MetadataExt;
use std::fs;
use std::process::Command;




#[derive(Debug, Clone, Copy)]
enum YimTypeT { Lib, Worker, Directive }
#[derive(Debug)]
struct YimT { 
    dir: String, 
    name: String,
    _yimtype: YimTypeT, 
}




pub fn yimit(instance:&str) -> Result<()> {

    let ml = format!("{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DEV_PATH, "lazy/");
    let cl = format!("{}{}{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DEV_PATH, crate::CLIENT_PREFIX, &instance, "/lazy/");

    let main_li = format!("{}{}", ml, "libs");
    let main_wo = format!("{}{}", ml, "workers");
    let main_di = format!("{}{}", ml, "directives");
    let instance_li = format!("{}{}", cl, "libs");
    let instance_wo = format!("{}{}", cl, "workers");
    let instance_di = format!("{}{}", cl, "directives");

    let mut yims:Vec<YimT> = vec![];

    let splitstr = format!("{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DEV_PATH);
    let src_prefixpath = format!("{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DEV_PATH );
    let output_prefixpath = format!("{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DIST_PATH );

    yims.extend(get_yims(&main_li, YimTypeT::Lib, &splitstr)?);
    yims.extend(get_yims(&main_wo, YimTypeT::Worker, &splitstr)?);
    yims.extend(get_yims(&main_di, YimTypeT::Directive, &splitstr)?);
    yims.extend(get_yims(&instance_li, YimTypeT::Lib, &splitstr)?);
    yims.extend(get_yims(&instance_wo, YimTypeT::Worker, &splitstr)?);
    yims.extend(get_yims(&instance_di, YimTypeT::Directive, &splitstr)?);

    yims.into_par_iter().for_each(|p| {
        processit(&p, &src_prefixpath, &output_prefixpath).unwrap();
    });

    Ok(())
}




fn get_yims(dir: &str, yimtype:YimTypeT, splitstr:&str) -> Result<Vec<YimT>> {

    let mut yims:Vec<YimT> = vec![];

    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();

        if path.is_file() && path.extension() == Some("js".as_ref()) {

            let _extension = path.extension().unwrap().to_str().unwrap();
            let pathstr = path.to_str().unwrap().to_string();
            let mut dir = pathstr.split(splitstr).last().unwrap().to_string();
            let dir_p = Path::new(&dir);
            dir = dir_p.parent().unwrap().to_str().unwrap().to_string();
            dir.push_str("/");

            let name = path.file_stem().unwrap().to_str().unwrap().to_string();

            yims.push(YimT { dir, name, _yimtype:yimtype });
        }
    }
    Ok(yims)
}




fn processit(yim:&YimT, src_prefixpath:&str, output_prefixpath:&str) -> Result<()> {

    let abs_dir = format!("{}{}", src_prefixpath, yim.dir);
    let output_dir = format!("{}{}", output_prefixpath, yim.dir);
    let output_file = format!("{}{}{}", &output_dir, yim.name, ".js");
    let output_min_file = format!("{}{}{}", &output_dir, yim.name, ".min.js");

    let t = format!("{}{}{}", abs_dir, yim.name, ".js");

    let x = ["esbuild", &t, "--bundle"];
    let cts = Command::new("npx").args(x).output().expect("esbuild chucked an error");

    let jsstr = String::from_utf8(cts.stdout).expect("ts stdout error");

    fs::create_dir_all(output_dir).expect("create dir error");

    fs::write(&output_file, &jsstr).expect("write error");

    let jsminargs = ["uglify-js", &output_file, "-o", &output_min_file];
    let _jsmin = Command::new("npx").args(jsminargs).output().expect("uglifyjs chucked an error");

    let m = Path::new(&output_min_file);
    let metadata = m.metadata().expect("metadata error");
    let size = metadata.size();

    if size > 5000 {
        let brotliargs = ["brotli-cli", "compress", &output_min_file];
        let _brotli = Command::new("npx").args(brotliargs).output().expect("uglifyjs chucked an error");
    }
    
    Ok(())
}




