import { APIRequest, APIResponse } from "../../../lib/utils/api";

type Data = {
  name: string;
};

export default function (
  req: APIRequest<{}, { userUuid: string }>,
  res: APIResponse<Data>
) {
  switch (req.method) {
    default:
      res.status(405).json({ error: "Method not allowed" });
  }
}
