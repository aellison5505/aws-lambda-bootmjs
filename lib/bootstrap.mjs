import { Runtime } from "./Runtime.mjs";
export class BootStrap {
    reqAPI;
    runtime;
    constructor() {
        console.log(process.env);
        this.runtime = new Runtime();
    }
    async startRuntime() {
        return new Promise(async (res, rej) => {
            await this.runtime.start()
                .catch((e) => {
                console.error(e);
                rej(e);
            });
            res(null);
        });
    }
}
