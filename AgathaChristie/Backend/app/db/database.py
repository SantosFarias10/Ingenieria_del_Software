from pony.orm import Database

db = Database()
_initialized = False

def init_pony():
    global _initialized
    if _initialized:
        return

    db.bind(provider="sqlite", filename="database.sqlite", create_db=True)
    db.generate_mapping(create_tables=True)
    _initialized = True
