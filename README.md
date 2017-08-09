# selfmanaged_robots

The robot assignment today is another train wreck. Here is what I would like to see as a successful assignment: Be able to create a new robot through a sign up form, add that new robot to the existing database of robots, and have that robot populate to the robot page. Use password hashing and authentication. THEN, be able to edit the robot that you created.

TLDR: Don’t worry about the already existing robots that are in the database because it seems pointless to either manually give them passwords (the defeats the purpose of password hashing) or recreate the database just for fun-sies. For the images, just use any images or repeat the robot urls in the data.JS file. (edited)


How to retrieve MongoDB database:

mongoimport --db newdb --collection userdirectories --out userdirectories.json



