#!/usr/bin/env python3
"""Сборка всех скриптов в один файл js/bundle.js.
Запускать после правки любого файла в js/:  python3 build.py
Порядок подключения важен — он такой же, каким был в index.html."""
import os, datetime

ORDER = ["enhance","data","booking","db","extras","features","admin",
         "icons","app","header","polish","extra","tabdrag","navfix","chatflow"]

def main():
    base = os.path.dirname(os.path.abspath(__file__))
    parts = ["/* bundle.js — собран автоматически из js/*.js (build.py). Не редактировать вручную. */",
             "/* Сборка: %s */" % datetime.date.today().isoformat()]
    for name in ORDER:
        path = os.path.join(base, "js", name + ".js")
        with open(path, encoding="utf-8") as f:
            parts.append("\n/* ───── js/%s.js ───── */\n" % name + f.read())
    out = os.path.join(base, "js", "bundle.js")
    text = "\n;\n".join(parts)
    with open(out, "w", encoding="utf-8") as f:
        f.write(text)
    print("js/bundle.js собран: %d файлов, %d КБ" % (len(ORDER), len(text.encode()) // 1024))

if __name__ == "__main__":
    main()
