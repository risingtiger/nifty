
use std::io::Result;
use std::process::Command;




pub fn thirdpartyfiles(instance:&str) -> Result<()> {

    let ca = format!("{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_MAIN_SRC_PATH, "thirdparty/*");
    let oa = format!("{}{}{}{}", "--outdir=", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DEV_PATH, "thirdparty");

    let cc = format!("{}{}{}{}{}", crate::ABSOLUTE_PATH, crate::CLIENT_MAIN_SRC_PATH, crate::CLIENT_PREFIX, &instance, "/thirdparty/*");
    let oc = format!("{}{}{}{}{}{}", "--outdir=", crate::ABSOLUTE_PATH, crate::CLIENT_OUTPUT_DEV_PATH, crate::CLIENT_PREFIX, &instance, "/thirdparty");

    let aa = ["esbuild", &ca, "--bundle", &oa];
    let ac = ["esbuild", &cc, "--bundle", &oc];

    let mut aar = Command::new("npx").args(aa).spawn().expect("ebuild aa chucked an error on thirdparty");
    let mut acr = Command::new("npx").args(ac).spawn().expect("ebuild ac chucked an error on thirdparty");

    let mut flg = false;

    while !flg {
        let aarl = aar.try_wait().unwrap();
        let acrl = acr.try_wait().unwrap();

        if aarl.is_some() && acrl.is_some() {
            println!("all done");
            flg = true;
        }
    } 

    Ok(())
}












