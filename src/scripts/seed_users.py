import os
import pymongo
import bcrypt
from dotenv import load_dotenv
import sys
from pymongo import uri_parser # Add this import
from bson import ObjectId # Import ObjectId

# Determine the project root directory (assuming the script is in src/scripts)
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
dotenv_path = os.path.join(project_root, '.env.local')

# Load environment variables from .env.local at the project root
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path=dotenv_path)
    print(f"Loaded environment variables from: {dotenv_path}")
else:
    print(f"Warning: .env.local file not found at {dotenv_path}. Make sure MONGODB_URI is set in your environment.")

# --- Configuration ---
MONGODB_URI = os.environ.get("MONGODB_URI")
DATABASE_NAME = "secex_day3" # Replace with your actual database name if not in URI

if not MONGODB_URI:
    print("Error: MONGODB_URI environment variable not set.")
    # Use forward slashes or raw string for the path to avoid unicode escape errors
    print("Please create a .env.local file in the project root (c:/Users/tejasv/Documents/secex-day3)")
    print("and add the MONGODB_URI variable, or set it in your system environment.")
    sys.exit(1)

# --- User Data ---
# Same user data as provided previously
sample_users = [
  # Team Users (Ensure this list order matches the ObjectId list below)
  { 'name': 'Team B001 User', 'email': 'teamb001user@cdac.in', 'role': 'participant', 'handle': 'teamb001user', 'password': 'B001470c!#' },
  { 'name': 'Team D001 User', 'email': 'teamd001user@cdac.in', 'role': 'participant', 'handle': 'teamd001user', 'password': 'D0014ea1!#' },
  { 'name': 'Team M001 User', 'email': 'teamm001user@cdac.in', 'role': 'participant', 'handle': 'teamm001user', 'password': 'M0014173!#' },
  { 'name': 'Team K001 User', 'email': 'teamk001user@cdac.in', 'role': 'participant', 'handle': 'teamk001user', 'password': 'K0014290!#' },
  { 'name': 'Management User', 'email': 'mgmtuser@cdac.in', 'role': 'participant', 'handle': 'mgmtuser', 'password': 'Mgmt4198!#' },
  { 'name': 'Team B002 User', 'email': 'teamb002user@cdac.in', 'role': 'participant', 'handle': 'teamb002user', 'password': 'B002498d!#' },
  { 'name': 'Team B003 User', 'email': 'teamb003user@cdac.in', 'role': 'participant', 'handle': 'teamb003user', 'password': 'B0034a2f!#' },
  { 'name': 'Team B004 User', 'email': 'teamb004user@cdac.in', 'role': 'participant', 'handle': 'teamb004user', 'password': 'B004492a!#' },
  { 'name': 'Team B005 User', 'email': 'teamb005user@cdac.in', 'role': 'participant', 'handle': 'teamb005user', 'password': 'B00547f7!#' },
  { 'name': 'Team B006 User', 'email': 'teamb006user@cdac.in', 'role': 'participant', 'handle': 'teamb006user', 'password': 'B006446e!#' },
  { 'name': 'Team B007 User', 'email': 'teamb007user@cdac.in', 'role': 'participant', 'handle': 'teamb007user', 'password': 'B00747a2!#' },
  { 'name': 'Team B008 User', 'email': 'teamb008user@cdac.in', 'role': 'participant', 'handle': 'teamb008user', 'password': 'B00843ff!#' },
  { 'name': 'Team B009 User', 'email': 'teamb009user@cdac.in', 'role': 'participant', 'handle': 'teamb009user', 'password': 'B0094533!#' },
  { 'name': 'Team B010 User', 'email': 'teamb010user@cdac.in', 'role': 'participant', 'handle': 'teamb010user', 'password': 'B01041e5!#' },
  { 'name': 'Team D002 User', 'email': 'teamd002user@cdac.in', 'role': 'participant', 'handle': 'teamd002user', 'password': 'D002443c!#' },
  { 'name': 'Team D003 User', 'email': 'teamd003user@cdac.in', 'role': 'participant', 'handle': 'teamd003user', 'password': 'D00345a2!#' },
  { 'name': 'Team D004 User', 'email': 'teamd004user@cdac.in', 'role': 'participant', 'handle': 'teamd004user', 'password': 'D0044710!#' },
  { 'name': 'Team D005 User', 'email': 'teamd005user@cdac.in', 'role': 'participant', 'handle': 'teamd005user', 'password': 'D0054485!#' },
  { 'name': 'Team D006 User', 'email': 'teamd006user@cdac.in', 'role': 'participant', 'handle': 'teamd006user', 'password': 'D0064abf!#' },
  { 'name': 'Team D007 User', 'email': 'teamd007user@cdac.in', 'role': 'participant', 'handle': 'teamd007user', 'password': 'D0074e77!#' },
  { 'name': 'Team D008 User', 'email': 'teamd008user@cdac.in', 'role': 'participant', 'handle': 'teamd008user', 'password': 'D008459a!#' },
  { 'name': 'Team D009 User', 'email': 'teamd009user@cdac.in', 'role': 'participant', 'handle': 'teamd009user', 'password': 'D00946e4!#' },
  { 'name': 'Team D010 User', 'email': 'teamd010user@cdac.in', 'role': 'participant', 'handle': 'teamd010user', 'password': 'D01046c6!#' },
  { 'name': 'Team D011 User', 'email': 'teamd011user@cdac.in', 'role': 'participant', 'handle': 'teamd011user', 'password': 'D01141d9!#' },
  { 'name': 'Team D012 User', 'email': 'teamd012user@cdac.in', 'role': 'participant', 'handle': 'teamd012user', 'password': 'D012454b!#' },
  { 'name': 'Team M002 User', 'email': 'teamm002user@cdac.in', 'role': 'participant', 'handle': 'teamm002user', 'password': 'M0024fbd!#' },
  { 'name': 'Team M003 User', 'email': 'teamm003user@cdac.in', 'role': 'participant', 'handle': 'teamm003user', 'password': 'M0034653!#' },
  { 'name': 'Team M004 User', 'email': 'teamm004user@cdac.in', 'role': 'participant', 'handle': 'teamm004user', 'password': 'M004416e!#' },
  { 'name': 'Team M005 User', 'email': 'teamm005user@cdac.in', 'role': 'participant', 'handle': 'teamm005user', 'password': 'M0054bdc!#' },
  { 'name': 'Team M006 User', 'email': 'teamm006user@cdac.in', 'role': 'participant', 'handle': 'teamm006user', 'password': 'M0064f79!#' },
  { 'name': 'Team M007 User', 'email': 'teamm007user@cdac.in', 'role': 'participant', 'handle': 'teamm007user', 'password': 'M007443e!#' },
  { 'name': 'Team M008 User', 'email': 'teamm008user@cdac.in', 'role': 'participant', 'handle': 'teamm008user', 'password': 'M0084dea!#' },
  { 'name': 'Team M009 User', 'email': 'teamm009user@cdac.in', 'role': 'participant', 'handle': 'teamm009user', 'password': 'M0094235!#' },
  { 'name': 'Team M010 User', 'email': 'teamm010user@cdac.in', 'role': 'participant', 'handle': 'teamm010user', 'password': 'M0104b9c!#' },
  { 'name': 'Team M011 User', 'email': 'teamm011user@cdac.in', 'role': 'participant', 'handle': 'teamm011user', 'password': 'M0114d63!#' },
  { 'name': 'Team M012 User', 'email': 'teamm012user@cdac.in', 'role': 'participant', 'handle': 'teamm012user', 'password': 'M0124d7a!#' },
  { 'name': 'Team K002 User', 'email': 'teamk002user@cdac.in', 'role': 'participant', 'handle': 'teamk002user', 'password': 'K0024ee0!#' },
  { 'name': 'Team K003 User', 'email': 'teamk003user@cdac.in', 'role': 'participant', 'handle': 'teamk003user', 'password': 'K0034ee0!#' },
  { 'name': 'Team K004 User', 'email': 'teamk004user@cdac.in', 'role': 'participant', 'handle': 'teamk004user', 'password': 'K0044983!#' },
  { 'name': 'Team K005 User', 'email': 'teamk005user@cdac.in', 'role': 'participant', 'handle': 'teamk005user', 'password': 'K005409f!#' },
  { 'name': 'Team K006 User', 'email': 'teamk006user@cdac.in', 'role': 'participant', 'handle': 'teamk006user', 'password': 'K0064fad!#' },
  { 'name': 'Team K007 User', 'email': 'teamk007user@cdac.in', 'role': 'participant', 'handle': 'teamk007user', 'password': 'K0074b98!#' },
  { 'name': 'Team K008 User', 'email': 'teamk008user@cdac.in', 'role': 'participant', 'handle': 'teamk008user', 'password': 'K008465e!#' },
  { 'name': 'Team K009 User', 'email': 'teamk009user@cdac.in', 'role': 'participant', 'handle': 'teamk009user', 'password': 'K009448d!#' },
  { 'name': 'Team K010 User', 'email': 'teamk010user@cdac.in', 'role': 'participant', 'handle': 'teamk010user', 'password': 'K0104c1e!#' },
  { 'name': 'Team K011 User', 'email': 'teamk011user@cdac.in', 'role': 'participant', 'handle': 'teamk011user', 'password': 'K0114f70!#' },
  # Admin Users
  { 'name': 'Admin One', 'email': 'admin1@cdac.in', 'role': 'admin', 'handle': 'admin1', 'password': 'AdminPassword1!#' }, # Replace with a strong, unique password
  { 'name': 'Admin Two', 'email': 'admin2@cdac.in', 'role': 'admin', 'handle': 'admin2', 'password': 'AdminPassword2!#' }, # Replace with a strong, unique password
]

# --- Hardcoded ObjectIds (ensure order matches sample_users) ---
hardcoded_oids = [
    "68038d30016d47bb63ab466f", "68038d30016d47bb63ab466c", "68038d30016d47bb63ab4670",
    "68038d30016d47bb63ab466e", "68038d30016d47bb63ab466b", "68038d30016d47bb63ab4659",
    "68038d30016d47bb63ab4665", "68038d30016d47bb63ab4672", "68038d30016d47bb63ab4666",
    "68038d30016d47bb63ab4669", "68038d30016d47bb63ab4663", "68038d30016d47bb63ab4675",
    "68038d30016d47bb63ab467b", "68038d30016d47bb63ab4661", "68038d30016d47bb63ab4679",
    "68038d30016d47bb63ab4674", "68038d30016d47bb63ab4671", "68038d30016d47bb63ab4678",
    "68038d30016d47bb63ab4680", "68038d30016d47bb63ab4658", "68038d30016d47bb63ab465d",
    "68038d30016d47bb63ab465c", "68038d30016d47bb63ab465e", "68038d30016d47bb63ab4657",
    "68038d30016d47bb63ab4667", "68038d30016d47bb63ab467d", "68038d30016d47bb63ab4668",
    "68038d30016d47bb63ab465a", "68038d30016d47bb63ab465f", "68038d30016d47bb63ab4677",
    "68038d30016d47bb63ab467e", "68038d30016d47bb63ab4676", "68038d30016d47bb63ab4662",
    "68038d30016d47bb63ab4660", "68038d30016d47bb63ab467f", "68038d30016d47bb63ab466a",
    "68038d30016d47bb63ab467c", "68038d30016d47bb63ab4673",
    # Add OIDs for Admin users if needed, ensure total count matches sample_users
    "68038d30016d47bb63ab4681", # Example OID for Admin One
    "68038d30016d47bb63ab4682"  # Example OID for Admin Two
]

# Check if the number of users matches the number of OIDs
if len(sample_users) != len(hardcoded_oids):
    print(f"Error: Mismatch between number of users ({len(sample_users)}) and number of ObjectIds ({len(hardcoded_oids)}).")
    sys.exit(1)


# --- Seeding Logic ---
client = None # Initialize client to None
try:
    print(f"🌱 Attempting to connect to MongoDB: {MONGODB_URI}")
    # Add serverSelectionTimeoutMS to handle connection issues faster
    client = pymongo.MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    # The ismaster command is cheap and does not require auth.
    client.admin.command('ismaster')
    print("✅ Successfully connected to MongoDB server.")

    # Infer database name from URI if not specified, otherwise use DATABASE_NAME
    db_name = uri_parser.parse_uri(MONGODB_URI)['database'] # Use the imported uri_parser
    if not db_name:
        if DATABASE_NAME == "your_database_name": # Check if placeholder is still used
             print(f"Error: Database name not found in URI and DATABASE_NAME placeholder is not replaced.")
             print("Please specify the database name in your MONGODB_URI or update the DATABASE_NAME variable in the script.")
             sys.exit(1)
        else:
            db_name = DATABASE_NAME

    db = client[db_name]
    users_collection = db["users"] # Assuming your collection is named 'users'
    print(f"✅ Selected database '{db_name}' and collection '{users_collection.name}'.")

    # Clear existing users
    print(f"🗑️ Clearing existing documents from '{users_collection.name}' collection...")
    delete_result = users_collection.delete_many({})
    print(f"📦 Cleared {delete_result.deleted_count} existing user documents.")

    # Prepare users for insertion (hash passwords and add ObjectId)
    print("🔑 Hashing passwords and assigning ObjectIds...")
    users_to_insert = []
    for i, user_data in enumerate(sample_users):
        # Assign the hardcoded ObjectId
        user_data["_id"] = ObjectId(hardcoded_oids[i])

        plain_password = user_data.get("password")
        if plain_password:
            # Encode password to bytes, required by bcrypt
            password_bytes = plain_password.encode('utf-8')
            # Generate salt and hash password
            hashed_password = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
            # Store the hashed password (as bytes or decode to string if needed by schema)
            user_data["password"] = hashed_password # Store as bytes (recommended for bcrypt)
            # If your schema expects a string, decode it:
            # user_data["password"] = hashed_password.decode('utf-8')
        else:
             print(f"Warning: User {user_data.get('email')} has no password defined. Skipping hashing.")

        # Add required fields if missing (like timestamps if your schema expects them)
        # from datetime import datetime, timezone
        # user_data['createdAt'] = datetime.now(timezone.utc)
        # user_data['updatedAt'] = datetime.now(timezone.utc)

        users_to_insert.append(user_data)
    print("✅ Passwords hashed and ObjectIds assigned.")

    # Insert users
    print(f"👤 Inserting {len(users_to_insert)} users into '{users_collection.name}'...")
    if users_to_insert:
        insert_result = users_collection.insert_many(users_to_insert, ordered=False)
        print(f"👥 Successfully inserted {len(insert_result.inserted_ids)} user documents.")
    else:
        print("🤷 No users to insert.")

    print("✅ User seeding completed successfully!")

except pymongo.errors.ServerSelectionTimeoutError as err:
    print(f"❌ MongoDB Connection Error: Could not connect to the server. Check your MONGODB_URI and network.")
    print(f"   Error details: {err}")
except pymongo.errors.OperationFailure as err:
    print(f"❌ MongoDB Operation Failure: Check credentials and permissions.")
    print(f"   Error details: {err.details}")
except Exception as e:
    print(f"❌ An unexpected error occurred during seeding: {e}")
    import traceback
    traceback.print_exc() # Print detailed traceback

finally:
    if client:
        client.close()
        print("🚪 Database connection closed.")

