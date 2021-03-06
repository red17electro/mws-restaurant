# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

### How to run the project?

Please, follow the next steps in order to run the project.

1. First of all, for the files `index.html` and `restaurant.html`, change the `YOUR_GOOGLE_MAP_API_KEY` to your actual Google Maps API Key.

2. Then you need to start the server from the `/server` folder ([it's here](https://github.com/red17electro/mws-restaurant/tree/master/server)) (**!important)**.

   To do that, please run the command `node server` in the root directory of it.

3. Now, once your server is set up, you can run the actual project. As it is under gulp, the latest build is located in the directory `dist`. Therefore, start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer. 

In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8887` (or some other port, if port 8887 is already in use.) For Python 3.x, you can use `python3 -m http.server 8887`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.

​	With your server running, visit the site: `http://localhost:8887`.

#### Additional information 

In case you want to rebuild the whole project, run the command:

````cmd 
gulp dist
````
