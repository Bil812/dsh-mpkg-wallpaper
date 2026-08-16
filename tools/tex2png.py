#!/usr/bin/env python3
"""Decode Wallpaper Engine mobile .tex (TEXV0005) textures to PNG.

Format reference: repkg (notscuffed/repkg) for desktop WE; mobile (壁纸引擎)
uses the same container with a slightly different format id mapping.
"""
import struct, sys, os
import lz4.block
from PIL import Image

TEX_FORMATS = {0: 'RGBA8888', 4: 'DXT5', 6: 'DXT3', 7: 'DXT1', 8: 'RG88', 9: 'R8'}

def rd_int(buf, pos):
    return struct.unpack_from('<i', buf, pos)[0], pos + 4

def rd_uint(buf, pos):
    return struct.unpack_from('<I', buf, pos)[0], pos + 4

def find_magic(buf, magic, start=0):
    return buf.find(magic.encode(), start)

def parse_tex(path):
    buf = open(path, 'rb').read()
    pos = 0
    out = {'path': path, 'size': len(buf), 'blocks': []}
    # TEXV
    i = buf.find(b'TEXV')
    assert i >= 0, 'no TEXV'
    ver = buf[i:i+8].decode()
    pos = i + 8
    while pos < len(buf) and buf[pos] == 0:
        pos += 1
    # TEXI
    i2 = buf.find(b'TEXI', pos)
    assert i2 >= 0, 'no TEXI'
    pos = i2 + 8
    while pos < len(buf) and buf[pos] == 0:
        pos += 1
    fmt, pos = rd_int(buf, pos)
    flags, pos = rd_uint(buf, pos)
    tw, pos = rd_int(buf, pos)
    th, pos = rd_int(buf, pos)
    iw, pos = rd_int(buf, pos)
    ih, pos = rd_int(buf, pos)
    color, pos = rd_uint(buf, pos)
    out['version'] = ver
    out['format_id'] = fmt
    out['format_name'] = TEX_FORMATS.get(fmt, '?')
    out['flags'] = flags
    out['tex_w'], out['tex_h'] = tw, th
    out['img_w'], out['img_h'] = iw, ih
    out['clear_color'] = hex(color)
    # TEXB
    while True:
        i3 = buf.find(b'TEXB', pos)
        if i3 < 0:
            break
        tag = buf[i3:i3+8].decode(errors='replace')
        p = i3 + 8
        while p < len(buf) and buf[p] == 0:
            p += 1
        v = int(tag[4:])
        image_count, p = rd_int(buf, p)
        imgfmt = None
        is_mp4 = False
        if v >= 3:
            imgfmt, p = rd_int(buf, p)
        if v >= 4:
            is_mp4v, p = rd_int(buf, p)
            is_mp4 = is_mp4v == 1
        images = []
        for _ in range(image_count):
            mip_count, p = rd_int(buf, p)
            mips = []
            for _ in range(mip_count):
                if v == 1:
                    mw, p = rd_int(buf, p)
                    mh, p = rd_int(buf, p)
                    bcnt, p = rd_int(buf, p)
                    data = buf[p:p+bcnt]; p += bcnt
                    is_lz4, dec_len = False, None
                else:
                    mw, p = rd_int(buf, p)
                    mh, p = rd_int(buf, p)
                    is_lz4v, p = rd_int(buf, p)
                    dec_len, p = rd_int(buf, p)
                    bcnt, p = rd_int(buf, p)
                    data = buf[p:p+bcnt]; p += bcnt
                    is_lz4 = is_lz4v == 1
                mips.append({'w': mw, 'h': mh, 'lz4': is_lz4,
                             'dec_len': dec_len, 'raw_len': len(data), 'data': data})
            images.append(mips)
        out['blocks'].append({'tag': tag, 'version': v, 'image_count': image_count,
                              'img_format': imgfmt, 'is_mp4': is_mp4, 'images': images})
        pos = p
    return out

def expected_size(fmt_id, w, h):
    f = TEX_FORMATS.get(fmt_id)
    bw, bh = (w + 3) // 4, (h + 3) // 4
    if f == 'RGBA8888':
        return w * h * 4
    if f == 'DXT1':
        return bw * bh * 8
    if f in ('DXT3', 'DXT5'):
        return bw * bh * 16
    if f == 'RG88':
        return w * h * 2
    if f == 'R8':
        return w * h
    return None

def decode_dxt1(block_bytes, w, h):
    img = bytearray(w * h * 4)
    bw, bh = (w + 3) // 4, (h + 3) // 4
    idx = 0
    for by in range(bh):
        for bx in range(bw):
            c0, c1 = struct.unpack_from('<HH', block_bytes, idx); idx += 4
            r0 = ((c0 >> 11) & 0x1F) << 3; g0 = ((c0 >> 5) & 0x3F) << 2; b0 = (c0 & 0x1F) << 3
            r1 = ((c1 >> 11) & 0x1F) << 3; g1 = ((c1 >> 5) & 0x3F) << 2; b1 = (c1 & 0x1F) << 3
            r0 |= r0 >> 5; g0 |= g0 >> 6; b0 |= b0 >> 5
            r1 |= r1 >> 5; g1 |= g1 >> 6; b1 |= b1 >> 5
            if c0 > c1:
                pal = [(r0, g0, b0, 255), (r1, g1, b1, 255),
                       ((2 * r0 + r1) // 3, (2 * g0 + g1) // 3, (2 * b0 + b1) // 3, 255),
                       ((r0 + 2 * r1) // 3, (g0 + 2 * g1) // 3, (b0 + 2 * b1) // 3, 255)]
            else:
                pal = [(r0, g0, b0, 255), (r1, g1, b1, 255),
                       ((r0 + r1) // 2, (g0 + g1) // 2, (b0 + b1) // 2, 255),
                       (0, 0, 0, 0)]
            bits = struct.unpack_from('<I', block_bytes, idx)[0]; idx += 4
            for py in range(4):
                for px in range(4):
                    x, y = bx * 4 + px, by * 4 + py
                    if x < w and y < h:
                        o = (y * w + x) * 4
                        r, g, b, a = pal[(bits >> (2 * (py * 4 + px))) & 3]
                        img[o:o + 4] = bytes((r, g, b, a))
    return bytes(img)

def decode_dxt3(block_bytes, w, h):
    img = bytearray(w * h * 4)
    bw, bh = (w + 3) // 4, (h + 3) // 4
    idx = 0
    for by in range(bh):
        for bx in range(bw):
            alphas = block_bytes[idx:idx + 8]; idx += 8
            c0, c1 = struct.unpack_from('<HH', block_bytes, idx); idx += 4
            r0 = ((c0 >> 11) & 0x1F) << 3; g0 = ((c0 >> 5) & 0x3F) << 2; b0 = (c0 & 0x1F) << 3
            r1 = ((c1 >> 11) & 0x1F) << 3; g1 = ((c1 >> 5) & 0x3F) << 2; b1 = (c1 & 0x1F) << 3
            r0 |= r0 >> 5; g0 |= g0 >> 6; b0 |= b0 >> 5
            r1 |= r1 >> 5; g1 |= g1 >> 6; b1 |= b1 >> 5
            pal = [(r0, g0, b0, 255), (r1, g1, b1, 255),
                   ((2 * r0 + r1) // 3, (2 * g0 + g1) // 3, (2 * b0 + b1) // 3, 255),
                   ((r0 + 2 * r1) // 3, (g0 + 2 * g1) // 3, (b0 + 2 * b1) // 3, 255)]
            bits = struct.unpack_from("<I", block_bytes, idx)[0]; idx += 4
            for py in range(4):
                for px in range(4):
                    x, y = bx * 4 + px, by * 4 + py
                    if x < w and y < h:
                        o = (y * w + x) * 4
                        ai = py * 4 + px
                        a = (alphas[ai >> 1] >> (4 * (ai & 1))) & 0xF
                        a = (a << 4) | a
                        r, g, b, _ = pal[(bits >> (2 * (py * 4 + px))) & 3]
                        img[o:o + 4] = bytes((r, g, b, a))
    return bytes(img)

def decode_dxt5(block_bytes, w, h):
    img = bytearray(w * h * 4)
    bw, bh = (w + 3) // 4, (h + 3) // 4
    idx = 0
    for by in range(bh):
        for bx in range(bw):
            a0, a1 = block_bytes[idx], block_bytes[idx + 1]; idx += 2
            aind = struct.unpack_from('<Q', block_bytes[idx:idx + 8])[0]; idx += 6
            if a0 > a1:
                apal = [a0, a1, (6 * a0 + a1) // 7, (5 * a0 + 2 * a1) // 7,
                        (4 * a0 + 3 * a1) // 7, (3 * a0 + 4 * a1) // 7,
                        (2 * a0 + 5 * a1) // 7, (a0 + 6 * a1) // 7]
            else:
                apal = [a0, a1, (4 * a0 + a1) // 5, (3 * a0 + 2 * a1) // 5,
                        (2 * a0 + 3 * a1) // 5, (a0 + 4 * a1) // 5, 0, 255]
            c0, c1 = struct.unpack_from('<HH', block_bytes, idx); idx += 4
            r0 = ((c0 >> 11) & 0x1F) << 3; g0 = ((c0 >> 5) & 0x3F) << 2; b0 = (c0 & 0x1F) << 3
            r1 = ((c1 >> 11) & 0x1F) << 3; g1 = ((c1 >> 5) & 0x3F) << 2; b1 = (c1 & 0x1F) << 3
            r0 |= r0 >> 5; g0 |= g0 >> 6; b0 |= b0 >> 5
            r1 |= r1 >> 5; g1 |= g1 >> 6; b1 |= b1 >> 5
            pal = [(r0, g0, b0, 255), (r1, g1, b1, 255),
                   ((2 * r0 + r1) // 3, (2 * g0 + g1) // 3, (2 * b0 + b1) // 3, 255),
                   ((r0 + 2 * r1) // 3, (g0 + 2 * g1) // 3, (b0 + 2 * b1) // 3, 255)]
            bits = struct.unpack_from("<I", block_bytes, idx)[0]; idx += 4
            for py in range(4):
                for px in range(4):
                    x, y = bx * 4 + px, by * 4 + py
                    if x < w and y < h:
                        o = (y * w + x) * 4
                        ai = (aind >> (3 * (py * 4 + px))) & 7
                        r, g, b, _ = pal[(bits >> (2 * (py * 4 + px))) & 3]
                        img[o:o + 4] = bytes((r, g, b, apal[ai]))
    return bytes(img)

def decode(tex, fmt_id, w, h, raw):
    """Try to decode raw bytes to RGBA8888 given format id. Returns bytes or None."""
    f = TEX_FORMATS.get(fmt_id)
    if f is None:
        # unknown format id: try heuristic
        for cand, fn in ((7, decode_dxt1), (6, decode_dxt3), (5, decode_dxt5), (4, decode_dxt5), (0, None)):
            exp = expected_size(cand, w, h)
            if exp is not None and len(raw) == exp:
                if fn:
                    return fn(raw, w, h)
                return raw  # RGBA8888
        return None
    if f == 'RGBA8888':
        return raw if len(raw) == w * h * 4 else None
    if f == 'DXT1':
        return decode_dxt1(raw, w, h) if len(raw) == expected_size(7, w, h) else None
    if f == 'DXT3':
        return decode_dxt3(raw, w, h) if len(raw) == expected_size(6, w, h) else None
    if f == 'DXT5':
        return decode_dxt5(raw, w, h) if len(raw) == expected_size(4, w, h) else None
    return None

def main(path, outdir):
    os.makedirs(outdir, exist_ok=True)
    tex = parse_tex(path)
    print(f"== {path}")
    print(f"   version={tex['version']} format={tex['format_id']}({tex['format_name']}) "
          f"flags={tex['flags']} tex={tex['tex_w']}x{tex['tex_h']} img={tex['img_w']}x{tex['img_h']} "
          f"clear={tex['clear_color']}")
    base = os.path.splitext(os.path.basename(path))[0]
    results = []
    for bi, block in enumerate(tex['blocks']):
        print(f"   block {block['tag']} images={block['image_count']} fmt={block['img_format']} mp4={block['is_mp4']}")
        for ii, mips in enumerate(block['images']):
            for mi, m in enumerate(mips):
                data = m['data']
                if m['lz4']:
                    try:
                        data = lz4.block.decompress(m['data'], uncompressed_size=m['dec_len'])
                    except Exception as e:
                        print(f"     LZ4 fail img{ii} mip{mi}: {e}")
                        continue
                rgba = decode(tex, tex['format_id'], m['w'], m['h'], data)
                if rgba is None:
                    # try each known format heuristic with size check
                    for cand in (7, 6, 4, 5, 0, 8, 9):
                        rgba = decode(tex, cand, m['w'], m['h'], data)
                        if rgba is not None:
                            print(f"     img{ii} mip{mi} {m['w']}x{m['h']} lz4={m['lz4']} "
                                  f"raw={m['raw_len']}->{len(data)} decoded as fmt {cand}")
                            break
                if rgba is not None:
                    img = Image.frombytes('RGBA', (m['w'], m['h']), rgba)
                    fn = os.path.join(outdir, f"{base}_b{bi}_i{ii}_m{mi}.png")
                    img.save(fn)
                    results.append((fn, m['w'], m['h']))
                    print(f"     -> saved {fn} ({m['w']}x{m['h']})")
                    break  # only largest mip of each image
                else:
                    print(f"     img{ii} mip{mi} {m['w']}x{m['h']} raw={len(data)} dec_len={m['dec_len']} UNDECODED")
    return results

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else '.')
