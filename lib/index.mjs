#!/usr/bin/env node
const { BootStrap } = await import("./bootstrap.mjs");
let cont = true;
let main = async () => {
    console.log(`handler: ${process.env._HANDLER}`);
    try {
        let boot = new BootStrap();
        await boot.startRuntime();
        //console.log("done");
        process.nextTick(main);
    }
    catch (e) {
        cont = false;
        throw new Error(e);
        //process.nextTick(main);
        return;
    }
};
await main();
export {};
