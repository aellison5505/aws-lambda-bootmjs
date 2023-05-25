

import { RequestApi } from "./RequestApi.mjs";
import { Runtime } from "./Runtime.mjs";

export class BootStrap {
  reqAPI:RequestApi
  runtime: Runtime

  constructor() {

    this.runtime = new Runtime();
  }

  async startRuntime () {
    return new Promise(async (res,rej) => {
      await this.runtime.start()
      .catch((e) => {
        console.error(e);
        rej(e)
      });
      res(null);
    })
   

  }
}
