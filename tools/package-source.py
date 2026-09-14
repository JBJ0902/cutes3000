"""Package portable game source without credentials, hosting identity, caches or recursion."""
import pathlib, zipfile
root=pathlib.Path(__file__).resolve().parents[1]
out=root/'dist/source.zip'
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted(root.rglob('*')):
        relative=p.relative_to(root)
        if not p.is_file() or p==out:continue
        if any(part in ('.git','.openai','.sites-runtime','__pycache__','node_modules') for part in relative.parts):continue
        if p.name.startswith('.env') or p.name=='asset-state.json' or p.name.endswith(('.tar.gz','.zip')):continue
        z.write(p,relative)
print(out)
