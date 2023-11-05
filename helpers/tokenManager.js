import jwt from "jsonwebtoken";

export const generateJWT = (uid) => {
    const expiresIn = 60 * 15;

    try {
        const token = jwt.sign({ uid }, process.env.JWT_SECRET, {expiresIn})
        return {token, expiresIn}
        
    } catch (error) {
        console.log(error);
        
        
    }
};

export const generateRefreshJWT = (uid, res) => {
    const expiresIn =  60 * 60 * 24 * 30;

    try {
        const refreshToken = jwt.sign({ uid }, process.env.JWT_REFRESH, {expiresIn,});
        
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            expires: new Date(Date.now() + expiresIn * 1000),
            sameSite: "none"
        })
        
        
        
    } catch (error) {
        console.log(error);
        
        
    }
}

export const  requiereRefreshToken = (req, res, next) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        return res.status(401).json({ message: "Acceso no autorizado" });
    }

    try {
        const { uid } = jwt.verify(refreshToken, process.env.JWT_REFRESH);
        generateRefreshJWT(uid, res);
        req.uid = uid;
        next();
        
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Acceso no autorizado" });
        
    }
};

export const refreshToken = (req, res) => {
    try {
        const { uid } = req;
        const { token, expiresIn } = generateJWT(uid);
        return res.status(200).json({ message: "Refresh Token", token, expiresIn });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error en el servidor" });        
    }
};

export const verifyToken = (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return res.status(401).json({ message: "Acceso no autorizado" });
    }

    try {
        const { uid } = jwt.verify(token, process.env.JWT_SECRET);
        req.uid = uid;
        next();
        
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Acceso no autorizado" });
        
    }
};

export const logout = (req, res) => {
    res.clearCookie("refreshToken");
    res.json({ ok: true });
};