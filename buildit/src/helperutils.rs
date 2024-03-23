
use std::io::Result;
use std::fs;
use std::path::Path;
use std::process::Command;
use regex::Regex;



pub fn instance_ignores(instance:&str, c_m:&str, excludeterm:&str, prefix:&str, should_create_relative_paths:bool) -> Result<Vec<String>> {

    let paths = fs::read_dir(c_m)?
        .filter_map(|x| {
            let p = x.unwrap().path();
            let pstr = p.to_str()?.to_string();

            if p.is_dir() && pstr.contains(prefix) && !pstr.contains(&instance){
                let spepa = if should_create_relative_paths {
                    pstr.split("/").collect::<Vec<&str>>().last().unwrap().to_string()
                } else {
                    pstr
                };
                return Some( [format!("{}{}","--", &excludeterm), spepa.clone()] );
            } else {
                return None;
            }
        })
        .collect::<Vec<_>>();

    let mut ignores: Vec<String> = vec![];

    paths.iter().for_each(|x| {
        ignores.push(x[0].clone());
        ignores.push(x[1].clone());
    });

    Ok(ignores)
}








pub fn replace_links_with_appversion(appversion:u16, filestr:&str) -> Result<String> {

    let re = Regex::new(r#"(\"|\'|\`)\/assets\/([^"'`]+)\.([_a-z0-9]+)(\"|\'|\`)"#).unwrap();
    let y = re.replace_all(filestr, |caps: &regex::Captures| {
        format!("{}{}{}{}{}{}{}{}", &caps[1], "/assets/", &caps[2], "_v", appversion, ".", &caps[3], &caps[4])
    });

    Ok(y.to_string())
}
