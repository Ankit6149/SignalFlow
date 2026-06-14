import subprocess
import tempfile
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import time
from typing import List


class TerminalRecorder:
    """A simple terminal recorder that runs a sequence of commands,
    captures stdout, renders frames as images, and encodes them to MP4 using ffmpeg.

    Note: Requires `ffmpeg` in PATH.
    """

    def __init__(self, font_path=None, font_size=14, width=1200, height=720, bg_color="#000000", fg_color="#e6e6e6"):
        self.font_size = font_size
        try:
            self.font = ImageFont.truetype(font_path, font_size) if font_path else ImageFont.load_default()
        except Exception:
            self.font = ImageFont.load_default()
        self.width = width
        self.height = height
        self.bg_color = bg_color
        self.fg_color = fg_color

    def _render_text_frame(self, text: str, path: Path):
        img = Image.new("RGB", (self.width, self.height), color=self.bg_color)
        draw = ImageDraw.Draw(img)
        margin = 8
        draw.text((margin, margin), text, font=self.font, fill=self.fg_color)
        img.save(path)

    def record(self, commands: List[str], out_mp4: Path, frame_delay: float = 0.08):
        tmpdir = Path(tempfile.mkdtemp())
        frames = []
        try:
            for i, cmd in enumerate(commands):
                proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
                output = []
                for line in proc.stdout:
                    output.append(line.rstrip("\n"))
                    # render current output as a frame
                    frame_path = tmpdir / f"frame_{i}_{len(output)}.png"
                    self._render_text_frame("\n".join(output), frame_path)
                    frames.append(frame_path)
                proc.wait()
                # small pause to show final state
                time.sleep(0.2)

            if not frames:
                raise RuntimeError("No frames generated; check commands and environment.")

            # Build ffmpeg input list
            listfile = tmpdir / "frames.txt"
            with open(listfile, "w", encoding="utf-8") as f:
                for fr in frames:
                    f.write(f"file '{fr.as_posix()}'\n")
                    f.write(f"duration {frame_delay}\n")
                # repeat last frame
                f.write(f"file '{frames[-1].as_posix()}'\n")

            # Run ffmpeg to create mp4
            cmd = [
                "ffmpeg",
                "-y",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(listfile),
                "-vsync",
                "vfr",
                "-pix_fmt",
                "yuv420p",
                str(out_mp4),
            ]
            subprocess.run(cmd, check=True)
            return out_mp4
        finally:
            # do not delete frames for now to allow inspection
            pass
