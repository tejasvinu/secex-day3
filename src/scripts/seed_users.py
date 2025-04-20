import os
import pymongo
import bcrypt
from dotenv import load_dotenv
import sys
from pymongo import uri_parser
from bson.objectid import ObjectId # Import ObjectId
import traceback

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
DATABASE_NAME = "secex_day3" # Default DB name if not in URI

if not MONGODB_URI:
    print("Error: MONGODB_URI environment variable not set.")
    # Use forward slashes or raw string for the path
    print(r"Please create a .env.local file in the project root (e.g., c:\Users\tejasv\Documents\secex-day3)")
    print("and add the MONGODB_URI variable, or set it in your system environment.")
    sys.exit(1)

# --- User Data ---
# Order matters here - it must correspond to the object_ids list below
sample_users = [
  # Team Users
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
  { 'name': 'Admin One', 'email': 'admin1@cdac.in', 'role': 'admin', 'handle': 'admin1', 'password': 'AdminPassword1!#' },
  { 'name': 'Admin Two', 'email': 'admin2@cdac.in', 'role': 'admin', 'handle': 'admin2', 'password': 'AdminPassword2!#' },
]

# --- Hardcoded ObjectIds ---
# Ensure this list has the EXACT same number of items as sample_users
# and is in the corresponding order based on creation time/first appearance.
object_ids = [
    "68038d30016d47bb63ab466f", "68038d30016d47bb63ab466c",
    "68038d30016d47bb63ab4670", "68038d30016d47bb63ab466e",
    "68038d30016d47bb63ab466b", "68038d30016d47bb63ab4659",
    "68038d30016d47bb63ab4665", "68038d30016d47bb63ab4672",
    "68038d30016d47bb63ab4666", "68038d30016d47bb63ab4669",
    "68038d30016d47bb63ab4663", "68038d30016d47bb63ab4675",
    "68038d30016d47bb63ab467b", "68038d30016d47bb63ab4661",
    "68038d30016d47bb63ab4679", "68038d30016d47bb63ab4674",
    "68038d30016d47bb63ab4671", "68038d30016d47bb63ab4678",
    "68038d30016d47bb63ab4680", "68038d30016d47bb63ab4658",
    "68038d30016d47bb63ab465d", "68038d30016d47bb63ab465c",
    "68038d30016d47bb63ab465e", "68038d30016d47bb63ab4657",
    "68038d30016d47bb63ab4667", "68038d30016d47bb63ab467d",
    "68038d30016d47bb63ab4668", "68038d30016d47bb63ab465a",
    "68038d30016d47bb63ab465f", "68038d30016d47bb63ab4677",
    "68038d30016d47bb63ab467e", "68038d30016d47bb63ab4676",
    "68038d30016d47bb63ab4662", "68038d30016d47bb63ab4660",
    "68038d30016d47bb63ab467f", "68038d30016d47bb63ab466a",
    "68038d30016d47bb63ab467c", "68038d30016d47bb63ab4673",
    # Add the rest of your ObjectIds here if needed
    # Make sure the total count is 49 (to match sample_users)
    "68038d30016d47bb63ab467e", # Placeholder - replace if needed
    "68038d30016d47bb63ab467e", # Placeholder - replace if needed
    "68038d30016d47bb63ab467e", # Placeholder - replace if needed
    "68038d30016d47bb63ab467e", # Placeholder - replace if needed
    "68038d30016d47bb63ab467e", # Placeholder - replace if needed
    "68038d30016d47bb63ab467e", # Placeholder - replace if needed
    "68038d30016d47bb63ab467e", # Placeholder - replace if needed
    "68038d30016d47bb63ab467e", # Placeholder - replace if needed
    "68038d30016d47bb63ab467e", # Placeholder - replace if needed
    "68038d30016d47bb63ab467e", # Placeholder - replace if needed
]

# --- Length Check ---
if len(sample_users) != len(object_ids):
    print(f"Error: Mismatch between number of users ({len(sample_users)}) and provided ObjectIds ({len(object_ids)}).")
    print("Please ensure the object_ids list has the same number of elements as the sample_users list.")
    sys.exit(1)

# --- Seeding Logic ---
client = None # Initialize client to None
try:
    print(f"🌱 Attempting to connect to MongoDB: {MONGODB_URI}")
    client = pymongo.MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ismaster')
    print("✅ Successfully connected to MongoDB server.")

    # Infer database name from URI or use default
    parsed_uri = uri_parser.parse_uri(MONGODB_URI)
    db_name = parsed_uri.get('database') # Use .get() for safety
    if not db_name:
        if DATABASE_NAME == "your_database_name": # Check if placeholder is still used
             print(f"Error: Database name not found in URI and default placeholder 'your_database_name' is used.")
             print("Please specify the database name in your MONGODB_URI or update the DATABASE_NAME variable.")
             sys.exit(1)
        db_name = DATABASE_NAME
        print(f"Database name not in URI, using default: '{db_name}'")
    else:
         print(f"Database name found in URI: '{db_name}'")


    db = client[db_name]
    users_collection = db["users"] # Assuming your collection is named 'users'
    print(f"✅ Selected database '{db_name}' and collection '{users_collection.name}'.")

    # Clear existing users
    print(f"🗑️ Clearing existing documents from '{users_collection.name}' collection...")
    delete_result = users_collection.delete_many({})
    print(f"📦 Cleared {delete_result.deleted_count} existing user documents.")

    # Prepare users for insertion (assign ID, hash passwords)
    print("🔧 Preparing users for insertion (assigning IDs and hashing passwords)...")
    users_to_insert = []
    # Use zip to iterate through users and their corresponding ObjectIds
    for user_data, oid_str in zip(sample_users, object_ids):
        # --- Assign the hardcoded ObjectId FIRST ---
        try:
            user_data["_id"] = ObjectId(oid_str)
        except Exception as id_err:
             print(f"Error converting ObjectId string '{oid_str}' for user {user_data.get('email')}: {id_err}")
             continue # Skip this user if ID is invalid

        # --- Hash the password ---
        plain_password = user_data.get("password")
        if plain_password:
            try:
                password_bytes = plain_password.encode('utf-8')
                hashed_password = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
                user_data["password"] = hashed_password # Store as bytes
            except Exception as hash_err:
                 print(f"Error hashing password for user {user_data.get('email')} (ID: {oid_str}): {hash_err}")
                 # Decide if you want to skip or insert without password
                 continue # Skip user if hashing fails
        else:
             print(f"Warning: User {user_data.get('email')} (ID: {oid_str}) has no password defined. Skipping hashing.")

        # Add timestamps or other fields if needed
        # from datetime import datetime, timezone
        # user_data['createdAt'] = datetime.now(timezone.utc)
        # user_data['updatedAt'] = datetime.now(timezone.utc)

        users_to_insert.append(user_data)
    print("✅ User preparation complete.")

    # Insert users
    print(f"👤 Inserting {len(users_to_insert)} prepared users into '{users_collection.name}'...")
    if users_to_insert:
        insert_result = users_collection.insert_many(users_to_insert, ordered=False) # ordered=False can speed up bulk inserts slightly
        print(f"👥 Successfully inserted {len(insert_result.inserted_ids)} user documents.")
        # Verify count matches expected
        if len(insert_result.inserted_ids) != len(users_to_insert):
             print(f"Warning: Expected to insert {len(users_to_insert)} users, but only {len(insert_result.inserted_ids)} were inserted.")
    else:
        print("🤷 No valid users were prepared for insertion.")

    print("✅ User seeding completed successfully!")

except pymongo.errors.ServerSelectionTimeoutError as err:
    print(f"❌ MongoDB Connection Error: Could not connect to the server. Check your MONGODB_URI and network.")
    print(f"   Error details: {err}")
except pymongo.errors.OperationFailure as err:
    print(f"❌ MongoDB Operation Failure: Check credentials and permissions.")
    print(f"   Error details: {err.details}")
except Exception as e:
    print(f"❌ An unexpected error occurred during seeding: {e}")
    traceback.print_exc() # Print detailed traceback

finally:
    if client:
        client.close()
        print("🚪 Database connection closed.")