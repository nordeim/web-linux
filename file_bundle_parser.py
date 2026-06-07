# Now let me parse the full bundle and extract each file's content for analysis
import re

# Parse the bundle into individual files
file_pattern = r'^# ([^\n]+\.\w+)\n```\w*\n(.*?)\n```'
# More robust parsing - find all code blocks with their preceding headers

files = {}
current_file = None
current_content = []

lines = content.split('\n')
i = 0
while i < len(lines):
    line = lines[i]
    # Check for file header
    if line.startswith('# ') and not line.startswith('# ##') and not line.startswith('# ###'):
        # Save previous file if exists
        if current_file and current_content:
            files[current_file] = '\n'.join(current_content)
        current_file = line[2:].strip()
        current_content = []
        i += 1
        continue
    
    # Check for code block start
    if line.startswith('```'):
        # Skip the ``` line
        i += 1
        code_lines = []
        while i < len(lines) and not lines[i].startswith('```'):
            code_lines.append(lines[i])
            i += 1
        # Skip the closing ```
        if i < len(lines):
            i += 1
        current_content.extend(code_lines)
        continue
    
    i += 1

# Save last file
if current_file and current_content:
    files[current_file] = '\n'.join(current_content)

print(f"Successfully parsed {len(files)} files")
print("\nKey files:")
for key in sorted(files.keys())[:20]:
    print(f"  {key}: {len(files[key])} chars")

