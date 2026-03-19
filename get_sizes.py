import os

def get_dir_size(start_path = '.'):
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(start_path):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            if not os.path.islink(fp) and os.path.exists(fp):
                total_size += os.path.getsize(fp)
    return total_size

for d in os.listdir('.'):
    p = os.path.join('.', d)
    if os.path.isdir(p):
        size = get_dir_size(p)
        print(f"DIR  {d}: {size / (1024**3):.4f} GB")
    else:
        print(f"FILE {d}: {os.path.getsize(p) / (1024**3):.6f} GB")
