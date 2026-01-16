import sqlite3

conn = sqlite3.connect('mailshield.db')
cursor = conn.cursor()

# Get existing columns
existing = [row[1] for row in cursor.execute('PRAGMA table_info(users)').fetchall()]
print(f"Existing columns: {existing}")

# Columns to add
columns_to_add = [
    ('is_locked', 'BOOLEAN DEFAULT 0'),
    ('notification_level', 'TEXT DEFAULT "all"'),
    ('notification_enabled', 'BOOLEAN DEFAULT 1'),
    ('quarantine_enabled', 'BOOLEAN DEFAULT 0'),
    ('auto_labeling_enabled', 'BOOLEAN DEFAULT 0'),
]

for col_name, col_def in columns_to_add:
    if col_name not in existing:
        try:
            cursor.execute(f'ALTER TABLE users ADD COLUMN {col_name} {col_def}')
            print(f"Added column: {col_name}")
        except Exception as e:
            print(f"Column {col_name} already exists or error: {e}")

conn.commit()
conn.close()
print("Done!")
