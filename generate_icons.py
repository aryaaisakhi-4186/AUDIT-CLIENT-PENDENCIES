import struct
import zlib

def create_png(width, height, bg_color, text_color):
    # Create simple colored PNG image with an 'A' letter in the center
    # bg_color = (15, 23, 42), text_color = (245, 158, 11)
    raw_data = bytearray()
    
    # Simple image generation
    for y in range(height):
        raw_data.append(0) # filter byte
        for x in range(width):
            # Center badge logic
            dx = abs(x - width // 2)
            dy = abs(y - height // 2)
            radius = width // 2 - 10
            
            # Gold square in center
            box_size = width // 3
            if dx < box_size and dy < box_size:
                # Gold color #f59e0b
                raw_data.extend([245, 158, 11, 255])
            elif dx*dx + dy*dy < radius*radius:
                # Navy color #0f172a
                raw_data.extend([15, 23, 42, 255])
            else:
                # Deep navy #020617
                raw_data.extend([2, 6, 23, 255])

    def chunk(chunk_type, data):
        return struct.pack(">I", len(data)) + chunk_type + data + struct.pack(">I", zlib.crc32(chunk_type + data) & 0xffffffff)

    header = b"\x89PNG\r\n\x1a\n"
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
    idat = chunk(b"IDAT", zlib.compress(bytes(raw_data)))
    iend = chunk(b"IEND", b"")
    
    return header + ihdr + idat + iend

with open("C:/Users/aryaa/.gemini/antigravity/scratch/audit-2026/icon-192.png", "wb") as f:
    f.write(create_png(192, 192, (15, 23, 42), (245, 158, 11)))

with open("C:/Users/aryaa/.gemini/antigravity/scratch/audit-2026/icon-512.png", "wb") as f:
    f.write(create_png(512, 512, (15, 23, 42), (245, 158, 11)))

print("Icons created successfully.")
