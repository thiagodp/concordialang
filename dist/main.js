import { main } from "./modules/cli/cli-main";
process.on('uncaughtException', console.error);
process.on('SIGINT', () => {
    console.log('\nAborted. Bye!');
    process.exit(1);
});
main(__dirname, process.cwd())
    .then((success) => {
    process.exit(success ? 0 : 1);
})
    .catch((err) => {
    console.error(err);
    process.exit(1);
});
