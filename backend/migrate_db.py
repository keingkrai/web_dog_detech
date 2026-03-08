import asyncio
from database import engine
from sqlalchemy import text

async def main():
    try:
        async with engine.begin() as conn:
            await conn.execute(text("ALTER TABLE screening_history ADD COLUMN latitude FLOAT;"))
            await conn.execute(text("ALTER TABLE screening_history ADD COLUMN longitude FLOAT;"))
        print("Successfully added latitude and longitude to screening_history.")
    except Exception as e:
        print(f"Error migrating (columns might already exist or table missing): {e}")

if __name__ == "__main__":
    asyncio.run(main())
