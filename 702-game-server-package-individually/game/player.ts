import { ServerMessage } from "./messages";
import { managementApi } from "../support/aws";
import randomId from "../support/randomId";

export default class Player {
  public readonly id = randomId();
  public sendable = true;

  constructor(public readonly connectionId: string) {}

  public async send(message: ServerMessage): Promise<void> {
    if (!this.sendable) {
      return;
    }
    try {
      await managementApi
        .postToConnection({
          ConnectionId: this.connectionId,
          Data: JSON.stringify(message),
        })
        .promise();
    } catch (error: any) {
      if (!error.retryable) {
        this.sendable = false;
      }
    }
  }

  public async disconnect(): Promise<void> {
    this.sendable = false;
    await managementApi
      .deleteConnection({ ConnectionId: this.connectionId })
      .promise();
  }
}
