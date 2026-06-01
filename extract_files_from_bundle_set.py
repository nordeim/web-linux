# Let me extract and analyze the key files for deep understanding
# First, let me parse the bundle content properly

with open('codebase_fileset_bundle.md', 'r') as f:
    content = f.read()

# Parse files from the bundle
import re

# Find all file blocks (filename followed by code block)
# Pattern: # filename\n```lang\n...code...\n```
file_pattern = r'^# (app/[^\n]+)\n```[^\n]*\n(.*?)\n```'

# Better approach: split by file headers
lines = content.split('\n')
files = {}
current_file = None
current_content = []

for line in lines:
    if line.startswith('# app/'):
        if current_file:
            files[current_file] = '\n'.join(current_content)
        current_file = line[2:].strip()  # Remove "# " prefix
        current_content = []
    elif line.startswith('```') and current_file and not current_content:
        # Skip the language marker line
        continue
    elif line.startswith('```') and current_file and current_content:
        # End of code block
        files[current_file] = '\n'.join(current_content)
        current_file = None
        current_content = []
    elif current_file:
        current_content.append(line)

# Check last file
if current_file and current_content:
    files[current_file] = '\n'.join(current_content)

print(f"Successfully parsed {len(files)} files")
print("\nKey files available:")
for k in sorted(files.keys()):
    print(f"  - {k} ({len(files[k])} chars)")

