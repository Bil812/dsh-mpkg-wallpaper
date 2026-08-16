#!/usr/bin/env python3
"""wallpaper64.exe xref 追踪工具：找字符串引用 → 反汇编函数。"""
import struct, sys
from capstone import *

EXE = "winbin/wallpaper_engine/wallpaper64.exe"
data = open(EXE, 'rb').read()
pe = struct.unpack_from('<I', data, 0x3c)[0]
imgbase = struct.unpack_from('<Q', data, pe+24+24)[0]
# sections
nsec = struct.unpack_from('<H', data, pe+6)[0]
optsize = struct.unpack_from('<H', data, pe+20)[0]
sec_off = pe + 24 + optsize
secs = {}
for s in range(nsec):
    o = sec_off + s*40
    name = data[o:o+8].rstrip(b'\x00').decode()
    vsize, vaddr, rsize, rptr = struct.unpack_from('<IIII', data, o+8)
    secs[name] = (vaddr, rptr, rsize)

def file_to_va(foff):
    for name, (vaddr, rptr, rsize) in secs.items():
        if rptr <= foff < rptr + rsize:
            return imgbase + vaddr + (foff - rptr)
    return None

def va_to_file(va):
    for name, (vaddr, rptr, rsize) in secs.items():
        if vaddr <= va - imgbase < vaddr + rsize:
            return rptr + (va - imgbase - vaddr)
    return None

def find_string(s):
    """找字符串的所有出现及 VA。"""
    b = s.encode()
    out = []
    j = 0
    while True:
        j = data.find(b, j)
        if j < 0: break
        out.append((j, file_to_va(j)))
        j += 1
    return out

def find_xrefs(target_va):
    """扫描 .text 找 lea rip+disp 指向 target_va。"""
    vaddr, rptr, rsize = secs['.text']
    text = data[rptr:rptr+rsize]
    hits = []
    modrm_ok = (0x05,0x0d,0x15,0x1d,0x25,0x2d,0x35,0x3d)
    for i in range(len(text)-7):
        b = text[i]
        if b in (0x48, 0x4c, 0x44) and text[i+1] == 0x8d and text[i+2] in modrm_ok:
            disp = struct.unpack_from('<i', text, i+3)[0]
            lea_va = imgbase + vaddr + i
            if lea_va + 7 + disp == target_va:
                hits.append(lea_va)
    return hits

def disasm_range(start_va, nbytes):
    f = va_to_file(start_va)
    if f is None: return []
    md = Cs(CS_ARCH_X86, CS_MODE_64)
    return list(md.disasm(data[f:f+nbytes], start_va))

def trace_function(entry_va, limit=120):
    """从入口反汇编直到 ret（简化）。"""
    f = va_to_file(entry_va)
    if f is None: return []
    md = Cs(CS_ARCH_X86, CS_MODE_64)
    insns = []
    for ins in md.disasm(data[f:f+4000], entry_va):
        insns.append(ins)
        if ins.mnemonic == 'ret':
            break
        if len(insns) > limit:
            break
    return insns

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else "MDLS0002"
    hits = find_string(target)
    print(f"'{target}' 出现 {len(hits)} 次: {[(hex(h), hex(v) if v else '-') for h, v in hits]}")
    for foff, va in hits:
        if va is None: continue
        xrefs = find_xrefs(va)
        print(f"  引用: {[hex(x) for x in xrefs]}")
        for x in xrefs:
            # 找函数开头（向前找 ret+int3 或序言）
            insns = disasm_range(x - 0x200, 0x200)
            # 简化：直接打印 xref 附近
            insns2 = disasm_range(x - 0x40, 0x160)
            for ins in insns2:
                print(f"    0x{ins.address:x}: {ins.mnemonic:8s} {ins.op_str}")
