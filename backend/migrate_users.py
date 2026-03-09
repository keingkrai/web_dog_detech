import asyncio
from database import engine
from sqlalchemy import text

async def main():
    try:
        async with engine.begin() as conn:
            await conn.execute(text("ALTER TABLE users ADD COLUMN full_name VARCHAR(100);"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR(150);"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN organization VARCHAR(100);"))
        print("Successfully added profile columns to users table.")
    except Exception as e:
        print(f"Error migrating (columns might already exist): {e}")

if __name__ == "__main__":
    asyncio.run(main())
