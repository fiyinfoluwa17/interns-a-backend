import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  try {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(404).json({ err: "Invalid Bearer" });
    }

    const token = authHeader.split(" ")[1];

    const payload = jwt.verify(token, process.env.TOKEN);

    req.user = {
      userId: payload.userId,
    };
    next();
  } catch (error) {
    res.status(404).json({ err: "Invalid token" });
  }
};

export default auth