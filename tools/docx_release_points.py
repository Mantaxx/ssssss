from docx import Document
import re

def dms_to_decimal(txt: str) -> float:
    m = re.search(r"([+-]?\d+)[°º\s]+(\d+)[′'\s]+(\d+(?:\.\d+)?)[\"”\s]*\s*([NSEW])?", txt)
    if not m:
        raise ValueError(f"Invalid DMS: {txt}")
    deg, minutes, seconds, dirc = m.groups()
    deg = float(deg); minutes = float(minutes); seconds = float(seconds)
    sign = -1 if (dirc and dirc.upper() in ['S','W']) else 1
    dec = abs(deg) + minutes/60 + seconds/3600
    return sign * dec

def parse_docx(path: str):
    doc = Document(path)
    rows = []
    for tbl in doc.tables:
        for row in tbl.rows:
            cells = [c.text.strip() for c in row.cells]
            if len(cells) < 3:
                continue
            place = cells[0]
            lat = dms_to_decimal(cells[1])
            lon = dms_to_decimal(cells[2])
            rows.append({"name": place, "lat": lat, "lon": lon})
    return rows

if __name__ == "__main__":
    import sys, json
    print(json.dumps(parse_docx(sys.argv[1]), ensure_ascii=False, indent=2))

