
# Structure

```javascript

// file info
dec[ hash ] = {
    name: string; // name without path. e.g. "a.asl"
    paths: string[]; // paths where the file was found. e.g.: [ 'path/to/', '../to/' ]
    // content: string; // file lines (needed? -> maybe not -> can be read )
}

// parse
parsed[ hash ] =  {

    problems: [
        {
            line: number,
            message: string,
            type: string // 'error' | 'warning'
        }
    ],

    // Used to check inclusions
    inclusions: string[]; // hashes. e.g. [ "b3c4d6", "c7d6e5" ]

    // Declarations
    features: [
        {
            name: string;
            description: string;

            scenarios: [
                {
                    number?: string;
                    name: string
                    sentences: string[];
                    parsed: [
                        {
                            ???
                        }
                    ]
                }
            ],

            ui: [
                {

                }
            ],

            rules: [
                {

                }
            ],

            tasks: [
                {
                    when: string;   // 'BAT' = before all the tests, 
                                    // 'BET' = before each test,
                                    // 'AET' = after each test,
                                    // 'AAT' = after all the tests
                    what: [
                        {
                            action: 'script' | 'command',
                            name?: string;
                            content?: string;
                            // name or content is used, bot not both
                        }
                    ]
                }
            ]

        }
    ]


};

// Hash for each file.
// When including a file, generate a hash. If the hash does not exists, include it in "dec".
//
fileHashes = {};
fileHashes[ 'path/to/a.asl' ] = 'a1b2c3';
fileHashes[ '../to/a.asl' ] = 'a1b2c3';
```
