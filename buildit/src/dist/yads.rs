
use rayon::prelude::*;
use std::io::Result;
use std::os::unix::fs::MetadataExt;
use std::path::Path;
use std::fs;
use std::process::Command;




#[derive(Debug, Clone, Copy)]
enum YadTypeT { View, Component }
#[derive(Debug)]
struct YadT { 
    dir: String, 
    name: String,
    _yadtype: YadTypeT, 
}




pub fn yadit(instance:&str) -> Result<()> {

    let ml = format!("{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DEV_PATH, "lazy/");
    let cl = format!("{}{}{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DEV_PATH, crate::CLIENT_PREFIX, &instance, "/lazy/");

    let main_mn = format!("{}{}", ml, "views");
    let main_mp = format!("{}{}", ml, "components");
    let client_mn = format!("{}{}", cl, "views");
    let client_mp = format!("{}{}", cl, "components");

    let mut yads:Vec<YadT> = vec![];

    let splitstr = format!("{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DEV_PATH);
    let src_prefixpath = format!("{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DEV_PATH );
    let output_prefixpath = format!("{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DIST_PATH );

    yads.extend(get_yads(&main_mn, YadTypeT::View, &splitstr)?);
    yads.extend(get_yads(&main_mp, YadTypeT::Component, &splitstr)?);
    yads.extend(get_yads(&client_mn, YadTypeT::View, &splitstr)?);
    yads.extend(get_yads(&client_mp, YadTypeT::Component, &splitstr)?);

    yads.into_par_iter().for_each(|p| {
        processit(&p, &src_prefixpath, &output_prefixpath).unwrap();
    });

    Ok(())
}




fn get_yads(dir: &str, yadtype:YadTypeT, splitstr:&str) -> Result<Vec<YadT>> {

    let mut yads:Vec<YadT> = vec![];

    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();

        if path.is_dir() {

            let pathstr = path.to_str().unwrap().to_string();
            let mut dir = pathstr.split(splitstr).last().unwrap().to_string();

            dir.push_str("/");

            let name = pathstr.split("/").last().unwrap().to_string();

            yads.push(YadT { dir, name, _yadtype:yadtype });
        }
    }
    Ok(yads)
}




fn processit(yad:&YadT, src_prefixpath:&str, output_prefixpath:&str) -> Result<()> {

    let abs_dir = format!("{}{}", src_prefixpath, yad.dir);
    let output_dir = format!("{}{}", output_prefixpath, yad.dir);
    let output_file = format!("{}{}{}", &output_dir, yad.name, ".js");
    let output_min_file = format!("{}{}{}", &output_dir, yad.name, ".min.js");

    let t = format!("{}{}{}", abs_dir, yad.name, ".js");
    let c = format!("{}{}{}", abs_dir, yad.name, ".css");
    let h = format!("{}{}{}", abs_dir, yad.name, ".html");

    let cts = Command::new("npx").args(["esbuild", &t, "--bundle"]).output().expect("cat chucked an error");
    let ccss = Command::new("npx").args(["esbuild", &c, "--bundle", "--minify"]).output().expect("cat chucked an error");

    let mut jsstr = String::from_utf8(cts.stdout).expect("ts stdout error");
    let cssstr = String::from_utf8(ccss.stdout).expect("ts stdout error");

    let htmlstr = fs::read_to_string(&h).expect("read error");

    processit_parts(&abs_dir, &mut jsstr)?;

    let re = regex::Regex::new(r#"<link rel="stylesheet" href="/assets/.*">"#).unwrap();
    jsstr = re.replace_all(&jsstr, "").to_string();

    jsstr = jsstr.replace("{--distcss--}", &cssstr);

    jsstr = jsstr.replace("{--html--}", &htmlstr);

    jsstr = jsstr.replace("{--devservercss--}", "");

    fs::create_dir_all(output_dir).expect("create dir error");

    fs::write(&output_file, &jsstr).expect("write error");

    let _jsmin_cmd = Command::new("npx").args(["uglify-js", &output_file, "-o", &output_min_file]).current_dir(crate::ABSOLUTE_PATH).output().expect("uglifyjs chucked an error");

    let m = Path::new(&output_min_file);
    let metadata = m.metadata().expect("metadata error");
    let size = metadata.size();

    if size > 5000 {
        let brotliargs = ["brotli-cli", "compress", &output_min_file];
        let _brotli = Command::new("npx").args(brotliargs).output().expect("uglifyjs chucked an error");
    }
    
    Ok(())
}




fn processit_parts(abs_dir:&str, jsstr:&mut String) -> Result<()> {

    let partspath_str = format!("{}{}", abs_dir, "parts");

    let partspath = Path::new(&partspath_str);

    if partspath.exists() {

        let parts = fs::read_dir(partspath)?
            .filter_map(|x| {
                let p = x.unwrap().path();
                if p.is_dir() {
                    return Some(p);
                } else {
                    return None;
                }
            })
            .collect::<Vec<_>>();

        if parts.len() > 0 {
            for p in parts.iter() {
                processit_parts_runit(&p, jsstr)?;
            }
        }

    }

    Ok(())
}




fn processit_parts_runit(p:&Path, parent_jsstr:&mut String) -> Result<()> {

    let filename = p.file_name().unwrap().to_str().unwrap();
    let pp = p.to_str().unwrap();

    let css = format!("{}{}{}{}", pp, "/", filename, ".css");
    let html = format!("{}{}{}{}", pp, "/", filename, ".html");

    let css = Command::new("npx").args(["esbuild", &css, "--bundle", "--minify"]).output().expect("cat chucked an error");
    let html = Command::new("cat").arg(&html).output().expect("cat chucked an error");

    let css = String::from_utf8(css.stdout).expect("ts stdout error");
    let html = String::from_utf8(html.stdout).expect("ts stdout error");

    let ifs = format!("{}{}{}{}", filename, "/", filename, ".js");
    let index = parent_jsstr.find(&ifs).unwrap_or(0);

    let sbn = parent_jsstr.split_off(index);
    let sbn = sbn.replacen("{--html--}", format!("{}", html).as_str(), 1);
    let sbn = sbn.replacen("{--distcss--}", format!("{}", css).as_str(), 1);
    parent_jsstr.push_str(&sbn);

    Ok(())
}


