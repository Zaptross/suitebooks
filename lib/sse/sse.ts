import type { NextApiRequest, NextApiResponse } from "next";
import logger from "../logger/logger";

type Uuid = string;

type Stringable = string | { toString(): string };

type Client = {
  id: Uuid;
  req: NextApiRequest;
  res: NextApiResponse;
};

enum SSEEventType {
  MESSAGE = "message",
  DATA = "data",
}

enum SSEChannel {
  ALL = "all",
  UPDATE = "update",
}

type DataEvent<D> = {
  type: SSEEventType.DATA;
  data: D;
};
type MessageEvent = {
  type: SSEEventType.MESSAGE;
  data: string;
};

type SSEEventBase = { type: SSEEventType; channel: SSEChannel };

export type SSEEvent<D = {}> = SSEEventBase & (DataEvent<D> | MessageEvent);

const clients: Map<Uuid, Client> = new Map();

export function messagify(data: Stringable): string {
  const content = () => {
    if (typeof data === "string") {
      return data;
    }
    return data.toString();
  };

  return `data: ${content()}\n\n`;
}

function register(client: Client) {
  clients.set(client.id, client);

  for (const reason of ["close", "error"]) {
    client.req.on(reason, () => {
      try {
        client.res.end();
      } finally {
        clients.delete(client.id);
        logger.debug(`Client ${client.id} disconnected`);
      }
    });
  }

  logger.debug(`${clients.size} clients connected`);
}

function sendAll(data: Stringable) {
  clients.forEach((client) => {
    sendMessage(client, data);
  });
}

function sendTo(id: Uuid, data: string) {
  const client = clients.get(id);

  if (client) {
    sendMessage(client, data);
  }
}

function sendMessage(client: Client, data: Stringable) {
  logger.debug(`Sending to ${client.id}`);
  client.res.write(messagify(data), () => logger.debug(`Sent to ${client.id}`));
}

export default {
  register,
  sendAll,
  sendTo,
};
