import jwt from "jsonwebtoken";
import { generateJWT } from "../helpers/tokenManager.js";



export const refreshToken = (req, res) => {
  try {
    const refreshTokenCookie = req.cookies.refreshToken;
    if (!refreshTokenCookie) throw new Error("No existen el token");

    const { uid } = jwt.verify(refreshTokenCookie, process.env.JWT_REFRESH);
    const { token, expiresIn } = generateJWT(uid);
    return res.json({ token, expiresIn });
  } catch (error) {
    console.log(error);

    const TokenVerificationErrors = {
      "invalid signature": "La firma del JWT no es valida",
      "jwt expired": "JWT expirado",
      "invalid token": "Token no valido",
      "No Bear": "Utiliza formato Beare",
      "jwt malformed": "JWT formato no valido",
    };

    return res
      .status(401)
      .send({ error: TokenVerificationErrors[error.message] });
  }
};
