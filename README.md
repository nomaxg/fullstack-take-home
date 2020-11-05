# Course Application Take Home

---

## Requirements
- [docker](https://www.docker.com/)
- yarn (`brew install yarn`)

## Setup 

First, run the database and server.
- Install dependencies: `yarn`
- Navigate to the server directory: `cd server`
- Start the database: `yarn startdb`. If you encounter issues, ensure that docker is running.
- Start the server: `yarn start`
- In another terminal, navigate to the `server` directory. Seed the database with the starting data: `yarn populatedb`

Now start the frontend: 
- Navigate to the frontend directory: `cd course-client`
- Install depdendencies: `yarn`
- Start the app: `yarn start`

## Using the Application

1. Open the [application](http://localhost:3000/) in your browser.
2. Sign up with a valid username/password. You can also login with an existing username and password on the same form.
3. Explore courses! Hit "Preview schedule" to see a preview of the course content. And "course information" to join a section.
4. Find a section with an open slot and hit "join section". 
5. You will be able to see the released content and a list of section participants. You can also leave the section.

## Testing
To run API tests, navigate to the `server` directory and run `yarn test`. Running the server tests will reset the database, so run `yarn populatedb` after testing.

## Implementation Notes
This was a fun exercise! It's been awhile since I've used the React/Node stack and it was interesting to see how the React API has evolved. I found [hooks](https://reactjs.org/docs/hooks-intro.html) to be particularly useful. I also experimented a bit with user authorization and authentication, hashing passwords with [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) and using JSON web tokens. 
