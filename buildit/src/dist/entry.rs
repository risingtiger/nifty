
use std::fs;
use anyhow::Result;




pub fn runit() -> Result<()> {

    let entry_in   = crate::INSTANCE_CLIENT_OUTPUT_DEV_PATH.clone() + "entry/";
    let entry_out  = crate::INSTANCE_CLIENT_OUTPUT_DIST_PATH.clone() + "entry/";
    let html_in    = entry_in.clone() + "index.html";
    let html_out   = entry_out.clone() + "index.html";
    let sw_in      = entry_in.clone() + "sw.js";
    let sw_out     = entry_out.clone() + "sw.js";
    let js_in      = entry_in.clone() + "index.js";
    let css_in     = entry_in.clone() + "index.css";

    let html       = fs::read_to_string(html_in).expect("read error");
    let js         = fs::read_to_string(js_in).expect("read error");
    let css        = fs::read_to_string(css_in).expect("read error");

    let js_tag = format!(r#"<script type="module">{}</script>"#, js);
    let html = html.replace(r#"<script src="/entry/index.js" type="module"></script>"#, &js_tag);

    let css_tag = format!(r#"<style>{}</style>"#, css);
    let html = html.replace(r#"<link rel="stylesheet" href="/entry/index.css">"#, &css_tag);

    fs::create_dir_all(entry_out).expect("create dir error");
    fs::write(&html_out, html).expect("write error");

    fs::copy(&sw_in, &sw_out).expect("copy error");

    Ok(())
}

