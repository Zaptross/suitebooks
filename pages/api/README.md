# API Guide

This api is designed using the rough principles from google's resource-based api design documentation, available here:
https://cloud.google.com/apis/design/resources

Some example routes (assumed to be after the base url):

- Create a new User
  - `POST /users`
- Get a user's details
  - `GET /users/:userUuid`
- Book a room for a user
  - `POST /bookings/:roomUuid/:fromTimestamp/:toTimestamp/:userUuid`
- Log in a user / get a login token
  - `POST /sessions`
