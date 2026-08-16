#!/usr/bin/env python3
"""Parse Wallpaper Engine mobile .mpkg container (format from aqnya/unmpkg)."""
import struct, sys, os

def parse(path, extract_dir):
    with open(path, 'rb') as f:
        data = f.read()
    pos = 0
    version_length = struct.unpack_from('<I', data, pos)[0]; pos += 4
    version = data[pos:pos+version_length].decode('utf-8', 'replace'); pos += version_length
    # align? unmpkg reads 8 bytes for version; try raw u32 after version_length bytes
    file_total = struct.unpack_from('<I', data, pos)[0]; pos += 4
    print(f"version_length={version_length} version={version!r} file_total={file_total}")
    entries = []
    for i in range(file_total):
        nl = struct.unpack_from('<I', data, pos)[0]; pos += 4
        name = data[pos:pos+nl].decode('utf-8', 'replace'); pos += nl
        index = struct.unpack_from('<I', data, pos)[0]; pos += 4
        size = struct.unpack_from('<I', data, pos)[0]; pos += 4
        entries.append((name, index, size))
    print(f"{'index':>5} {'size':>12}  name")
    for name, index, size in entries:
        print(f"{index:>5} {size:>12}  {name}")
    # extract
    os.makedirs(extract_dir, exist_ok=True)
    for name, index, size in entries:
        chunk = data[pos:pos+size]
        pos += size
        safe = name.lstrip('/').replace('..', '__')
        outp = os.path.join(extract_dir, safe)
        os.makedirs(os.path.dirname(outp) or extract_dir, exist_ok=True)
        with open(outp, 'wb') as w:
            w.write(chunk)
        print(f"extracted -> {outp} ({size} bytes)")
    print(f"total parsed bytes={pos} / file size={len(data)}")

if __name__ == '__main__':
    parse(sys.argv[1], sys.argv[2])
