import os

BASE_DIR = "data/uploads"

def save_file(project_id: str, file):
    """
    Save a file to object storage.
    """
    os.makedirs(f"{BASE_DIR}/{project_id}", exist_ok=True)

    path = f"{BASE_DIR}/{project_id}/{file.filename}"
    with open(path, "wb") as f:
        f.write(file.file.read())

    return path
