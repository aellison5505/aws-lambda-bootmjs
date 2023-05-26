const http = await import("node:http");
//import {} from "../package.json"
export class RequestApi {
    getNext() {
        return new Promise(async (res, rej) => {
            console.log(process.env.AWS_LAMBDA_RUNTIME_API);
            let callAddr = `${process.env.AWS_LAMBDA_RUNTIME_API}`.split(":");
            const options = {
                host: `${callAddr[0]}`,
                path: `/2018-06-01/runtime/invocation/next`,
                port: callAddr[1],
                method: "GET",
            };
            await this.send(options)
                .then((data) => res(data))
                .catch(async (err) => {
                await this.sendError(err).catch((err) => rej(err));
                rej(err);
            });
        });
    }
    sendResponse(headers, sendRes) {
        //console.log(`REsp: ${sendRes}`);
        return new Promise(async (res, rej) => {
            if (sendRes === undefined) {
                sendRes = {};
            }
            let callAddr = `${process.env.AWS_LAMBDA_RUNTIME_API}`.split(":");
            let id = headers["lambda-runtime-aws-request-id"];
            const options = {
                host: `${callAddr[0]}`,
                path: `/2018-06-01/runtime/invocation/${id}/response`,
                port: callAddr[1],
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Object.keys(sendRes).length,
                },
            };
            await this.send(options, sendRes)
                .then((data) => {
                res(data);
            })
                .catch(async (err) => {
                //await this.sendError(err, headers).catch((err) => rej(err));
                rej(err);
            });
        });
    }
    sendError(sendErr, headers = {}) {
        console.log("in error");
        return new Promise(async (res, rej) => {
            let id = undefined;
            let path = undefined;
            let callAddr = `${process.env.AWS_LAMBDA_RUNTIME_API}`.split(":");
            if (headers["lambda-runtime-aws-request-id"]) {
                id = headers["lambda-runtime-aws-request-id"];
                path = `/2018-06-01/runtime/invocation/${id}/error`;
            }
            else {
                path = `/2018-06-01/runtime/init/error`;
            }
            const postErr = JSON.stringify({
                errorMessage: sendErr.message,
                errorType: sendErr.name,
                stackTrace: sendErr.stack.split(`\n`)
            });
            //console.log(postErr)
            const options = {
                host: `${callAddr[0]}`,
                path: path,
                port: callAddr[1],
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.from(postErr).length,
                    "Lambda-Runtime-Function-Error-Type": sendErr.name
                },
            };
            //console.dir(options);
            await this.send(options, postErr)
                .then((data) => res(data))
                .catch((err) => {
                rej(err);
            });
        });
    }
    send(options, body = undefined) {
        //console.log(body);
        return new Promise((resP, rej) => {
            let data = "";
            const req = http.request(options, (res) => {
                //console.log(`STATUS: ${res.statusCode}`);
                //console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
                res.setEncoding("utf8");
                res.on("data", (chunk) => {
                    //console.log(`BODY: ${chunk}`);
                    data = data + chunk;
                });
                res.on("end", () => {
                    console.log('No more data in response.');
                    let ret = {
                        status: `${res.statusCode}`,
                        headers: res.headers,
                        body: data,
                    };
                    //console.dir(ret)
                    resP(ret);
                });
            });
            req.on("error", (e) => {
                console.log(`problem with request: ${e.message}`);
                rej(e.message);
            });
            // write data to request body
            if (body != undefined) {
                req.write(body);
            }
            req.end();
        });
    }
}
//# sourceMappingURL=RequestApi.mjs.map