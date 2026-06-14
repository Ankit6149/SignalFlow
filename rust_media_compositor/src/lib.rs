use anyhow::Result;
use image::{RgbImage, Rgb};
use rusttype::{Font, Scale};

pub fn render_text_image(text: &str, width: u32, height: u32) -> Result<Vec<u8>> {
    // Simple in-memory PNG renderer that writes text onto an RGB canvas.
    let mut img = RgbImage::from_pixel(width, height, Rgb([15, 23, 32]));

    // Load an embedded font (system fallback not guaranteed in this scaffold)
    let font_data: &[u8] = include_bytes!("../../assets/DejaVuSansMono.ttf");
    let font = Font::try_from_bytes(font_data).ok_or_else(|| anyhow::anyhow!("font load"))?;
    let scale = Scale::uniform(14.0);

    // Very small text rendering loop (placeholder - proper layout omitted)
    let mut y = 10.0f32;
    for line in text.lines() {
        let v_metrics = font.v_metrics(scale);
        let glyphs: Vec<_> = font.layout(line, scale, rusttype::point(8.0, y + v_metrics.ascent)).collect();
        for g in glyphs {
            if let Some(bounding) = g.pixel_bounding_box() {
                g.draw(|gx, gy, v| {
                    let x = gx as i32 + bounding.min.x;
                    let y = gy as i32 + bounding.min.y;
                    if x >= 0 && y >= 0 && (x as u32) < width && (y as u32) < height {
                        let px = img.get_pixel_mut(x as u32, y as u32);
                        let existing = px.0;
                        let alpha = (v * 255.0) as u8;
                        px.0 = [
                            ((existing[0] as u16 * (255 - alpha) as u16 + 230 * alpha as u16) / 255) as u8,
                            ((existing[1] as u16 * (255 - alpha) as u16 + 230 * alpha as u16) / 255) as u8,
                            ((existing[2] as u16 * (255 - alpha) as u16 + 230 * alpha as u16) / 255) as u8,
                        ];
                    }
                });
            }
        }
        y += scale.y + 6.0;
    }

    let mut buf: Vec<u8> = Vec::new();
    img.write_to(&mut std::io::Cursor::new(&mut buf), image::ImageOutputFormat::Png)?;
    Ok(buf)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_render() {
        let out = render_text_image("fn main() { println!(\"hi\"); }", 800, 400).unwrap();
        assert!(out.len() > 0);
    }
}
