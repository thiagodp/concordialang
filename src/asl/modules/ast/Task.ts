import { Node } from './Node';

//
// Task example 1:
// ```
// Before all the tests:
//   - Run script "script-name"
//   - Run command "command-name"
//   - Run command `cmd /k dir`
// ```

export interface TaskContent extends Node {
    
    action: 'script' | 'command';
    // name or content is used, bot not both
    name?: string;
    content?: string;
}

export interface Task extends Node {

    // When:
    // 'BAT' = before all the tests, 
    // 'BET' = before each test,
    // 'AET' = after each test,
    // 'AAT' = after all the tests    
    when: 'BAT' | 'BET' | 'AAT' | 'AET';

    content: Array< TaskContent >;
}