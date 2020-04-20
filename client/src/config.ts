// DONE: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'zdyl1xgq70'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-2.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'serveless-todo.auth0.com', // Auth0 domain
  clientId: 'ab9t953NlhyBnaxFKkWKWDq4WkXSYyb6', // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
