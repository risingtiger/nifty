
use std::io::Result;
use std::process::Command;


use crate::helperutils::instance_ignores;



pub fn serverfiles(instance:&str) -> Result<()> {

    let sd = format!("{}{}", crate::ABSOLUTE_PATH, crate::SERVER_MAIN_SRC_PATH);
    let od = format!("{}{}", crate::ABSOLUTE_PATH, crate::SERVER_BUILD_PATH);
    let od = od.trim_end_matches('/').to_string();

    let mut commandargs:Vec<String> = vec![
        String::from("swc"), 
        String::from(&sd), 
        String::from("-d"), 
        String::from(&od), 
        String::from("--strip-leading-paths")
    ];

    let ignores = instance_ignores(&instance, &sd, "ignore", crate::SERVER_PREFIX, false)?;

    commandargs.extend(ignores);

    let mut swc = Command::new("npx").args(commandargs).current_dir(format!("{}{}", crate::ABSOLUTE_PATH, crate::SERVER_MAIN_PATH)).spawn().expect("swc chucked an error");
    swc.wait().expect("swc chucked an error");

    /*
    let sdreplace = format!("{}{}{}{}", "'./", crate::SERVER_PREFIX, instance, "/index_extend.js'");
    let sdreplace_file = format!("{}{}{}", crate::ABSOLUTE_PATH, crate::SERVER_BUILD_PATH, "instance_link.js");
    let sdargs = ["'__instance_path__'", &sdreplace, &sdreplace_file];
    println!("sdargs {:?}", &sdargs);
    let _sd = Command::new("sd").args(sdargs).output().expect("sd chucked an error");
    */

    Ok(())
}

