start with running in terminal :

cd endometriosis-backend

pip install -r requirements.txt
```markdown
start with running in terminal:

cd endometriosis-backend

pip install -r requirements.txt


To set up the project locally:

1. Run the database setup script:

   python create_db.py

2. Verify the database; initially there will be no users.

3. Run the API tests to populate demo data and check basic functionality:

   python tests/test_api.py

   Expected partial output:

   No demo lesson found. Creating one...
    Current database contents:
   Users:
     1: Admin User (admin)
     2: Member User (member)

   Courses:
     1: Demo Course

   Modules:
     1: Demo Module (Course 1)

   Lessons:
     1: Demo Lesson (Module 1)

4. Run `check_permits` to confirm endpoint permissions. Example expected table:

   Endpoint                                Admin   Member  Description
   --------------------------------------------------------------------------------
   POST /courses                           ✅       ❌       Create course
   POST /modules                           ✅       ❌       Create module
   POST /lessons                           ✅       ❌       Create lesson
   GET /courses                            ✅       ✅       View all courses
   GET /courses/1/modules                  ✅       ✅       View modules of course
   GET /modules/1/lessons                  ✅       ✅       View lessons of module
   POST /lessons/1/progress                ✅       ✅       Mark lesson complete

5. Finally, run the application:

   python app.py

   The site will be available at: http://127.0.0.1:5000


