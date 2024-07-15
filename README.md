# Project: Stealth

## End-point: All Exercises

### Get All Exercises

This endpoint makes an HTTP GET request to retrieve all exercises available.

#### Request Body
This endpoint does not require a request body.

#### Response
- `exercises`: An array of objects containing details of all available exercises.
  - `id`: The unique identifier for the exercise.
  - `name`: The name of the exercise.
  - `category`: The category to which the exercise belongs.

Example:
```json
{
  "exercises": [
    {
      "id": 1,
      "name": "Exercise 1",
      "category": "Cardio"
    },
    {
      "id": 2,
      "name": "Exercise 2",
      "category": "Strength Training"
    }
  ]
}
```

### Method: GET
>```
>{{address}}:{{port}}/api/all_exercises
>```

⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃

## End-point: Target Exercise
# API Request Description

This endpoint is a GET request to retrieve a specific exercise by name. The request should be made to `{{address}}:{{port}}/api/specific_target_exercise/name/lats`.

### Request Body

This request does not require a request body.

### Response Body

The response will be in JSON format with the following schema:

``` json
{
    "status": "",
    "message": [
        {
            "_id": "",
            "bodyPart": "",
            "equipment": "",
            "gifUrl": "",
            "id": "",
            "name": "",
            "target": "",
            "secondaryMuscles": [""],
            "instructions": [""],
            "__v": 0
        }
    ]
}

 ```

The `status` field indicates the status of the response, and the `message` field contains an array of exercise objects with various attributes such as `_id`, `bodyPart`, `equipment`, `gifUrl`, `id`, `name`, `target`, `secondaryMuscles`, `instructions`, and `__v`.
### Method: GET
>```
>{{address}}:{{port}}/api/specific_target_exercise/name/lats
>```

⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃

## End-point: All Filtered List Exercises
# Get Filtered List of Exercises by Body Part

This endpoint retrieves a list of exercises filtered by the specified body part.

## Request

### URL

`GET /api/all_filtered_list_exercises/bodyPart`

- `address` (string): The base URL for the API.
    
- `port` (string): The port number for the API.
    

### Query Parameters

- `bodyPart` is the main filter. This can be any value within the schema
    
- `filter_criteria` (string, required): This can be any filtered value within the selected filter
    
    - Example: `target/abs`
        

## Response

The response will be a JSON object with the following properties:

- `exerciseId` (string): The unique identifier for the exercise.
    
- `exerciseName` (string): The name of the exercise.
    
- `bodyPart` (string): The body part targeted by the exercise.
    

## Time for Completion

The time taken to complete this request will depend on the server load and network conditions.

``` json
{
    "exercises": [
        {
            "id": "1234",
            "name": "Exercise 1",
            "bodyPart": "waist"
        },
        {
            "id": "5678",
            "name": "Exercise 2",
            "bodyPart": "waist"
        }
    ]
}

 ```
### Method: GET
>```
>{{address}}:{{port}}/api/all_filtered_list_exercises/bodyPart?filter_criteria=waist
>```
### Query Params

|Param|value|
|---|---|
|filter_criteria|waist|



⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃

## End-point: Specific Filtered List
This API endpoint makes an HTTP GET request to retrieve a filtered list based on the specified body part. The request should be sent to {{address}}:{{port}}/api/all_filtered_list/bodyPart.

### Request Parameters

- `bodyPart` (string, required): The specific filtered value for which the list is being filtered.
    

### Response

The response will contain the filtered list of items based on the specified body part. The structure of the response data will include the following keys:

- `item1`: Description of item 1
    
- `item2`: Description of item 2
    

``` json
{
    "status": "success",
    "message": [
        "waist",
        "back",
        "lower legs",
        "chest",
        "upper legs",
        "upper arms",
        "cardio",
        "shoulders",
        "lower arms",
        "neck"
    ]
}
 ```
### Method: GET
>```
>{{address}}:{{port}}/api/all_filtered_list/bodyPart
>```

⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃

## End-point: Test API Endpoint
### Method: GET
>```
>{{address}}:{{port}}/all_exercises
>```

⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃

## End-point: Create Account
### Create User Account

This endpoint allows the client to create a new user account.

#### Request Body

- `fullName` (string, required): The full name of the user.
    
- `email` (string, required): The email address of the user.
    
- `username` (string, required): The username chosen by the user.
    
- `password` (string, required): The password for the user account.
    
- `accessLevel` (string, required): The access level for the user account.
    

#### Response

The response for this request is a JSON object conforming to the following schema:

``` json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string"
    },
    "message": {
      "type": "string"
    }
  }
}

 ```
### Method: PUT
>```
>{{address}}:{{port}}/users/create_account
>```
### Body (**raw**)

```json
{
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "username": "janedoe",
    "password": "securepassword",
    "accessLevel": "668e160d1189c5010d026dd1"
}

```


⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃

## End-point: Login
This endpoint allows users to log in via a POST request. The request should include a JSON payload in the raw request body type with the "username" and "password" fields.

### Response

The response to this request is a JSON object with the following schema:

``` json
{
    "type": "object",
    "properties": {
        "status": {
            "type": "string"
        },
        "message": {
            "type": "object",
            "properties": {
                "fullName": {
                    "type": "string"
                },
                "email": {
                    "type": "string"
                },
                "username": {
                    "type": "string"
                },
                "isActive": {
                    "type": "boolean"
                },
                "accessLevel": {
                    "type": "string"
                },
                "createdAt": {
                    "type": "string"
                }
            }
        }
    }
}

 ```
### Method: POST
>```
>{{address}}:{{port}}/users/login
>```
### Body (**raw**)

```json
{
    "username": "janedoe",
    "password": "securepassword"
}

```


⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃
_________________________________________________
Powered By: [postman-to-markdown](https://github.com/bautistaj/postman-to-markdown/)