# Post API Spec

# Create Post API Spec

Endpoint : POST /api/posts

Headers :

-   Authorization : token

Request Body :

```json
{
    "text": "first post"
}
```

Response Body Success :

```json
{
    "data": {
        "id": 92,
        "text": "first post",
        "reply_count": 0,
        "like_count": 0,
        "user": {
            "id": 162,
            "username": "arale",
            "name": "Arale"
        },
        "created_at": "<timestamp>",
        "updated_at": "<timestamp>"
    }
}
```

Response Body Error :

```json
{
    "errors": "Text length max 140"
}
```

# Get Post API Spec

Endpoint : GET /api/posts/:post_id

Headers :

-   Authorization : token

Response Body Success :

```json
{
    "data": {
        "id": 1,
        "text": "first post",
        "post": null,
        "replies": [
            {
                "id": 90,
                "text": "reply post",
                "reply_count": 0,
                "like_count": 0,
                "user": {
                    "id": 1,
                    "username": "edwinhendrian",
                    "name": "Edwin Hendrian"
                },
                "created_at": "<timestamp>",
                "updated_at": "<timestamp>"
            }
        ],
        "reply_count": 2,
        "like_count": 2,
        "user": {
            "id": 1,
            "username": "edwinhendrian",
            "name": "Edwin Hendrian"
        },
        "created_at": "<timestamp>",
        "updated_at": "<timestamp>"
    }
}
```

Response Body Error :

```json
{
    "errors": "Unauthorized"
}
```

# Reply Post API Spec

Endpoint : POST /api/posts/:post_id

Headers :

-   Authorization : token

Request Body :

```json
{
    "text": "reply post"
}
```

Response Body Success :

```json
{
    "data": {
        "id": 91,
        "text": "reply post",
        "post_id": 1,
        "reply_count": 0,
        "like_count": 0,
        "user": {
            "id": 162,
            "username": "arale",
            "name": "Arale"
        },
        "created_at": "<timestamp>",
        "updated_at": "<timestamp>"
    }
}
```

Response Body Error :

```json
{
    "errors": "Post is not found"
}
```

# Delete Post API Spec

Endpoint : DELETE /api/posts/:post_id

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
    "errors": "Post is not found"
}
```

# Like Post API Spec

Endpoint : GET /api/posts/:post_id/like

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
    "errors": "Already liked the post"
}
```

# Unlike Post API Spec

Endpoint : DELETE /api/posts/:post_id/like

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
    "errors": "Post is not found"
}
```

# Get All User's Post API Spec

Endpoint : GET /api/users/:user_id/posts

Headers :

-   Authorization : token

Response Body Success :

```json
{
    "data": [
        {
            "id": 1,
            "text": "first post",
            "replies": [
                {
                    "id": 90,
                    "text": "reply post",
                    "reply_count": 0,
                    "like_count": 0,
                    "user": {
                        "id": 1,
                        "username": "edwinhendrian",
                        "name": "Edwin Hendrian"
                    },
                    "created_at": "<timestamp>",
                    "updated_at": "<timestamp>"
                }
            ],
            "reply_count": 2,
            "like_count": 2,
            "user": {
                "id": 1,
                "username": "edwinhendrian",
                "name": "Edwin Hendrian"
            },
            "created_at": "<timestamp>",
            "updated_at": "<timestamp>"
        }
    ]
}
```

Response Body Error :

```json
{
    "errors": "Unauthorized"
}
```

# Get All User's Reply API Spec

Endpoint : GET /api/users/:user_id/replies

Headers :

-   Authorization : token

Response Body Success :

```json
{
    "data": [
        {
            "id": 90,
            "text": "reply post",
            "post": {
                "id": 1,
                "text": "first post",
                "reply_count": 2,
                "like_count": 2,
                "user": {
                    "id": 1,
                    "username": "edwinhendrian",
                    "name": "Edwin Hendrian"
                },
                "created_at": "<timestamp>",
                "updated_at": "<timestamp>"
            },
            "replies": [],
            "reply_count": 0,
            "like_count": 0,
            "user": {
                "id": 1,
                "username": "edwinhendrian",
                "name": "Edwin Hendrian"
            },
            "created_at": "<timestamp>",
            "updated_at": "<timestamp>"
        }
    ]
}
```

Response Body Error :

```json
{
    "errors": "Unauthorized"
}
```
