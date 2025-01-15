
use std::fs;
use std::os::unix::fs::symlink;
use std::path::{PathBuf,Path};
use anyhow::Result;

use crate::common_helperfuncs::PathE;
use crate::common_helperfuncs::path;



pub fn runit(instance: &str) -> Result<()> {

    let zprofile_file = "/Users/dave/.zprofile";

    let content = fs::read_to_string(zprofile_file).unwrap();
    
    // just update the one line for NIFTY_INSTANCE and leave the rest as is

    let updated_content = content.lines()
        .map(|line| {
            if line.starts_with("export NIFTY_INSTANCE=") {
                format!("export NIFTY_INSTANCE={}", instance)
            } else {
                line.to_string()
            }
        })
        .collect::<Vec<String>>()
        .join("\n");

    fs::write(zprofile_file, &updated_content).unwrap();


    let p = format!("export NIFTY_INSTANCE_{}_SERVER_DIR=", instance.to_uppercase());
    let server = &updated_content.lines()
        .find(|line| line.starts_with(&p))
        .and_then(|line| line.split('=').nth(1))
        .unwrap_or("")
        .trim_matches('"');

    let p = format!("export NIFTY_INSTANCE_{}_CLIENT_DIR=", instance.to_uppercase());
    let client = &updated_content.lines()
        .find(|line| line.starts_with(&p))
        .and_then(|line| line.split('=').nth(1))
        .unwrap_or("")
        .trim_matches('"');

    //let instance_server_defs_path = PathBuf::from(server).join("defs.ts");
    //let instance_client_defs_path = PathBuf::from(client).join("defs.ts");

    let instance_server_path = PathBuf::from(server);
    let instance_client_path = PathBuf::from(client);

    handle_defs_symlinks(&instance_server_path, &instance_client_path)?;

    println!("Remember to run 'source ~/.zprofile' to apply changes");

    Ok(())
}




/*
fn handle_defs_links(instance_server_defs_path:&PathBuf, instance_client_defs_path:&PathBuf) -> Result<()> {
    let start = std::time::Instant::now();

    let server_defs_path          = pathp(PathE::ServerSrc,"defs.ts");
    let client_defs_path          = pathp(PathE::ClientSrc,"defs.ts");

    let _ = update_file(&client_defs_path, "export * as NiftyServer", format!("export * as NiftyServer from '{}'", server_defs_path.display()));
    let _ = update_file(&instance_server_defs_path, "export * as NiftyServer", format!("export * as NiftyServer from '{}'", server_defs_path.display()));
    let _ = update_file(&instance_client_defs_path, "export * as NiftyServer", format!("export * as NiftyServer from '{}'", server_defs_path.display()));
    let _ = update_file(&instance_client_defs_path, "export * as InstanceServer", format!("export * as InstanceServer from '{}'", instance_server_defs_path.display()));
    let _ = update_file(&instance_client_defs_path, "export * as NiftyClient", format!("export * as NiftyClient from '{}'", client_defs_path.display()));

    println!("handle_defs_links: {:?}", start.elapsed());


    fn update_file(file_path:&PathBuf, line_startswith:&str, newline:String) -> Result<()> {

        let file_content = fs::read_to_string(file_path).unwrap();

        let changed_content:String = file_content
            .lines()
            .map(|line| {
                if line.starts_with(line_startswith) {
                    newline.as_str()
                } else {
                    line
                }
            })
            .collect::<Vec<&str>>()
            .join("\n");
        
        fs::write(file_path, changed_content)?;

        Ok(())
    }

    Ok(())
}
*/



fn handle_defs_symlinks(instance_server_path:&PathBuf, instance_client_path:&PathBuf) -> Result<()> {

    let server_path          = path(PathE::ServerSrc);
    let client_path          = path(PathE::ClientSrc);

    symlink(Path::new(&server_path).join("defs.ts"), Path::new(&client_path).join("defs_server_symlink.ts")).unwrap_or_default();
    symlink(Path::new(&server_path).join("defs.ts"), Path::new(&instance_server_path).join("defs_server_symlink.ts")).unwrap_or_default();
    symlink(Path::new(&server_path).join("defs.ts"), Path::new(&instance_client_path).join("defs_server_symlink.ts")).unwrap_or_default();
    symlink(Path::new(&instance_server_path).join("defs.ts"), Path::new(&instance_client_path).join("defs_instance_server_symlink.ts")).unwrap_or_default();
    symlink(Path::new(&client_path).join("defs.ts"), Path::new(&instance_client_path).join("defs_client_symlink.ts")).unwrap_or_default();

    /*
    let _ = update_file(&client_defs_path, "export * as NiftyServer", format!("export * as NiftyServer from '{}'", server_defs_path.display()));
    let _ = update_file(&instance_server_defs_path, "export * as NiftyServer", format!("export * as NiftyServer from '{}'", server_defs_path.display()));
    let _ = update_file(&instance_client_defs_path, "export * as NiftyServer", format!("export * as NiftyServer from '{}'", server_defs_path.display()));
    let _ = update_file(&instance_client_defs_path, "export * as InstanceServer", format!("export * as InstanceServer from '{}'", instance_server_defs_path.display()));
    let _ = update_file(&instance_client_defs_path, "export * as NiftyClient", format!("export * as NiftyClient from '{}'", client_defs_path.display()));

    println!("handle_defs_links: {:?}", start.elapsed());


    fn update_file(file_path:&PathBuf, line_startswith:&str, newline:String) -> Result<()> {

        let file_content = fs::read_to_string(file_path).unwrap();

        let changed_content:String = file_content
            .lines()
            .map(|line| {
                if line.starts_with(line_startswith) {
                    newline.as_str()
                } else {
                    line
                }
            })
            .collect::<Vec<&str>>()
            .join("\n");
        
        fs::write(file_path, changed_content)?;

        Ok(())
    }
*/

    Ok(())
}




