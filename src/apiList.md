## authtication
Post/signup
post/login
post/logout

## connectionRequestRouter
- POST /request/send/intereted/:userId
- POST /request/send/ignored/:userId

-	
- GET /request/review/friend-requests
- POST /request/review/accepted/:requestId
- POST /request/review/rejected/:requestId


## User should see all the user cards except
// 0. his own card
// 1. his connections
// 2. ignored people
// 3. already sent the connection request
