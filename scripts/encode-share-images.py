"""Format-only conversion for crawler-compatible public JPEGs.

The existing menu artwork is preserved, with no crop, retouching or overlays.
"""
import json
import sys
from pathlib import Path
from PIL import Image, ImageOps

results = []
for job in json.load(sys.stdin):
    source, target = Path(job['source']), Path(job['target'])
    image = ImageOps.exif_transpose(Image.open(source)).convert('RGB')
    image.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, 'JPEG', quality=87, optimize=True, progressive=True)
    results.append({'path': job['path'], 'width': image.width, 'height': image.height,
                    'bytes': target.stat().st_size})
json.dump(results, sys.stdout)
