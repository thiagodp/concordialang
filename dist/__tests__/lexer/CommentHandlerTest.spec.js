"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CommentHandler_1 = require("../../modules/lexer/CommentHandler");
describe('CommentHandlerTest', () => {
    let ch; // under test
    beforeEach(() => ch = new CommentHandler_1.CommentHandler());
    afterEach(() => ch = null);
    describe('removes a comment from', () => {
        it('a sentence that contains a UI Literal without hashtag', () => {
            let r = ch.removeComment('Given that I click <hello> # hey');
            expect(r).toEqual('Given that I click <hello>');
        });
        it('a sentence that contains a UI Literal with hashtag', () => {
            let r = ch.removeComment('Given that I click <#hello> # hey');
            expect(r).toEqual('Given that I click <#hello>');
        });
        it('a sentence that contains a value with hashtag', () => {
            let r = ch.removeComment('Given that I click "#hello" # hey');
            expect(r).toEqual('Given that I click "#hello"');
        });
        it('a sentence that contains a value with hashtag and ui literal with hashtag', () => {
            let r = ch.removeComment('Given that I click "#hello", <#world> # hey');
            expect(r).toEqual('Given that I click "#hello", <#world>');
        });
        it('a sentence that contains a value with hashtag, ui literal, and other stuff with hashtag', () => {
            let r = ch.removeComment('Given that I click "#hello", <#world>, and wait 5 seconds # hey');
            expect(r).toEqual('Given that I click "#hello", <#world>, and wait 5 seconds');
        });
        it('a sentence starting with a command', () => {
            let r = ch.removeComment("Given that I run 'command'#foo");
            expect(r).toEqual("Given that I run 'command'");
        });
        it('a sentence starting with a comment', () => {
            let r = ch.removeComment("\t #hello", true);
            expect(r).toEqual("\t ");
        });
        it('a list item', () => {
            let r = ch.removeComment('- foo#comment');
            expect(r).toEqual('- foo');
        });
    });
    describe('does not remove a comment from', () => {
        it('a sentence without comment that contains a UI Literal with hashtag', () => {
            let r = ch.removeComment('Given that I click <#hello>');
            expect(r).toEqual('Given that I click <#hello>');
        });
        it('a sentence that contains a value with hashtag', () => {
            let r = ch.removeComment('Given that I click "#hello"');
            expect(r).toEqual('Given that I click "#hello"');
        });
        it('a sentence that contains a value with hashtag and ui literal with hashtag', () => {
            let r = ch.removeComment('Given that I click "#hello", <#world>');
            expect(r).toEqual('Given that I click "#hello", <#world>');
        });
        it('a sentence that contains a value with hashtag, ui literal with hashtag, and other stuff', () => {
            let r = ch.removeComment('Given that I click "#hello", <#world>, and wait 5 seconds');
            expect(r).toEqual('Given that I click "#hello", <#world>, and wait 5 seconds');
        });
        it('a sentence that contains a ui literal with hashtag, a value with hashtag, and other stuff', () => {
            let r = ch.removeComment('Given that I click <#world>, "#hello", and wait 5 seconds');
            expect(r).toEqual('Given that I click <#world>, "#hello", and wait 5 seconds');
        });
    });
    describe('CURRENTLY HAS LIMITATION OF', () => {
        it('not recognizing when comment has a value wrapper', () => {
            let r = ch.removeComment('Given that I click <#world>, "#hello", and wait 5 seconds # "');
            expect(r).toEqual('Given that I click <#world>, "#hello", and wait 5 seconds # "');
        });
        it('not recognizing when comment has a ui literal terminator', () => {
            let r = ch.removeComment('Given that I click <#world>, "#hello", and wait 5 seconds # >');
            expect(r).toEqual('Given that I click <#world>, "#hello", and wait 5 seconds # >');
        });
        it('not recognizing when comment has a command terminator', () => {
            let r = ch.removeComment('Given that I click <#world>, "#hello", and wait 5 seconds # \'');
            expect(r).toEqual('Given that I click <#world>, "#hello", and wait 5 seconds # \'');
        });
    });
});
