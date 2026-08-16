#!/usr/bin/env python3
"""MDLV .mdl 结构探索器：定位块标签、解析头部、识别浮点数组区段。"""
import struct, re, sys, os

def tags_of(d):
    """找出所有 MDL?xxxx 标签及其偏移。"""
    out = []
    pat = re.compile(rb'MDL[A-Z][0-9]{4}')
    for m in pat.finditer(d):
        out.append((m.start(), d[m.start():m.start()+8].decode()))
    return out

def analyze(path):
    d = open(path, 'rb').read()
    print(f"\n{'='*70}\n{os.path.basename(path)}  ({len(d)} bytes)")
    # 头部
    magic = d[0:8]
    print(f"  魔数: {magic.decode()}")
    # 前 8 个 u32
    u32s = struct.unpack_from('<8I', d, 8) if len(d) >= 40 else ()
    print(f"  头 8×u32: {list(u32s)}")
    # 找字符串（可打印序列）
    strs = re.findall(rb'[ -~]{5,}', d[:200])
    print(f"  头部字符串: {[s.decode(errors='replace') for s in strs[:5]]}")
    # 块标签
    tags = tags_of(d)
    print(f"  块标签 ({len(tags)}):")
    for i, (off, tag) in enumerate(tags):
        end = tags[i+1][0] if i+1 < len(tags) else len(d)
        size = end - off
        print(f"    @0x{off:06x} {tag}  size={size}")

def probe_region(d, start, end, label):
    """分析一块区域：u32 计数 + 浮点数组候选。"""
    print(f"  --- {label} @0x{start:06x}..0x{end:06x} ({end-start} bytes) ---")
    pos = start
    # 跳过前几个 u32 看结构
    for k in range(min(6, (end-start)//4)):
        v, = struct.unpack_from('<I', d, pos)
        print(f"    u32[{k}] = {v} (0x{v:x})", end="")
        pos += 4
        if k % 3 == 2: print()
    print()
    # 浮点数组检测：从头按 4 字节步进，找连续 8 字节对齐的 float 运行
    # 找最长的 "合理 float" 连续段（0<|x|<10000）
    def is_float(b):
        f, = struct.unpack_from('<f', b)
        return abs(f) < 1e6 and not (f != f)
    # 统计 4 字节步进的 float 合法性
    pos = start
    runs = []
    run_start = None
    while pos + 4 <= end:
        ok = is_float(d[pos:pos+4])
        if ok and run_start is None: run_start = pos
        if not ok and run_start is not None:
            runs.append((run_start, pos)); run_start = None
        pos += 4
    if run_start is not None: runs.append((run_start, end))
    # 输出最长的几个 float 运行
    runs.sort(key=lambda r: r[1]-r[0], reverse=True)
    for rs, re_ in runs[:4]:
        nf = (re_-rs)//4
        f0 = struct.unpack_from('<4f', d, rs)
        print(f"    float 运行: {nf} floats @0x{rs:06x} 首4值={[round(x,3) for x in f0]}")

if __name__ == '__main__':
    for p in sys.argv[1:]:
        analyze(p)
        d = open(p,'rb').read()
        tags = tags_of(d)
        for i, (off, tag) in enumerate(tags):
            end = tags[i+1][0] if i+1 < len(tags) else len(d)
            if end - off > 100:
                probe_region(d, off, end, tag)
