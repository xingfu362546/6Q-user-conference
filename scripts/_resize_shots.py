import os
from pathlib import Path
try:
    from PIL import Image
except ImportError:
    import subprocess
    subprocess.check_call(['pip', 'install', 'pillow', '-q'])
    from PIL import Image

src = Path('d:/Cursor/testProject/output/lingxiu-v331-shots')
dst = Path('d:/Cursor/testProject/output/lingxiu-v331-shots-sm')
dst.mkdir(parents=True, exist_ok=True)
for f in src.glob('*.png'):
    im = Image.open(f)
    w = 720
    h = int(im.height * w / im.width)
    im = im.resize((w, h), Image.Resampling.LANCZOS)
    im.save(dst / f.name, optimize=True)
print('resized', len(list(dst.glob('*.png'))))
