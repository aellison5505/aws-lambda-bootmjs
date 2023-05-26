import { captureRejectionSymbol } from "node:events";
import { RequestApi } from "./RequestApi.mjs";
const { existsSync } = await import("node:fs");

export class Runtime {
  handler: unknown;
  lambdaFuc: Function;
  eventData: any;
  reqAPI: RequestApi;

  constructor() {
    this.reqAPI = new RequestApi();
    this.handler = process.env._HANDLER.split(".") || ["", ""];
  }

  async start(): Promise<unknown> {
    return new Promise(async (res, rej) => {
      //console.log(this.lambdaFuc)
      try {
      
        /*
        if (existsSync(`/usr/src/task/${this.handler[0]}.js`)) {
          this.lambdaFuc = await import(`/usr/src/task/${this.handler[0]}.js`);
        } else if (existsSync(`/usr/src/task/${this.handler[0]}.mjs`)) {
          this.lambdaFuc = await import(`/usr/src/task/${this.handler[0]}.mjs`);
        } else {
          this.reqAPI.sendError(new Error("handler not found",this.eventData.headers),{
            cause: console.trace()
          });
          console.log("err not found")
          rej(null)
          return
        }

        */

        switch (true) {
          case await this.getModule("js"):
            break;
          case await this.getModule("mjs"):
            break;
          default:
            let e = new Error("handler not found", {
              cause: `${console.trace()}`
            })
            await this.reqAPI.sendError(e)
            console.log("err not found");
            rej(e);
            return;
            break;
        }


        const callFunc = this.lambdaFuc[`${this.handler[1]}`];

        this.eventData = await this.reqAPI.getNext();

        //console.log('req called');
        //console.log(eventData);
        let context = {
          getRemainingTimeInMillis: () => {
            const tRem =
              this.eventData.headers["lambda-runtime-deadline-ms"] - Date.now();
            return tRem;
          },
          functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
          functionVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION,
          invokedFunctionArn:
            this.eventData.headers["lambda-runtime-invoked-function-arn"] || "",
          memoryLimitInMB: process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE,
          awsRequestId:
            this.eventData.headers["lambda-runtime-aws-request-id"] || "",
          logGroupName: process.env.AWS_LAMBDA_LOG_GROUP_NAME,
          logStreamName: process.env.AWS_LAMBDA_LOG_STREAM_NAME,
          clientContext:
            this.eventData.headers["lambda-runtime-client-context"] || "",
          callbackWaitsForEmptyEventLoop: false,
          identity: {},
        };

        if (this.eventData.headers["lambda-runtime-cognito-identity"]) {
          context.identity = JSON.parse(
            this.eventData.headers["lambda-runtime-cognito-identity"]
          );
        }

        //console.log(context);

        let funcRet = await callFunc(JSON.parse(this.eventData.body), context);

        console.log("funcRet");
        console.log(funcRet);

        let data = await this.reqAPI.sendResponse(
          this.eventData.headers,
          funcRet
        );

        res(data);
      } catch (e) {
        let ret: unknown;
        if (this.eventData)
        await this.reqAPI.sendError(e, this.eventData.headers);
        else ret = await this.reqAPI.sendError(e);
        rej(e);
        return;
      }
    });
  }

  async getModule(ext: string) {
    return new Promise(async (ret) => {
      try {
        console.log(`./${this.handler[0]}.${ext}`)
        this.lambdaFuc = await import(`${process.env['PWD']}/${this.handler[0]}.${ext}`);
        ret(true);
      } catch {
        ret(false);
      }
  });
}
    
}
