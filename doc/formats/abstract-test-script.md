# Abstract Test Script

An abstract test script is a test case converted to a machine-readable format, such as JSON.

## JSON

Extension: `.testcase.json`

See: `AbstractTestScript.ts`

```javascript
{
    "schemaVersion": "1.0",
    "sourceFile": "path/to/somefile.testcase",

    "feature": {
        "location": { "column": 1, "line": 1 },
        "name": "login"
    },

    "scenarios": [
        {
            "location": { "column": 1, "line": 3 },
            "name": "successful login"
        },
        {
            "location": { "column": 1, "line": 10 },
            "name": "unsuccessful login"
        }
    ],  

    "testcases": [
        {
            "location": { "column": 1, "line": 40 },
            "name": "successful login",
            "invalid": true,

            "feature": "login",
            "scenario": "successful login",
            
            "commands": [
                {
                    "location": { "column": 1, "line": 41 },
                    "id": "a7b5c3d4",
                    "action": "see",
                    "target": [ "Login" ],
                    "targetType": "text"
                },
                {
                    "location": { "column": 1, "line": 42 },
                    "id": "a8b6c4d5",
                    "action": "fill",
                    "target": [ "#username" ],
                    "targetType": "textbox",
                    "values": [ "bob" ],
                    "invalid": true
                },
                {
                    "location": { "column": 1, "line": 43 },
                    "id": "s8a7s8",
                    "action": "click",
                    "target": [ "#enter" ],
                    "targetType": "button"
                }                
            ]
        }
    ]

}
```