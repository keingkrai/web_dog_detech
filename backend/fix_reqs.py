import os
import io

req_path = r"c:\cuvet\backend\requirements.txt"
with io.open(req_path, "r", encoding="utf-16le") as f:
    content = f.read()

# Append new deps if not present
deps_to_add = ["passlib[bcrypt]", "python-jose[cryptography]", "python-multipart"]
for dep in deps_to_add:
    if dep.split("[")[0] not in content:
        content += f"\n{dep}"

with io.open(req_path, "w", encoding="utf-8") as f:
    f.write(content.strip() + "\n")
