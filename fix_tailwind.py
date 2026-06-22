import os
import re

def fix_tailwind_classes(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replacements mapping
    replacements = {
        r'\b(zinc|emerald|blue|amber|rose|purple|sky|red|green)-150\b': r'\1-200',
        r'\b(zinc|emerald|blue|amber|rose|purple|sky|red|green)-250\b': r'\1-300',
        r'\b(zinc|emerald|blue|amber|rose|purple|sky|red|green)-350\b': r'\1-400',
        r'\b(zinc|emerald|blue|amber|rose|purple|sky|red|green)-450\b': r'\1-500',
        r'\b(zinc|emerald|blue|amber|rose|purple|sky|red|green)-550\b': r'\1-600',
        r'\b(zinc|emerald|blue|amber|rose|purple|sky|red|green)-650\b': r'\1-700',
        r'\b(zinc|emerald|blue|amber|rose|purple|sky|red|green)-750\b': r'\1-800',
        r'\b(zinc|emerald|blue|amber|rose|purple|sky|red|green)-850\b': r'\1-900',
        r'\b(zinc|emerald|blue|amber|rose|purple|sky|red|green)-955\b': r'\1-950',
        r'\b(zinc|emerald|blue|amber|rose|purple|sky|red|green)-[0-9]{2}[1-9]\b': lambda m: f"{m.group(1)}-{m.group(0).split('-')[1][:2]}0" # 909 -> 900
    }

    new_content = content
    for pattern, repl in replacements.items():
        new_content = re.sub(pattern, repl, new_content)

    # Some specific fixes for those ending in random digits like 909, 805, 404, 505
    new_content = re.sub(r'\b(zinc|emerald|blue|amber|rose|purple|sky)-([1-9])0[1-9]\b', r'\1-\200', new_content)
    new_content = re.sub(r'\b(zinc|emerald|blue|amber|rose|purple|sky)-([1-9])4[0-9]\b', r'\1-\200', new_content) # text-zinc-440 -> 400

    if content != new_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed: {file_path}")

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.jsx', '.js')):
            fix_tailwind_classes(os.path.join(root, file))

