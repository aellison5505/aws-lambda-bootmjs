#!/usr/bin/env node
const { BootStrap } = await import("./bootstrap.mjs");
let main = async () => {
    console.log(`handler: ${process.env._HANDLER}`);
    try {
        let boot = new BootStrap();
        await boot.startRuntime();
        //console.log("done");
        process.nextTick(main);
    }
    catch (e) {
        // throw new Error(e);
        //process.nextTick(main);
        return;
    }
};
main();
export {};
