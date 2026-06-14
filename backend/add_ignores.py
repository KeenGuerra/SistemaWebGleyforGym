import os
import re

def main():
    src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "src"))
    print(f"Limpiando y agregando ignores detallados en {src_dir}...")
    
    count = 0
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(".py"):
                filepath = os.path.join(root, file)
                if process_file(filepath):
                    count += 1
                    
    print(f"Proceso completado. Se actualizaron {count} archivos.")

def process_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    lines = content.splitlines()
    new_lines = []
    modified = False
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Si la línea actual es un comentario de ignore viejo que nosotros o el usuario pusimos, la omitimos
        # para hacer una limpieza limpia y volver a generar los ignores de forma exacta.
        if "pyrefly: ignore [missing-import]" in line or "pyright: ignore [reportMissingImports]" in line:
            modified = True
            i += 1
            continue
            
        # Detectar si es una importación de src
        is_src_import = re.match(r"^\s*(from|import)\s+src(\.|\s)", line)
        
        if is_src_import:
            # Ponemos los comentarios de ignore justo arriba de ESTA línea de importación individual
            indent = re.match(r"^(\s*)", line).group(1)
            new_lines.append(f"{indent}# pyrefly: ignore [missing-import]")
            new_lines.append(f"{indent}# pyright: ignore [reportMissingImports]")
            modified = True
            
        new_lines.append(line)
        i += 1
        
    # Guardar si hubo modificaciones
    if modified:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write("\n".join(new_lines) + "\n")
        print(f"Actualizado: {filepath}")
        return True
    return False

if __name__ == "__main__":
    main()
