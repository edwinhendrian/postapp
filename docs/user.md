# User API Spec

# Register User API Spec

Endpoint : POST /api/users

Request Body :

```json
{
    "username": "user",
    "email": "edwinhendrian23@gmail.com",
    "password": "rahasia",
    "name": "Edwin Hendrian"
}
```

Response Body Success :

```json
{
    "data": {
        "id": 1,
        "username": "user",
        "email": "edwinhendrian23@gmail.com",
        "name": "Edwin Hendrian"
    }
}
```

Response Body Error :

```json
{
    "errors": "Username already registered"
}
```

# Login User API Spec

Endpoint : POST /api/users/login

Request Body :

```json
{
    "username": "user",
    "password": "rahasia"
}
```

Response Body Success :

```json
{
    "data": {
        "token": "unique-token"
    }
}
```

Response Body Error :

```json
{
    "errors": "Username or password wrong"
}
```

# Get User API Spec

Endpoint : GET /api/users/current

Headers :

-   Authorization : token

Response Body Success :

```json
{
    "data": {
        "id": 1,
        "username": "user",
        "email": "edwinhendrian23@gmail.com",
        "name": "Edwin Hendrian"
    }
}
```

Response Body Error :

```json
{
    "errors": "Unauthorized"
}
```

# Update User API Spec

Endpoint : PATCH /api/users/current

Headers :

-   Authorization : token

Request Body :

```json
{
    "username": "userupdate", // optional
    "email": "edwinhendrian2303@gmail.com", // optional
    "name": "Edwin Hendrian Update", // optional
    "password": "new password" // optional
}
```

Response Body Success :

```json
{
    "data": {
        "id": 1,
        "username": "userupdate",
        "email": "edwinhendrian2303@gmail.com",
        "name": "Edwin Hendrian Update"
    }
}
```

Response Body Error :

```json
{
    "errors": "Name length max 100"
}
```

# Logout User API Spec

Endpoint : DELETE /api/users/logout

Headers :

-   Authorization : token

Response Body Success :

```json
{
    "data": "OK"
}
```

Response Body Error :

```json
{
    "errors": "Unauthorized"
}
```
