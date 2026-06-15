"""
课件索引生成器
扫描 courses/ 目录下所有包含 index.html + meta.json 的课件文件夹，
自动生成 data/courses.json 索引文件。

用法：
    python generate.py           # 生成 courses.json
    python generate.py --watch   # 持续监听文件变化（开发用）
"""
import json
import os
import sys
import time
from pathlib import Path
from hashlib import md5

# 项目根目录（脚本所在目录）
ROOT = Path(__file__).resolve().parent
COURSES_DIR = ROOT / "courses"
DATA_DIR = ROOT / "data"
OUTPUT_FILE = DATA_DIR / "courses.json"

# 年级配置（如需新增年级，在此添加）
GRADES_CONFIG = [
    {"id": "grade1", "name": "一年级", "description": "探索知识的起点"},
    {"id": "grade2", "name": "二年级", "description": "夯实基础，稳步成长"},
    {"id": "grade3", "name": "三年级", "description": "拓展视野，探索新知"},
    {"id": "grade4", "name": "四年级", "description": "深化学习，提升能力"},
    {"id": "grade5", "name": "五年级", "description": "知识积累，厚积薄发"},
    {"id": "grade6", "name": "六年级", "description": "毕业前夕，整装待发"},
]


def scan_courses() -> list:
    """扫描 courses/ 目录，返回课件列表"""
    courses = []
    if not COURSES_DIR.exists():
        print(f"[警告] courses 目录不存在: {COURSES_DIR}")
        return courses

    # 遍历 courses/gradeX/courseName/
    for grade_dir in sorted(COURSES_DIR.iterdir()):
        if not grade_dir.is_dir():
            continue

        grade_id = grade_dir.name  # e.g. "grade3"

        for course_dir in sorted(grade_dir.iterdir()):
            if not course_dir.is_dir():
                continue

            index_html = course_dir / "index.html"
            meta_json = course_dir / "meta.json"

            if not index_html.exists():
                print(f"[跳过] {course_dir.name}: 缺少 index.html")
                continue

            # 读取 meta.json
            meta = {}
            if meta_json.exists():
                try:
                    meta = json.loads(meta_json.read_text(encoding="utf-8"))
                except json.JSONDecodeError as e:
                    print(f"[警告] {course_dir.name}/meta.json 格式错误: {e}")
                    continue

            course_id = course_dir.name  # 文件夹名即课件ID
            file_path = f"courses/{grade_id}/{course_id}/index.html"

            courses.append({
                "id": course_id,
                "title": meta.get("title", course_id),
                "grade": grade_id,
                "subject": meta.get("subject", "未分类"),
                "createdAt": meta.get("createdAt", "2026-01-01"),
                "filePath": file_path
            })

    return courses


def generate():
    """生成 courses.json"""
    courses = scan_courses()

    output = {
        "grades": GRADES_CONFIG,
        "courses": courses
    }

    # 确保 data 目录存在
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    # 写入文件（美化格式）
    json_str = json.dumps(output, ensure_ascii=False, indent=2)
    OUTPUT_FILE.write_text(json_str, encoding="utf-8")

    grade_ids = set(c["grade"] for c in courses)
    print(f"✅ 已生成 {OUTPUT_FILE}")
    print(f"   年级数: {len(GRADES_CONFIG)}  课件数: {len(courses)}")
    for g in GRADES_CONFIG:
        count = sum(1 for c in courses if c["grade"] == g["id"])
        print(f"   {g['name']}: {count} 个课件")


def watch():
    """监听 courses/ 目录变化，自动重新生成（开发用）"""
    print("👀 正在监听 courses/ 目录变化... (Ctrl+C 停止)")
    last_hash = ""

    try:
        while True:
            # 简单实现：每2秒检查一次文件修改时间
            current_hash = _dir_hash(COURSES_DIR)
            if current_hash != last_hash:
                last_hash = current_hash
                print("\n🔄 检测到变化，重新生成...")
                generate()
                print("👀 继续监听...")
            time.sleep(2)
    except KeyboardInterrupt:
        print("\n👋 已停止监听")


def _dir_hash(directory: Path) -> str:
    """计算目录下所有文件的哈希（用于变化检测）"""
    if not directory.exists():
        return ""
    hasher = md5()
    for f in sorted(directory.rglob("*")):
        if f.is_file() and f.name not in (".DS_Store", "Thumbs.db"):
            hasher.update(str(f.stat().st_mtime).encode())
    return hasher.hexdigest()


if __name__ == "__main__":
    if "--watch" in sys.argv or "-w" in sys.argv:
        watch()
    else:
        generate()
