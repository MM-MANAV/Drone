import re
import os

# Determine project root based on this script's location
# Current file is in Setup/scripts/
script_dir = os.path.dirname(os.path.abspath(__file__)) # Setup/scripts
setup_dir = os.path.dirname(script_dir) # Setup
base_dir = os.path.dirname(setup_dir) # Project Root

index_path = os.path.join(setup_dir, 'index.html')
template_dir = os.path.join(base_dir, 'App', 'backend', 'templates')
static_dir = os.path.join(base_dir, 'App', 'backend', 'static')

with open(index_path, 'r') as f:
    content = f.read()

# Extract CSS
css_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
css_content = ""
if css_match:
    css_content = css_match.group(1).strip()
    # Remove the style block and replace with Jinja link
    content = re.sub(r'<style>.*?</style>', '<link rel="stylesheet" href="{{ url_for(\'static\', path=\'/style.css\') }}">', content, flags=re.DOTALL)

# Extract JS
js_match = re.search(r'<script>(.*?)</script>', content, re.DOTALL)
js_content = ""
if js_match:
    js_content = js_match.group(1).strip()
    # Remove the script block and replace with Jinja script tag
    content = re.sub(r'<script>.*?</script>', '<script src="{{ url_for(\'static\', path=\'/script.js\') }}"></script>', content, flags=re.DOTALL)

# Write files
with open(os.path.join(static_dir, 'style.css'), 'w') as f:
    f.write(css_content)

with open(os.path.join(static_dir, 'script.js'), 'w') as f:
    f.write(js_content)

with open(os.path.join(template_dir, 'index.html'), 'w') as f:
    f.write(content)

print("Files split successfully!")
