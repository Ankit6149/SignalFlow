use std::fs::File;
use std::io::Write;
use std::env;
use anyhow::Result;
use media_compositor::render_text_image;

fn main() -> Result<()> {
    let args: Vec<String> = env::args().collect();
    if args.len() < 3 {
        eprintln!("Usage: renderer <input.txt> <out.png>");
        std::process::exit(2);
    }
    let input = &args[1];
    let out = &args[2];
    let txt = std::fs::read_to_string(input)?;
    let png = render_text_image(&txt, 1200, 630)?;
    let mut f = File::create(out)?;
    f.write_all(&png)?;
    Ok(())
}
