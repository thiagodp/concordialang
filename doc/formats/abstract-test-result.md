# Abstract Test Result

## JSON

Extension: `.result.json`

WARNING: WIP

```javascript
{
    "schemaVersion": 1.0,
    "sourceFile": "somefile.testcase.json",
    "plugin": {
        "name": "concordialang-codeceptjs",
        "version": "1.0",
        "frameworks": [ "CodeceptJS" ]
    },
    "started": "2017-09-29T21:59:18.236Z",
    "finished": "2017-09-29T22:03:18.236Z",
    "durationMs": 4000,
    "total": {
        "tests": 10,
        "passed": 7,
        "skipped": 1,
        "failed": 1,
        "error": 1,
        "unknown": 0
    },
    "results": [
        {
            "suite": "TestSuite",
            "methods": [
                {
                    "name": "startServer",
                    "status": "failed",
                    "durationMs": 500,
                    "isForSetup": true, // e.g. setUp/setUpOnce/before/beforeAll
                    "exception": {
                        "type": "RuntimeError",
                        "message": "Couldn't connect to selenium server.",
                        "file": "SomeFile.ext",
                        "line": 50,                        
                        "stackTrace": "..."
                    }
                }
            ]
        }
    ]
}
```