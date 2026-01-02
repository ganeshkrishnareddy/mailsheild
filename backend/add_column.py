import sqlite3

def add_column():
    conn = sqlite3.connect('mailshield.db')
    cursor = conn.cursor()
    
    try:
        # Check if column exists first to avoid error
        cursor.execute("PRAGMA table_info(users)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if 'quarantine_enabled' not in columns:
            print("Adding quarantine_enabled column...")
            cursor.execute("ALTER TABLE users ADD COLUMN quarantine_enabled BOOLEAN DEFAULT 0")
            conn.commit()
            print("Column added successfully.")
        else:
            print("Column 'quarantine_enabled' already exists.")
            
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    add_column()
