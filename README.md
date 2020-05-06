# SFTROUWeb
## A web-based version of Sisyphus for the Rest of Us

The [original version](https://github.com/markyland/SisyphusForTheRestOfUs) by [markyland](https://github.com/markyland/) is still used in the backend of the application.   

Feel free to test it out at https://sftrou.omarelamri.me.

## Technologies used
- React
- Ionic Framework
- TypeScript
- WebSockets
- Node.JS
- Java

## Build instructions
Dependencies:
- Java (>v8??)
- Node.JS (>v12)
    - other JavaScript dependencies are highlighted in the package.json files
- A working SSL key and certificate (one can easily obtain from Let's Encrypt)

Firstly, change directory into  `frontend/SFTROUWeb`. Then, open `src/Serverconn.tsx`. At the top, there will be a `URL` constant that references the server hostname. Change that as needed. Next, run `npm install` to install all the JavaScript dependencies. Provided there are no errors, run `npm run build`. That will create a production build of the React application and copy it to the backend so it can host the website along with the WebSockets server. 

After that, build the Java algorithm by changing directory to `backend` and running `javac SFTROUCLI.java`. 

Now, the final step is to build the server. In `backend`, run `npm install` and subsequently `npm run build`. 

## Run instructions

Before running the server, an SSL key and certificate is needed. Provide paths to both by setting environment variables `SSLCERT` and `SSLKEY` to their respective values.

Finally, run the server by changing directory into `backend` and running `node build/main.js`. Root permissions may be needed since the server is served on port 443. 

## Known bugs
- Since progress is sent to the frontend by piping STDOUT of the Java process to Node.JS, percentages can show up as a long string instead of subsequent status updates. (Especially true of the Debian version.)

- Instead of throwing an error when the image cannot be parsed, a status update of "Java heap collection" is sent. 
